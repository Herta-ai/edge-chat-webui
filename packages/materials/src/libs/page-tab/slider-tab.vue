<script setup lang="ts">
import style from './index.module.css'
import type { PageTabProps } from '../../types'

defineOptions({
  name: 'SliderTab',
})

defineProps<PageTabProps>()

defineSlots<Slots>()

type SlotFn = (props?: Record<string, unknown>) => any

interface Slots {
  /**
   * Slot
   *
   * The center content of the tab
   */
  default?: SlotFn
  /**
   * Slot
   *
   * The left content of the tab
   */
  prefix?: SlotFn
  /**
   * Slot
   *
   * The right content of the tab
   */
  suffix?: SlotFn
}
</script>

<template>
  <div
    class=":soy: relative inline-flex cursor-pointer items-center justify-center gap-6px whitespace-nowrap px-12px py-4px"
    :class="[
      style['slider-tab'],
      { [style['slider-tab_dark']]: darkMode },
      { [style['slider-tab_active']]: active },
      { [style['slider-tab_active_dark']]: active && darkMode },
    ]"
  >
    <slot name="prefix" />
    <slot />
    <slot name="suffix" />
  </div>
</template>

<style scoped></style>
