import { computed, reactive, ref, shallowRef } from 'vue'
import { pipeline } from '@huggingface/transformers'
import type { PipelineType, PretrainedModelOptions, ProgressInfo } from '@huggingface/transformers'
import type { LoadModelFnOptions, TStatus } from '../types.ts'

export function useShare({ task, loadModelFn }: { task?: PipelineType, loadModelFn?: (modelId: string, options?: LoadModelFnOptions) => Promise<any> }) {
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
    const { loaded, total } = [...downloadFiles.values()].reduce(
      (acc, file) => ({ loaded: acc.loaded + file.loaded, total: acc.total + file.total }),
      { loaded: 0, total: 0 },
    )
    return total === 0 ? 0 : Math.round((loaded / total) * 100)
  })

  const isLoaded = computed(() => status.value === 'ready' || status.value === 'model_running')

  // 内部保持模型的实例
  const pipelineIns: any = shallowRef<unknown>(null)

  // 统一的进度处理回调
  const handleProgress = (info: ProgressInfo) => {
    if (info.status === 'progress' || info.status === 'done') {
      downloadFiles.set(info.file, {
        // @ts-ignore
        loaded: info.status === 'done' ? info.total : info.loaded,
        // @ts-ignore
        total: info.total,
      })
    }
  }

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
      if (task) {
        pipelineIns.value = await pipeline(task, modelId, {
          ...options,
          progress_callback: handleProgress,
        })
      }
      else if (loadModelFn) {
        pipelineIns.value = await loadModelFn(modelId, options)
      }
      else {
        throw new Error('Either task or loadModelFn must be provided')
      }
      status.value = 'ready'
      return pipelineIns.value
    }
    catch (err: any) {
      status.value = 'error'
      error.value = err instanceof Error ? err : new Error(String(err))
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
    handleProgress,
  }
}
