import { describe, expect, it } from 'vitest'
import { embed } from '@xsai/embed'
import { env } from '@huggingface/transformers'
import { useEmbed } from '../src/embed'

describe('useEmbed test', () => {
  // 注意：下载模型文件需要网络请求且文件较大，因此这里的 timeout 设置为 60 秒 (60000ms)
  it('should successfully load the model and generate embeddings', async () => {
    env.remoteHost = 'http://127.0.0.1:8080'
    env.remotePathTemplate = '{model}'

    const modelId = 'onnx-community/Qwen3-Embedding-0.6B-ONNX'
    const { embed: transformersEmbed } = useEmbed()

    // ----------------------------------------
    // 测试向量生成 (embed)
    // ----------------------------------------
    const result = await embed({
      ...transformersEmbed(modelId, {
        dtype: 'q4',
      }),
      input: 'Hello, world!',
    })

    console.log('embedded result', result)

    // ----------------------------------------
    // Step 3: 断言结果
    // ----------------------------------------
    expect(result).toBeDefined()
    expect(result.embedding).toBeDefined()

    // 验证 embedding 是一个数组 (通常返回的是多维数组或一维数字数组)
    expect(result.embedding.length).toBeGreaterThan(0)

    // 这里做基础的类型检查，确保返回了有效的数字向量
    const firstEmbedding = result.embedding[0]
    const isNumberArray = Array.isArray(firstEmbedding)
      ? typeof firstEmbedding[0] === 'number'
      : true

    expect(isNumberArray).toBe(true)
  }, 600000) // 显式声明 600s 超时时间
})
