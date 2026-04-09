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
    const { streamText: transformersStreamText } = useStreamText()

    const { textStream, usage } = streamText({
      ...transformersStreamText({
        device: 'webgpu',
        dtype: 'q4f16',
      }),
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France?' },
      ],
      model: 'HuggingFaceTB/SmolLM2-135M-Instruct',
    })

    const text: string[] = []
    for await (const textPart of textStream) {
      text.push(textPart)
    }

    expect(Array.isArray(text)).toBe(true)
    expect(await usage).toBeDefined()
  }, 600000) // 显式声明 600s 超时时间
  it('qwen3.5', async () => {
    const { streamText: transformersStreamText } = useQwen3_5Chat()

    const { textStream, usage } = streamText({
      ...transformersStreamText({
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
      model: 'onnx-community/Qwen3.5-0.8B-ONNX',
    })

    const text: string[] = []
    for await (const textPart of textStream) {
      text.push(textPart)
    }

    expect(Array.isArray(text)).toBe(true)
    expect(usage).toBeDefined()
  }, 600000) // 显式声明 600s 超时时间
})
