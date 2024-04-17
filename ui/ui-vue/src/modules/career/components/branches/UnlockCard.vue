<template>
  <div class="wrapper">
    <BngIcon class="icon" :type="icons[data.icon]" />
    <div class="heading">
      {{ data.heading }}
    </div>
    <div class="description">
      {{ data.description }}
    </div>
  </div>
</template>

<script setup>
import { BngIcon, icons } from "@/common/components/base"
const props = defineProps({
  data: Object,
})
</script>

<style scoped lang="scss">
.wrapper {
  width: auto;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0.25rem;
  display: grid;
  grid-template: min-content auto / 2.5rem 2fr;

  .icon {
    font-size: 2em;
    grid-row: 1 / -1;
    align-self: baseline;
  }

  .heading {
    font-weight: 600;
    font-size: 1.25em;
  }

  .description {
    font-weight: 400;
    font-size: 0.8em;
  }
}
</style>
