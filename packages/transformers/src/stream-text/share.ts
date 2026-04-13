import { TextStreamer } from '@huggingface/transformers'
import type { PretrainedModelOptions } from '@huggingface/transformers'
import type { Ref } from 'vue'
import type { TStatus } from '../types.ts'

export function commonFetch({
  error,
  status,
  loadModelOptions,
  getTokenizer,
  loadModel,
  prepareInputFn,
  generateFn,
  textStreamerOption = {},
}: {
  error: Ref<Error | null>
  status: Ref<TStatus>
  loadModelOptions?: PretrainedModelOptions
  getTokenizer: () => any
  loadModel: (modelId: string, options?: PretrainedModelOptions) => Promise<void>
  prepareInputFn: (messages: any, prepareOptions: any) => Promise<any>
  generateFn: (...args: any) => Promise<void>
  textStreamerOption?: any
}) {
  return async (_url: string, fetchOptions: RequestInit): Promise<Response> => {
    try {
      // 1. 解析请求 body 中的 messages
      const { messages = [], model, enable_thinking, prepareOptions = {}, ...extBodyOptions } = JSON.parse(fetchOptions.body as string)

      // 2. 确保模型已经加载
      await loadModel(model, loadModelOptions)
      status.value = 'model_running'

      const tokenizer = getTokenizer()

      // 3. 将对话信息转换成调用模型入参
      const input = await prepareInputFn(messages, {
        ...prepareOptions,
        enable_thinking,
      })

      // 4. 创建 ReadableStream 以支持 SSE 流式输出
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()

          // 用于记录当前是否在推理，以及累计完整生成的文本供最后计算 usage
          let isReasoning = !!enable_thinking
          let fullGeneratedText = ''
          let fullReasoningText = ''

          // 发送 OpenAI 兼容的 SSE Chunk 格式
          const sendChunk = (text: string, type: 'content' | 'reasoning' = 'content') => {
            const chunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model,
              choices: [{ index: 0, delta: {} }],
            } as any // @todo: 完善类型
            if (type === 'reasoning') {
              chunk.choices[0]!.delta.reasoning_content = text
              fullReasoningText += text
            }
            else {
              chunk.choices[0]!.delta.content = text
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
          }

          // action 类型: 'start_reasoning' (进入思考) | 'end_reasoning' (结束思考) | 'drop' (消除不显示)
          const ALL_TAGS = [
            { tag: '<think>', action: 'start_reasoning' },
            { tag: '<|channel>', action: 'start_reasoning' }, // Gemma4 开始思考
            { tag: '</think>', action: 'end_reasoning' },
            { tag: '<channel|>', action: 'end_reasoning' }, // Gemma4 结束思考
            { tag: '<turn|>', action: 'drop' }, // 遇到后直接消除
          ]

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

            // 每次解码出完整的有效字符时触发
            // 解析 <think> 标签并动态分发 content 或 reasoning
            override on_finalized_text(text: string) {
              if (!text)
                return
              fullGeneratedText += text

              let remainingText = text

              while (remainingText.length > 0) {
                let minIndex = -1
                let matchedRule = null

                // 始终遍历【所有】标签，寻找最先出现的一个
                for (const rule of ALL_TAGS) {
                  const index = remainingText.indexOf(rule.tag)
                  // 寻找最早出现的标签
                  if (index !== -1 && (minIndex === -1 || index < minIndex)) {
                    minIndex = index
                    matchedRule = rule
                  }
                }

                // 如果匹配到了任何标签
                if (minIndex !== -1 && matchedRule) {
                  // 1. 发送标签前面的内容（按当前的 isReasoning 状态决定身份）
                  const before = remainingText.slice(0, minIndex)
                  if (before) {
                    sendChunk(before, isReasoning ? 'reasoning' : 'content')
                  }

                  // 2. 根据标签配置的动作，更新状态 (具备自纠错能力)
                  if (matchedRule.action === 'start_reasoning') {
                    isReasoning = true // 即使已经是 true，再次赋值也无妨
                  }
                  else if (matchedRule.action === 'end_reasoning') {
                    isReasoning = false // 即使已经是 false，再次赋值也无妨
                  }
                  // 'drop' 动作不改变 isReasoning 状态

                  // 3. 截断掉已处理的内容及该标签本体，继续循环处理剩余字符串
                  remainingText = remainingText.slice(minIndex + matchedRule.tag.length)
                }
                // 如果没有任何匹配的标签
                else {
                  // 剩下的所有字符都是安全的，直接发送
                  sendChunk(remainingText, isReasoning ? 'reasoning' : 'content')
                  break
                }
              }
            }
          }

          const streamer = new CustomStreamer(tokenizer)

          try {
            // 5. 执行推理
            await generateFn(input, {
              ...extBodyOptions,
              streamer,
            })

            // 新增：6. 推理结束，计算 Usage
            // 注意：@huggingface/transformers 的 encode 返回的可能是数组，也可能是 Tensor(需要取 .data.length)
            try {
              const promptEncoded = await tokenizer.encode(prompt)
              const outputEncoded = await tokenizer.encode(fullGeneratedText)
              const reasoningEncoded = fullReasoningText ? await tokenizer.encode(fullReasoningText) : { length: 0, data: [] }

              const prompt_tokens = promptEncoded.length ?? promptEncoded.data?.length ?? 0
              const completion_tokens = outputEncoded.length ?? outputEncoded.data?.length ?? 0
              const reasoning_tokens = reasoningEncoded.length ?? reasoningEncoded.data?.length ?? 0

              const usageChunk = {
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
            console.error('error', error)
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
  }
}
