<template>
  <ul class="tree">
    <tree-node
      v-for="(node, index) in model"
      :key="node.id"
      :model="node"
      :order="index"
      :path="`${index}`"
      :selectedNodes="selectedNodes"
      :expandedNodes="expandedNodes"
      :templates="$templates"
      @expand="onExpanded"
      @select="onSelected">
    </tree-node>
  </ul>
</template>

<script setup>
import { ref, computed, useSlots, reactive, watch } from "vue"
import treeNode from "./tree-node-new.vue"

const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
  expandedNodes: Array,
  selectedNodes: Array,
  multiSelect: Boolean,
  selectEnabled: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(["update:expandedNodes", "update:selectedNodes", "selectedChanged", "expandedChanged"])

const $templates = useSlots()

const treeState = reactive({
  selectedNodes: [],
  expandedNodes: [],
})

const expandedNodes = computed({
  get: () => (props.expandedNodes ? props.expandedNodes : treeState.expandedNodes),
  set: newValue => {
    treeState.expandedNodes = newValue
    emit("update:expandedNodes", newValue)
    emit("expandedChanged", newValue)
  },
})

const selectedNodes = computed({
  get: () => (props.selectedNodes !== null && props.selectedNodes !== undefined ? props.selectedNodes : treeState.selectedNodes),
  set: newValue => {
    treeState.selectedNodes = newValue
    emit("update:selectedNodes", newValue)
    emit("selectedChanged", newValue)
  },
})

watch(
  () => props.multiSelect,
  () => {
    if (props.multiSelect === false && selectedNodes.value.length > 1) {
      selectedNodes.value = []
    }
  }
)

const onExpanded = node => {
  if (!node.children || node.children.length === 0) return

  const isExpanded = expandedNodes.value.includes(node.id)
  if (isExpanded) {
    const index = expandedNodes.value.indexOf(node.id)
    expandedNodes.value.splice(index, 1)
  } else {
    expandedNodes.value.push(node.id)
  }
}

const onSelected = node => {
  if (props.multiSelect) {
    const isSelected = selectedNodes.value.includes(node.id)
    if (isSelected) {
      selectedNodes.value = selectedNodes.value.filter(x => x !== node.id)
    } else {
      selectedNodes.value = [...selectedNodes.value, node.id]
    }
  } else {
    selectedNodes.value = [node.id]
  }
  // console.log("onSelected", selectedNodes.value)
}
</script>

<style scoped lang="scss">
.tree {
  padding-inline-start: 0;

  :deep(.subtree) {
    padding-inline-start: 1rem;
  }
}

.tree,
.tree :deep(.subtree) {
  list-style: none;
  margin-block-start: 0;
}
</style>
