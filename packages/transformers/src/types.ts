import type { PretrainedModelOptions, ProgressInfo } from '@huggingface/transformers'
import type { MessageRole, Usage } from '@ecw/types/llm'

export type TStatus = 'idle' | 'loading_model' | 'ready' | 'model_running' | 'error'

// 定义工具调用流式分块
export interface ToolCallChunk {
  index: number // 非常关键：流式返回多个并行工具调用时，用 index 区分当前是哪个工具
  id?: string // 通常只在工具调用的第一个 chunk 中返回
  type?: 'function' // 通常只在第一个 chunk 中返回
  function?: {
    name?: string // 通常只在第一个 chunk 中返回
    arguments?: string // 流式拼接的核心字段：JSON 格式的参数片段
  }
}

// Delta 内容
export interface Delta {
  role?: MessageRole // 通常只在流的第一个 chunk 中返回
  content?: string | null
  reasoning_content?: string | null // 兼容 DeepSeek / OpenAI o1 等推理模型
  tool_calls?: ToolCallChunk[] // 补充：新的工具调用字段
}

// Choice 内容
export interface ChunkChoice {
  index: number
  delta: Delta
  // finish_reason 非常重要：
  // null 表示还在输出中
  // 'stop' 表示正常输出结束
  // 'tool_calls' 表示接下来需要客户端去执行函数
  // 'length' 表示达到最大 token 限制
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
}

// 根对象
export interface ChatCompletionChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: ChunkChoice[]
  usage?: Usage // 注意：前面的 chunk usage 都是未定义，只有最后一个 chunk 才有
}

export interface LoadModelFnOptions extends PretrainedModelOptions {
  progress_callback?: (info: ProgressInfo) => void
}
