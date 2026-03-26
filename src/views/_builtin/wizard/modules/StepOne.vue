<script setup lang="ts">
import { $t } from '@/locales'
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center p-8 text-center">
    <!-- 占位插画或图标 -->
    <div class="mb-8 h-48 w-48 flex items-center justify-center border border-primary/20 rounded-2xl bg-primary-100/30">
      <div class="text-icon-xl text-primary font-bold">
        Icon 1
      </div>
    </div>
    <h2 class="mb-4 text-2xl text-base-text font-bold">
      {{ $t('page.wizard.step1Title') }}
    </h2>
    <p class="mb-8 text-base-text opacity-70">
      {{ $t('page.wizard.step1Desc') }}
    </p>

    <!-- TODO: 第一步的具体表单或设置项 -->
    <div class="max-w-md w-full border border-white/10 rounded-lg bg-layout/40 p-4">
      <span class="text-info">TODO: 在这里实现主题选择或语言切换</span>
    </div>
  </div>
</template>
