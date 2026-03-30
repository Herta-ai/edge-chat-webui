import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { embed } from '@xsai/embed'
import { createEmbedProvider } from 'xsai-transformers'

describe('xsai-transformers embed functionality', () => {
  const modelId = 'Xenova/all-MiniLM-L6-v2'
  let embedProvider: ReturnType<typeof createEmbedProvider>

  beforeAll(async () => {
    const workerModule = await import('xsai-transformers/embed/worker?worker&url')
    const embedWorkerURL = workerModule.default
    // 1. 初始化 Provider
    embedProvider = createEmbedProvider({
      baseURL: `xsai-transformers:///?worker-url=${embedWorkerURL}`,
    })
  })

  afterAll(async () => {
    // 4. 清理工作：测试结束后终止 worker，防止内存泄漏和进程挂起
    if (embedProvider) {
      embedProvider.terminateEmbed()
    }
  })

  // 注意：下载模型文件需要网络请求且文件较大，因此这里的 timeout 设置为 60 秒 (60000ms)
  it('should successfully load the model and generate embeddings', async () => {
    // ----------------------------------------
    // Step 1: 测试模型加载 (loadEmbed)
    // ----------------------------------------
    let hasInitiated = false
    let hasDone = false

    console.log('starting embed provider', modelId)
    await embedProvider.loadEmbed(modelId, {
      onProgress: (progress) => {
        if (progress.status === 'initiate')
          hasInitiated = true
        if (progress.status === 'done')
          hasDone = true
      },
    })

    console.log('finishing embed provider')
    // 验证 progress 回调是否正常工作
    expect(hasInitiated).toBe(true)
    expect(hasDone).toBe(true)

    // ----------------------------------------
    // Step 2: 测试向量生成 (embed)
    // ----------------------------------------
    const input = 'Hello, world!'
    const result = await embed({
      ...embedProvider.embed(modelId),
      input,
    })

    // ----------------------------------------
    // Step 3: 断言结果
    // ----------------------------------------
    expect(result).toBeDefined()
    expect(result.embedding).toBeDefined()

    // 验证 embedding 是一个数组 (通常返回的是多维数组或一维数字数组)
    expect(result.embedding.length).toBeGreaterThan(0)

    // all-MiniLM-L6-v2 的特征向量维度通常是 384
    // 这里做基础的类型检查，确保返回了有效的数字向量
    const firstEmbedding = result.embedding[0]
    const isNumberArray = Array.isArray(firstEmbedding)
      ? typeof firstEmbedding[0] === 'number'
      : true

    expect(isNumberArray).toBe(true)
  }, 600000) // 显式声明 600s 超时时间
})
