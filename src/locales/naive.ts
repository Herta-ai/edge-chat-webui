import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'
import type { NDateLocale, NLocale } from 'naive-ui'

export const naiveLocales: Record<I18N.LangType, NLocale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export const naiveDateLocales: Record<I18N.LangType, NDateLocale> = {
  'zh-CN': dateZhCN,
  'en-US': dateEnUS,
}
