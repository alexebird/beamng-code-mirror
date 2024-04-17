<template>
  <BngCard bng-ui-scope="computer" class="card-content">
    <div class="main">
      <div class="btn-back-container">
        <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="close" accent="attention"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
      </div>

      <BngCardHeading class="computer-heading">My Computer</BngCardHeading>

      <div class="vehicle-info">
        <div class="currentVehicleSection">
          <h3>Vehicle in garage</h3>
          <div v-if="computerStore.computerData.vehicles && computerStore.computerData.vehicles.length">
            <div class="current-vehicle" style="display: flex">
              <BngButton
                class="btn-vehicle-select"
                v-if="showVehicleSelectorButtons"
                @click="switchActiveVehicle(-1)"
                v-bng-on-ui-nav:tab_l.asMouse
                :icon="icons.arrowLargeLeft"
                ><BngBinding ui-event="tab_l" deviceMask="xinput"
              /></BngButton>
              <h3>{{ computerStore.computerData.vehicles[computerStore.activeVehicleIndex].vehicleName }}</h3>
              <BngButton
                class="btn-vehicle-select"
                v-if="showVehicleSelectorButtons"
                @click="switchActiveVehicle(1)"
                v-bng-on-ui-nav:tab_r.asMouse
                :iconRight="icons.arrowLargeRight"
                ><BngBinding ui-event="tab_r" deviceMask="xinput"
              /></BngButton>
            </div>

            <div v-for="computerFunction in computerStore.vehicleSpecificComputerFunctions[computerStore.activeInventoryId]">
              <div class="buttonBox">
                <BngButton :disabled="computerFunction.disabled" @click="computerButtonCallback(computerFunction.id, computerStore.activeInventoryId)">{{
                  getLabel(computerFunction)
                }}</BngButton>
              </div>
            </div>
          </div>
          <div v-else>No vehicle in garage</div>
        </div>
      </div>

      <div v-for="computerFunction in computerStore.generalComputerFunctions">
        <div v-if="!computerFunction.type" class="buttonBox">
          <BngButton :disabled="computerFunction.disabled" @click="computerButtonCallback(computerFunction.id)">{{ getLabel(computerFunction) }}</BngButton>
        </div>
      </div>
    </div>
  </BngCard>

  <CareerStatus class="profileStatus" ref="careerStatusRef" />
</template>

<script setup>
import { lua } from "@/bridge"
import { useComputerStore } from "../stores/computerStore"
import { onMounted, onUnmounted, computed } from "vue"
import { BngButton, BngCard, BngCardHeading, BngBinding, icons } from "@/common/components/base"
import { default as UINavEvents, UI_EVENT_GROUPS } from "@/bridge/libs/UINavEvents"
import { vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import { CareerStatus } from "@/modules/career/components"

useUINavScope("computer")

const computerStore = useComputerStore()
const showVehicleSelectorButtons = computed(() => computerStore.computerData.vehicles && computerStore.computerData.vehicles.length > 1)

const computerButtonCallback = computerStore.computerButtonCallback
const switchActiveVehicle = computerStore.switchActiveVehicle

const getLabel = computerFunction => {
  let label = computerFunction.label
  if (computerFunction.disabled && computerFunction.disableReason) label += " (" + computerFunction.disableReason + ")"
  return label
}

const close = () => {
  lua.career_career.closeAllMenus()
}

const start = () => {
  UINavEvents.setFilteredEvents(UI_EVENT_GROUPS.focusMoveScalar)
  computerStore.requestComputerData()
}

const kill = () => {
  computerStore.onMenuClosed()
  UINavEvents.clearFilteredEvents()
  computerStore.$dispose()
}
onMounted(start)
onUnmounted(kill)
</script>

<style scoped lang="scss">
.vehicle-info {
  padding-left: 2em;
}
.btn-back-container {
  padding: 5px;
  text-align: left;
}

.computer-heading {
  text-align: left;
}

.btn-vehicle-select {
  flex: 0 0 auto;
  min-width: 0;
}

.current-vehicle {
  display: flex;
  & h3 {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.card-content {
  display: block;
  flex-flow: column;
  position: relative;
  overflow: hidden;
  width: 20%;
  height: 100%;
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0);
  }
}

.main {
  overflow: auto;
}

.currentVehicleSection {
  border: 1px solid rgb(196, 196, 196);
  width: 90%;
  & div {
    padding-bottom: 0.5em;
  }
}

.buttonBox {
  padding: 10px;
  white-space: pre-wrap;
}

.profileStatus {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  border-radius: var(--bng-corners-2);
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
