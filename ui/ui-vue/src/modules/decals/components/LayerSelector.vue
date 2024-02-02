<template>
  <BngCard class="layer-selector" :class="{'disabled': disabled}">
    <BngCardHeading type="ribbon">{{ layersData.length }} {{ $tc("ui.decalsEditor.layersNoun", layersData.length) }}</BngCardHeading>
    <div class="header-wrapper">
      <slot name="header"></slot>
    </div>
    <div class="layer-tree">
      <LayerTree :data="layersData" @nodeClicked="value => $emit('nodeClicked', value)" />
    </div>
  </BngCard>
</template>

<script setup>
import { ref, computed, useSlots } from "vue"
import { BngCard, BngCardHeading, BngButton } from "@/common/components/base"
import LayerTree from "./LayerTree.vue"
import { icons } from "@/assets/icons"

const props = defineProps({
  layersData: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const slots = useSlots()

defineEmits(["nodeClicked", "newDecalClicked"])

const treeData = computed(() => layersToTreeData(props.layersData))
</script>

<script>
import { LayerNode, LayerGroupNode, MaskGroupNode } from "."

const getNodeType = model => (model.children && model.children.length ? LayerGroupNode : LayerNode)

// Just sort nodes by name at any level for now (likely an order flag later, and maybe also node with mask at top)
const makeNodeSorter = (parentModel, parentLevel) => (node1, node2) => node1.name.toLowerCase() > node2.name.toLowerCase() ? 1 : -1

const layersToTreeData = d => ({
  open: true,
  children: d,
})
</script>

<style lang="scss" scoped>
.layer-selector {
  height: 100%;
  // right: 0;
  width: 450px;
  // position: absolute;
  .header-wrapper {
    display: flex;
    flex-flow: column;
    flex: 0 0 auto;
    padding: 0.25rem 0.5rem;
  }

  &.disabled > * > * {
    pointer-events: none;
    opacity: 0.5;
  }
}

.add-layer {
  text-align: center;

  >.button-text {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
}

.layer-tree {
  overflow-y: auto;
  padding: 0.5rem;

  &::-webkit-scrollbar {
    width: 0.25rem;
    height: 0.25rem;
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    background: #222;
  }

  &::-webkit-scrollbar-thumb {
    background: #f60;
  }
}
</style>
