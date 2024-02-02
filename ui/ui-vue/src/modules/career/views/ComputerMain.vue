<template>
  <BngCard bng-ui-scope="computer" class="md-content">
    <div style="overflow: auto">
      <div style="padding: 5px; text-align: left">
        <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="close"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
      </div>

      <BngCardHeading style="text-align: left">My Computer</BngCardHeading>

      <div style="padding-left: 2em">
        <div class="currentVehicleSection">
          <h3>Vehicle in garage</h3>
          <div v-if="computerStore.computerData.vehicles && computerStore.computerData.vehicles.length > 0" style="padding-bottom: 0.5em" >
            <div style="display: flex;">
              <BngButton style="flex: 0 0 auto; min-width: 0;" @click="switchActiveVehicle(-1)" >{{ "<-" }}</BngButton>
              <h3 style="flex: 1 1 auto;  min-width: 0; height: 1em;">{{ computerStore.computerData.vehicles[computerStore.activeVehicleIndex].vehicleName }}</h3>
              <BngButton style="flex: 0 0 auto;  min-width: 0;" @click="switchActiveVehicle(1)" >{{ "->" }}</BngButton>
            </div>

            <div v-for="computerFunction in computerStore.vehicleSpecificComputerFunctions[computerStore.activeInventoryId]">
              <div class="buttonBox">
                <BngButton :disabled="computerFunction.disabled" @click="computerButtonCallback(computerFunction.id, computerStore.activeInventoryId)">{{ getLabel(computerFunction) }}</BngButton>
              </div>
            </div>
          </div>
          <div v-else>
            No vehicle in garage
          </div>
        </div>
      </div>

      <div v-for="computerFunction in computerStore.generalComputerFunctions">
        <div v-if="!computerFunction.type" class="buttonBox">
          <BngButton :disabled="computerFunction.disabled" @click="computerButtonCallback(computerFunction.id)">{{ getLabel(computerFunction) }}</BngButton>
        </div>
      </div>
    </div>
  </BngCard>
</template>

<script setup>
import { lua } from "@/bridge"
import { useComputerStore } from "../stores/computerStore"
import { onMounted, onUnmounted } from "vue"
import { BngButton, BngCard, BngCardHeading, BngBinding } from "@/common/components/base"
import { default as UINavEvents, UI_EVENT_GROUPS } from "@/bridge/libs/UINavEvents"
import { vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
useUINavScope("computer")

const computerStore = useComputerStore()

const computerButtonCallback = (computerFunctionId, inventoryId) => {
  computerStore.computerButtonCallback(computerFunctionId, inventoryId)
}

const switchActiveVehicle = (offset) => {
  computerStore.switchActiveVehicle(offset)
}

const getLabel = computerFunction => {
  let label = computerFunction.label
  if (computerFunction.disabled && computerFunction.disableReason) {
    label = label + " (" + computerFunction.disableReason + ")"
  }
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
.md-content {
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

.currentVehicleSection {
  border: 1px solid rgb(196, 196, 196);
  width: 90%;
}

.buttonBox {
  padding: 10px;
  white-space: pre-wrap;
}
</style>
