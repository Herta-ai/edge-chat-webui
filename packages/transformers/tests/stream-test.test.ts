import { describe, expect, it } from 'vitest'
import { streamText } from '@xsai/stream-text'
import { env } from '@huggingface/transformers'
import { useStreamText } from '../src/stream-text'
import { useQwen3_5Chat } from '../src/stream-text/use-qwen3_5-chat.ts'

describe('useStreamText test', () => {
  env.remoteHost = 'http://127.0.0.1:8080'
  env.remotePathTemplate = '{model}'
  env.backends.onnx.wasm!.wasmPaths = 'http://127.0.0.1:8080/ort/'

  it('common text generate pipeline', async () => {
    const modelId = 'onnx-community/Qwen3-0.6B-ONNX'
    const { streamText: transformersStreamText } = useStreamText()

    // ----------------------------------------
    // 测试向量生成 (embed)
    // ----------------------------------------
    const { textStream, usage, totalUsage } = streamText({
      ...transformersStreamText(modelId, {
        device: 'webgpu',
        dtype: 'q4',
      }),
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France?' },
      ],
    })

    const text: string[] = []
    for await (const textPart of textStream) {
      console.log(textPart)
      text.push(textPart)
    }

    console.log('usage', await usage)
    console.log('totalUsage', await totalUsage)

    // ----------------------------------------
    // Step 3: 断言结果
    // ----------------------------------------
    expect(Array.isArray(text)).toBe(true)
  }, 600000) // 显式声明 600s 超时时间
  it('qwen3.5', async () => {
    const modelId = 'huggingworld/Qwen3.5-0.8B-ONNX'
    const { streamText: transformersStreamText } = useQwen3_5Chat()

    // ----------------------------------------
    // 测试向量生成 (embed)
    // ----------------------------------------
    const { textStream, usage } = streamText({
      ...transformersStreamText(modelId, {
        device: 'webgpu',
        dtype: {
          embed_tokens: 'q4',
          vision_encoder: 'fp16',
          decoder_model_merged: 'q4',
        },
      }),
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France?' },
      ],
    })

    const text: string[] = []
    for await (const textPart of textStream) {
      text.push(textPart)
    }

    // ----------------------------------------
    // Step 3: 断言结果
    // ----------------------------------------
    expect(Array.isArray(text)).toBe(true)
  }, 600000) // 显式声明 600s 超时时间
})
