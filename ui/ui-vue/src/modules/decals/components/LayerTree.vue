<template>
  <div class="layer-tree-node">
    <LayerNode
      v-if="data.uid"
      :model="data"
      :path="path"
      :class="{ expandable: canExpand, expanded: canExpand && nodeProperties.expanded }"
      @expandClicked="onExpandClicked"
      @nodeClicked="value => $emit('nodeClicked', value)"
    />
    <div v-if="!data.uid || (canExpand && nodeProperties.expanded)" class="layer-children" :class="{ 'sub-tree': data.uid }">
      <LayerTree
        v-for="(child, index) in sortedChildren"
        :key="child.uid"
        :data="child"
        :path="path.concat(index)"
        class="layer-child-item"
        @nodeClicked="value => $emit('nodeClicked', value)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, inject, onBeforeUpdate } from "vue"
import LayerNode from "./LayerNode.vue"

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  path: {
    type: Array,
    default: [],
  },
})

const nodeProperties = reactive({
  expanded: false,
})

const sortedChildren = computed(() => props.data.children ? props.data.children.sort((a,b) => b.order - a.order) : [])

const canExpand = computed(() => props.data.children && props.data.children.length > 0)

const onExpandClicked = () => (nodeProperties.expanded = !nodeProperties.expanded)

watch(
  () => (props.data.children ? props.data.children.length : 0),
  (newValue, oldValue) => {
    if (newValue > oldValue) {
      nodeProperties.expanded = true
    }
  }
)

defineEmits(["nodeClicked"])
</script>

<style lang="scss" scoped>
.layer-children {
  > :deep(.layer-child-item) > .layer-node {
    margin-bottom: 0.25rem;
  }

  &.sub-tree {
    margin-left: 1rem;

    > :deep(.layer-child-item) > .layer-node {
      border-left: 4px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
