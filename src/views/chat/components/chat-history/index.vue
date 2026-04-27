<script setup lang="ts">
import { computed, ref } from 'vue'
import { $t } from '@/locales'

// const oneSelect = ref<string | null>(null)
const shiftSelectTo = ref<string | null>(null)
const multipleSelectCount = computed(() => 0)
const search = ref('')
</script>

<template>
  <div class="size-full flex flex-col bg-container p-8px text-base-text">
    <div class="flex items-center justify-between">
      <div class="truncate">
        {{ $t('page.chat.chatHistory') }}
      </div>
      <div v-if="shiftSelectTo" class="flex-center">
        <n-button size="small" secondary strong>
          {{ $t('common.deselect') }}
        </n-button>
        <n-button size="small" secondary strong circle>
          <template #icon>
            <i class="i-tabler:trash" />
          </template>
          ({{ multipleSelectCount }})
        </n-button>
      </div>
      <n-button v-else quaternary circle @click="() => {}">
        <template #icon>
          <div class="i-tabler:message-circle-plus" />
        </template>
      </n-button>
    </div>
    <n-input v-model:value="search" type="text" class="mt-8px" :placeholder="$t('page.chat.searchHistory')">
      <template #prefix>
        <n-icon><div class="i-tabler:list-search" /></n-icon>
      </template>
    </n-input>
    <div class="mt-8px">
      <n-button quaternary block>
        <template #icon>
          <div class="i-tabler:folder-plus" />
        </template>
        {{ $t('common.newFolder') }}
      </n-button>
    </div>
  </div>
</template>

<style scoped>

</style>
