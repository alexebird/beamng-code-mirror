<template>
  <template v-if="cargoOverviewStore.cargoData">
    <div class="heading-wrapper">
      <BngCardHeading type="ribbon" class="cardHeading">
        {{ facilityId ? "Available Cargo - " + cargoOverviewStore.cargoData.facility.name : "My Cargo" }}
      </BngCardHeading>
      <div class="buttons-container">
        <BngButton
          class="headingButton"
          v-if="facilityId"
          :disabled="!cargoOverviewStore.newCargoAvailable"
          v-bng-sound-class="'bng_click_hover_generic'"
          @click="updateCargoDataAll">
          Refresh
        </BngButton>
        <BngButton class="headingButton" v-if="!facilityId" v-bng-sound-class="'bng_click_hover_generic'" @click="setAutomaticRoute">
          Automatic route
        </BngButton>
        <BngButton
          class="headingButton"
          v-if="!facilityId && cargoOverviewStore.cargoData.player.penaltyForAbandon > 0"
          v-bng-sound-class="'bng_click_hover_generic'"
          show-hold
          v-bng-click="{ holdCallback: () => exitMode(), holdDelay: 1000, repeatInterval: 0 }"
          accent="attention">
          Dump all cargo and pay <BngUnit :beambucks="cargoOverviewStore.cargoData.player.penaltyForAbandon" />
        </BngButton>
      </div>
    </div>

    <!-- progress bar if the facility is disabled -->
    <div class="lockedFacility" v-if="facilityId && cargoOverviewStore.cargoData.facility.disabled">
      <h3 class="subHeader">{{ cargoOverviewStore.cargoData.facility.disabledReasonHeader }} <BngIcon class="text-icon" :type="icons.lockClosed" /></h3>
      <div class="locked-reason">{{ cargoOverviewStore.cargoData.facility.disabledReasonContent }}</div>
      <div v-for="prog in cargoOverviewStore.cargoData.facility.progress" class="unlock-progress">
        <!-- TODO - please replace with BngProgressBar or discuss why not -->
        <div v-if="prog.type === 'progressBar'" class="progressbar-wrapper">
          <div class="progressbar-background">
            <div class="progress-label">{{ $ctx_t(prog.label) }}</div>
            <div class="progressbar-fill" :style="{ width: (prog.currValue > 0 ? (prog.currValue / (prog.maxValue - prog.minValue)) * 100 : 0) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="cargoTable">
      <!-- display a facility -->
      <div v-if="facilityId" class="scrollable-table" :class="getFacilityClass()">
        <!-- <div v-if="cargoOverviewStore.sortedOutgoingCargoFacility.length > 0"> -->
        <CargoTable
          :isFacility="true"
          :sortedCargo="cargoOverviewStore.sortedOutgoingCargoFacility"
          :cargoAttributes="parkingSpotPath ? CARGO_ATTRIBS.outgoing : CARGO_ATTRIBS.outgoingNoParkingSpot"
          @cargoHovered="onCargoHovered"
          v-if="cargoOverviewStore.sortedOutgoingCargoFacility.length" />
        <!-- </div> -->
        <div v-else>No cargo available</div>
      </div>

      <!-- display player cargo -->
      <div v-else class="playerVehicle" v-for="vehicleData in cargoOverviewStore.cargoData.player.vehicles">
        <div v-if="vehicleData.containers.length > 0">
          <h3 class="subHeader">{{ vehicleData.niceName }}</h3>
          <div class="playerContainer" v-for="containerData in vehicleData.containers">
            <div>
              <h3 class="subHeader">
                <div style="display: flex">
                  <!-- TODO - sort out this HTML+CSS mess... DIVs inside SPANs?? Inline styles (some do nothing) -->
                  <div style="float: left; margin-top: 0.5em">{{ containerData.name }}</div>
                  <div style="float: left; margin-top: 0.5em; padding-left: 1em">Slots:</div>
                  <span>
                    <!-- TODO - consider using BngProgressBar here -->
                    <div class="progressbar-wrapper" style="padding-left: 0.5em">
                      <div class="slotsProgressbarBackground">
                        <div
                          class="slotsProgressbarFill"
                          :style="{
                            width: (containerData.usedCargoSlots > 0 ? (containerData.usedCargoSlots / containerData.totalCargoSlots) * 100 : 0) + '%',
                          }"></div>

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
                            }"></div>

                          <!-- the hovered cargo doesnt fit the container -->
                          <!-- TODO - remove inline styling -->
                          <div
                            v-else
                            class="slotsProgressbarFill slotHighlight"
                            :style="{
                              backgroundColor: 'rgb(255, 56, 49)',
                              width: '100%',
                              animation: 'undefined',
                            }"></div>
                        </span>
                        <div class="progress-label">{{ containerData.usedCargoSlots + "/" + containerData.totalCargoSlots }}</div>
                      </div>
                    </div>
                  </span>

                  <!-- TODO - remove inline styling -->
                  <div v-if="getDisplayAmountHighlightSlots(containerData) > containerData.totalCargoSlots" style="padding-left: 1em; margin-top: 0.5em">
                    Not enough space
                  </div>
                </div>
              </h3>
            </div>
            <div v-if="containerData.cargo.length">
              <CargoTable :isFacility="false" :sortedCargo="containerData.cargo" :cargoAttributes="CARGO_ATTRIBS.player" @cargoHovered="onCargoHovered" />
            </div>
          </div>
        </div>
      </div>
      <div v-if="!facilityId && cargoOverviewStore.cargoData.player.noContainers" style="max-width: 48em">
        <p>Your vehicle has no cargo containers installed. Head to you garage and install some!</p>
        <p>Access the <b>Computer</b> and navigate to <b>Purchase Parts</b> and then <b>Cargo Parts</b>.</p>
        <BngButton @click="showCargoContainerHelpPopup">Show me how!</BngButton>
      </div>

      <!-- TODO - remove inline styling -->
      <div v-if="!facilityId" class="summary" style="padding-top: 0.5em">
        <div style="float: left; padding-right: 5em">
          Penalty for abandoning deliveries:
          <BngUnit :beambucks="cargoOverviewStore.cargoData.player.penaltyForAbandon" />
        </div>
        <div style="float: left; padding-right: 5em">
          Reward sum:
          <BngUnit :beambucks="cargoOverviewStore.cargoData.player.loadedCargoMoneySum" />
        </div>
        <div style="float: left; padding-right: 5em">
          Cargo weight:
          {{ units.buildString("weight", cargoOverviewStore.cargoData.player.weightSum, 1) }}
        </div>
      </div>
    </div>
  </template>
