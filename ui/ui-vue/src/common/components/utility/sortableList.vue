<template>
  <div ref="dropzone" class="sortable-list">
    <div v-for="(item, index) of sortedItems" :key="item[itemKey]" v-bng-draggable :data-draggable-index="index" class="sortable-list__item">
      <slot name="item" :item="item"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { vBngDraggable } from "@/common/directives"
import { useSortable } from "@/services/drag/sortable"

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  itemKey: {
    type: String,
    required: true,
  },
  canTarget: {
    type: Function,
  },
  canSort: {
    type: Function,
  },
})

const emit = defineEmits(["update:items", "sorted"])

const dropzone = ref(null)

const sortable = useSortable(dropzone, {
  ondragstart: onDragStart,
  ondragover: onDragOver,
  ondragend: onDragEnd,
  canSort: props.canSort,
  canTarget: props.canTarget,
})

const sortedItems = computed({
  get: () => props.items,
  set: newValue => emit("update:items", newValue),
})

function onDragStart(data) {}
function onDragOver(data) {}

function onDragEnd(data) {
  const oldIndex = parseInt(data.dragElement.draggableIndex)
  const newIndex = parseInt(data.targetElement.draggableIndex)

  const dragItem = sortedItems.value[oldIndex]
  const targetItem = sortedItems.value[newIndex]

  sortedItems.value[oldIndex] = targetItem
  sortedItems.value[newIndex] = dragItem

  emit("sorted", {
    oldIndex: oldIndex,
    newIndex: newIndex,
  })
}
</script>

<style lang="scss" scoped>
.sortable-list {
  position: relative;
  width: fit-content;

  &__item:not(:last-child) {
    margin-bottom: 0.5rem;
  }
}
</style>
