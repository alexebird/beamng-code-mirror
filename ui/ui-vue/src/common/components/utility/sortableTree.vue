<template>
  <div ref="sortableEl" class="sortable-tree">
    <!-- <sortableTreeNode v-for="(item, index) in root.children" :item="item" :index="index" :itemKey="itemKey" :disabled="disabled"> </sortableTreeNode> -->
    <treeNew
      :model="root.children"
      :selectedNodes="selectedNodes"
      :multiSelect="multiSelect"
      @selectedChanged="data => $emit('selectedChanged', data)"
      @expandedChanged="data => $emit('expandedChanged', data)"
      @update:selectedNodes="data => $emit('update:selectedNodes', data)"
      @update:expandedNodes="data => $emit('update:expandedNodes', data)">
      <template #node="{ node, isSelected, isExpanded, onExpand, onSelect, order, level, group, path, parentKey }">
        <div
          class="content-wrapper"
          v-bng-draggable="!disabled"
          :data-draggable-index="order"
          :data-draggable-key="node[itemKey]"
          :data-draggable-group="group"
          :data-draggable-level="level"
          :data-draggable-path="`${path}`"
          :data-draggable-parent-key="parentKey">
          <div class="node-container" :class="{ expanded: isExpanded, selected: isSelected }">
            <div class="node-left">
              <BngIcon v-if="node.children && node.children.length > 0" :type="isExpanded ? icons.arrowSmallUp : icons.arrowSmallDown" @click.stop="onExpand" />
            </div>
            <div class="node-content" @click="onSelect">
              <component :is="$templates['content']" :node="node" :isSelected="isSelected" :isExpanded="isExpanded"></component>
            </div>
          </div>
        </div>
      </template>
      <!-- <template #content="{ node, order, level, parentKey, path, isSelected, isExpanded }">
        <div
          v-bng-draggable="!disabled"
          :data-draggable-index="order"
          :data-draggable-key="node[itemKey]"
          :data-draggable-group="group"
          :data-draggable-level="level"
          :data-draggable-path="`${path}`"
          :data-draggable-parent-key="parentKey"
          class="content-wrapper">
          <component :is="$templates['content']" :node="node" :isSelected="isSelected"></component>
        </div>
      </template> -->
    </treeNew>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeMount, onMounted, provide, ref, useSlots, watch } from "vue"
import { useSortable, INTERSECTION_TYPES } from "@/services/drag/sortable"
import { vBngDraggable } from "@/common/directives"
import { BngIcon, icons } from "@/common/components/base"
import treeNew from "@/common/components/utility/tree-new.vue"

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  itemKey: {
    type: String,
    required: true,
  },
  group: String,
  parentKey: String,
  path: String,
  selectedNodes: Array,
  canSort: Function,
  getItemIntersectionOffsets: Function,
  multiSelect: Boolean,
  selectEnabled: Boolean,
  disabled: Boolean,
})

const emit = defineEmits(["sorted", "update:expandedNodes", "update:selectedNodes", "selectedChanged", "expandedChanged"])

const sortableEl = ref(null)
const $templates = ref(null)

const injTempls = inject("$templates", null)
const level = inject("level", 0)

const root = computed(() => ({
  children: props.items,
}))

onBeforeMount(() => {
  if (injTempls) {
    $templates.value = injTempls
  } else {
    $templates.value = useSlots()
    provide("$templates", $templates.value)
  }

  provide("level", level + 1)
})

const sortable = useSortable(sortableEl, {
  ondragstart: onDragStart,
  ondragover: onDragOver,
  ondragend: onDragEnd,
  canSort: internalCanSort,
  getIntersectionOffsets: props.getItemIntersectionOffsets,
})

function onDragStart(data) {
  console.log("drag start", data)
}

function onDragOver(data) {
  console.log("drag over", data)
}

function onDragEnd(data) {
  console.log("drag end", data)
  if (!data.intersectionType) return

  const intersectionType = data.intersectionType
  const dragElement = data.draggableDataset
  const targetElement = data.targetDataset
  const targetElementIndex = parseInt(targetElement.draggableIndex)

  let newIndex
  // move dragged element inside the target element's children
  if (intersectionType === INTERSECTION_TYPES.sub) newIndex = 0
  // move dragged element above and before the target element
  else if (intersectionType === INTERSECTION_TYPES.top) newIndex = targetElementIndex
  // move dragged element after target element and move outside of target element if it is a child node
  else if (intersectionType === INTERSECTION_TYPES.bottom) {
    if (dragElement.draggableParentKey === targetElement.draggableKey) {
      newIndex = targetElementIndex + 1
    } else {
      newIndex = targetElementIndex
    }
  }

  const itemValue = getItemByPath(dragElement.draggablePath)
  const targetNode = intersectionType === INTERSECTION_TYPES.sub ? getItemByPath(targetElement.draggablePath) : getParentByPath(targetElement.draggablePath)

  const sortData = {
    oldIndex: parseInt(dragElement.draggableIndex),
    oldParentKey: dragElement.draggableParentKey,
    newIndex: newIndex,
    newParentKey: targetNode[props.itemKey],
  }

  // Remove from original location
  const dragItemParent = getParentByPath(dragElement.draggablePath)
  dragItemParent.children.splice(dragElement.draggableIndex, 1)

  // Add to new location
  if (!targetNode.children) targetNode.children = []
  targetNode.children.splice(newIndex, 0, itemValue)

  emit("sorted", sortData)
}

