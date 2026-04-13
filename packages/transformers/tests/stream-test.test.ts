import { describe, expect, it } from 'vitest'
import { streamText } from '@xsai/stream-text'
import { env } from '@huggingface/transformers'
import { useGemma4Chat, useQwen3_5Chat, useStreamText } from '../src/stream-text'

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
  }, 600000)
  it('qwen3.5', async () => {
    const { streamText: transformersStreamText } = useQwen3_5Chat()

    const { fullStream, usage } = streamText({
      ...transformersStreamText({
        device: 'webgpu',
        dtype: {
          embed_tokens: 'q4',
          vision_encoder: 'fp16',
          decoder_model_merged: 'q4',
        },
      }),
      messages: [
        { role: 'user', content: 'What is the capital of France?' },
      ],
      model: 'onnx-community/Qwen3.5-0.8B-ONNX',
      enable_thinking: true,
      max_new_tokens: 1024,
      temperature: 0.6,
      presence_penalty: 1.5,
    })

    const reasoningText: string[] = []
    const text: string[] = []
    for await (const textPart of fullStream) {
      if (textPart.type === 'text-delta' && textPart.text) {
        text.push(textPart.text)
      }
      else if (textPart.type === 'reasoning-delta') {
        reasoningText.push(textPart.text)
      }
    }

    expect(reasoningText.length).toBeGreaterThan(0)
    expect(text.length).toBeGreaterThan(0)
    expect(usage).toBeDefined()
  }, 600000)
  it('gemma4', async () => {
    const { streamText: transformersStreamText } = useGemma4Chat()

    const { fullStream, usage } = streamText({
      ...transformersStreamText({
        device: 'webgpu',
        dtype: {
          embed_tokens: 'q4',
          vision_encoder: 'fp16',
          audio_encoder: 'fp16',
          decoder_model_merged: 'q4',
        },
      }),
      messages: [
        { role: 'user', content: 'What is the capital of France?' },
      ],
      model: 'onnx-community/gemma-4-E2B-it-ONNX',
      enable_thinking: true,
      max_new_tokens: 1024,
    })

    const reasoningText: string[] = []
    const text: string[] = []
    for await (const textPart of fullStream) {
      if (textPart.type === 'text-delta' && textPart.text) {
        text.push(textPart.text)
      }
      else if (textPart.type === 'reasoning-delta') {
        reasoningText.push(textPart.text)
      }
    }

    expect(reasoningText.length).toBeGreaterThan(0)
    expect(text.length).toBeGreaterThan(0)
    expect(usage).toBeDefined()
  }, 600000)
})
