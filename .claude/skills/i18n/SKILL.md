---
name: i18n
description: 编写界面文案时，根据该规则编写i18n国际化代码
version: 1.0.0
---

## trigger

当编写文案、文本、国际化时，参考下面的规则。
关键词识别：国际化、i18n

## step

1. 先查阅 `src/locales/langs/zh-cn.ts` 和 `src/locales/langs/en-us.ts` 是否有已有的国际化文案
2. 使用i18n插件时，使用 `import { $t } from '@/locales'` 导入插件
3. 如果已有，可以直接使用 `$t('page.wizard.step1Title')` 的方式使用
4. 如果需要新增，首先在 `src/types/i18n.d.ts` 里的 `I18N.Scheme` 内加入类型定义
5. 然后在 `src/locales/langs/zh-cn.ts` 和 `src/locales/langs/en-us.ts` 加入对应的国际化文案
