<template>
  <div v-if="vehicleInventoryStore" style="height: 80vh; overflow: auto">
    <table class="vehicleTable">
      <tr>
        <th>Description</th>
        <th>Value</th>
        <th>Insurance requirement</th>
        <th>Location</th>
        <th></th>
        <th v-if="vehicleInventoryStore.vehicleInventoryData.repairEnabled || vehicleInventoryStore.vehicleInventoryData.sellEnabled || vehicleInventoryStore.vehicleInventoryData.favoriteEnabled"></th>
      </tr>
      <tr v-for="(vehicle, key) in vehicleInventoryStore.filteredVehicles">
        <td>
          <div v-if="vehicleInventoryStore.vehicleInventoryData.tutorialActive">Tutorial Vehicle:</div>
          {{ vehicle.niceName }}
        </td>

        <td>{{ units.beamBucks(vehicle.value) }}</td>

        <td>
          {{ vehicle.policyInfo.name }}
          <div v-if="!vehicle.ownsRequiredInsurance">
            <div style="color: rgb(245, 29, 29)">Not owned!</div>
            <BngButton
              :disabled="vehicle.policyInfo.initialBuyPrice > vehicleInventoryStore.vehicleInventoryData.playerMoney"
              @click="buyInsurance(vehicle.policyInfo.id)"
            >
              Purchase ({{ units.beamBucks(vehicle.policyInfo.initialBuyPrice) }})
            </BngButton>
          </div>
        </td>

        <td>
          <div v-if="vehicle.missingFile">Missing File!</div>
          <div v-else-if="vehicle.timeToAccess">
            <div v-if="vehicle.delayReason == 'bought'">In delivery ({{ vehicle.timeToAccess.toFixed(0) }} s)</div>
            <div v-else-if="vehicle.delayReason == 'repair'">Being repaired ({{ vehicle.timeToAccess.toFixed(0) }} s)</div>
            <div v-else>Available in: {{ vehicle.timeToAccess.toFixed(0) }} s</div>
          </div>
          <div v-else-if="vehicle.inGarage">In garage</div>
          <div v-else-if="vehicle.distance">{{ units.buildString("length", vehicle.distance, 0) }} away</div>
          <div v-else>storage</div>
        </td>

        <td style="text-align: center">
          <div v-for="buttonData, index in vehicleInventoryStore.vehicleInventoryData.chooseButtonsData">
            <div v-if="buttonData.repairRequired && vehicle.needsRepair && !vehicleInventoryStore.vehicleInventoryData.tutorialActive">
              <BngButton style="min-width: 0" :disabled="true" @click="vehicleInventoryStore.chooseVehicle(vehicle.id, index)">
                {{ buttonData.buttonText }} (Needs repair)
              </BngButton>
            </div>
            <div v-else>
              <BngButton
                :disabled="vehicle.timeToAccess || vehicle.missingFile || (buttonData.insuranceRequired && !vehicle.ownsRequiredInsurance) || (buttonData.requiredVehicleNotInGarage && vehicle.inGarage) || (buttonData.requiredOtherVehicleInGarage && !vehicle.otherVehicleInGarage)"
                style="min-width: 0"
                @click="vehicleInventoryStore.chooseVehicle(vehicle.id, index)"
              >
                {{ buttonData.buttonText }}
              </BngButton>
            </div>
          </div>
        </td>
        <td v-if="vehicleInventoryStore.vehicleInventoryData.repairEnabled || vehicleInventoryStore.vehicleInventoryData.sellEnabled || vehicleInventoryStore.vehicleInventoryData.favoriteEnabled || vehicleInventoryStore.vehicleInventoryData.storingEnabled"
        style="padding-right: 0.0em; padding-left: 0.0em; text-align: center">
          <BngButton v-if="vehicleInventoryStore.vehicleInventoryData.repairEnabled" :disabled="vehicle.timeToAccess || vehicle.missingFile" @click="openRepairMenu(vehicle)"> Repair </BngButton>

          <BngButton
            show-hold
            v-if="vehicleInventoryStore.vehicleInventoryData.sellEnabled"
            :disabled="vehicle.timeToAccess"
            v-bng-on-ui-nav:ok.asMouse.focusRequired
            @click="setVehicleToSell(vehicle)"
          >
            Sell
          </BngButton>
          <BngButton v-if="vehicleInventoryStore.vehicleInventoryData.favoriteEnabled" :disabled="vehicle.favorite || vehicle.missingFile" @click="setFavoriteVehicle(vehicle.id)">
            Set as Favorite
          </BngButton>
          <BngButton v-if="vehicleInventoryStore.vehicleInventoryData.storingEnabled" :disabled="vehicle.inStorage" @click="storeVehicle(vehicle.id)"> Put in storage </BngButton>
        </td>
      </tr>
      <tr v-for="index in vehicleInventoryStore.vehicleInventoryData.numberOfFreeSlots" :key="index">
        <td>Empty</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td v-if="vehicleInventoryStore.vehicleInventoryData.repairEnabled || vehicleInventoryStore.vehicleInventoryData.sellEnabled || vehicleInventoryStore.vehicleInventoryData.favoriteEnabled"></td>
      </tr>
    </table>

    <div v-if="vehicleToSell">
      <div v-bng-blur class="blurBackground"></div>
      <BngCard class="modalPopup">
        <h3 style="padding: 10px">Do you want to sell this vehicle for {{ units.beamBucks(vehicleToSell.value) }}?</h3>
        <template #buttons>
          <BngButton @click="sellVehicle(vehicleToSell.id)"> Yes </BngButton>
          <BngButton @click="setVehicleToSell(undefined)"> No </BngButton>
        </template>
      </BngCard>
    </div>
  </div>
</template>

<script setup>
import { lua, useBridge } from "@/bridge"
import { BngButton, BngCard, BngCardHeading } from "@/common/components/base"
import { useVehicleInventoryStore } from "../../stores/vehicleInventoryStore"
import { vBngBlur, vBngClick, vBngOnUiNav } from "@/common/directives"

import { ref } from "vue"

const vehicleInventoryStore = useVehicleInventoryStore()

const vehicleToSell = ref()

function setVehicleToSell(vehicle) {
  vehicleToSell.value = vehicle
}

const { units } = useBridge()

const sellVehicle = inventoryId => {
  lua.career_modules_inventory.sellVehicleFromInventory(inventoryId)
  setVehicleToSell(undefined)
}

const openRepairMenu = vehicle => {
  lua.career_modules_insurance.openRepairMenu(vehicle, vehicleInventoryStore.vehicleInventoryData.originComputerId)
}

const setFavoriteVehicle = inventoryId => {
  lua.career_modules_inventory.setFavoriteVehicle(inventoryId)
  lua.career_modules_inventory.sendDataToUi()
}

const storeVehicle = inventoryId => {
  lua.career_modules_inventory.removeVehicleObject(inventoryId)
  lua.career_modules_inventory.sendDataToUi()
}

const buyInsurance = id => {
  lua.career_modules_insurance.purchasePolicy(id)
  lua.career_modules_inventory.sendDataToUi()
}
</script>

<style scoped lang="scss">
.vehicleTable {
  border: 1px solid rgb(255, 255, 255);
  margin-bottom: 1em;
  color: white;
  & th,
  & td {
    border: 1px solid rgb(255, 255, 255);
    padding: 0.2em;
    text-align: left;
    padding-right: 0.5em;
    padding-left: 0.5em;
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
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
