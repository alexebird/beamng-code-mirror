<template>
  <div bng-ui-scope="vehicleInventory">
    <BngCard class="vehicleList">
      <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="close" accent="attention" style="align-self: flex-start"
        ><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton
      >
      <BngCardHeading style="text-align: left"> {{ vehicleInventoryStore.vehicleInventoryData.header }}</BngCardHeading>
      <VehicleInventory
        ref="elInventory"
      />
    </BngCard>

    <BngCard class="profile-status" v-bng-blur>
      <CareerStatus />
    </BngCard>
  </div>

  <div v-if="vehicleInventoryStore.vehIdToChooseAfterRepairPopup">
    <div v-bng-blur class="blurBackground"></div>
    <div class="modalPopup">
      <h3>Do you want to repair your previous vehicle?</h3>
      <div style="height: 70%; flex-grow: 1; display: flex; align-items: center">
        <div style="flex-grow: 1"><BngButton @click="vehicleInventoryStore.repairPopupAccept()"> Yes </BngButton></div>
        <div style="flex-grow: 1"><BngButton @click="vehicleInventoryStore.repairPopupDecline()"> No </BngButton></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useVehicleInventoryStore } from "../stores/vehicleInventoryStore"
import { vBngBlur, vBngOnUiNav } from "@/common/directives"
import { BngButton, BngCard, BngCardHeading, BngBinding } from "@/common/components/base"
import { CareerStatus } from "@/modules/career/components"
import VehicleInventory from "../components/vehicleInventory/VehicleInventory.vue"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("vehicleInventory")

const vehicleInventoryStore = useVehicleInventoryStore()


const elInventory = ref()

const close = () => elInventory.value.closeMenu()

const start = () => {}
const kill = () => {
  vehicleInventoryStore.$dispose()
}
onMounted(start)
onUnmounted(kill)
</script>

<style scoped lang="scss">
.vehicleList {
  max-width: 50%;
  overflow-y: auto;
  padding: 10px;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0);
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
  background: #ffffffea;
  width: 30%;
  height: 30%;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  text-align: center;
}

.profile-status {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
}
</style>
