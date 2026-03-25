<script setup lang="ts">
defineOptions({ name: 'DarkModeContainer' })

defineProps<Props>()

interface Props {
  inverted?: boolean
}
</script>

<template>
  <div class="bg-container text-base-text transition-300" :class="{ 'bg-inverted text-#1f1f1f': inverted }">
    <slot />
  </div>
</template>

<style scoped></style>
