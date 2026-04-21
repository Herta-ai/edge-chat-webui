import type { StreamParserConfig, TagRule } from './types.ts'

// 流处理器
export class StreamProcessor {
  private isReasoning = false
  private isToolCall = false
  private toolCallBuffer = ''
  private fullGeneratedText = ''
  private fullReasoningText = ''
  private hasEmittedToolCall = false

  constructor(
    private config: StreamParserConfig,
    private onChunk: (data: any, type: 'content' | 'reasoning' | 'tool_calls') => void,
    reasoning = false,
  ) {
    this.isReasoning = reasoning
  }

  /** 处理模型输出的文本块 */
  process(text: string) {
    if (!text)
      return
    this.fullGeneratedText += text
    let remaining = text

    while (remaining.length > 0) {
      // 查找最早出现的标签
      const matches = this.config.tags
        .map(rule => ({ ...rule, index: remaining.indexOf(rule.tag) }))
        .filter(r => r.index !== -1)
        .sort((a, b) => a.index - b.index)

      const matched = matches[0]

      if (matched) {
        const before = remaining.slice(0, matched.index)
        if (before)
          this.handleText(before)
        this.handleTag(matched.action, matched.tag)
        remaining = remaining.slice(matched.index + matched.tag.length)
      }
      else {
        this.handleText(remaining)
        break
      }
    }
  }

  private handleText(text: string) {
    if (this.isToolCall) {
      this.toolCallBuffer += text
    }
    else {
      const cleaned = this.config.cleanText ? this.config.cleanText(text) : text
      if (cleaned) {
        this.onChunk(cleaned, this.isReasoning ? 'reasoning' : 'content')
        if (this.isReasoning)
          this.fullReasoningText += cleaned
      }
    }
  }

  private handleTag(action: TagRule['action'], tag: string) {
    switch (action) {
      case 'start_reasoning': {
        this.isReasoning = true
        break
      }
      case 'end_reasoning': {
        this.isReasoning = false
        break
      }
      case 'start_tool':
        this.isToolCall = true
        this.toolCallBuffer += tag
        break
      case 'end_tool':
        this.toolCallBuffer += tag
        this.isToolCall = false
        this.flushToolCall()
        break
      case 'drop': break
    }
  }

  private flushToolCall() {
    const parsed = this.config.parseToolCall(this.toolCallBuffer)
    if (parsed?.tool_calls?.length) {
      const mapped = parsed.tool_calls.map((tc, i) => ({
        index: i,
        id: tc.id,
        type: tc.type,
        function: { name: tc.function.name, arguments: tc.function.arguments },
      }))
      this.onChunk(mapped, 'tool_calls')
      this.hasEmittedToolCall = true
    }
    else if (parsed?.content) {
      this.onChunk(parsed.content, 'content')
    }
    this.toolCallBuffer = ''
  }

  /** 推理结束时的兜底处理 */
  finalize() {
    if (this.isToolCall && this.toolCallBuffer.trim()) {
      this.flushToolCall()
    }
  }

  /** 暴露给外部计算 usage 和 finish_reason 的状态 */
  get state() {
    return {
      hasEmittedToolCall: this.hasEmittedToolCall,
      fullGeneratedText: this.fullGeneratedText,
      fullReasoningText: this.fullReasoningText,
    }
  }
}
