<template>
  <component :is="view" @close="$emit('return', true)" />
</template>

<script>
import { popupPosition } from "@/services/popup"

export default {
  position: popupPosition.left,
}
</script>

<script setup>
defineProps({
  view: Object
})

defineEmits(["return"])
</script>

<style scoped lang="scss"></style>
