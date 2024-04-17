<template>
  <div v-if="partInventoryStore.partInventoryData.partList">
    <table v-if="partInventoryStore.partInventoryData.partList.length" class="partTable">
      <tr>
        <th>Description</th>
        <th>Location</th>
        <th>Mileage</th>
        <th>Part Value</th>
        <th>Vehicle Model</th>
        <th></th>
      </tr>
      <tr v-for="(part, key) in partInventoryStore.partInventoryData.partList" :key="key">
        <td>{{ getPartDescription(part) }}</td>
        <td>{{ getLocationName(part) }}</td>
        <td>{{ units.buildString("length", part.partCondition.odometer, 0) }}</td>
        <td>{{ units.beamBucks(part.finalValue) }}</td>
        <td>{{ part.vehicleModel }}</td>
        <td>
          <div v-if="!part.missingFile">
            <BngButton v-if="part.location !== 0 && !part.isInCoreSlot" :disabled="buttonDisabled(part)" @click="movePartToLocation(0, part.id)">
              Remove from vehicle
            </BngButton>
            <BngButton
              v-if="part.fitsCurrentVehicle && part.location !== partInventoryStore.partInventoryData.currentVehicle"
              :disabled="buttonDisabled(part)"
              @click="movePartToLocation(partInventoryStore.partInventoryData.currentVehicle, part.id)">
              Put into current vehicle
            </BngButton>
          </div>
          <BngButton v-if="part.location === 0" :disabled="buttonDisabled(part)" @click="confirmSellPart(part)">Sell</BngButton>
        </td>
      </tr>
    </table>
    <h3 v-else>You don't currently own any parts</h3>
  </div>
</template>

<script setup>
import { lua, useBridge } from "@/bridge"
import { BngButton } from "@/common/components/base"
import { usePartInventoryStore } from "../../stores/partInventoryStore"
import { openConfirmation } from "@/services/popup"
import { $translate } from "@/services/translation"

const { units } = useBridge()

const emit = defineEmits(["partSold"])
const partInventoryStore = usePartInventoryStore()

const buttonDisabled = part =>
  !part.accessible || partInventoryStore.partInventoryData.brokenVehicleInventoryIds[partInventoryStore.partInventoryData.currentVehicle]

const confirmSellPart = async partToSell => {
  const res = await openConfirmation("", `Do you want to sell this part for ${units.beamBucks(partToSell.finalValue)}?`, [
    { label: $translate.instant("ui.common.yes"), value: true },
    { label: $translate.instant("ui.common.no"), value: false, extras: { accent: "attention" } },
  ])
  if (res) sellPart(partToSell)
}

const getPartDescription = part => (part.missingFile ? "Missing File" : part.description.description)

const movePartToLocation = (location, partId) => lua.career_modules_partInventory.movePart(location, partId)

const sellPart = part => {
  lua.career_modules_partInventory.sellPart(part.id)
  emit("partSold")
}

const getLocationName = part => (part.location ? "Vehicle No. " + part.location + " (" + part.vehicleModel + ")" : "Inventory")
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
</style>
