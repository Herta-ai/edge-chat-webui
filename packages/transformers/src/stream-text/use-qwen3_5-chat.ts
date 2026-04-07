import {
  AutoProcessor,
  Qwen3_5ForConditionalGeneration,
  TextStreamer,
} from '@huggingface/transformers'
import { useShare } from '../share'
import type { PreTrainedModel, PretrainedModelOptions, Processor } from '@huggingface/transformers'
import type { CommonRequestOptions } from '@xsai/shared'

export function useQwen3_5Chat() {
  const { status, currentModelId, error, loadProgress, isLoaded, pipelineIns, downloadFiles } = useShare({ task: 'text-generation' })

  let processor: null | Processor = null
  let model: null | PreTrainedModel = null

  // === 内部加载模型方法 ===
  const loadModel = async (modelId: string, options?: PretrainedModelOptions) => {
    // 如果请求的模型和当前模型一致，且已经加载过，则直接复用
    if (currentModelId.value === modelId && model && processor) {
      return
    }

    // 重置状态
    status.value = 'loading_model'
    currentModelId.value = modelId
    error.value = null
    downloadFiles.clear()
    processor = null
    model = null

    try {
      processor = await AutoProcessor.from_pretrained(modelId)
      model = await Qwen3_5ForConditionalGeneration.from_pretrained(modelId, {
        ...options,
        progress_callback: (info: any) => {
          if (info.status === 'progress') {
            // 记录每个文件的下载进度
            downloadFiles.set(info.file, { loaded: info.loaded, total: info.total })
          }
          else if (info.status === 'done') {
            downloadFiles.set(info.file, { loaded: info.total, total: info.total })
          }
        },
      })
    }
    catch (err: any) {
      status.value = 'error'
      error.value = err
      throw err
    }
  }

  // === 核心：返回兼容 xsai 的流式配置对象 ===
  const streamText = (modelId: string, options?: PretrainedModelOptions) => {
    return {
      baseURL: 'mock-url:///',
      fetch: async (_url: string, fetchOptions: RequestInit): Promise<Response> => {
        try {
          // 1. 确保模型已经加载
          await loadModel(modelId, options)
          status.value = 'model_running'

          // 2. 解析请求 body 中的 messages
          const body = JSON.parse(fetchOptions.body as string)
          const messages = body.messages || []

          // 3.1 Prepare inputs
          const prompt = processor!.apply_chat_template(messages, {
            add_generation_prompt: true,
          })
          const inputs = await processor!(prompt)

          // 4. 创建 ReadableStream 以支持 SSE 流式输出
          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder()

              // 发送 OpenAI 兼容的 SSE Chunk 格式
              const sendChunk = (text: string) => {
                const chunk = {
                  id: `chatcmpl-${Date.now()}`,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: modelId,
                  choices: [{ index: 0, delta: { content: text } }],
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
              }

              // 继承 TextStreamer 拦截输出，防止打印到控制台，转而推送到 Stream 中
              class CustomStreamer extends TextStreamer {
                constructor(tokenizer: any) {
                  // skip_prompt: true 确保只输出 AI 生成的回复，不包含我们发送的 Prompt
                  super(tokenizer, { skip_prompt: true })
                }

                // 每次解码出完整的有效字符时触发
                override on_finalized_text(text: string) {
                  if (text) {
                    sendChunk(text)
                  }
                }
              }

              const streamer = new CustomStreamer(processor.tokenizer)

              try {
                // 5. 执行推理
                await model?.generate({
                  ...inputs,
                  max_new_tokens: body.max_tokens || 1024,
                  temperature: body.temperature ?? 0.7,
                  top_p: body.top_p ?? 0.95,
                  repetition_penalty: body.repetition_penalty ?? 1.1,
                  streamer, // 传入我们自定义的流式拦截器
                })

                // 6. 推理结束，发送 [DONE] 标识并关闭流
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
                status.value = 'ready'
              }
              catch (err) {
                controller.error(err)
                status.value = 'error'
              }
            },
          })

          // 7. 返回 SSE Response
          return new Response(stream, {
            status: 200,
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          })
        }
        catch (err: any) {
          status.value = 'error'
          error.value = err
          return new Response(JSON.stringify({ error: { message: err.message } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    } as unknown as CommonRequestOptions
  }

  return {
    streamText,
    status,
    loadProgress,
    isLoaded,
    currentModelId,
    error,
  }
}
