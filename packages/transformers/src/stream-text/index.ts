import { TextStreamer } from '@huggingface/transformers'
import { useShare } from '../share'
import type { PretrainedModelOptions } from '@huggingface/transformers'
import type { CommonRequestOptions } from '@xsai/shared'

export function useStreamText() {
  const { status, currentModelId, error, loadProgress, isLoaded, pipelineIns, loadModel } = useShare({ task: 'text-generation' })

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

          // 3. 使用 tokenizer 的 chat template 格式化对话历史为字符串 Prompt
          const prompt = pipelineIns.value.tokenizer.apply_chat_template(messages, {
            tokenize: false,
            add_generation_prompt: true,
          })

          // 4. 创建 ReadableStream 以支持 SSE 流式输出
          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder()

              // 用于记录当前是否在推理，以及累计完整生成的文本供最后计算 usage
              let isReasoning = false
              let fullGeneratedText = ''
              let fullReasoningText = ''

              // 发送 OpenAI 兼容的 SSE Chunk 格式
              const sendChunk = (text: string, type: 'content' | 'reasoning' = 'content') => {
                const chunk = {
                  id: `chatcmpl-${Date.now()}`,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: modelId,
                  choices: [{ index: 0, delta: {} }],
                } as any // @todo: 完善类型
                if (type === 'reasoning') {
                  chunk.choices[0]!.delta.reasoning_content = text
                  fullReasoningText += text
                }
                else {
                  chunk.choices[0]!.delta.content = text
                }
                console.log('chunk', chunk)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
              }

              // 继承 TextStreamer 拦截输出，防止打印到控制台，转而推送到 Stream 中
              class CustomStreamer extends TextStreamer {
                constructor(tokenizer: any) {
                  // skip_prompt: true 确保只输出 AI 生成的回复，不包含我们发送的 Prompt
                  super(tokenizer, { skip_prompt: true })
                }

                // 每次解码出完整的有效字符时触发
                // 解析 <think> 标签并动态分发 content 或 reasoning
                override on_finalized_text(text: string) {
                  if (!text)
                    return
                  fullGeneratedText += text // 收集完整的 AI 输出

                  let remainingText = text

                  // 简单的状态机解析 <think> 标签
                  while (remainingText.length > 0) {
                    if (!isReasoning) {
                      const thinkStart = remainingText.indexOf('<think>')
                      if (thinkStart !== -1) {
                        const before = remainingText.slice(0, thinkStart)
                        if (before)
                          sendChunk(before, 'content')
                        isReasoning = true
                        remainingText = remainingText.slice(thinkStart + 7) // 截断 '<think>'
                      }
                      else {
                        sendChunk(remainingText, 'content')
                        break
                      }
                    }
                    else {
                      const thinkEnd = remainingText.indexOf('</think>')
                      if (thinkEnd !== -1) {
                        const before = remainingText.slice(0, thinkEnd)
                        if (before)
                          sendChunk(before, 'reasoning')
                        isReasoning = false
                        remainingText = remainingText.slice(thinkEnd + 8) // 截断 '</think>'
                      }
                      else {
                        sendChunk(remainingText, 'reasoning')
                        break
                      }
                    }
                  }
                }
              }

              const streamer = new CustomStreamer(pipelineIns.value.tokenizer)

              try {
                // 5. 执行推理
                await pipelineIns.value(prompt, {
                  max_new_tokens: body.max_tokens || 1024,
                  temperature: body.temperature ?? 0.7,
                  top_p: body.top_p ?? 0.95,
                  repetition_penalty: body.repetition_penalty ?? 1.1,
                  streamer, // 传入我们自定义的流式拦截器
                })

                // 新增：6. 推理结束，计算 Usage
                // 注意：@huggingface/transformers 的 encode 返回的可能是数组，也可能是 Tensor(需要取 .data.length)
                try {
                  const promptEncoded = await pipelineIns.value.tokenizer.encode(prompt)
                  const outputEncoded = await pipelineIns.value.tokenizer.encode(fullGeneratedText)
                  const reasoningEncoded = fullReasoningText ? await pipelineIns.value.tokenizer.encode(fullReasoningText) : { length: 0, data: [] }

                  const prompt_tokens = promptEncoded.length ?? promptEncoded.data?.length ?? 0
                  const completion_tokens = outputEncoded.length ?? outputEncoded.data?.length ?? 0
                  const reasoning_tokens = reasoningEncoded.length ?? reasoningEncoded.data?.length ?? 0

                  const usageChunk = {
                    id: `chatcmpl-${Date.now()}`,
                    object: 'chat.completion.chunk',
                    created: Math.floor(Date.now() / 1000),
                    model: modelId,
                    choices: [], // 必须为空数组
                    usage: {
                      prompt_tokens,
                      completion_tokens,
                      total_tokens: prompt_tokens + completion_tokens,
                      completion_tokens_details: { // 添加思考 tokens 统计
                        reasoning_tokens,
                        accepted_prediction_tokens: 0, // 兼容 OpenAI 格式
                        rejected_prediction_tokens: 0, // 兼容 OpenAI 格式
                      },
                    },
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(usageChunk)}\n\n`))
                }
                catch (e) {
                  console.warn('计算 Token usage 失败', e)
                }

                // 7. 推理结束，发送 [DONE] 标识并关闭流
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
