<!-- bngActionsList - a list of action 'buttons' -->
<template>
  <div class="actions">
    <BngImageTile
      class="action-tile"
      v-for="action of actions"
      tabindex="0"
      :key="action.value"
      v-bind="action"
      bng-nav-item
      @click="emit('actionClick', action.value)" />
  </div>
</template>

<script setup>
import { BngImageTile } from "@/common/components/base"

const props = defineProps({
  actions: {
    type: Array,
    required: true,
  },
  selected: {
    type: [String, Number],
    required: false,
  },
})

const emit = defineEmits(["actionClick"])
</script>

<style scoped lang="scss">
$text-color: white;
$highlight-color: var(--bng-orange-500);

.actions {
  display: flex;
  padding: 0.25rem 0.5rem;
  color: $text-color;
  font-family: "Overpass";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.01em;
  user-select: none;
  overflow-y: hidden;
  overflow-x: auto;

  &.expanded {
    flex-wrap: wrap;
    justify-content: center;
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    > .action-tile {
      margin: 0.25rem;
    }
  }
}
</style>
