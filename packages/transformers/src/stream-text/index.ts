import { useShare } from '../share'
import { commonFetch } from './common-fetch.ts'
import type { PretrainedModelOptions } from '@huggingface/transformers'
import type { CommonRequestOptions } from '@xsai/shared'
import type { StreamParserConfig } from './parser/types.ts'

export function useStreamText() {
  const { status, currentModelId, error, loadProgress, isLoaded, pipelineIns, loadModel } = useShare({ task: 'text-generation' })

  // === 核心：返回兼容 xsai 的流式配置对象 ===
  const streamText = (options: PretrainedModelOptions, streamParserConfig: StreamParserConfig) => {
    return {
      baseURL: 'mock-url:///',
      fetch: commonFetch({
        error,
        status,
        loadModel,
        loadModelOptions: options,
        getTokenizer: () => pipelineIns.value.tokenizer,
        generateFn: (input, options) => pipelineIns.value(input, options),
        prepareInputFn: async (messages) => {
          const tokenizer = (pipelineIns.value as any).tokenizer
          // Pipeline 通常直接吃 string 或者数组，我们需要把它提炼出来计算 token
          const promptStr = tokenizer.apply_chat_template(messages, {
            tokenize: false,
            add_generation_prompt: true,
          })
          return { input: messages, promptStr }
        },
        streamParserConfig,
      }),
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

export { BLANK_PARSER_CONFIG } from './parser/blank.ts'
export { GEMMA_PARSER_CONFIG } from './parser/gemma.ts'
export { QWEN_PARSER_CONFIG } from './parser/qwen.ts'
export type { StreamParserConfig } from './parser/types.ts'
export { useGemma4Chat } from './use-gemma4-chat.ts'
export { useQwen3_5Chat } from './use-qwen3_5-chat.ts'
