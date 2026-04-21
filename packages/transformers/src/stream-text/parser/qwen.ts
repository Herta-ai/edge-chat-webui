import type { StreamParserConfig } from './types.ts'

export const QWEN_PARSER_CONFIG: StreamParserConfig = {
  tags: [
    { tag: '<think>', action: 'start_reasoning' },
    { tag: '</think>', action: 'end_reasoning' },
    { tag: '<tool_call>', action: 'start_tool' },
    { tag: '</tool_call>', action: 'end_tool' },
    { tag: '<turn|>', action: 'drop' },
    { tag: '<|im_end|>', action: 'drop' },
  ],
  parseToolCall: (raw) => {
    const funcMatch = raw.match(/<function=([^>]+)>/)
    if (!funcMatch)
      return { content: raw.replace(/<tool_call>|<\/tool_call>/g, '').trim() || null }

    const functionName = funcMatch[1]!
    const args: Record<string, any> = {}
    const paramRegex = /<parameter=([^>]+)>([\s\S]*?)<\/parameter>/g
    for (const m of raw.matchAll(paramRegex)) {
      args[m[1]!] = m[2]!.trim()
    }

    const content = raw.split(/<function=/)[0]!.replace(/<tool_call>/g, '').trim() || null
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
