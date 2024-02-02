<template>
  <div v-bng-tooltip:[position]="text">
    <slot></slot>
  </div>
</template>

<script setup>
import { vBngTooltip } from "@/common/directives"

defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: "top",
  },
})
</script>

<style scoped lang="scss">
.bng-tooltip {
  width: min-content;

  &::after {
    transform: translate(0.5, -20%);
  }
}
</style>
