<template>
  <template v-if="cargoOverviewStore.cargoData">
    <BngCardHeading type="ribbon" class="cardHeading">
      {{ facilityId ? "Available Cargo - " + cargoOverviewStore.cargoData.facility.name : "My Cargo" }}
      <BngButton class="headingButton" v-if="facilityId" :disabled="!cargoOverviewStore.newCargoAvailable" @click="updateCargoDataAll"> Refresh </BngButton>
      <BngButton class="headingButton" v-else v-if="cargoOverviewStore.cargoData.player.penaltyForAbandon > 0" show-hold v-bng-click="{holdCallback: () => exitMode(), holdDelay: 1000, repeatInterval: 0 }" accent="attention">
        Dump all cargo and pay <BngUnit :beambucks="cargoOverviewStore.cargoData.player.penaltyForAbandon" />
      </BngButton>
    </BngCardHeading>

    <!-- progress bar if the facility is disabled -->
    <div class="lockedFacility" v-if="facilityId && cargoOverviewStore.cargoData.facility.disabled">
      <h3 class="subHeader">
        {{ cargoOverviewStore.cargoData.facility.disabledReasonHeader }} <BngIcon class="text-icon" :type="iconTypes.decals.general.lock" />
      </h3>
      <div style="color: red; padding-bottom: 1em">{{ cargoOverviewStore.cargoData.facility.disabledReasonContent }}</div>
      <div v-for="prog in cargoOverviewStore.cargoData.facility.progress" class="unlock-progress">
        <div v-if="prog.type === 'progressBar'" class="progressbar-wrapper">
          <div class="progressbar-background">
            <div class="progress-label">{{ $ctx_t(prog.label) }}</div>
            <div class="progressbar-fill" :style="{ width: (prog.currValue > 0 ? (prog.currValue / (prog.maxValue - prog.minValue)) * 100 : 0) + '%' }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cargoTable">
      <!-- display a facility -->
      <div v-if="facilityId" class="scrollable-table" :class="getFacilityClass()">
        <h3 class="subHeader" v-if="cargoOverviewStore.sortedIncomingCargoFacility.length > 0">
          Outgoing Cargo
          <BngIcon v-if="cargoOverviewStore.cargoData.facility.disabled" class="text-icon" :type="iconTypes.decals.general.lock" />
        </h3>

        <!-- <div v-if="cargoOverviewStore.sortedOutgoingCargoFacility.length > 0"> -->
        <CargoTable
          :is-facility="true"
          :sorted-cargo="cargoOverviewStore.sortedOutgoingCargoFacility"
          :cargoAttributes="parkingSpotPath ? outgoingCargoAttributes : outgoingCargoAttributesNoParkingSpot"
          @hoveredCargo="hoveredCargo"
          v-if="cargoOverviewStore.sortedOutgoingCargoFacility.length > 0"
        />
        <!-- </div> -->
        <div v-else>No cargo available</div>

        <div v-if="cargoOverviewStore.sortedIncomingCargoFacility.length > 0">
          <h3 class="subHeader">Incoming Cargo</h3>
          <CargoTable
            :is-facility="true"
            :sorted-cargo="cargoOverviewStore.sortedIncomingCargoFacility"
            :cargoAttributes="incomingCargoAttributes"
            @hoveredCargo="hoveredCargo"
          />
        </div>
      </div>

      <!-- display player cargo -->
      <div v-else class="playerVehicle" v-for="vehicleData in cargoOverviewStore.cargoData.player.vehicles">
        <div v-if="vehicleData.containers.length > 0">
          <h3 class="subHeader">{{ vehicleData.niceName }}</h3>
          <div class="playerContainer" v-for="containerData in vehicleData.containers">
            <div>
              <h3 class="subHeader">
                <div style="display: flex">
                  <div style="float: left; margin-top: 0.5em">{{ containerData.name }}</div>
                  <div style="float: left; margin-top: 0.5em; padding-left: 1em">Slots:</div>
                  <span>
                    <div class="progressbar-wrapper" style="padding-left: 0.5em">
                      <div class="slotsProgressbarBackground">
                        <div
                          class="slotsProgressbarFill"
                          :style="{
                            width: (containerData.usedCargoSlots > 0 ? (containerData.usedCargoSlots / (containerData.totalCargoSlots - 0)) * 100 : 0) + '%',
                          }"
                        ></div>

                        <!-- hovering over cargo -->
                        <span v-if="getDisplayAmountHighlightSlots(containerData) > 0">
                          <!-- the hovered cargo fits the container -->
                          <div
                            v-if="getDisplayAmountHighlightSlots(containerData) <= containerData.totalCargoSlots"
                            class="slotsProgressbarFill slotHighlight"
                            :style="{
                              backgroundColor: 'rgb(255, 130, 47)',
                              zIndex: -1,
                              width: Math.min((getDisplayAmountHighlightSlots(containerData) / containerData.totalCargoSlots) * 100, 110) + '%',
                            }"
                          ></div>

                          <!-- the hovered cargo doesnt fit the container -->
                          <div
                            v-else
                            class="slotsProgressbarFill slotHighlight"
                            :style="{
                              backgroundColor: 'rgb(255, 56, 49)',
                              width: '100%',
                              animation: 'undefined',
                            }"
                          ></div>
                        </span>
                        <div class="progress-label">{{ containerData.usedCargoSlots + "/" + containerData.totalCargoSlots }}</div>
                      </div>
                    </div>
                  </span>
                  <div v-if="getDisplayAmountHighlightSlots(containerData) > containerData.totalCargoSlots" style="padding-left: 1em; margin-top: 0.5em">
                    Not enough space
                  </div>
                </div>
              </h3>
            </div>
            <div v-if="containerData.cargo.length > 0">
              <CargoTable :is-facility="false" :sorted-cargo="containerData.cargo" :cargoAttributes="playerCargoAttributes" @hoveredCargo="hoveredCargo" />
            </div>
          </div>
        </div>
      </div>
      <div class="playerVehicle" v-if="!facilityId && cargoOverviewStore.cargoData.player.noContainers" style="max-width:48em;">
        <p>
          Your vehicle has no cargo containers installed. Head to you garage and install some!
        </p>
        <p>
          Access the <b>Computer</b> and navigate to <b>Purchase Parts</b> and then <b>Cargo Parts</b>.
        </p>
        <BngButton @click="showCargoContainerHelpPopup">Show me how!</BngButton>
      </div>
      <div v-if="!facilityId" class="summary" style="padding-top: 0.5em">
        <div style="float: left; padding-right: 5em">
          Penalty for abandoning deliveries:
          <BngIcon class="text-icon" :type="iconTypes.general['money']" />
          {{ units.beamBucks(cargoOverviewStore.cargoData.player.penaltyForAbandon) }}
        </div>
        <div style="float: left; padding-right: 5em">
          Reward sum:
          <BngIcon class="text-icon" :type="iconTypes.general['money']" />
          {{ units.beamBucks(cargoOverviewStore.cargoData.player.loadedCargoMoneySum) }}
        </div>
        <div style="float: left; padding-right: 5em">
          Cargo weight:
          {{ units.buildString("weight",cargoOverviewStore.cargoData.player.weightSum,1) }}
        </div>
      </div>
    </div>

    <div v-if="false">
      <div v-bng-blur class="blurBackground"></div>
      <BngCard class="modalPopup"> </BngCard>
    </div>
  </template>
