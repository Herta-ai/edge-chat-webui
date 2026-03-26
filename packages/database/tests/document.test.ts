import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { DateTime, RecordId } from 'surrealdb'
import { db, document, setupDB } from '../src'
import type { AnyRecordId } from 'surrealdb'

const { add, del, getAll, getOne, updateOne } = document

describe('document Module CRUD', () => {
  import.meta.env.VITE_INDEX_DB = 'test'
  let rootDocId: AnyRecordId
  let childDocId: AnyRecordId

  // 测试前：连接数据库并清理脏数据
  beforeAll(async () => {
    await setupDB()
    // 清空 document 表，确保测试在一个干净的环境下运行
    await db.query('DELETE document')
  })

  // 测试后：清理测试数据并断开连接
  afterAll(async () => {
    await db.query('DELETE document')
    await db.close()
  })

  it('1. add: 应该能成功插入根文档', async () => {
    const doc = await add({
      id: new RecordId('document', Date.now()),
      title: 'Root Document',
      content: 'This is root content',
      updatedAt: new Date(),
      createdAt: new Date(),
    })

    expect(doc).toBeDefined()
    expect(doc.id).toBeDefined()
    expect(doc.title).toBe('Root Document')
    expect(doc.createdAt).toBeInstanceOf(DateTime)
    expect(doc.updatedAt).toBeInstanceOf(DateTime)
    expect(doc.parent).toBeUndefined()

    rootDocId = doc.id
  })

  it('2. getOne: 应该能通过 ID 获取文档', async () => {
    const doc = await getOne(rootDocId)

    expect(doc).toBeDefined()
    // SurrealDB 的 RecordId 可以转为 string 对比以保证准确性
    expect(doc?.id.toString()).toEqual(rootDocId.toString())
    expect(doc?.title).toBe('Root Document')
  })

  it('3. add: 应该能插入子文档并成功建立 parent 关联', async () => {
    const doc = await add(
      {
        id: new RecordId('document', Date.now()),
        title: 'Child Document',
        content: 'This is child content',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      rootDocId,
    )

    expect(doc).toBeDefined()
    expect(doc.parent).toBeDefined()
    expect(doc.parent?.toString()).toEqual(rootDocId.toString())

    childDocId = doc.id
  })

  it('4. getAll: 应该能通过自定义函数正确获取树形嵌套结果', async () => {
    const tree = await getAll()

    expect(tree).toBeInstanceOf(Array)
    expect(tree.length).toBeGreaterThan(0)

    // 找出刚才插入的根文档节点
    const rootNode = tree.find(node => node.id.toString() === rootDocId.toString())
    expect(rootNode).toBeDefined()
    expect(rootNode?.title).toBe('Root Document')

    // 检查其 children 字段是否包含了子文档
    expect(rootNode?.children).toBeInstanceOf(Array)
    expect(rootNode?.children?.length).toBe(1)
    expect(rootNode?.children?.[0]?.id.toString()).toBe(childDocId.toString())
    expect(rootNode?.children?.[0]?.title).toBe('Child Document')
  })

  it('5. updateOne: 应该能更新文档信息', async () => {
    const updateInput = {
      id: rootDocId,
      title: 'Updated Root Document',
      content: 'Updated content',
    }

    const updatedDoc = await updateOne(updateInput)

    expect(updatedDoc).toBeDefined()
    expect(updatedDoc.title).toBe('Updated Root Document')
    expect(updatedDoc.updatedAt).toBeInstanceOf(DateTime)

    // 二次确认数据库里确实更新了
    const dbDoc = await getOne(rootDocId)
    expect(dbDoc?.title).toBe('Updated Root Document')
  })

  it('6. del: 应该能级联删除文档以及所有子文档', async () => {
    // 触发删除根文档
    await del(rootDocId)

    // 检查根文档是否被删除
    const rootAfterDel = await getOne(rootDocId)
    expect(rootAfterDel).toBeUndefined()

    // 检查子文档是否因为级联函数 (delete_doc_tree) 而被同时删除
    const childAfterDel = await getOne(childDocId)
    expect(childAfterDel).toBeUndefined()
  })
})
