<template>
  <div style="padding: 50px">
    <BngCard v-if="vehiclePurchaseStore.vehicleInfo.niceName" bng-ui-scope="vehiclePurchase" class="purchaseScreen">
      <BngCardHeading type="ribbon" style="text-align: left">Purchase</BngCardHeading>
      <table style="width: 100%; text-align: center">
        <tr>
          <th class="article" style="width: 30%; padding-bottom: 5px"></th>
          <th class="price" style="width: 20%; padding-bottom: 5px">Price</th>
        </tr>
        <tr>
          <td class="article">
            <div>{{ vehiclePurchaseStore.vehicleInfo.year }} {{ vehiclePurchaseStore.vehicleInfo.niceName }}</div>
            ({{ units.buildString("length", vehiclePurchaseStore.vehicleInfo.Mileage, 0) }})
          </td>
          <td class="price">{{ units.beamBucks(vehiclePurchaseStore.vehicleInfo.Value) }}</td>
        </tr>
        <tr>
          <td class="article">Dealership Fees</td>
          <td class="price">{{ units.beamBucks(vehiclePurchaseStore.vehicleInfo.fees) }}</td>
        </tr>
        <tr v-if="vehiclePurchaseStore.tradeInVehicleInfo.niceName">
          <td class="article">Trade-in: {{ vehiclePurchaseStore.tradeInVehicleInfo.niceName }}</td>
          <td class="price">{{ units.beamBucks(-vehiclePurchaseStore.tradeInVehicleInfo.Value) }}</td>
        </tr>

        <tr>
          <th class="article" style="padding-top: 20px; padding-bottom: 20px">Subtotal</th>
          <th class="price">
            {{
              units.beamBucks(
                vehiclePurchaseStore.prices.finalPrice -
                  vehiclePurchaseStore.prices.taxes -
                  (vehiclePurchaseStore.buyRequiredInsurance ? vehiclePurchaseStore.vehicleInfo.requiredInsurance.initialBuyPrice : 0)
              )
            }}
          </th>
        </tr>

        <tr>
          <td class="article">Sales Tax (7%)</td>
          <td class="price">{{ units.beamBucks(vehiclePurchaseStore.prices.taxes) }}</td>
        </tr>

        <tr v-if="vehiclePurchaseStore.buyRequiredInsurance">
          <td class="article" style="color: rgb(255, 183, 0)">{{ vehiclePurchaseStore.vehicleInfo.requiredInsurance.name }} insurance</td>
          <td class="price" style="color: rgb(255, 183, 0)">{{ units.beamBucks(vehiclePurchaseStore.vehicleInfo.requiredInsurance.initialBuyPrice) }}</td>
        </tr>

        <tr>
          <th class="article" style="padding-top: 5px; font-size: 1.3em">Total</th>
          <th class="price" style="padding-top: 5px; font-size: 1.3em">{{ units.beamBucks(vehiclePurchaseStore.prices.finalPrice) }}</th>
        </tr>

        <tr v-if="vehiclePurchaseStore.prices.finalPrice > vehiclePurchaseStore.playerMoney" style="color: rgb(245, 29, 29)">
          <td class="article" style="padding-top: 5px; font-size: 1.3em">Additional funds required</td>
          <td class="price" style="padding-top: 5px; font-size: 1.3em">
            {{ units.beamBucks(vehiclePurchaseStore.prices.finalPrice - vehiclePurchaseStore.playerMoney) }}
          </td>
        </tr>
      </table>

      <div v-if="!vehiclePurchaseStore.ownsRequiredInsurance" style="text-align: right; padding-right: 10px; padding-top: 30px">
        <input bng-nav-item type="checkbox" id="insurance" v-model="vehiclePurchaseStore.buyRequiredInsurance" v-on:change="insuranceCheckboxClicked" />
        <label for="insurance"
          >Purchase "{{ vehiclePurchaseStore.vehicleInfo.requiredInsurance.name }}" insurance? ({{
            units.beamBucks(vehiclePurchaseStore.vehicleInfo.requiredInsurance.initialBuyPrice)
          }})</label
        >
      </div>

      <div v-if="vehiclePurchaseStore.locationSelectionEnabled" style="text-align: right; padding-right: 10px">
        <input
          :disabled="vehiclePurchaseStore.forceNoDelivery || (!vehiclePurchaseStore.ownsRequiredInsurance && !vehiclePurchaseStore.buyRequiredInsurance)"
          bng-nav-item
          type="checkbox"
          id="delivery"
          v-model="vehiclePurchaseStore.makeDelivery"
        />
        <label for="delivery">Deliver this vehicle to your garage?</label>
      </div>

      <template #buttons>
        <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="cancel" accent="attention">Cancel</BngButton>

        <BngButton
          v-if="vehiclePurchaseStore.tradeInEnabled && vehiclePurchaseStore.tradeInVehicleInfo.niceName"
          @click="removeTradeInVehicle"
          accent="attention"
          >Remove Trade-In</BngButton
        >
        <div v-else>
          <div v-if="vehiclePurchaseStore.tradeInEnabled">
            <BngButton @click="chooseTradeInVehicle" accent="secondary">Choose Trade-In</BngButton>
          </div>
          <div v-else>
            <BngTooltip style="width: max-content" position="top" text="Trade in only possible in person at a dealership">
              <BngButton :disabled="true" @click="chooseTradeInVehicle" accent="secondary">Choose Trade-In</BngButton>
            </BngTooltip>
          </div>
        </div>

        <BngButton
          :disabled="
            vehiclePurchaseStore.prices.finalPrice > vehiclePurchaseStore.playerMoney ||
            (!vehiclePurchaseStore.inventoryHasFreeSlot && !vehiclePurchaseStore.tradeInVehicleInfo.niceName) ||
            (vehiclePurchaseStore.forceTradeIn && !vehiclePurchaseStore.tradeInVehicleInfo.niceName)
          "
          show-hold
          v-bng-on-ui-nav:ok.asMouse.focusRequired
          v-bng-click="{
            clickCallback: () => setPopupOpen(true),
            holdCallback: () => buyVehicle(!vehiclePurchaseStore.locationSelectionEnabled || vehiclePurchaseStore.makeDelivery),
            holdDelay: 2000,
            repeatInterval: 0,
          }"
        >
          <div v-if="vehiclePurchaseStore.prices.finalPrice > vehiclePurchaseStore.playerMoney">Insufficient Funds</div>
          <div v-else-if="!vehiclePurchaseStore.inventoryHasFreeSlot && !vehiclePurchaseStore.tradeInVehicleInfo.niceName">No free inventory slots</div>
          <div v-else>Purchase</div>
        </BngButton>
      </template>
      <BngCard class="profileStatus">
        <CareerStatus />
      </BngCard>
    </BngCard>
  </div>

  <div v-if="popupOpen">
    <div v-bng-blur class="blurBackground"></div>
    <BngCard class="modalPopup">
      <div style="padding: 1em">
        <h3 style="padding-bottom: 0.5em">Are you sure you want to purchase this vehicle?</h3>
        <div v-if="!vehiclePurchaseStore.ownsRequiredInsurance && !vehiclePurchaseStore.buyRequiredInsurance" style="color: rgb(245, 29, 29); padding-bottom: 1.5em">
          Warning: You must purchase "{{ vehiclePurchaseStore.vehicleInfo.requiredInsurance.name }}" insurance to drive this vehicle.
        </div>
        <div style="padding-bottom: 8px" v-if="!vehiclePurchaseStore.locationSelectionEnabled || vehiclePurchaseStore.makeDelivery">
          {{ vehiclePurchaseStore.vehicleInfo.niceName }} will be delivered to your garage in {{ vehiclePurchaseStore.vehicleInfo.deliveryDelay }} s.
          <div style="font-style: oblique">(Purchase on location to avoid the {{ vehiclePurchaseStore.vehicleInfo.deliveryDelay }} s delivery delay)</div>
        </div>
      </div>
      <template #buttons>
        <BngButton @click="buyVehicle(!vehiclePurchaseStore.locationSelectionEnabled || vehiclePurchaseStore.makeDelivery)"> Yes </BngButton>
        <BngButton @click="setPopupOpen(false)" accent="attention"> No </BngButton>
      </template>
    </BngCard>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue"
