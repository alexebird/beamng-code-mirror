<!-- bngPill - a pill control -->
<template>
  <span bng-nav-item class="bng-pill" :class="{ 'pill-marked': isMarked, 'pill-clickable': hasClickEvent }" :tabindex="hasClickEvent ? 0 : -1">
    <slot></slot>
  </span>
</template>

<script setup>
import { ref, computed, useAttrs, watch } from "vue"

const props = defineProps({
  marked: {
    type: Boolean,
    default: false,
  },
})
const attrs = useAttrs()

const hasClickEvent = computed(() => attrs && attrs.onClick)

const isMarked = ref(props.marked)

watch(
  () => props.marked,
  newValue => (isMarked.value = newValue)
)
</script>

<style lang="scss" scoped>
$highlight-color: var(--bng-orange-b400);
$text-color: white;
$default-background-color: transparent;
$marked-background-color: var(--bng-cool-gray-700);
$default-border-color: var(--bng-ter-blue-gray-700);

.bng-pill {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: flex-end;
  padding: 0.4em 1em;
  border-radius: 0.5em;
  color: $text-color;
  border: 1px solid $default-border-color;
  white-space: nowrap;

  &:focus::before {
    display: none;
  }

  &.pill-marked {
    background-color: $marked-background-color;
    background-clip: padding-box;
    border-color: transparent;
  }

  &.pill-clickable {
    cursor: pointer;

    &.pill-marked:focus {
      background-color: $marked-background-color;
    }

    &:focus {
      background-color: rgba(255, 102, 0, 0.15);

      &::before {
        position: absolute;
        display: block;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid $highlight-color;
        border-radius: 0.625em;
      }
    }
  }
}
</style>
