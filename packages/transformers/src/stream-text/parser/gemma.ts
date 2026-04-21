import type { StreamParserConfig } from './types.ts'

export const GEMMA_PARSER_CONFIG: StreamParserConfig = {
  tags: [
    { tag: '<|channel>', action: 'start_reasoning' },
    { tag: '<channel|>', action: 'end_reasoning' },
    { tag: '<|tool_call>', action: 'start_tool' },
    { tag: '<tool_call|>', action: 'end_tool' },
    { tag: '<|im_end|>', action: 'drop' },
    { tag: '<|tool_response|>', action: 'drop' },
  ],
  parseToolCall: (raw) => {
    const toolCallRegex = /<\|tool_call>\s*call:([^{]+)\{([^}]*)\}\s*<tool_call\|>/
    const match = raw.match(toolCallRegex)
    if (!match)
      return { content: raw.trim() }

    const functionName = match[1]!.trim()
    const argsString = match[2]!.trim()
    const args: Record<string, any> = {}

    if (argsString) {
      const kvRegex = /(\w+):(?:<\|"\|>(.*?)<\|"\|>|([^,]+))/g
      for (const kv of argsString.matchAll(kvRegex)) {
        args[kv[1]!.trim()] = kv[2] !== undefined ? kv[2] : kv[3]!.trim()
      }
    }

    const content = raw.split('<|tool_call>')[0]!.trim() || null
    return {
      content,
      tool_calls: [{
        id: `call_${Math.random().toString(36).substring(2, 10)}`,
        type: 'function',
        function: { name: functionName, arguments: JSON.stringify(args) },
      }],
    }
  },
}
