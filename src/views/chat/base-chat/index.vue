<script setup lang="ts">
import { ref } from 'vue'
import { ChatContainer, ChatHistory, ResizeableLayout, SidebarRight } from '../components'

const showLeft = ref(true)
const showRight = ref(true)
</script>

<template>
  <div class="flex flex-col p-0!">
    <div class="flex items-center justify-between bg-container px-12px py-8px">
      <n-space>
        <n-button circle quaternary @click="showLeft = !showLeft">
          <template #icon>
            <div :class="[showLeft ? 'i-tabler:layout-sidebar-left-collapse-filled' : 'i-tabler:layout-sidebar-left-expand-filled']" />
          </template>
        </n-button>
        <n-button v-if="!showLeft" circle quaternary @click="() => {}">
          <template #icon>
            <div class="i-tabler:message-circle-plus" />
          </template>
        </n-button>
      </n-space>
      <div>
        <n-button circle quaternary @click="showRight = !showRight">
          <template #icon>
            <div :class="[showLeft ? 'i-tabler:layout-sidebar-right-collapse-filled' : 'i-tabler:layout-sidebar-right-expand-filled']" />
          </template>
        </n-button>
      </div>
    </div>
    <ResizeableLayout
      v-model:left-visible="showLeft"
      v-model:right-visible="showRight"
      class="flex-1"
    >
      <template #left>
        <ChatHistory />
      </template>
      <template #center>
        <ChatContainer />
      </template>
      <template #right>
        <SidebarRight />
      </template>
    </ResizeableLayout>
  </div>
</template>

<style scoped>

</style>
