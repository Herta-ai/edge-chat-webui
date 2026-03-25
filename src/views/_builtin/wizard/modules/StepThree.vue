<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center p-8 text-center">
    <div class="mb-8 h-48 w-48 flex items-center justify-center border border-primary/50 rounded-full bg-primary/20 shadow-[var(--header-box-shadow)]">
      <div class="text-icon-xl text-primary font-bold">
        🎉
      </div>
    </div>
    <h2 class="mb-4 text-2xl text-base-text font-bold">
      {{ t('page.wizard.step3Title') }}
    </h2>
    <p class="mb-8 text-base-text opacity-70">
      {{ t('page.wizard.step3Desc') }}
    </p>

    <!-- TODO: 第三步的预览或确认信息 -->
    <div class="max-w-md w-full border border-white/10 rounded-lg bg-layout/40 p-4">
      <span class="text-success">TODO: 在这里展示用户的设置汇总</span>
    </div>
  </div>
</template>
