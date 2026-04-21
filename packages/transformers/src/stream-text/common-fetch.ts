import { consola } from 'consola/browser'
import { TextStreamer } from '@huggingface/transformers'
import { StreamProcessor } from './parser/stream-processer.ts'
import type { PretrainedModelOptions } from '@huggingface/transformers'
import type { Ref } from 'vue'
import type { ChatCompletionChunk, TStatus } from '../types.ts'
import type { StreamParserConfig } from './parser/types.ts'

interface FetchParams {
  error: Ref<Error | null>
  status: Ref<TStatus>
  loadModelOptions?: PretrainedModelOptions
  getTokenizer: () => any
  loadModel: (modelId: string, options?: PretrainedModelOptions) => Promise<void>
  prepareInputFn: (messages: any, prepareOptions: any) => Promise<{ input: any, promptStr: string }>
  generateFn: (input: any, options: any) => Promise<void>
  textStreamerOption?: Record<string, any>
  streamParserConfig: StreamParserConfig
}

export function commonFetch({
  error,
  status,
  loadModelOptions,
  getTokenizer,
  loadModel,
  prepareInputFn,
  generateFn,
  textStreamerOption = {},
  streamParserConfig,
}: FetchParams) {
  return async (_url: string, fetchOptions: RequestInit): Promise<Response> => {
    try {
      // 1. 解析请求 body 中的 messages
      const { messages = [], model, enable_thinking = false, prepareOptions = {}, tools, ...extBodyOptions } = JSON.parse(fetchOptions.body as string)

      // 2. 确保模型已经加载
      await loadModel(model, loadModelOptions)
      status.value = 'model_running'

      const tokenizer = getTokenizer()

      // 3. 将对话信息转换成调用模型入参以及prompt计算token
      const { input, promptStr } = await prepareInputFn(messages, {
        ...prepareOptions,
        enable_thinking,
        tools,
      })

      // 4. 创建 ReadableStream 以支持 SSE 流式输出
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()

          // 用于追踪整个对话中是否触发了工具调用（决定最后的 finish_reason）
          let hasEmittedToolCall = false

          // 发送 OpenAI 兼容的 SSE Chunk 格式
          const sendChunk = (data: any, type: 'content' | 'reasoning' | 'tool_calls' | 'finish' = 'content') => {
            const chunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model,
              choices: [{ index: 0, delta: {}, finish_reason: null }],
            } as ChatCompletionChunk
            if (type === 'reasoning') {
              chunk.choices[0]!.delta.reasoning_content = data
            }
            else if (type === 'content') {
              chunk.choices[0]!.delta.content = data
            }
            else if (type === 'tool_calls') {
              // 插入工具调用数据
              chunk.choices[0]!.delta.tool_calls = data
              hasEmittedToolCall = true
            }
            else if (type === 'finish') {
              // 结束帧
              chunk.choices[0]!.delta = {}
              chunk.choices[0]!.finish_reason = data // data 此时传入 'stop' 或 'tool_calls'
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
          }

          // 初始化流处理器（注入策略）
          const processor = new StreamProcessor(streamParserConfig, sendChunk, enable_thinking)

          // 继承 TextStreamer 拦截输出，防止打印到控制台，转而推送到 Stream 中
          class CustomStreamer extends TextStreamer {
            constructor(tokenizer: any) {
              // skip_prompt: true 确保只输出 AI 生成的回复，不包含我们发送的 Prompt
              super(tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                ...textStreamerOption,
              })
            }

            override on_finalized_text(text: string) {
              consola.debug('on_finalized_text', text)
              processor.process(text)
            }
          }

          const streamer = new CustomStreamer(tokenizer)

          try {
            // 5. 执行推理
            await generateFn(input, {
              ...extBodyOptions,
              streamer,
            })

            if (hasEmittedToolCall) {
              // 如果发出过工具调用，结束原因是 'tool_calls'，否则是 'stop'
              sendChunk('tool_calls', 'finish')
            }

            // 新增：6. 推理结束，计算 Usage
            // 注意：@huggingface/transformers 的 encode 返回的可能是数组，也可能是 Tensor(需要取 .data.length)
            try {
              const getTokenCount = async (text: string) => {
                if (!text)
                  return 0
                const encoded = await tokenizer.encode(text)
                return encoded.length ?? encoded.data?.length ?? 0
              }

              const { fullGeneratedText, fullReasoningText } = processor.state
              const prompt_tokens = await getTokenCount(promptStr)
              const completion_tokens = await getTokenCount(fullGeneratedText)
              const reasoning_tokens = await getTokenCount(fullReasoningText)

              const usageChunk: ChatCompletionChunk = {
                id: `chatcmpl-${Date.now()}`,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model,
                choices: [], // 必须为空数组
                usage: {
                  prompt_tokens,
                  completion_tokens,
                  total_tokens: prompt_tokens + completion_tokens,
                  completion_tokens_details: { // 添加思考 tokens 统计
                    reasoning_tokens,
                  },
                },
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(usageChunk)}\n\n`))
            }
            catch (e) {
              consola.warn('计算 Token usage 失败', e)
            }

            // 7. 推理结束，发送 [DONE] 标识并关闭流
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
            status.value = 'ready'
          }
          catch (err) {
            consola.error('推理失败', error)
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
      consola.error('推理前预处理错误', err)
      status.value = 'error'
      error.value = err
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}
