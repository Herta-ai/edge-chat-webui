import {
  Qwen3_5ForConditionalGeneration,
} from '@huggingface/transformers'
import { useCustomModelChat } from './use-custom-model-chat.ts'

export function useQwen3_5Chat() {
  return useCustomModelChat(Qwen3_5ForConditionalGeneration)
}