function internalCanSort(sortableData) {
  if (props.canSort && !props.canSort(sortableData)) return false

  // if hovering directly under own parent node
  if (sortableData.oldParentKey === sortableData.newParentKey && sortableData.intersectionType === INTERSECTION_TYPES.sub) return false

  // if hovering inside a child element
  if (
    sortableData.targetDataset.draggablePath &&
    sortableData.draggableDataset.draggablePath &&
    sortableData.targetDataset.draggablePath.startsWith(sortableData.draggableDataset.draggablePath) &&
    sortableData.targetDataset.draggablePath.length > sortableData.draggableDataset.draggablePath.length
  )
    return false

  // if hovering bottom of an item directly above
  if (
    sortableData.draggableDataset.draggableParentKey === sortableData.targetDataset.draggableParentKey &&
    sortableData.oldIndex - 1 === sortableData.newIndex &&
    sortableData.intersectionType === INTERSECTION_TYPES.bottom
  )
    return false

  // if hovering above of an item directly below
  if (
    sortableData.draggableDataset.draggableParentKey === sortableData.targetDataset.draggableParentKey &&
    sortableData.oldIndex + 1 === sortableData.newIndex &&
    sortableData.intersectionType === INTERSECTION_TYPES.top
  )
    return false

  return true
}

function getParentByPath(path) {
  return getItemByPath(getParentPath(path))
}

function getItemByPath(path) {
  let currentItem = root.value

  const pathSegments = path ? path.split("/") : undefined

  if (pathSegments && pathSegments.length > 0) {
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      currentItem = currentItem.children[segment]
    }
  }

  return currentItem
}

function getParentPath(path) {
  var parts = path.split("/")
  parts.pop()
  return parts.join("/")
}
</script>

<style lang="scss" scoped>
$selected-color: var(--bng-orange-b400);

.sortable-tree {
  // target indicator
  [bng-draggable].draggable-target {
    // position: relative;
    opacity: 0.5;

    &::before {
      content: "";
      position: absolute;
      height: 0.125rem;
      background: var(--bng-orange-300);
      width: calc(100% - 0.125rem);
      left: 0.125rem;
    }

    &::after {
      content: "";
      position: absolute;
      width: 0.5rem;
      height: 0.5rem;
      left: 0;
      border-radius: 50%;
      background: var(--bng-orange-300);
    }

    &.target-top {
      // padding-top: 0.25rem;
      &::before {
        top: -0.25rem;
      }

      &::after {
        top: calc(-0.25rem - 0.125rem);
      }
    }

    &.target-bottom {
      // padding-bottom: 0.25rem;
      &::before {
        bottom: -0.25rem;
      }

      &::after {
        bottom: calc(-0.25rem - 0.125rem);
      }
    }

    &.target-sub {
      // padding-bottom: 0.25rem;
      &::before {
        left: 2rem;
        bottom: -0.25rem;
      }

      &::after {
        left: 2rem;
        bottom: calc(-0.25rem - 0.125rem);
      }
    }
  }

  .content-wrapper {
    // width: fit-content;
    border: 0.25rem solid transparent;
  }

  .node-container {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-bottom: 0.25rem;
    list-style: none;
    border-left: 0.25rem solid transparent;

    > .node-left {
      min-width: 1.5rem;
      cursor: pointer;
    }

    > .node-content {
      width: 100%;
      border: 0.125rem solid transparent;
      border-radius: 0.25rem;
    }

    &.selected {
      &::before {
        content: "";
        position: absolute;
        top: -0.25rem;
        left: -0.5rem;
        bottom: -0.25rem;
        right: -0.25rem;
        border: 0.125rem solid $selected-color;
        border-radius: 0.25rem;
        pointer-events: none;
      }
    }
  }

  :deep() {
    .tree-node.expanded {
      .node-container {
        border-left-color: var(--bng-cool-gray-600);
      }
    }
  }
}
</style>
