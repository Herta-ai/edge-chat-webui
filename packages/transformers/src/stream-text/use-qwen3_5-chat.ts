import {
  AutoProcessor,
  Qwen3_5ForConditionalGeneration,
} from '@huggingface/transformers'
import { useShare } from '../share'
import { commonFetch } from './share.ts'
import type { PreTrainedModel, PretrainedModelOptions, Processor } from '@huggingface/transformers'
import type { CommonRequestOptions } from '@xsai/shared'

export function useQwen3_5Chat() {
  const { status, currentModelId, error, loadProgress, isLoaded, downloadFiles } = useShare({ task: 'text-generation' })

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
  const streamText = (options?: PretrainedModelOptions) => {
    return {
      baseURL: 'mock-url:///',
      fetch: commonFetch({
        error,
        status,
        loadModel,
        loadModelOptions: options,
        getTokenizer: () => processor.tokenizer,
        tokenizeFn: (messages) => {
          const prompt = processor!.apply_chat_template(messages, {
            add_generation_prompt: true,
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
