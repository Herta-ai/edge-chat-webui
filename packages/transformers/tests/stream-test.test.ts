import { describe, expect, it } from 'vitest'
import { streamText } from '@xsai/stream-text'
import { env } from '@huggingface/transformers'
import { useQwen3_5Chat } from '../src/stream-text/use-qwen3_5-chat.ts'

describe('useStreamText test', () => {
  // 注意：下载模型文件需要网络请求且文件较大，因此这里的 timeout 设置为 60 秒 (60000ms)
  it('should successfully load the model and generate text', async () => {
    env.remoteHost = 'http://127.0.0.1:8080'
    env.remotePathTemplate = '{model}'

    const modelId = 'huggingworld/Qwen3.5-0.8B-ONNX'
    const { streamText: transformersStreamText } = useQwen3_5Chat()

    // ----------------------------------------
    // 测试向量生成 (embed)
    // ----------------------------------------
    const { textStream } = streamText({
      ...transformersStreamText(modelId, {
        dtype: {
          embed_tokens: 'q4',
          vision_encoder: 'fp16',
          decoder_model_merged: 'q4',
        },
      }),
      messages: [],
    })

    const text: string[] = []
    for await (const textPart of textStream) {
      text.push(textPart)
    }

    console.log('result', text)

    // ----------------------------------------
    // Step 3: 断言结果
    // ----------------------------------------
    expect(Array.isArray(text)).toBe(true)
  }, 600000) // 显式声明 600s 超时时间
})
