declare namespace Database {
  namespace Document {
    // 文档的核心内容 (用于插入和更新)
    interface IDocumentPayload {
      title: string
      content: string
      sort?: number
    }
    interface IDocumentRecord extends IDocumentPayload {
      id: import('surrealdb').RecordId<'document'>
      parent?: import('surrealdb').AnyRecordId | null
      createdAt: Date
      updatedAt: Date
    }
    interface IDocumentTreeNode {
      id: import('surrealdb').RecordId<'document'>
      parent?: import('surrealdb').AnyRecordId | null
      children?: IDocumentTreeNode[]
      title: string
      sort: number
    }
    // 更新时的入参
    interface IDocumentUpdateInput extends Partial<IDocumentPayload> {
      id: import('surrealdb').AnyRecordId
      parent?: import('surrealdb').AnyRecordId | null
    }
  }
  namespace ChatHistory {
    interface IChatFolder {
      id: import('surrealdb').RecordId<'chat_folder'>
      type: 'folder'
      title: string
      parent?: import('surrealdb').RecordId<'chat_folder'> | null
      createdAt: Date
      updatedAt: Date
    }
    interface IChat {
      id: import('surrealdb').RecordId<'chat'>
      type: 'chat'
      title: string
      messages: IMessage[]
      parent?: import('surrealdb').RecordId<'chat_folder'> | null
      createdAt: Date
      updatedAt: Date
    }
    type TMessageContent = {
      type: 'text'
      text: string
    } | {
      type: 'tool_call'
      function?: {
        name: string
        arguments: string
      }
    } | {
      type: 'file'
      fileType: 'image' | 'audio'
      base64: string
      fileIdentifier: string
      sizeBytes: number
    }
    interface IMessage {
      id: string
      role: import('@ecw/types/llm').MessageRole
      content: TMessageContent[]
      model?: string
      reasoning_content?: string
      finish_reason?: string
      stat?: {
        // 首字响应时间
        timeToFirstTokenSec?: number
        // 思考时间
        reasoning_time?: number
        // 正文生成时间
        content_time?: number
        // 文字生成速度（token/s）
        tokensPerSecond?: number
      }

      usage?: import('@ecw/types/llm').Usage
    }
  }
}
