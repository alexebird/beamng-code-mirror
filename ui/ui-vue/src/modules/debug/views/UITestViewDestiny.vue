<template>
  <div class="test-screen">
    <div style="width: 100%; height: 100%;">
      <BngActionsDrawerOne :groups="groups" :items="items">
        <template #header> Select decal </template>
      </BngActionsDrawerOne>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { BngActionsDrawer, BngButton, BngDrawer, BngActionsList, BngPillFilters } from "@/common/components/base"
import { icons } from "@/assets/icons"
import { LayerSettings } from "@/modules/decals/components"
import BngActionsDrawerOne from "@/common/components/base/bngActionsDrawerOne.vue"

const groups = [
  {
    label: "Shapes",
    value: "shapes",
    order: 2,
  },
  {
    label: "Stripes",
    value: "stripes",
    order: 3,
  },
  {
    label: "Tribal",
    value: "tribal",
    order: 4,
  },
  {
    label: "Tire marks",
    value: "tiremarks",
    order: 5,
  },
  {
    label: "Logotypes",
    value: "logotypes",
    order: 6,
  },
  {
    label: "Recent",
    value: "recent",
    order: 1,
    expanded: true,
    expandedItemCount: 2,
  },
]

const items = [
  {
    label: "Shapes 1",
    value: "shape1",
    group: "shapes",
  },
  {
    label: "Shapes 2",
    value: "shape2",
    group: "shapes",
  },
  {
    label: "Shapes 3",
    value: "shape3",
    group: "shapes",
  },
  {
    label: "Stripes 1",
    value: "stripes1",
    group: "stripes",
  },
  {
    label: "Stripes 2",
    value: "stripes2",
    group: "stripes",
  },
  {
    label: "Stripes 3",
    value: "stripes3",
    group: "stripes",
  },
  {
    label: "Tribal 1",
    value: "tribal1",
    group: "tribal",
  },
  {
    label: "Tribal 2",
    value: "tribal2",
    group: "tribal",
  },
  {
    label: "Tribal 3",
    value: "tribal3",
    group: "tribal",
  },
  {
    label: "Tiremarks 1",
    value: "tiremarks1",
    group: "tiremarks",
  },
  {
    label: "Tiremarks 2",
    value: "tiremarks2",
    group: "tiremarks",
  },
  {
    label: "Tiremarks 3",
    value: "tiremarks3",
    group: "tiremarks",
  },
  {
    label: "Logo Type 1",
    value: "logotype1",
    group: "logotypes",
  },
  {
    label: "Logo Types 2",
    value: "logotype2",
    group: "logotypes",
  },
  {
    label: "Logo Types 3",
    value: "logotype3",
    group: "logotypes",
  },
  {
    label: "Recent 1",
    value: "recent1",
    group: "recent",
  },
  {
    label: "Recent 2",
    value: "recent2",
    group: "recent",
  },
  {
    label: "Recent 3",
    value: "recent3",
    group: "recent",
  },
]
</script>

<style scoped lang="scss">
.test-screen {
  // background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  height: 100%;
  width: 100%;
}
</style>
