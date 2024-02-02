<template>
  <div v-if="partShoppingStore.slot !== ''">
    <PartsList />
  </div>
  <div v-else>
    <div>
      <div style="width: 100%; display: flex">
        <BngButton @click="partShoppingStore.backAction"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
        <h1 style="width: 100%; text-align: center">Part Slots</h1>
      </div>
      <div v-for="data in partShoppingStore.filteredSlots">
        <div class="slotButton">
          <BngButton
            :disabled="partShoppingStore.partShoppingData.tutorialSlots !== undefined && !partShoppingStore.partShoppingData.tutorialSlots[data[0]]"
            @click="partShoppingStore.setSlot(data[0])"
            >{{ data[1] }}</BngButton
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { lua } from "@/bridge"
import { BngButton, BngBinding } from "@/common/components/base"
import PartsList from "./PartsList.vue"
import { onMounted, onUnmounted } from "vue"
import { usePartShoppingStore } from "../../stores/partShoppingStore"

const partShoppingStore = usePartShoppingStore()

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
.slotButton {
  padding-top: 5px;
}
</style>
