<template>
  <li class="tree-node" :class="{ selected: isSelected, expanded: isExpanded }">
    <component
      v-if="templates['node']"
      :is="templates['node']"
      :node="model"
      :isSelected="isSelected"
      :isExpanded="isExpanded"
      :order="order"
      :level="level"
      :path="`${path}`"
      :parentKey="parentKey"
      :onSelect="() => select(model)"
      :onExpand="() => expand(model)">
    </component>
    <div v-else class="node-container" :class="{ expanded: isExpanded, selected: isSelected }">
      <div class="node-left">
        <component
          v-if="templates['left'] && model.children && model.children.length > 0"
          :is="templates['left']"
          :node="model"
          :isSelected="isSelected"
          :isExpanded="isExpanded"
          :onExpand="expand(model)"></component>
        <BngIcon
          v-else-if="model.children && model.children.length > 0"
          :type="isExpanded ? icons.arrowSmallUp : icons.arrowSmallDown"
          @click="expand(model)" />
      </div>
      <div class="node-content" @click="select(model)">
        <component
          :is="templates['content']"
          :node="model"
          :order="order"
          :path="`${path}`"
          :level="level"
          :parentKey="parentKey"
          :isSelected="isSelected"
          :isExpanded="isExpanded"></component>
      </div>
    </div>
    <ul class="subtree" v-if="isExpanded && model.children">
      <tree-node
        v-for="(node, index) in model.children"
        :key="node.id"
        :model="node"
        :order="index"
        :level="level + 1"
        :parentKey="model.id"
        :path="`${path}/${index}`"
        :templates="templates"
        :selectedNodes="selectedNodes"
        :expandedNodes="expandedNodes"
        @expand="expand"
        @select="select" />
    </ul>
  </li>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue"
import treeNode from "./tree-node-new.vue"
import { BngIcon, icons } from "@/common/components/base"

const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  parentKey: {
    type: [Number, String],
  },
  path: {
    type: String,
    required: true,
  },
  expandedNodes: Array,
  selectedNodes: Array,
  selectEnabled: {
    type: Boolean,
    default: true,
  },
  templates: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["expand", "select"])

const isExpanded = computed(() => props.expandedNodes && props.expandedNodes.includes(props.model.id))
const isSelected = computed(() => props.selectedNodes && props.selectedNodes.includes(props.model.id))

const select = node => emit("select", node)
const expand = node => emit("expand", node)
</script>

<style lang="scss" scoped>
$selected-color: var(--bng-orange-b400);

.tree-node {
  position: relative;

  > .node-container {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-bottom: 0.25rem;
    list-style: none;
    border-left: 0.25rem solid transparent;

    > .node-left {
      width: 1.5rem;

      > span {
        font-size: 1.5rem;
        display: inline-block;
        font-weight: 700;
        cursor: pointer;
      }
    }

    > .node-content {
      width: 100%;
      border: 0.125rem solid transparent;
      border-radius: 0.25rem;
    }
  }

  &.selected > .node-container {
    &::before {
      content: "";
      position: absolute;
      top: -0.25rem;
      left: -0.5rem;
      bottom: -0.25rem;
      right: -0.25rem;
      border: 0.125rem solid $selected-color;
      border-radius: 0.25rem;
    }
  }

  &.expanded > .node-container,
  .subtree .node-container {
    border-left-color: var(--bng-cool-gray-600);
  }
}
</style>
