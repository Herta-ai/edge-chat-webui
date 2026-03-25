/**
 * @todo: @surrealdb/wasm v3.0还并不可用，等待解决
 * https://github.com/surrealdb/surrealdb.js/issues/571
 * https://github.com/surrealdb/indxdb/issues/9
 */
import { Surreal } from 'surrealdb'
import { createWasmWorkerEngines } from '@surrealdb/wasm'

export const db = new Surreal({
  engines: {
    ...createWasmWorkerEngines(),
  },
})

export async function setupDB() {
  await db.connect(`indxdb://${import.meta.env.VITE_INDEX_DB}`, {
    namespace: import.meta.env.VITE_INDEX_DB,
    database: import.meta.env.VITE_INDEX_DB,
  })
}
