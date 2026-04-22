import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { RecordId } from 'surrealdb'
import { chatHistory, db, setupDB } from '../src'
import type { AnyRecordId } from 'surrealdb'

describe('chatHistory Module CRUD', () => {
  import.meta.env.VITE_INDEX_DB = 'test'

  let rootFolderId: AnyRecordId
  let rootChatId: AnyRecordId
  let childFolderId: AnyRecordId
  let childChatId: AnyRecordId

  beforeAll(async () => {
    await setupDB()
    // 清空两个表，确保干净的环境
    await db.query('DELETE chat_folder; DELETE chat;')
  })

  afterAll(async () => {
    await db.query('DELETE chat_folder; DELETE chat;')
    await db.close()
  })

  it('1. addFolder: 应该能成功插入根目录', async () => {
    const folder = await chatHistory.addFolder({
      id: new RecordId('chat_folder', 'root_1'),
      title: 'Root Folder',
    })

    expect(folder).toBeDefined()
    expect(folder.id.toString()).toContain('chat_folder:root_1')
    expect(folder.type).toBe('folder')
    expect(folder.title).toBe('Root Folder')
    expect(folder.parent).toBeUndefined()

    rootFolderId = folder.id
  })

  it('2. addChat: 应该能插入在根目录的对话', async () => {
    const chat = await chatHistory.addChat({
      id: new RecordId('chat', 'root_c1'),
      title: 'Root Chat',
      messages: [],
    })

    expect(chat).toBeDefined()
    expect(chat.parent).toBeUndefined()
    expect(chat.type).toBe('chat')

    rootChatId = chat.id
  })

  it('3. addFolder & addChat: 能够成功嵌套子目录和子对话', async () => {
    // 插入子目录 (挂在根目录)
    const folder = await chatHistory.addFolder(
      { id: new RecordId('chat_folder', 'child_f1'), title: 'Child Folder' },
      rootFolderId,
    )
    expect(folder.parent?.toString()).toEqual(rootFolderId.toString())
    childFolderId = folder.id

    // 插入子对话 (挂在子目录)
    const chat = await chatHistory.addChat(
      { id: new RecordId('chat', 'child_c1'), title: 'Child Chat', messages: [] },
      childFolderId,
    )
    expect(chat.parent?.toString()).toEqual(childFolderId.toString())
    childChatId = chat.id
  })

  it('4. getRootChats: 应该能够正确过滤仅仅位于根目录下的对话历史', async () => {
    const rootChats = await chatHistory.getRootChats()
    expect(rootChats).toBeInstanceOf(Array)
    expect(rootChats.length).toBe(1)
    expect(rootChats[0]?.title).toBe('Root Chat')
  })

  it('5. getTree: 应该能够正确组装多态树结构 (Folder 和 Chat 并存)', async () => {
    const tree = await chatHistory.getTree()

    // 检查顶层是否包含 1个根目录 和 1个根对话
    expect(tree.length).toBe(2)
    const rootFolderNode = tree.find(n => n.type === 'folder' && n.id.toString() === rootFolderId.toString())
    const rootChatNode = tree.find(n => n.type === 'chat' && n.id.toString() === rootChatId.toString())
    expect(rootFolderNode).toBeDefined()
    expect(rootChatNode).toBeDefined()

    // 检查根目录下的 children（是否包含子目录）
    expect(rootFolderNode?.children).toBeDefined()
    expect(rootFolderNode?.children?.length).toBe(1)

    const childFolderNode = rootFolderNode?.children?.[0]
    expect(childFolderNode?.title).toBe('Child Folder')

    // 检查子目录下的 children（是否包含子对话）
    expect(childFolderNode?.children).toBeDefined()
    expect(childFolderNode?.children?.length).toBe(1)
    expect(childFolderNode?.children?.[0]?.title).toBe('Child Chat')
  })

  it('6. updateFolder & updateChat: 应该能更新标题等信息', async () => {
    const updatedFolder = await chatHistory.updateFolder({
      id: rootFolderId,
      title: 'Updated Root Folder',
    })
    expect(updatedFolder.title).toBe('Updated Root Folder')

    const updatedChat = await chatHistory.updateChat({
      id: rootChatId,
      title: 'Updated Root Chat',
    })
    expect(updatedChat.title).toBe('Updated Root Chat')
  })

  it('7. delFolder: 级联删除，应自动清理自身、所有嵌套子目录和挂载的子对话', async () => {
    // 执行级联删除
    await chatHistory.delFolder(rootFolderId)

    // 1. 验证：根目录被删除
    const rootFolderDb = await chatHistory.getFolder(rootFolderId)
    expect(rootFolderDb).toBeUndefined()

    // 2. 验证：子目录被删除
    const childFolderDb = await chatHistory.getFolder(childFolderId)
    expect(childFolderDb).toBeUndefined()

    // 3. 验证：挂载在子目录下的子对话也被级联清空
    const childChatDb = await chatHistory.getChat(childChatId)
    expect(childChatDb).toBeUndefined()

    // 4. 验证：不在这个目录体系下（也就是根目录下）的独立对话【不应该】受到影响
    const rootChatDb = await chatHistory.getChat(rootChatId)
    expect(rootChatDb).toBeDefined()
  })

  it('8. delChat: 应该能单独删除对话', async () => {
    // 清理最后余下的独立根对话
    await chatHistory.delChat(rootChatId)
    const chatDb = await chatHistory.getChat(rootChatId)
    expect(chatDb).toBeUndefined()
  })

  it('9. sort: 查询应基于 updatedAt 降序排列 (最新更新的在最前)', async () => {
    // 1. 依次插入三个数据 (它们的时间会依次变新)
    const chat1 = await chatHistory.addChat({
      id: new RecordId('chat', 'sort_c1'),
      title: 'Oldest Chat',
      messages: [],
    })

    // 稍微延迟 10ms 确保 updatedAt 不在同一毫秒
    await new Promise(resolve => setTimeout(resolve, 10))

    const folder1 = await chatHistory.addFolder({
      id: new RecordId('chat_folder', 'sort_f1'),
      title: 'Middle Folder',
    })

    await new Promise(resolve => setTimeout(resolve, 10))

    const chat2 = await chatHistory.addChat({
      id: new RecordId('chat', 'sort_c2'),
      title: 'Newest Chat',
      messages: [],
    })

    // 2. 验证初始顺序：最新创建的 chat2 应在第一位
    let tree = await chatHistory.getTree()
    expect(tree[0]?.id.toString()).toBe(chat2.id.toString())
    expect(tree[1]?.id.toString()).toBe(folder1.id.toString())
    expect(tree[2]?.id.toString()).toBe(chat1.id.toString())

    // 3. 更新最旧的 chat1，这将更新它的 updatedAt (使其成为最新)
    await chatHistory.updateChat({
      id: chat1.id,
      title: 'Updated Chat (Now Newest)',
    })

    // 4. 再次获取树结构，验证顺序是否发生了动态改变
    tree = await chatHistory.getTree()

    // chat1 现在是刚被更新过的，应跃升至第 1 位
    expect(tree[0]?.id.toString()).toBe(chat1.id.toString())
    expect(tree[0]?.title).toBe('Updated Chat (Now Newest)')

    // 原本的 chat2 被挤到了第 2 位
    expect(tree[1]?.id.toString()).toBe(chat2.id.toString())

    // 清理测试数据
    await chatHistory.delChat(chat1.id)
    await chatHistory.delChat(chat2.id)
    await chatHistory.delFolder(folder1.id)
  })
})
