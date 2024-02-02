<template>
  <div class="bng-color-tile"></div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  red: {
    type: Number,
  },
  blue: {
    type: Number,
  },
  green: {
    type: Number,
  },
  alpha: {
    type: Number,
    default: 1,
  },
})

const backgroundColor = computed(() => `rgba(${props.red}, ${props.green}, ${props.blue}, ${props.alpha})`)
</script>

<style scoped lang="scss">
@import "@/styles/modules/mixins";

$f-offset: 0.25rem;
$rad: $border-rad-1;

.bng-color-tile {
  position: relative;
  background: v-bind(backgroundColor);
  width: 100%;
  height: 100%;
  min-width: 1rem;
  min-height: 1rem;
  border-radius: 0.25rem;

  // Modify the focus frame radius and offset based on tile corner radius
  @include modify-focus($rad, $f-offset);

  &:not(:last-child) {
    margin-right: 0.2em;
  }
}
</style>
