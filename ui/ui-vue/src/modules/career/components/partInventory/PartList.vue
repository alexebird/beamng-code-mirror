<template>
  <div v-if="partInventoryStore.partInventoryData.partList">
    <table class="partTable">
      <tr>
        <th>id</th>
        <th>Description</th>
        <th>Location</th>
        <th>Mileage</th>
        <th>Part Value</th>
        <th>Move part</th>
      </tr>
      <tr v-for="(part, key) in partInventoryStore.partInventoryData.partList" :key="key">
        <td>{{ part.id }}</td>
        <td>{{ getPartDescription(part) }}</td>
        <td>{{ getLocationName(part) }}</td>
        <td>{{ units.buildString("length", part.partCondition.odometer, 0) }}</td>
        <td>{{ units.beamBucks(part.finalValue) }}</td>
        <td>
          <div v-if="!part.missingFile">
            <BngButton v-if="part.location !== 0 && !part.isInCoreSlot" :disabled="buttonDisabled(part)" @click="movePartToLocation(0, part.id)"
              >Remove from vehicle</BngButton
            >
            <BngButton
              v-if="part.fitsCurrentVehicle && part.location !== partInventoryStore.partInventoryData.currentVehicle"
              :disabled="buttonDisabled(part)"
              @click="movePartToLocation(partInventoryStore.partInventoryData.currentVehicle, part.id)"
              >Put into current vehicle</BngButton
            >
          </div>
          <BngButton v-if="part.location === 0" :disabled="buttonDisabled(part)" @click="setPartToSell(part)">Sell</BngButton>
        </td>
      </tr>
    </table>
  </div>

  <div v-if="partToSell">
    <div v-bng-blur class="blurBackground"></div>
    <BngCard class="modalPopup">
      <h3 style="padding: 10px">Do you want to sell this part for {{ units.beamBucks(partToSell.finalValue) }}?</h3>
      <BngButton @click="sellPart(partToSell)"> Yes </BngButton>
      <BngButton @click="setPartToSell(undefined)" accent="attention"> No </BngButton>
    </BngCard>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngButton, BngCard } from "@/common/components/base"
import { usePartInventoryStore } from "../../stores/partInventoryStore"
import { vBngBlur } from "@/common/directives"

const emit = defineEmits(["partSold"])

const partInventoryStore = usePartInventoryStore()

const buttonDisabled = part =>
  !part.accessible || partInventoryStore.partInventoryData.brokenVehicleInventoryIds[partInventoryStore.partInventoryData.currentVehicle]

const { units } = useBridge()

const partToSell = ref()

const setPartToSell = open => {
  partToSell.value = open
}

const getPartDescription = part => {
  if (part.missingFile) {
    return "Missing File"
  }
  return part.description.description
}

const movePartToLocation = (location, partId) => {
  lua.career_modules_partInventory.movePart(location, partId)
}

const sellPart = part => {
  lua.career_modules_partInventory.sellPart(part.id)
  setPartToSell(undefined)
  emit("partSold")
}

const getLocationName = part => {
  if (part.location == 0) {
    return "Inventory"
  } else {
    return "Vehicle No. " + part.location + " (" + part.vehicleModel + ")"
  }
}
</script>

<style scoped lang="scss">
.partTable {
  border: 1px solid rgb(170, 170, 170);
  & th,
  & td {
    border: 1px solid rgb(170, 170, 170);
    padding: 2px;
    padding-right: 10px;
    text-align: left;
  }
}

.blurBackground {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.781);
}

.modalPopup {
  position: fixed;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  // TODO: This is hacky. should be properly moved into a popup modal component
  z-index: 1000;

  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
