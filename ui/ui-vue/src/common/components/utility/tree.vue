<!-- Tree - generalised component for rendering tree like data using nested unordered lists -->
<template>
  <!-- Top level needs initial UL tag -->
  <ul data-tree v-if="level == 0">
    <li :class="{ 'node-hasChildren': hasChildren, 'node-open': model[nodeOpenModelKey], 'node-closed': !model[nodeOpenModelKey] }">
      <component v-if="nodeType" :is="nodeType" :model="model" :hasChildren="hasChildren" :toggleOpen="toggle" :level="level" />
      <div v-else @click="toggle">
        {{ model.name }}
      </div>
      <ul v-if="hasChildren" data-sub-tree>
        <Tree
          v-for="childModel in sortedChildren"
          v-bind="propsForNextLevel"
          :model="childModel"
        />
      </ul>
    </li>
  </ul>

  <!-- Lower levels are already inside a UL -->
  <li v-else :class="{ 'node-hasChildren': hasChildren, 'node-open': model[nodeOpenModelKey], 'node-closed': !model[nodeOpenModelKey] }">
    <component v-if="nodeType" :is="nodeType" :model="model" :hasChildren="hasChildren" :toggleOpen="toggle" :level="level" />
    <div v-else @click="toggle">
      {{ model.name }}
    </div>
    <ul v-if="hasChildren" data-sub-tree>
      <Tree
        v-for="childModel in sortedChildren"
        v-bind="propsForNextLevel"
        :model="childModel"
      />
    </ul>
  </li>
</template>

<script setup>
import { ref, computed } from "vue"

const props = defineProps({
  makeNodeSorter: {
    type: Function, // if provided, should have signature: (model, level) => () => 0
  },
  level: {
    type: Number,
    default: 0,
  },
  getNodeType: Function,
  nodeOpenModelKey: {
    type: String,
    default: "open",
  },
  model: Object
})

const sortedChildren = computed(() => props.makeNodeSorter ? [...props.model.children].sort(props.makeNodeSorter(props.model, props.level)) : props.model.children)

const nodeType = computed(() => props.getNodeType && props.getNodeType(props.model))

const propsForNextLevel = computed(() => ({ ...props, level: props.level + 1 }))

const hasChildren = computed(() => {
  return !!(props.model.children && props.model.children.length)
})

function toggle() {
  props.model[props.nodeOpenModelKey] = !props.model[props.nodeOpenModelKey]
}
</script>
