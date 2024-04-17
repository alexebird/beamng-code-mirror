<template>
  <div class="bng-carousel-item" :data-carousel-item="value">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: [String, Number],
    required: true,
  },
})
</script>

<style lang="scss" scoped>
.bng-carousel-item {
  flex-shrink: 0;
  height: 100%;
  width: 100%;
}
</style>
