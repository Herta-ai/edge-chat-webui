import {
  AutoProcessor,
  Gemma4ForConditionalGeneration,
} from '@huggingface/transformers'
import { useShare } from '../share'
import { commonFetch } from './share.ts'
import type { PreTrainedModel, PretrainedModelOptions, Processor } from '@huggingface/transformers'
import type { CommonRequestOptions } from '@xsai/shared'

export function useGemma4Chat() {
  let processor: null | Processor = null
  let model: null | PreTrainedModel = null
  const { status, currentModelId, error, loadProgress, isLoaded, downloadFiles, loadModel } = useShare({
    loadModelFn: async (modelId, options) => {
      processor = await AutoProcessor.from_pretrained(modelId)
      model = await Gemma4ForConditionalGeneration.from_pretrained(modelId, {
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
    },
  })

  // === 核心：返回兼容 xsai 的流式配置对象 ===
  const streamText = (options?: PretrainedModelOptions) => {
    return {
      baseURL: 'mock-url:///',
      fetch: commonFetch({
        error,
        status,
        loadModel,
        loadModelOptions: options,
        textStreamerOption: {
          skip_special_tokens: false,
        },
        getTokenizer: () => processor!.tokenizer,
        prepareInputFn: (messages, prepareOptions) => {
          const prompt = processor!.apply_chat_template(messages, {
            add_generation_prompt: true,
            ...prepareOptions,
          })
          return processor!(prompt)
        },
        generateFn: async (inputs, options) => {
          await model!.generate({
            ...inputs,
            ...options,
          })
        },
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
