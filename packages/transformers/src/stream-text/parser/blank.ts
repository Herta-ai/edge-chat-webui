import type { StreamParserConfig } from './types.ts'

export const BLANK_PARSER_CONFIG: StreamParserConfig = {
  tags: [],
  parseToolCall: (raw) => {
    return { content: raw }
  },
}
