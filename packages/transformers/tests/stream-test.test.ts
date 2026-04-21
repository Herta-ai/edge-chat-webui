import { describe, expect, it } from 'vitest'
import { streamText } from '@xsai/stream-text'
import { env } from '@huggingface/transformers'
import { consola } from 'consola/browser'
import { BLANK_PARSER_CONFIG, GEMMA_PARSER_CONFIG, QWEN_PARSER_CONFIG, useGemma4Chat, useQwen3_5Chat, useStreamText } from '../src/stream-text'
import type { ToolCallChunk } from '../src/types.ts'
import type { Tool } from '@xsai/shared-chat'

describe('useStreamText test', () => {
  consola.level = 4
  env.remoteHost = 'http://127.0.0.1:8080'
  env.remotePathTemplate = '{model}'
  env.backends.onnx.wasm!.wasmPaths = 'http://127.0.0.1:8080/ort/'

  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_current_weather',
        description: '获取指定城市的当前天气情况',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: '城市名称，例如：北京、上海',
            },
          },
          required: ['location'],
        },
      },
      execute: () => '',
    },
  ] as Tool[]

  it('common text generate pipeline', async () => {
    const { streamText: transformersStreamText } = useStreamText()

    const { textStream, usage } = streamText({
      ...transformersStreamText({
        device: 'webgpu',
        dtype: 'q4f16',
      }, BLANK_PARSER_CONFIG),
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France?' },
      ],
      max_new_tokens: 1024,
      model: 'HuggingFaceTB/SmolLM2-135M-Instruct',
    })

    const text: string[] = []
    for await (const textPart of textStream) {
      consola.log(textPart)
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
      }, QWEN_PARSER_CONFIG),
      messages: [
        { role: 'user', content: 'What is the capital of France?' },
      ],
      model: 'onnx-community/Qwen3.5-0.8B-ONNX',
      enable_thinking: true,
      max_new_tokens: 1024,
      temperature: 0.6,
      // @todo: 重复惩罚入参好像没用？
      presence_penalty: 1.5,

    })

    const reasoningText: string[] = []
    const text: string[] = []
    for await (const textPart of fullStream) {
      consola.log(textPart)
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
  it('qwen3.5 tool call', async () => {
    const { streamText: transformersStreamText } = useQwen3_5Chat()

    const { fullStream, usage } = streamText({
      ...transformersStreamText({
        device: 'webgpu',
        dtype: {
          embed_tokens: 'q4',
          vision_encoder: 'fp16',
          decoder_model_merged: 'q4',
        },
      }, QWEN_PARSER_CONFIG),
      messages: [
        { role: 'user', content: '北京的天气怎么样?' },
      ],
      model: 'onnx-community/Qwen3.5-0.8B-ONNX',
      enable_thinking: true,
      max_new_tokens: 1024,
      maxSteps: 0,
      tools,
    })

    const reasoningText: string[] = []
    const text: string[] = []
    let toolCall: ToolCallChunk | null = null
    for await (const textPart of fullStream) {
      consola.log(textPart)
      if (textPart.type === 'text-delta' && textPart.text) {
        text.push(textPart.text)
      }
      else if (textPart.type === 'reasoning-delta') {
        reasoningText.push(textPart.text)
      }
      else if (textPart.type === 'tool-call') {
        toolCall = {
          index: 0,
          function: {
            name: textPart.toolName,
            arguments: JSON.parse(textPart.args),
          },
        }
      }
    }
    expect(toolCall?.function).toStrictEqual({ name: 'get_current_weather', arguments: { location: '北京' } })
    expect(reasoningText.length).toBeGreaterThan(0)
    expect(text.length).toBeGreaterThan(0)
    expect(usage).toBeDefined()
  }, 600000)
  it('gemma4', async () => {
    const { streamText: transformersStreamText } = useGemma4Chat()

    const { fullStream, usage } = streamText({
      ...transformersStreamText({
        device: 'webgpu',
        dtype: 'q4f16',
      }, GEMMA_PARSER_CONFIG),
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
      consola.log(textPart)
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
  it('gemma4 tool call', async () => {
    const { streamText: transformersStreamText } = useGemma4Chat()

    const { fullStream, usage } = streamText({
      ...transformersStreamText({
        device: 'webgpu',
        dtype: 'q4f16',
      }, GEMMA_PARSER_CONFIG),
      messages: [
        { role: 'user', content: '北京的天气怎么样?' },
      ],
      model: 'onnx-community/gemma-4-E2B-it-ONNX',
      enable_thinking: true,
      max_new_tokens: 1024,
      tools,
    })

    const reasoningText: string[] = []
    const text: string[] = []
    let toolCall: ToolCallChunk | null = null
    for await (const textPart of fullStream) {
      consola.log(textPart)
      if (textPart.type === 'text-delta' && textPart.text) {
        text.push(textPart.text)
      }
      else if (textPart.type === 'reasoning-delta') {
        reasoningText.push(textPart.text)
      }
      else if (textPart.type === 'tool-call') {
        toolCall = {
          index: 0,
          function: {
            name: textPart.toolName,
            arguments: JSON.parse(textPart.args),
          },
        }
      }
    }
    expect(toolCall?.function).toStrictEqual({ name: 'get_current_weather', arguments: { location: '北京' } })
    expect(reasoningText.length).toBeGreaterThan(0)
    expect(text.length).toBeGreaterThan(0)
    expect(usage).toBeDefined()
  }, 600000)
})
