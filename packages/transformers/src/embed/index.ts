import { env } from '@huggingface/transformers'
import { useShare } from '../share'
import type { PretrainedModelOptions } from '@huggingface/transformers'
import type { CommonRequestOptions } from '@xsai/shared'
// 禁用本地文件系统读取，确保在浏览器中正常运行
env.allowLocalModels = false

export function useEmbed() {
  const { status, currentModelId, error, loadProgress, isLoaded, pipelineIns, loadModel } = useShare({ task: 'feature-extraction' })

  // === 核心：返回兼容 xsai 的配置对象 ===
  const embed = (modelId: string, options?: PretrainedModelOptions) => {
    return {
      baseURL: 'mock-url:///',
      // 拦截 xsai 底层发出的 fetch 请求
      fetch: async (_url: string, fetchOptions: RequestInit): Promise<Response> => {
        try {
          // 1. 确保模型已经加载 (如果换了 ID 会自动重新加载)
          await loadModel(modelId, options)

          // 2. 状态切换为向量化中
          status.value = 'model_running'

          // 3. 解析 xsai 传过来的请求 body
          const body = JSON.parse(fetchOptions.body as string)
          // xsai/OpenAI 规范中，input 可以是字符串或字符串数组
          const texts = Array.isArray(body.input) ? body.input : [body.input]

          // === 新增：计算 Token 消耗 ===
          let promptTokens = 0
          if (pipelineIns.value?.tokenizer) {
            for (const text of texts) {
              // tokenizer.encode(text) 会返回 token ID 的数组 (例如 [101, 7592, 102])
              // 数组的长度就是该段文本实际消耗的 Token 数量
              const tokenIds = pipelineIns.value.tokenizer.encode(text)
              promptTokens += tokenIds.length
            }
          }

          // 4. 调用本地 Transformers.js 进行向量化
          // pooling: 'mean' 和 normalize: true 是文本向量化最常用的标准设置
          const output = await pipelineIns.value(texts, { pooling: 'mean', normalize: true })

          // 转换为标准的 JS 数组 (tolist 处理多维 Tensor)
          const embeddingsArray = output.tolist()

          // 5. 将本地结果包装成 OpenAI API 标准格式的 Response
          const responseBody = {
            object: 'list',
            data: embeddingsArray.map((emb: number[], index: number) => ({
              object: 'embedding',
              embedding: emb,
              index,
            })),
            model: modelId,
            usage: {
              prompt_tokens: promptTokens,
              total_tokens: promptTokens, // Embedding 没有生成 token，所以总和等于输入
            },
          }

          status.value = 'ready'
          return new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        catch (err: any) {
          status.value = 'error'
          error.value = err
          // 模拟接口报错
          return new Response(JSON.stringify({ error: { message: err.message } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    } as unknown as CommonRequestOptions
  }

  return {
    embed,
    status,
    loadProgress,
    isLoaded,
    currentModelId,
    error,
  }
}
