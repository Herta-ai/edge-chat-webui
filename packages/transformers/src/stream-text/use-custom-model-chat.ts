import { AutoProcessor } from '@huggingface/transformers'
import { consola } from 'consola/browser'
import { useShare } from '../share'
import { commonFetch } from './common-fetch.ts'
import type { PretrainedModelOptions } from '@huggingface/transformers'
import type { CommonRequestOptions } from '@xsai/shared'
import type { StreamParserConfig } from './parser/types.ts'

// 泛型抽象：接受任何兼容 from_pretrained 的模型类
export function useCustomModelChat(ModelClass: any, customStreamerOpts = {}) {
  const { status, currentModelId, error, loadProgress, isLoaded, pipelineIns, loadModel } = useShare({
    loadModelFn: async (modelId, options) => {
      // 这里的 options 已经包含了从 useShare 注入的 progress_callback
      const processor = await AutoProcessor.from_pretrained(modelId)
      const model = await ModelClass.from_pretrained(modelId, options)

      // 将 processor 和 model 绑定到 pipelineIns 上，供后续取用
      return { processor, model }
    },
  })

  const streamText = (options: PretrainedModelOptions, streamParserConfig: StreamParserConfig): CommonRequestOptions => {
    return {
      baseURL: 'mock-url:///',
      fetch: commonFetch({
        error,
        status,
        loadModel,
        loadModelOptions: options,
        textStreamerOption: customStreamerOpts,
        getTokenizer: () => (pipelineIns.value as any).processor.tokenizer,
        prepareInputFn: async (messages, prepareOptions) => {
          const processor = (pipelineIns.value as any).processor
          const promptStr = processor.apply_chat_template(messages, {
            add_generation_prompt: true,
            ...prepareOptions,
          })
          consola.debug('promptStr', promptStr)
          const input = await processor(promptStr)
          return { input, promptStr } // 符合重构后 commonFetch 的签名要求
        },
        generateFn: async (inputs, options) => {
          const model = (pipelineIns.value as any).model
          await model.generate({ ...inputs, ...options })
        },
        streamParserConfig,
      }),
    } as unknown as CommonRequestOptions
  }

  return { streamText, status, loadProgress, isLoaded, currentModelId, error }
}
