import { TextStreamer } from '@huggingface/transformers'
import type { PretrainedModelOptions } from '@huggingface/transformers'
import type { Ref } from 'vue'
import type { ChatCompletionChunk, TStatus } from '../types.ts'

interface FetchParams {
  error: Ref<Error | null>
  status: Ref<TStatus>
  loadModelOptions?: PretrainedModelOptions
  getTokenizer: () => any
  loadModel: (modelId: string, options?: PretrainedModelOptions) => Promise<void>
  prepareInputFn: (messages: any, prepareOptions: any) => Promise<{ input: any, promptStr: string }>
  generateFn: (input: any, options: any) => Promise<void>
  textStreamerOption?: Record<string, any>
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
}: FetchParams) {
  return async (_url: string, fetchOptions: RequestInit): Promise<Response> => {
    try {
      // 1. 解析请求 body 中的 messages
      const { messages = [], model, enable_thinking, prepareOptions = {}, tools, ...extBodyOptions } = JSON.parse(fetchOptions.body as string)

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

          // 用于记录当前是否在推理，以及累计完整生成的文本供最后计算 usage
          let isReasoning = !!enable_thinking
          let fullGeneratedText = ''
          let fullReasoningText = ''

          // 用于追踪整个对话中是否触发了工具调用（决定最后的 finish_reason）
          let hasEmittedToolCall = false
          let isToolCall = false
          // 用于存放工具调用的生肉字符串
          let toolCallBuffer = ''

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
              fullReasoningText += data
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

          function parseModelOutputToOpenAI(rawText: string) {
            if (rawText.includes('<|tool_call>'))
              return parseGemmaToOpenAI(rawText)
            else if (rawText.includes('<function='))
              return parseQwenToOpenAI(rawText)
            else return { role: 'assistant', content: rawText.replace(/<\|im_end\|>|<\|tool_response\|>/g, '').trim() || null, tool_calls: [] }
          }

          function parseGemmaToOpenAI(rawText: string) {
            const toolCallRegex = /<\|tool_call>\s*call:([^{]+)\{([^}]*)\}\s*<tool_call\|>/
            const match = rawText.match(toolCallRegex)
            if (!match)
              return { role: 'assistant', content: rawText.trim() }

            const functionName = match[1]!.trim()
            const argsString = match[2]!.trim()
            const args: any = {}

            if (argsString) {
              const kvRegex = /(\w+):(?:<\|"\|>(.*?)<\|"\|>|([^,]+))/g
              for (const kvMatch of argsString.matchAll(kvRegex)) {
                args[kvMatch[1]!.trim()] = kvMatch[2] !== undefined ? kvMatch[2] : kvMatch[3]!.trim()
              }
            }
            const content = rawText.split('<|tool_call>')[0]!.trim() || null
            return {
              role: 'assistant',
              content,
              tool_calls: [{
                id: `call_${Math.random().toString(36).substring(2, 10)}`,
                type: 'function',
                function: { name: functionName, arguments: JSON.stringify(args) },
              }],
            }
          }

          function parseQwenToOpenAI(rawText: string) {
            const funcMatch = rawText.match(/<function=([^>]+)>/)
            if (!funcMatch)
              return { role: 'assistant', content: rawText.trim() }

            const functionName = funcMatch[1]
            const args: any = {}
            const paramRegex = /<parameter=([^>]+)>([\s\S]*?)<\/parameter>/g
            for (const match of rawText.matchAll(paramRegex)) {
              args[match[1]!] = match[2]!.trim()
            }
            const content = rawText.split(/<function=/)[0]!.replace(/<tool_call>/g, '').trim() || null
            return {
              role: 'assistant',
              content,
              tool_calls: [{
                id: `call_${Math.random().toString(36).substring(2, 10)}`,
                type: 'function',
                function: { name: functionName, arguments: JSON.stringify(args) },
              }],
            }
          }

          const processAndSendToolCall = (rawBuffer: string) => {
            const parsed = parseModelOutputToOpenAI(rawBuffer)

            if (parsed && parsed.tool_calls && parsed.tool_calls.length > 0) {
              // 转换为符合 SSE Chunk 要求的结构 (加上 index)
              const mappedToolCalls = parsed.tool_calls.map((tc: any, index: number) => ({
                index,
                id: tc.id,
                type: tc.type,
                function: {
                  name: tc.function.name,
                  arguments: tc.function.arguments, // 直接把完整的 JSON 字符串传过去
                },
              }))
              sendChunk(mappedToolCalls, 'tool_calls')
            }
            else if (parsed.content) {
              // 如果解析失败但留有文本，作为后备方案当做普通文本发出去
              sendChunk(parsed.content, 'content')
            }
          }

          // action 类型: 'start_reasoning' (进入思考) | 'end_reasoning' (结束思考) | 'drop' (消除不显示)
          const ALL_TAGS = [
            { tag: '<think>', action: 'start_reasoning' },
            { tag: '<|channel>', action: 'start_reasoning' },
            { tag: '</think>', action: 'end_reasoning' },
            { tag: '<channel|>', action: 'end_reasoning' },

            // 工具调用标签 (Gemma & Qwen)
            { tag: '<|tool_call>', action: 'start_tool' }, // Gemma 开头
            { tag: '<tool_call|>', action: 'end_tool' }, // Gemma 结尾
            { tag: '<tool_call>', action: 'start_tool' }, // Qwen 开头
            { tag: '</tool_call>', action: 'end_tool' }, // Qwen 结尾

            // 需要丢弃的垃圾符号
            { tag: '<turn|>', action: 'drop' },
            { tag: '<|im_end|>', action: 'drop' },
            { tag: '<|tool_response|>', action: 'drop' },
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

            override on_finalized_text(text: string) {
              if (!text)
                return
              fullGeneratedText += text
              let remainingText = text

              while (remainingText.length > 0) {
                const matched = ALL_TAGS.map(rule => ({ ...rule, index: remainingText.indexOf(rule.tag) }))
                  .filter(r => r.index !== -1)
                  .sort((a, b) => a.index - b.index)[0]

                if (matched) {
                  // 1. 处理 Tag 之前的普通文本
                  const before = remainingText.slice(0, matched.index)
                  if (before) {
                    if (isToolCall) {
                      toolCallBuffer += before // 如果在提取工具模式，缓存起来
                    }
                    else {
                      sendChunk(before, isReasoning ? 'reasoning' : 'content') // 否则直接发送
                    }
                  }

                  // 2. 处理 Tag 行为
                  if (matched.action === 'start_reasoning') {
                    isReasoning = true
                  }
                  else if (matched.action === 'end_reasoning') {
                    isReasoning = false
                  }
                  else if (matched.action === 'start_tool') {
                    isToolCall = true
                    toolCallBuffer += matched.tag // 必须把标签也加进 buffer，因为正则解析器依赖这些标签
                  }
                  else if (matched.action === 'end_tool') {
                    toolCallBuffer += matched.tag
                    isToolCall = false
                    // 🎉 收集完毕！执行解析并发送工具调用帧
                    processAndSendToolCall(toolCallBuffer)
                    toolCallBuffer = '' // 清空以备后用
                  }
                  // 如果是 drop，什么都不用做，它自然会被丢弃

                  // 继续处理后面部分
                  remainingText = remainingText.slice(matched.index + matched.tag.length)
                }
                else {
                  // 当前块中没有 Tag 了
                  if (isToolCall) {
                    toolCallBuffer += remainingText
                  }
                  else {
                    sendChunk(remainingText, isReasoning ? 'reasoning' : 'content')
                  }
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

            // 兜底处理：如果模型中途因为 max_tokens 停止，工具标签可能没闭合
            if (isToolCall && toolCallBuffer.trim() !== '') {
              processAndSendToolCall(toolCallBuffer)
            }

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
      console.error('error', err)
      status.value = 'error'
      error.value = err
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}
