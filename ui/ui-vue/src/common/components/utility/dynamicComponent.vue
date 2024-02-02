<!-- DynamicComponent - for generating components on-the-fly with passed template -->
<template>
  <component :is="makeComponent"/>
</template>

<script>

import * as BNG_BASE_COMPONENTS from '@/common/components/base'
import * as BNG_UTILITY_COMPONENTS from '@/common/components/utility'

let ALL_COMPONENTS
const getAllUIComponents = () => {
  if (ALL_COMPONENTS) return ALL_COMPONENTS
  ALL_COMPONENTS = {
    ...BNG_BASE_COMPONENTS,
    ...BNG_UTILITY_COMPONENTS
  }
  for (let key in ALL_COMPONENTS) if (key.endsWith('Demo')) delete ALL_COMPONENTS[key]
  return ALL_COMPONENTS
}

</script>

<script setup>

import { defineComponent, useAttrs, computed } from 'vue'
    
const props = defineProps({
  useBNGUIComponents: {
    type: Boolean,
    default: true
  },
  template: {
    type: String,
    required: true
  },
  extraComponents: {
    type: Object,
    default: {}
  }
})

const makeComponent = computed(() => {
  const component = defineComponent({
    template: props.template,
    components: {
      ...(props.useBNGUIComponents && getAllUIComponents()),
      ...props.extraComponents
    },
    data() {
      return useAttrs()
    }
  })
  return component
})

</script>
