declare namespace ChatModel {
  interface IChatModel {
    modelId: string
    type: 'common' | 'qwen3.5'
    dtype: string | Record<string, any>
  }
}
