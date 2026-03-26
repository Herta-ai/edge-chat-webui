import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      // 至少需要一个实例
      instances: [{ browser: 'chromium' }],
    },
  },
})
