import { createPinia } from 'pinia'
import { resetSetupStore } from './plugins'
import type { App } from 'vue'

/** Setup Vue store plugin pinia */
export function setupStore(app: App) {
  const store = createPinia()

  store.use(resetSetupStore)

  app.use(store)
}