</template>

<script>
import { icons } from "@/common/components/base"

const CARGO_ATTRIBS = {
  player: {
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
  },

  outgoing: {
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
  },

  outgoingNoParkingSpot: {
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
  },
}
</script>

<script setup>
import { ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngButton, BngCardHeading, BngIcon, BngUnit } from "@/common/components/base"
import { useCargoOverviewStore } from "../../stores/cargoOverviewStore"
import { vBngClick, vBngSoundClass } from "@/common/directives"
import CargoTable from "../cargoOverview/CargoTable.vue"

const emit = defineEmits(["cargoHovered"])
const { units } = useBridge()

const emptySlotHighlightAmount = ref(0)
const props = defineProps({
  facilityId: String,
  parkingSpotPath: String,
})

const exitMode = () => {
  lua.career_modules_delivery_cargoScreen.exitDeliveryMode()
  lua.career_modules_delivery_cargoScreen.exitCargoOverviewScreen()
}

const cargoOverviewStore = useCargoOverviewStore()

const playButtonSound = () => lua.ui_audio.playEventSound("bng_click_generic", "click")

const updateCargoDataAll = () => {
  cargoOverviewStore.requestCargoData(props.facilityId, props.parkingSpotPath)
  //playButtonSound()
}

const setAutomaticRoute = cargoOverviewStore.setAutomaticRoute

const onCargoHovered = cargo => emit("cargoHovered", cargo)

const getFacilityClass = () => (cargoOverviewStore.cargoData.facility.disabled ? "disabledFacility" : "")

const highlightEmptySlots = amount => (emptySlotHighlightAmount.value = amount)

const getDisplayAmountHighlightSlots = containerData =>
  emptySlotHighlightAmount.value <= 0 ? 0 : containerData.usedCargoSlots + emptySlotHighlightAmount.value

const showCargoContainerHelpPopup = () => lua.career_modules_delivery_cargoScreen.showCargoContainerHelpPopup()

defineExpose({
  highlightEmptySlots,
})
</script>

<style scoped lang="scss">
@import "@/styles/modules/density";

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
    max-height: 30vh;
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
  .locked-reason {
    color: red;
    padding-bottom: 1em;
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

.subHeader {
  margin-block-end: 0.5em;
}

.slotOverview {
  margin-left: 0.5em;
}

// TODO - remove if no longer needed
.blurBackground {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.781);
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

.heading-wrapper {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  flex: 0 0 auto;
  padding: 0.5rem 0.5rem 0.5rem 0;
  align-items: center;

  .cardHeading {
    flex: 1 0 auto;
    margin: 0;
  }

  .buttons-container {
    display: flex;
    flex: 0 0.5 auto;
    flex-flow: row nowrap;
    align-items: stretch;
  }
}
</style>
