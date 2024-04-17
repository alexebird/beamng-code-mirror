<template>
  <div bng-ui-scope="vehicleInventory">
    <BngCard class="vehicleList">
      <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="close" accent="attention" style="align-self: flex-start">
        <BngBinding ui-event="back" deviceMask="xinput" />Back
      </BngButton>
      <BngCardHeading style="text-align: left" v-if="vehicleInventoryStore.vehicleInventoryData.header"> {{ vehicleInventoryStore.vehicleInventoryData.header }}</BngCardHeading>
      <br />
      <VehicleInventory ref="elInventory" />
    </BngCard>

    <CareerStatus class="profile-status" v-bng-blur />
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from "vue"
import { useVehicleInventoryStore } from "../stores/vehicleInventoryStore"
import { vBngBlur, vBngOnUiNav } from "@/common/directives"
import { BngButton, BngCard, BngCardHeading, BngBinding } from "@/common/components/base"
import { CareerStatus } from "@/modules/career/components"
import VehicleInventory from "../components/vehicleInventory/VehicleInventory.vue"
import { openConfirmation } from "@/services/popup"
import { $translate } from "@/services/translation"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("vehicleInventory")

const vehicleInventoryStore = useVehicleInventoryStore()

// display repair popup when required
watch(
  () => vehicleInventoryStore.vehIdToChooseAfterRepairPopup,
  (newId, oldId) => {
    !oldId && newId && confirmRepair()
  }
)

const confirmRepair = async vehicle => {
  const res = await openConfirmation("", "Do you want to repair your previous vehicle?", [
    { label: $translate.instant("ui.common.yes"), value: true },
    { label: $translate.instant("ui.common.no"), value: false },
  ])
  if (res) {
    vehicleInventoryStore.repairPopupAccept()
  } else {
    vehicleInventoryStore.repairPopupDecline()
  }
}

const elInventory = ref()

const close = () => elInventory.value.closeMenu()

const kill = () => {
  vehicleInventoryStore.$dispose()
}

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

.profile-status {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  --bg-opacity: 0.6;
  font-size: 1rem;
  font-family: Overpass, var(--fnt-defs);
  background-color: rgba(0, 0, 0, var(--bg-opacity));
  border-radius: var(--bng-corners-2);
}
</style>
