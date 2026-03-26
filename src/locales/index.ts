import { createI18n } from 'vue-i18n'
import { localStg } from '@/utils/storage'
import messages from './locale'
import type { App } from 'vue'

const i18n = createI18n({
  locale: localStg.get('lang') || 'zh-CN',
  fallbackLocale: 'en',
  messages,
  legacy: false,
})

/**
 * Setup plugin i18n
 *
 * @param app
 */
export function setupI18n(app: App) {
  app.use(i18n)
}

export const $t = i18n.global.t as I18N.$T

export function setLocale(locale: I18N.LangType) {
  i18n.global.locale.value = locale

  document?.querySelector('html')?.setAttribute('lang', locale)
}

export function getLocale(): I18N.LangType {
  return i18n.global.locale.value as I18N.LangType
}
