<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center p-8 text-center">
    <div class="mb-8 h-48 w-48 flex items-center justify-center border border-success/20 rounded-2xl bg-success-100/30">
      <div class="text-icon-xl text-success font-bold">
        Icon 2
      </div>
    </div>
    <h2 class="mb-4 text-2xl text-base-text font-bold">
      {{ t('page.wizard.step2Title') }}
    </h2>
    <p class="mb-8 text-base-text opacity-70">
      {{ t('page.wizard.step2Desc') }}
    </p>

    <!-- TODO: 第二步的具体表单或设置项 -->
    <div class="max-w-md w-full border border-white/10 rounded-lg bg-layout/40 p-4">
      <span class="text-warning">TODO: 在这里实现个人信息或偏好设置</span>
    </div>
  </div>
</template>