</template>

<script>
import { icons as iconTypes } from "@/assets/icons"
</script>

<script setup>
import { ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngButton, BngCard, BngCardHeading, BngIcon, BngUnit } from "@/common/components/base"
import { useCargoOverviewStore } from "../../stores/cargoOverviewStore"
import { vBngBlur, vBngClick } from "@/common/directives"
import CargoTable from "../cargoOverview/CargoTable.vue"

// TODO - switch to 'cargoHovered'
const emit = defineEmits(["hoveredCargo"])

const emptySlotHighlightAmount = ref(0)
const props = defineProps({
  facilityId: String,
  parkingSpotPath: String,
})

const exitMode = () => {
  lua.career_modules_delivery_deliveryManager.exitDeliveryMode()
  lua.career_modules_delivery_deliveryManager.exitCargoOverviewScreen()
}

const cargoOverviewStore = useCargoOverviewStore()

const { units } = useBridge()

const updateCargoDataAll = () => {
  cargoOverviewStore.requestCargoData(props.facilityId, props.parkingSpotPath)
}

const hoveredCargo = cargo => {
  emit("hoveredCargo", cargo)
}

const getFacilityClass = () => {
  if (cargoOverviewStore.cargoData.facility.disabled) {
    return "disabledFacility"
  }
  return ""
}

const highlightEmptySlots = amount => {
  emptySlotHighlightAmount.value = amount
}

const getDisplayAmountHighlightSlots = containerData => {
  if (emptySlotHighlightAmount.value <= 0) {
    return 0
  }
  return containerData.usedCargoSlots + emptySlotHighlightAmount.value
}

