<template>
  <div>
    <div style="width: 100%; display: flex">
      <span style="padding: 0.5em"
        ><BngButton @click="partShoppingStore.backAction" accent="attention"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton></span
      >
      <h1 style="width: 100%; text-align: center">Part Shop</h1>
    </div>

    <div v-if="partShoppingStore.filteredParts" style="padding: 5px">
      <div v-if="partShoppingStore.partShoppingData.vehicleSlotToPartMap[partShoppingStore.slot]">
        Currently installed: {{ partShoppingStore.partShoppingData.vehicleSlotToPartMap[partShoppingStore.slot].description.description }}
      </div>
      <div v-else-if="partShoppingStore.category != 'cargo'">Currently installed: nothing</div>
      <table class="partTable" style="width: 100%">
        <tr>
          <th>Description</th>
          <th v-if="partShoppingStore.category == 'cargo'">Slot</th>
          <th>Price</th>
          <th></th>
        </tr>
        <tr v-for="part in partShoppingStore.filteredParts">
          <td>
            {{ part.description.description }}
            <div
              v-if="
                partShoppingStore.partShoppingData.vehicleSlotToPartMap[part.slot] &&
                partShoppingStore.partShoppingData.vehicleSlotToPartMap[part.slot].description.description == part.description.description
              ">
              (Same part already installed)
            </div>
          </td>
          <td v-if="partShoppingStore.category == 'cargo'">{{ partShoppingStore.partShoppingData.slotsNiceName[part.slot] }}</td>
          <td>{{ units.beamBucks(part.finalValue) }}</td>
          <td>
            <BngButton
              :disabled="partShoppingStore.partShoppingData.tutorialPartNames !== undefined && !partShoppingStore.partShoppingData.tutorialPartNames[part.name]"
              @click="lua.career_modules_partShopping.installPartByPartShopId(part.partShopId)"
              >Install</BngButton
            >
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { BngButton, BngBinding } from "@/common/components/base"
import { lua, useBridge } from "@/bridge"
import { onMounted, onUnmounted } from "vue"
import { usePartShoppingStore } from "../../stores/partShoppingStore"

const partShoppingStore = usePartShoppingStore()

const { units } = useBridge()

let oldBack

onMounted(() => {
  oldBack = partShoppingStore.backAction
  partShoppingStore.backAction = () => partShoppingStore.setSlot("")
})

onUnmounted(() => {
  partShoppingStore.backAction = oldBack
})
</script>

<style scoped lang="scss">
.partTable,
.partTable th,
.partTable td {
  border: 1px solid rgb(255, 255, 255);
}
</style>
