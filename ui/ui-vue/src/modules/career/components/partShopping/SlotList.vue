<template>
  <div v-if="partShoppingStore.slot !== ''">
    <PartsList />
  </div>
  <div v-else>
    <div>
      <div class="shopping-header">
        <span style="padding: 0.5em"
          ><BngButton @click="partShoppingStore.backAction" accent="attention">
            <BngBinding ui-event="back" deviceMask="xinput" />
            {{ $t("ui.common.back") }}
          </BngButton></span
        >
        <h1>Part Slots</h1>
      </div>

      <BngInput floating-label="Search" v-model="searchValue" @valueChanged="searchValueChanged" />

      <!-- show a flat list when the user is searching for something -->
      <Accordion v-if="searchValue.length > 0" class="slot-flat-view">
        <SlotItem
          v-for="slotInfo in partShoppingStore.filteredSlots"
          :static="true"
          :slotName="slotInfo.slotName"
          :slotNiceName="slotInfo.slotNiceName"
          :partNiceName="slotInfo.partNiceName ? slotInfo.partNiceName : null" />
      </Accordion>

      <!-- else show the part tree -->
      <PartSubTree v-else class="slot-tree-view" :slots="partShoppingStore.partShoppingData.partTree.slots" />
    </div>
  </div>
</template>

<script setup>
import { lua } from "@/bridge"
import { BngButton, BngBinding, BngInput } from "@/common/components/base"
import PartsList from "./PartsList.vue"
import PartSubTree from "./PartSubTree.vue"
import SlotItem from "./SlotItem.vue"
import { Accordion } from "@/common/components/utility"
import { onMounted, onUnmounted, ref } from "vue"
import { usePartShoppingStore } from "../../stores/partShoppingStore"

const partShoppingStore = usePartShoppingStore()

const searchValue = ref("")

const searchValueChanged = () => {
  partShoppingStore.searchValueChanged(searchValue.value)
}

let oldBack

onMounted(() => {
  oldBack = partShoppingStore.backAction
  partShoppingStore.backAction = () => partShoppingStore.setCategory("")
})

onUnmounted(() => {
  // TODO this is a hack, but we set the back function explicitly here, because otherwise it breaks when skipping over the slot menu
  partShoppingStore.backAction = () => lua.career_modules_partShopping.cancelShopping()
  //partShoppingStore.backAction = oldBack
})
</script>

<style scoped lang="scss">
.shopping-header {
  display: flex;
  width: 100%;
  h1 {
    width: 100%;
    text-align: center;
  }
}

.slot-tree-view {
  margin: 0 0.25rem;
}
.slot-flat-view {
  margin: 0 0.75rem;
}
</style>
