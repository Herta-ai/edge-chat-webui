import { useShare } from '../share'
import { commonFetch } from './share.ts'
import type { PretrainedModelOptions } from '@huggingface/transformers'
import type { CommonRequestOptions } from '@xsai/shared'

export function useStreamText() {
  const { status, currentModelId, error, loadProgress, isLoaded, pipelineIns, loadModel } = useShare({ task: 'text-generation' })

  // === 核心：返回兼容 xsai 的流式配置对象 ===
  const streamText = (options?: PretrainedModelOptions) => {
    return {
      baseURL: 'mock-url:///',
      fetch: commonFetch({
        error,
        status,
        loadModel,
        loadModelOptions: options,
        getTokenizer: () => pipelineIns.value.tokenizer,
        generateFn: (input, options) => pipelineIns.value(input, options),
        prepareInputFn: messages => pipelineIns.value.tokenizer.apply_chat_template(messages, {
          tokenize: false,
          add_generation_prompt: true,
        }),
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

export { useGemma4Chat } from './use-gemma4-chat.ts'
export { useQwen3_5Chat } from './use-qwen3_5-chat.ts'
