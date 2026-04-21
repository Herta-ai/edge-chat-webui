export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

// 用量统计 (仅在流的最后一个 chunk 中通过 stream_options: { include_usage: true } 返回)
export interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  completion_tokens_details?: {
    reasoning_tokens: number
  }
}
