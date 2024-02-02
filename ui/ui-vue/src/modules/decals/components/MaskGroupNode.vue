<template>
  <div :class="{ hasChildren }" @click="toggleOpen">[[{{ model.name }}]]</div>
</template>

<script setup>
const props = defineProps({
  model: Object,
  hasChildren: Boolean,
  toggleOpen: Function,
})
</script>

<style scoped>
.hasChildren {
  color: #00f;
}
</style>
