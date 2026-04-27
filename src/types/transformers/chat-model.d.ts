declare namespace ChatModel {
  interface IChatModelBase {
    modelId: string
    type: 'base'
    dtype: string | Record<string, any>
    ability: {
      thinking: false
      toolCall: false
      vision: false
      audio: false
    }
  }
  interface IChatModelQwen3_5 {
    modelId: string
    type: 'qwen3.5'
    dtype: string | Record<string, any>
    ability: {
      thinking: true
      toolCall: true
      vision: true
      audio: false
    }
  }
  interface IChatModelGemma4 {
    modelId: string
    type: 'gemma4'
    dtype: string | Record<string, any>
    ability: {
      thinking: true
      toolCall: true
      vision: true
      audio: false
    }
  }
  type TChatModel = IChatModelBase | IChatModelQwen3_5 | IChatModelGemma4
}
