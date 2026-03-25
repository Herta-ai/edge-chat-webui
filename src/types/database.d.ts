declare namespace Database {
  declare namespace Document {
    // 文档的核心内容 (用于插入和更新)
    interface IDocumentPayload {
      title: string
      content: string
      sort?: number
    }
    interface IDocumentRecord extends IDocumentPayload {
      id: import('surrealdb').RecordId<'document'>
      parent?: AnyRecordId | null // 指向父文档的 ID
      createdAt: Date
      updatedAt: Date
    }
    interface IDocumentTreeNode {
      id: import('surrealdb').RecordId<'document'>
      parent?: AnyRecordId | null // 指向父文档的 ID
      children?: IDocumentTreeNode[]
      title: string
      sort: number
    }
    // 更新时的入参
    interface IDocumentUpdateInput extends Partial<IDocumentPayload> {
      id: AnyRecordId
      parent?: AnyRecordId | null
    }
  }
}
