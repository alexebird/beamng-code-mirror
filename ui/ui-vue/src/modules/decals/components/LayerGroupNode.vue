<template>
  <div v-if="level" :class="{ hasChildren }" @click="toggleOpen">[[{{ model.name }}]] {{ model.mask && '*** has mask *** '}} ({{ level }})</div>
</template>

<script setup>
const props = defineProps({
  model: Object,
  hasChildren: Boolean,
  toggleOpen: Function,
  level: Number
})
</script>

<style scoped>
.hasChildren {
  color: #fc0;
}
</style>
