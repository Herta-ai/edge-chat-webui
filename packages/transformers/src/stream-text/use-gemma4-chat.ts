import {
  Gemma4ForConditionalGeneration,
} from '@huggingface/transformers'
import { useCustomModelChat } from './use-custom-model-chat.ts'

export function useGemma4Chat() {
  return useCustomModelChat(Gemma4ForConditionalGeneration, { skip_special_tokens: false })
}