import { BngButton, BngCard, BngCardHeading, BngTooltip } from "@/common/components/base"
import { useVehiclePurchaseStore } from "../stores/vehiclePurchaseStore"
import { lua, useBridge } from "@/bridge"
import { vBngBlur, vBngClick } from "@/common/directives"
import { CareerStatus } from "@/modules/career/components"
import { vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
useUINavScope("vehiclePurchase")

const { units } = useBridge()

const vehiclePurchaseStore = useVehiclePurchaseStore()
const popupOpen = ref(false)

const insuranceCheckboxClicked = () => {
  vehiclePurchaseStore.toggleInsurancePurchase()
}

const setPopupOpen = open => {
  popupOpen.value = open
}

const cancel = () => {
  vehiclePurchaseStore.cancel()
}

const chooseTradeInVehicle = () => {
  vehiclePurchaseStore.chooseTradeInVehicle()
}

const removeTradeInVehicle = () => {
  vehiclePurchaseStore.removeTradeInVehicle()
}

const buyVehicle = _makeDelivery => {
  setPopupOpen(false)
  if (vehiclePurchaseStore.buyRequiredInsurance) {
    lua.career_modules_insurance.purchasePolicy(vehiclePurchaseStore.vehicleInfo.requiredInsurance.id)
  }
  vehiclePurchaseStore.buyVehicle(_makeDelivery)
}

const start = () => {
  vehiclePurchaseStore.requestPurchaseData()
}

const kill = () => {
  vehiclePurchaseStore.$dispose()
}
onMounted(start)
onUnmounted(kill)
</script>

<style scoped lang="scss">
.purchaseScreen {
  width: 600px;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.purchaseScreen {
  :deep(.buttons) {
    overflow: visible !important;
  }
}

.price {
  text-align: right;
  padding-right: 70px;
}

.article {
  text-align: left;
  padding-left: 70px;
}

.profileStatus {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
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
