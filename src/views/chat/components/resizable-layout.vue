<script setup lang="ts">
import { ref } from 'vue'

const leftVisible = defineModel<boolean>('leftVisible', { default: true })
const rightVisible = defineModel<boolean>('rightVisible', { default: false })

// 魔法值
const leftMin = 200
const leftMax = 400
const rightMin = 300
const rightMax = 500

// 宽度状态
const leftWidth = ref<number>(200)
const rightWidth = ref<number>(300)
const containerRef = ref<HTMLElement | null>(null)

// 拖拽相关临时状态
let startX = 0
let startWidth = 0

// ================= 左侧拖拽逻辑 =================
function startDragLeft(e: MouseEvent) {
  startX = e.clientX
  startWidth = leftVisible.value ? leftWidth.value : 0

  document.addEventListener('mousemove', onDragLeft)
  document.addEventListener('mouseup', stopDragLeft)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onDragLeft(e: MouseEvent) {
  let intendedWidth = startWidth + (e.clientX - startX)

  const containerW = containerRef.value?.clientWidth || 1000
  const currentRightW = rightVisible.value ? rightWidth.value : 0
  const maxLeftWidth = containerW - currentRightW - 300

  intendedWidth = Math.min(intendedWidth, maxLeftWidth)

  if (intendedWidth > leftMax) {
    leftVisible.value = true
    leftWidth.value = leftMax
  }
  else if (intendedWidth >= leftMin) {
    leftVisible.value = true
    leftWidth.value = intendedWidth
  }
  else if (intendedWidth > 50 && intendedWidth < leftMin) {
    leftVisible.value = true
    leftWidth.value = leftMin
  }
  else if (intendedWidth <= 50) {
    leftVisible.value = false
  }
}

function stopDragLeft() {
  document.removeEventListener('mousemove', onDragLeft)
  document.removeEventListener('mouseup', stopDragLeft)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// ================= 右侧拖拽逻辑 =================
function startDragRight(e: MouseEvent) {
  startX = e.clientX
  startWidth = rightVisible.value ? rightWidth.value : 0

  document.addEventListener('mousemove', onDragRight)
  document.addEventListener('mouseup', stopDragRight)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onDragRight(e: MouseEvent) {
  let intendedWidth = startWidth - (e.clientX - startX)

  const containerW = containerRef.value?.clientWidth || 1000
  const currentLeftW = leftVisible.value ? leftWidth.value : 0
  const maxRightWidth = containerW - currentLeftW - 300

  intendedWidth = Math.min(intendedWidth, maxRightWidth)

  if (intendedWidth > rightMax) {
    rightVisible.value = true
    rightWidth.value = rightMax
  }
  else if (intendedWidth >= rightMin) {
    rightVisible.value = true
    rightWidth.value = intendedWidth
  }
  else if (intendedWidth > 50 && intendedWidth < rightMin) {
    rightVisible.value = true
    rightWidth.value = rightMin
  }
  else if (intendedWidth <= 50) {
    rightVisible.value = false
  }
}

function stopDragRight() {
  document.removeEventListener('mousemove', onDragRight)
  document.removeEventListener('mouseup', stopDragRight)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}
</script>

<template>
  <div ref="containerRef" class="h-full w-full flex overflow-hidden text-gray-300">
    <!-- 左侧边栏 -->
    <div
      v-show="leftVisible"
      class="relative flex flex-col flex-shrink-0"
      :style="{ width: `${leftWidth}px` }"
    >
      <slot name="left" />
    </div>

    <!-- 左侧拖拽手柄 -->
    <div
      class="group relative z-10 w-[1px] flex-shrink-0"
    >
      <div
        class="absolute z-20 h-full w-3 cursor-col-resize transition-colors -left-1.5 group-hover:bg-[#8a2be2]/50"
        @mousedown="startDragLeft"
      />
    </div>

    <!-- 中间主内容区 -->
    <div class="relative min-w-[300px] flex flex-col flex-1 overflow-hidden">
      <slot name="center" />
    </div>

    <!-- 右侧拖拽手柄 -->
    <div
      class="group relative z-10 w-[1px] flex-shrink-0"
    >
      <div
        class="absolute z-20 h-full w-3 cursor-col-resize transition-colors -left-1.5 group-hover:bg-[#8a2be2]/50"
        @mousedown="startDragRight"
      />
    </div>

    <!-- 右侧边栏 -->
    <div
      v-show="rightVisible"
      class="relative flex flex-col flex-shrink-0"
      :style="{ width: `${rightWidth}px` }"
    >
      <slot name="right" />
    </div>
  </div>
</template>