const showCargoContainerHelpPopup = () => {
  lua.career_modules_delivery_deliveryManager.showCargoContainerHelpPopup()
}

defineExpose({
  highlightEmptySlots,
})

const playerCargoAttributes = {
  quantity: true,
  name: true,
  destination: true,
  location: false,
  origin: false,
  distance: true,
  reward: true,
  move: true,
  slots: true,
  route: true,
  weight: true,
  modifiers: true,
}

const outgoingCargoAttributes = {
  quantity: true,
  name: true,
  destination: true,
  location: false,
  origin: false,
  distance: true,
  reward: true,
  move: true,
  slots: true,
  offerTime: true,
  weight: true,
  modifiers: true,
}

const outgoingCargoAttributesNoParkingSpot = {
  quantity: true,
  name: true,
  destination: true,
  location: false,
  origin: true,
  distance: true,
  reward: true,
  move: false,
  slots: true,
  offerTime: true,
  weight: true,
  modifiers: true,
  routeOrigin: true,
}

const incomingCargoAttributes = {
  quantity: true,
  name: true,
  destination: false,
  location: false,
  origin: true,
  distance: true,
  reward: true,
  move: false,
  slots: true,
  offerTime: true,
  weight: true,
  modifiers: true,
}
</script>

<style scoped lang="scss">
.playerVehicle {
  overflow-y: auto;
}

@import "@/styles/modules/mixins";

.headingButton {
  font-size: 0.875rem;
  float: right;
}

.playerCargo {
  .cargoTable {
    flex: 1 1 auto;
    .playerContainer {
      background-color: rgba(var(--bng-cool-gray-700-rgb), 0.6);
      padding-left: 0.5em;
      padding-right: 0.5em;
      padding-bottom: 0.5em;
      padding-top: 0em;
      margin-top: 1em;
      border-radius: $border-rad-2;
    }
    .playerVehicle {
      flex: 1 1 auto;
      overflow-y: auto;
    }
  }
}

.cargoTable {
  padding: 0 0.5rem 0.5rem;
  flex: 0 1 auto;
  display: flex;
  flex-flow: column;
  // overflow-y: auto;
  position: relative;
  .scrollable-table {
    flex: 1 1 auto;
    overflow-y: auto;
    border-radius: $border-rad-2;
  }
}

.lockedFacility {
  flex: 0 0 auto;
  display: flex;
  flex-flow: column;
  .unlock-progress {
    flex: 0 0 auto;
    padding: 0 0.5em 1em 0.5em;
    min-height: 2em;
  }
}

.disabledFacility {
  color: rgb(172, 172, 172);
  flex: 1 1 auto;
}

.text-icon {
  min-width: 1em;
  min-height: 1em;
  display: inline-block;
  transform: translateY(0.15em);
}

.slot {
  float: left;
  width: 0.4em;
  height: 1.2em;
  margin: 0.05em;
  margin-top: 0.3em;
}

.slotEmpty {
  border: 0.01em solid rgb(255, 102, 0);
}

.slotFull {
  background-color: rgb(255, 102, 0);
}

@keyframes pulsing {
  50% {
    opacity: 0.5;
  }
}

.slotHighlight {
  animation: pulsing 0.8s ease-in-out infinite;
  background-color: rgb(255, 130, 47);
}

.cardHeading {
  margin-bottom: 0em;
}

.subHeader {
  margin-block-end: 0.5em;
}

.slotOverview {
  margin-left: 0.5em;
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

.slotsProgressbarBackground {
  //padding-left: 1em;
  display: flex;
  border-radius: var(--bng-corners-1);
  width: 20em;
  background-color: rgba(0, 0, 0, 0.781);
  transform: translate(0%, 20%);
}

.slotsProgressbarFill {
  background-color: rgb(255, 102, 0);
  position: absolute;
  border-radius: var(--bng-corners-1);
  height: 100%;
}

.progressbar-background {
  display: flex;
  border-radius: var(--bng-corners-1);
  width: 100%;
}

.progressbar-fill {
  background-color: rgba(114, 113, 113, 0.877);
  position: absolute;
  height: 100%;
}

.progressbar-wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
  border-radius: var(--bng-corners-1);
}
.progress-label {
  display: flex;
  flex-direction: row;
  z-index: 2;
  position: relative;
  padding-left: 0.5em;
  padding-top: 0.2em;

  text-align: center;
  height: 100%;
}

.summary {
  flex: 0 0 auto;
}
</style>
