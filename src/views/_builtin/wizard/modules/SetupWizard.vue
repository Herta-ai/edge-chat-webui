<script setup lang="ts">
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
// 移除 EffectFade，引入 EffectCreative
import { EffectCreative } from 'swiper/modules'
import { NButton } from 'naive-ui'
import { $t } from '@/locales'

import { useAppStore } from '@/store/modules/app'
import { useRouterPush } from '@/hooks/common/router'
import StepOne from './StepOne.vue'
import StepTwo from './StepTwo.vue'
import StepThree from './StepThree.vue'

// 引入基础样式和 creative 特效样式
import 'swiper/css'
import 'swiper/css/effect-creative'

const appStore = useAppStore()
const { toHome } = useRouterPush()
const swiperInstance = ref<any>(null)
const activeIndex = ref(0)

// 定义左右淡入淡出的动画参数
const creativeOptions = {
  prev: {
    // 切换到下一页时，当前页会向左侧偏移 20% 并淡出消失，同时降低层级
    translate: ['-20%', 0, -1],
    opacity: 0,
  },
  next: {
    // 从下一页切回来时，下一页会从右侧 20% 的位置淡入滑过来
    translate: ['20%', 0, 0],
    opacity: 0,
  },
}

function onSwiperInit(swiper: any) {
  swiperInstance.value = swiper
}

function onSlideChange() {
  if (swiperInstance.value) {
    activeIndex.value = swiperInstance.value.activeIndex
  }
}

function handlePrev() {
  swiperInstance.value?.slidePrev()
}

function handleNext() {
  if (activeIndex.value === 2) {
    handleComplete()
  }
  else {
    swiperInstance.value?.slideNext()
  }
}

function handleComplete() {
  appStore.setIsInit()
  toHome()
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
    <div
      class="relative h-[600px] max-w-4xl w-full flex flex-col overflow-hidden border border-white/20 rounded-2xl bg-container/80 shadow-2xl backdrop-blur-xl"
    >
      <!-- 进度指示器 -->
      <div class="absolute left-0 right-0 top-6 z-10 flex justify-center gap-2">
        <div
          v-for="i in 3"
          :key="i"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="activeIndex === i - 1 ? 'w-8 bg-primary' : 'w-4 bg-primary/30'"
        />
      </div>

      <!-- Swiper 滑动区域 -->
      <div class="relative flex-1 overflow-hidden">
        <Swiper
          :modules="[EffectCreative]"
          effect="creative"
          :speed="600"
          :creative-effect="creativeOptions"
          :allow-touch-move="false"
          class="h-full w-full"
          @swiper="onSwiperInit"
          @slide-change="onSlideChange"
        >
          <SwiperSlide class="h-full w-full">
            <StepOne />
          </SwiperSlide>
          <SwiperSlide class="h-full w-full">
            <StepTwo />
          </SwiperSlide>
          <SwiperSlide class="h-full w-full">
            <StepThree />
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- 底部控制栏 -->
      <div class="flex items-center justify-between border-t border-white/10 bg-layout/30 p-6">
        <NButton
          quaternary
          class="text-base-text opacity-60 transition-opacity hover:opacity-100"
          @click="handleComplete"
        >
          {{ $t('page.wizard.skip') }}
        </NButton>

        <div class="flex gap-4">
          <NButton
            v-show="activeIndex > 0"
            ghost
            class="border-white/20 text-base-text transition-colors hover:border-primary"
            @click="handlePrev"
          >
            {{ $t('page.wizard.prev') }}
          </NButton>

          <NButton
            type="primary"
            size="large"
            class="border-none bg-primary px-8 shadow-[var(--tab-box-shadow)] transition-colors hover:bg-primary-400"
            @click="handleNext"
          >
            {{ activeIndex === 2 ? $t('page.wizard.complete') : $t('page.wizard.next') }}
          </NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保 Slide 沾满全屏且能够被正确应用透明度 */
.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
