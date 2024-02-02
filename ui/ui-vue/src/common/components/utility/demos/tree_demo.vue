<template>
  <Tree class="myTree" :model="treeData" :makeNodeSorter="makeNodeSorter" :getNodeType="getNodeType" />
</template>

<script setup>
import { ref } from "vue"
import { Tree } from "@/common/components/utility"
import MyNode from "./myNode.vue"

const nodeTypes = { MyNode }

const getNodeType = model => model.type && nodeTypes[model.type]

const makeNodeSorter = (parentModel, parentLevel) => (node1, node2) => node1.name > node2.name ? 1 : node1.name < node2.name ? -1 : 0

const treeData = ref({
  name: "My Tree",
  open: true,
  children: [
    { name: "hello" },
    { name: "world", type: "MyNode" },
    {
      name: "child folder",
      open: true,
      children: [
        {
          name: "child folder",
          type: "MyNode",
          open: true,
          children: [{ name: "hello" }, { name: "world" }],
        },
        { name: "hello" },
        { name: "world" },
        {
          name: "child folder",
          open: false,
          children: [{ name: "hello" }, { name: "world" }],
        },
      ],
    },
  ],
})
</script>

<style scoped>
.myTree:deep(li.node-closed > ul[data-sub-tree]) {
  display: none;
}
</style>
