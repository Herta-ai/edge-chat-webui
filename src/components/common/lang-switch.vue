<script setup lang="ts">
import { computed } from 'vue'
import { $t } from '@/locales'

defineOptions({
  name: 'LangSwitch',
})

const props = withDefaults(defineProps<Props>(), {
  showTooltip: true,
})

const emit = defineEmits<Emits>()

interface Props {
  /** Current language */
  lang: I18N.LangType
  /** Language options */
  langOptions: I18N.LangOption[]
  /** Show tooltip */
  showTooltip?: boolean
}

interface Emits {
  (e: 'changeLang', lang: I18N.LangType): void
}

const tooltipContent = computed(() => {
  if (!props.showTooltip)
    return ''

  return $t('icon.lang')
})

/** Add bottom margin to all options except the last one for proper visual separation */
const dropdownOptions = computed(() => {
  const lastIndex = props.langOptions.length - 1

  return props.langOptions.map((option, index) => ({
    ...option,
    props: {
      class: index < lastIndex ? 'mb-1' : undefined,
    },
  }))
})

function changeLang(lang: I18N.LangType) {
  emit('changeLang', lang)
}
</script>

<template>
  <NDropdown :value="lang" :options="dropdownOptions" trigger="hover" @select="changeLang">
    <div>
      <ButtonIcon :tooltip-content="tooltipContent" tooltip-placement="left">
        <SvgIcon icon="heroicons:language" />
      </ButtonIcon>
    </div>
  </NDropdown>
</template>

<style scoped></style>
