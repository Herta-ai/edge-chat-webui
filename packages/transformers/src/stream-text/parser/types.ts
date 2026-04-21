export interface TagRule {
  tag: string
  action: 'start_reasoning' | 'end_reasoning' | 'start_tool' | 'end_tool' | 'drop'
}

export interface ParsedToolCallResult {
  content?: string | null
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string, arguments: string }
  }>
}

/** 依赖注入的解析配置接口 */
export interface StreamParserConfig {
  /** 模型特有的标签规则 */
  tags: TagRule[]
  /** 工具调用缓冲区完整后的解析函数 */
  parseToolCall: (buffer: string) => ParsedToolCallResult | null
  /** 可选：普通文本/思考文本发送前的清洗函数 */
  cleanText?: (text: string) => string
}
