<template>
  <div class="test-screen">
    <h1>Test Screen</h1>
    <!-- <LayerSettings class="layer-settings" :model="data" type="group" @save="onSave" /> -->
    <!-- <BngDrawer class="drawer">
      <template #header> Random text </template>
      <template #content>
        <div class="actions-demo-2">
          <BngActionsList :actions="actions" class="expanded" @actionClick="value => onActionClicked(value)"></BngActionsList>
        </div>
      </template>
    </BngDrawer> -->
    <div class="actions-drawer">
      <BngActionsDrawer :header="'Select decal'" :actions="actions" :expanded="true" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { BngActionsDrawer, BngButton, BngDrawer, BngActionsList } from "@/common/components/base"
import { icons } from "@/assets/icons"
import { LayerSettings } from "@/modules/decals/components"

const data = ref({
  name: "",
  colorR: 255,
  colorG: 255,
  colorB: 255,
  colorA: 1,
})

const onSave = model => {
  console.log("save", model)
}

function createRangeArray(start, end, step = 1) {
  let result = []

  for (let i = start; i <= end; i += step) {
    result.push({
      label: "Item " + i,
      value: "item" + i,
      icon: icons.decals.general.save,
    })
  }

  return result
}

// Example usage:
let actions = createRangeArray(1, 100)
</script>

<style scoped lang="scss">
.test-screen {
  background: white;
  padding: 1rem;
  height: 100%;
}

.layer-settings {
  width: 14rem;
}

.actions-drawer {
  height: 80%;
}
</style>
