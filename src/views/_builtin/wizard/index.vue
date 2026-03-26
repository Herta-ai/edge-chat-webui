<script setup lang="ts">
import { computed } from 'vue'
import { getPaletteColorByNumber, mixColor } from '@sa/color'
import { useThemeStore } from '@/store/modules/theme'
import SetupWizard from './modules/SetupWizard.vue'

const themeStore = useThemeStore()

const bgThemeColor = computed(() =>
  themeStore.darkMode ? getPaletteColorByNumber(themeStore.themeColor, 600) : themeStore.themeColor,
)

const bgColor = computed(() => {
  const COLOR_WHITE = '#ffffff'

  const ratio = themeStore.darkMode ? 0.5 : 0.2

  return mixColor(COLOR_WHITE, themeStore.themeColor, ratio)
})
</script>

<template>
  <div class="relative size-full flex-center overflow-hidden" :style="{ backgroundColor: bgColor }">
    <WaveBg :theme-color="bgThemeColor" />
    <SetupWizard />
  </div>
</template>

<style scoped></style>
