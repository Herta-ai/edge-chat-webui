import { computed, reactive, ref, shallowRef } from 'vue'
import { pipeline } from '@huggingface/transformers'
import type { PipelineType, PretrainedModelOptions } from '@huggingface/transformers'
import type { TStatus } from '../types.ts'

export function useShare({ task }: { task: PipelineType }) {
  // === 状态管理 ===
  const status = ref<TStatus>('idle')
  const currentModelId = ref<string | null>(null)
  const error = ref<Error | null>(null)

  // 进度跟踪 (Transformers.js 会同时下载多个文件，我们需要合并计算总进度)
  const downloadFiles = reactive(new Map<string, { loaded: number, total: number }>())

  // 计算总的加载进度 (0-100)
  const loadProgress = computed(() => {
    if (downloadFiles.size === 0)
      return 0
    let totalLoaded = 0
    let totalSize = 0
    for (const file of downloadFiles.values()) {
      totalLoaded += file.loaded
      totalSize += file.total
    }
    return totalSize === 0 ? 0 : Math.round((totalLoaded / totalSize) * 100)
  })

  const isLoaded = computed(() => status.value === 'ready' || status.value === 'model_running')

  // 内部保持模型的实例
  const pipelineIns: any = shallowRef()

  // === 内部加载模型方法 ===
  const loadModel = async (modelId: string, options?: PretrainedModelOptions) => {
    // 如果请求的模型和当前模型一致，且已经加载过，则直接复用
    if (currentModelId.value === modelId && pipelineIns.value) {
      return pipelineIns.value
    }

    // 重置状态
    status.value = 'loading_model'
    currentModelId.value = modelId
    error.value = null
    downloadFiles.clear()
    pipelineIns.value = null

    try {
      // 加载 feature-extraction 管道
      pipelineIns.value = await pipeline(task, modelId, {
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
      status.value = 'ready'
      return pipelineIns.value
    }
    catch (err: any) {
      status.value = 'error'
      error.value = err
      throw err
    }
  }

  return {
    status,
    currentModelId,
    error,
    downloadFiles,
    loadProgress,
    isLoaded,
    pipelineIns,
    loadModel,
  }
}
