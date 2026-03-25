import { StringRecordId, Table } from 'surrealdb'
import { db } from '..'
import type { AnyRecordId } from 'surrealdb'

/**
 * 插入文档
 * @param value 文档内容 (title, content等)
 * @param parent 是否有父文档
 */
export async function add(value: Database.Document.IDocumentRecord, parent?: AnyRecordId): Promise<Database.Document.IDocumentRecord> {
  const data: Record<string, unknown> = {
    ...value,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  // 如果传入了父级目录，则建立关联
  if (parent) {
    data.parent = parent
  }

  // 自动生成 ID 插入 document 表
  const [created] = await db.create<Database.Document.IDocumentRecord>(new Table('document')).content(data)
  return created
}

/**
 * 获取文档完整内容
 * @param id 文档 ID
 */
export async function getOne(id: AnyRecordId): Promise<Database.Document.IDocumentRecord | undefined> {
  return await db.select<Database.Document.IDocumentRecord>(id)
}

/**
 * 获取根目录下的所有文档（不包含文档内容，返回树形结构）
 * 通过 SurrealQL 递归自定义函数直接在数据库侧拼装好 Tree
 */
export async function getAll(): Promise<Database.Document.IDocumentTreeNode[]> {
  const query = `
    -- 定义递归函数：获取指定父节点下的所有文档骨架
    DEFINE FUNCTION OVERWRITE fn::get_doc_tree($parentId: option<record>) {
      -- 如果 $parentId 为 NONE，说明查根节点；否则查对应子节点
      LET $docs = IF $parentId == NONE {
        (SELECT id, title, parent FROM document WHERE parent IS NONE OR parent = NULL)
      } ELSE {
        (SELECT id, title, parent FROM document WHERE parent = $parentId)
      };

      -- 递归调用并组装 children 字段
      RETURN SELECT *, fn::get_doc_tree(id) AS children FROM $docs;
    };

    -- 从根节点开始触发查询
    RETURN fn::get_doc_tree(NONE);
  `

  // db.query 返回的是一个数组，对应每一条 SQL 语句的结果
  // result[0] 是 DEFINE FUNCTION 的执行结果 (空)
  // result[1] 是 RETURN 语句的执行结果
  const result = await db.query<[unknown, Database.Document.IDocumentTreeNode[]]>(query)
  return result[1] || []
}

/**
 * 更新文档
 * @param value 包含 id 的部分或全部需要更新的字段
 */
export async function updateOne(value: Database.Document.IDocumentUpdateInput): Promise<Database.Document.IDocumentRecord> {
  const { id, ...rest } = value

  // 使用 merge 只更新传入的字段
  return await db.update<Database.Document.IDocumentRecord>(id).content({
    ...rest,
    updatedAt: new Date(),
  })
}

/**
 * 删除文档以及所有子文档 (递归级联删除)
 * @param id 文档 ID (支持传入字符串或 RecordId)
 */
export async function del(id: string | AnyRecordId): Promise<void> {
  // 将 string 转换为 SurrealDB 的内部 ID 格式 (兼容 v2 版本的 SDK)
  const targetId = typeof id === 'string' ? new StringRecordId(id) : id

  const query = `
    -- 定义递归删除函数
    DEFINE FUNCTION OVERWRITE fn::delete_doc_tree($docId: record) {
      -- 1. 查找所有以当前节点为父节点的子文档
      LET $children = SELECT id FROM document WHERE parent = $docId;

      -- 2. 遍历并递归删除子文档
      FOR $child IN $children {
        fn::delete_doc_tree($child.id);
      };

      -- 3. 删除自身
      DELETE $docId;
    };

    -- 触发删除
    RETURN fn::delete_doc_tree($target);
  `

  await db.query(query, { target: targetId })
}
