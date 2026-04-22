import { StringRecordId, Table } from 'surrealdb'
import { db } from '../instance'
import type { AnyRecordId } from 'surrealdb'

// ================= 类型补充 =================
export interface IChatFolderUpdateInput extends Partial<Omit<Database.ChatHistory.IChatFolder, 'id' | 'type' | 'createdAt' | 'updatedAt'>> {
  id: AnyRecordId
}

export interface IChatUpdateInput extends Partial<Omit<Database.ChatHistory.IChat, 'id' | 'type' | 'createdAt' | 'updatedAt'>> {
  id: AnyRecordId
}

// 树结构节点可以是一个目录（包含 children），也可以是单个对话记录
export interface IChatTreeNode {
  id: AnyRecordId
  type: 'folder' | 'chat'
  title: string
  parent?: AnyRecordId | null
  createdAt: Date
  updatedAt: Date
  children?: IChatTreeNode[] // type === 'folder' 时才有可能包含子节点
}
// ===========================================

/**
 * 插入目录
 */
export async function addFolder(
  value: Partial<Database.ChatHistory.IChatFolder> & { title: string },
  parent?: AnyRecordId,
): Promise<Database.ChatHistory.IChatFolder> {
  const data: Record<string, unknown> = {
    ...value,
    type: 'folder',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  if (parent)
    data.parent = parent

  const [created] = await db.create<Database.ChatHistory.IChatFolder>(new Table('chat_folder')).content(data)
  return created!
}

/**
 * 插入对话
 */
export async function addChat(
  value: Partial<Database.ChatHistory.IChat> & { title: string, messages: Database.ChatHistory.IMessage[] },
  parent?: AnyRecordId,
): Promise<Database.ChatHistory.IChat> {
  const data: Record<string, unknown> = {
    ...value,
    type: 'chat',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  if (parent)
    data.parent = parent

  const [created] = await db.create<Database.ChatHistory.IChat>(new Table('chat')).content(data)
  return created!
}

/**
 * 获取单条目录详情
 */
export function getFolder(id: AnyRecordId): Promise<Database.ChatHistory.IChatFolder | undefined> {
  return db.select<Database.ChatHistory.IChatFolder>(id)
}

/**
 * 获取单条对话详情
 */
export function getChat(id: AnyRecordId): Promise<Database.ChatHistory.IChat | undefined> {
  return db.select<Database.ChatHistory.IChat>(id)
}

/**
 * 获取仅在根目录下的对话历史 (不包含任何文件夹)
 */
export async function getRootChats(): Promise<Database.ChatHistory.IChat[]> {
  const query = `
    SELECT * FROM chat
    WHERE parent IS NONE OR parent = NULL
    ORDER BY updatedAt DESC
  `
  const result = await db.query<[Database.ChatHistory.IChat[]]>(query)
  return result[0] || []
}

/**
 * 获取树形目录结构 (目录以及目录中的对话)
 * 通过 array::concat 将当前级的子文件夹和子对话合并并一并返回
 */
export async function getTree(): Promise<IChatTreeNode[]> {
  const query = `
    DEFINE FUNCTION OVERWRITE fn::get_chat_tree($parentId: option<record>) {
      -- 1. 获取同级所有目录
      LET $folders = IF $parentId == NONE {
        (SELECT id, type, title, parent, createdAt, updatedAt FROM chat_folder WHERE parent IS NONE OR parent = NULL)
      } ELSE {
        (SELECT id, type, title, parent, createdAt, updatedAt FROM chat_folder WHERE parent = $parentId)
      };

      -- 2. 获取同级所有对话
      LET $chats = IF $parentId == NONE {
        (SELECT id, type, title, parent, createdAt, updatedAt FROM chat WHERE parent IS NONE OR parent = NULL)
      } ELSE {
        (SELECT id, type, title, parent, createdAt, updatedAt FROM chat WHERE parent = $parentId)
      };

      -- 3. 递归遍历目录下的子结构
      LET $folder_nodes = SELECT *, fn::get_chat_tree(id) AS children FROM $folders;

      -- 4. 将目录节点和对话节点合并后，基于 updatedAt 降序排序输出
      RETURN SELECT * FROM array::concat($folder_nodes, $chats) ORDER BY updatedAt DESC;
    };

    RETURN fn::get_chat_tree(NONE);
  `

  const result = await db.query<[unknown, IChatTreeNode[]]>(query)
  return result[1] || []
}

/**
 * 更新目录 (注：使用 db.merge() 保留其他不需要更新的字段)
 */
export function updateFolder(value: IChatFolderUpdateInput): Promise<Database.ChatHistory.IChatFolder> {
  const { id, ...rest } = value
  return db.update<Database.ChatHistory.IChatFolder>(id).content({
    ...rest,
    updatedAt: new Date(),
  })
}

/**
 * 更新对话
 */
export function updateChat(value: IChatUpdateInput): Promise<Database.ChatHistory.IChat> {
  const { id, ...rest } = value
  return db.update<Database.ChatHistory.IChat>(id).content({
    ...rest,
    updatedAt: new Date(),
  })
}

/**
 * 删除目录以及所有子目录、并且清空所有对应的子对话 (递归级联删除)
 */
export async function delFolder(id: string | AnyRecordId): Promise<void> {
  const targetId = typeof id === 'string' ? new StringRecordId(id) : id

  const query = `
    DEFINE FUNCTION OVERWRITE fn::delete_chat_folder_tree($folderId: record) {
      -- 1. 查找所有子目录
      LET $subFolders = SELECT id FROM chat_folder WHERE parent = $folderId;

      -- 2. 递归删除子目录下的内容
      FOR $sub IN $subFolders {
        fn::delete_chat_folder_tree($sub.id);
      };

      -- 3. 删除挂载在该目录下的所有对话
      DELETE chat WHERE parent = $folderId;

      -- 4. 删除目录自身
      DELETE $folderId;
    };

    RETURN fn::delete_chat_folder_tree($target);
  `

  await db.query(query, { target: targetId })
}

/**
 * 删除独立对话
 */
export async function delChat(id: string | AnyRecordId): Promise<void> {
  const targetId = typeof id === 'string' ? new StringRecordId(id) : id
  await db.delete(targetId)
}
