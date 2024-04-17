<template>
  <div v-if="vehicleInventoryStore" style="height: 80vh; overflow: auto">
    <table v-if="vehicleInventoryStore.filteredVehicles.length" class="vehicleTable">
      <tr>
        <th>Description</th>
        <th>Value</th>
        <th>Insurance requirement</th>
        <th>Location</th>
        <th></th>
        <th
          v-if="
            vehicleInventoryStore.vehicleInventoryData.repairEnabled ||
            vehicleInventoryStore.vehicleInventoryData.sellEnabled ||
            vehicleInventoryStore.vehicleInventoryData.favoriteEnabled
          "></th>
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
              @click="buyInsurance(vehicle.policyInfo.id)">
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
          <div v-for="(buttonData, index) in vehicleInventoryStore.vehicleInventoryData.chooseButtonsData">
            <div v-if="buttonData.repairRequired && vehicle.needsRepair && !vehicleInventoryStore.vehicleInventoryData.tutorialActive">
              <BngButton style="min-width: 0" :disabled="true" @click="vehicleInventoryStore.chooseVehicle(vehicle.id, index)">
                {{ buttonData.buttonText }} (Needs repair)
              </BngButton>
            </div>
            <div v-else>
              <BngButton
                :disabled="
                  vehicle.timeToAccess ||
                  vehicle.missingFile ||
                  (buttonData.insuranceRequired && !vehicle.ownsRequiredInsurance) ||
                  (buttonData.requiredVehicleNotInGarage && vehicle.inGarage) ||
                  (buttonData.requiredOtherVehicleInGarage && !vehicle.otherVehicleInGarage)
                "
                style="min-width: 0"
                @click="vehicleInventoryStore.chooseVehicle(vehicle.id, index)">
                {{ buttonData.buttonText }}
              </BngButton>
            </div>
          </div>
        </td>
        <td
          v-if="
            vehicleInventoryStore.vehicleInventoryData.repairEnabled ||
            vehicleInventoryStore.vehicleInventoryData.sellEnabled ||
            vehicleInventoryStore.vehicleInventoryData.favoriteEnabled ||
            vehicleInventoryStore.vehicleInventoryData.storingEnabled
          "
          style="padding-right: 0em; padding-left: 0em; text-align: center">
          <BngButton
            v-if="vehicleInventoryStore.vehicleInventoryData.repairEnabled"
            :disabled="vehicle.timeToAccess || vehicle.missingFile"
            @click="openRepairMenu(vehicle)">
            Repair
          </BngButton>

          <BngButton
            v-if="vehicleInventoryStore.vehicleInventoryData.sellEnabled"
            :disabled="vehicle.timeToAccess"
            v-bng-on-ui-nav:ok.asMouse.focusRequired
            @click="confirmSellVehicle(vehicle)">
            Sell
          </BngButton>
          <BngButton
            v-if="vehicleInventoryStore.vehicleInventoryData.favoriteEnabled"
            :disabled="vehicle.favorite || vehicle.missingFile"
            @click="setFavoriteVehicle(vehicle.id)">
            Set as Favorite
          </BngButton>
          <BngButton v-if="vehicleInventoryStore.vehicleInventoryData.storingEnabled" :disabled="vehicle.inStorage" @click="storeVehicle(vehicle.id)">
            Put in storage
          </BngButton>
        </td>
      </tr>
      <tr v-for="index in vehicleInventoryStore.vehicleInventoryData.numberOfFreeSlots" :key="index">
        <td>Empty</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td
          v-if="
            vehicleInventoryStore.vehicleInventoryData.repairEnabled ||
            vehicleInventoryStore.vehicleInventoryData.sellEnabled ||
            vehicleInventoryStore.vehicleInventoryData.favoriteEnabled
          "></td>
      </tr>
    </table>
    <h3 v-else>You don't currently own any vehicles</h3>
  </div>
</template>

<script setup>
import { lua, useBridge } from "@/bridge"
import { BngButton } from "@/common/components/base"
import { useVehicleInventoryStore } from "../../stores/vehicleInventoryStore"
import { vBngOnUiNav } from "@/common/directives"
import { openConfirmation } from "@/services/popup"
import { $translate } from "@/services/translation"

const vehicleInventoryStore = useVehicleInventoryStore()

const confirmSellVehicle = async vehicle => {
  const res = await openConfirmation("", `Do you want to sell this vehicle for ${units.beamBucks(vehicle.value)}?`, [
    { label: $translate.instant("ui.common.yes"), value: true },
    { label: $translate.instant("ui.common.no"), value: false, extras: { accent: "attention" } },
  ])
  if (res) sellVehicle(vehicle.id)
}

const { units } = useBridge()

const sellVehicle = inventoryId => {
  lua.career_modules_inventory.sellVehicleFromInventory(inventoryId)
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
</style>
