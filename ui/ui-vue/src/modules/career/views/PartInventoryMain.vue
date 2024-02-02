<template>
  <div bng-ui-scope="partInventory">
    <BngCard class="partListCard">
      <div class="innerList">
        <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="close"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
        <BngCardHeading style="text-align: left"> Part Inventory </BngCardHeading>
        <PartList @partSold="updateCareerStatus" />
      </div>
      <CareerStatus class="status" ref="careerStatusRef" />
    </BngCard>

    <div v-if="partInventoryStore.newPartsPopupOpen">
      <div class="modalPopup">
        The following additional parts have been added to the vehicle from your inventory to fill the core slots:
        <table style="width: 100%">
          <tr>
            <th>id</th>
            <th>Description</th>
            <th>Location</th>
            <th>Mileage</th>
            <th>Part Value</th>
          </tr>
          <tr v-for="(part, key) in partInventoryStore.newParts" :key="key">
            <td>{{ part.id }}</td>
            <td>{{ part.description.description }}</td>
            <td>{{ getLocationName(part) }}</td>
            <td>{{ units.buildString("length", part.partCondition.odometer, 0) }}</td>
            <td>{{ units.beamBucks(part.finalValue) }}</td>
          </tr>
        </table>
        <BngButton @click="closeNewPartsPopup">OK</BngButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBridge } from "@/bridge"
import { onBeforeMount, onUnmounted, ref } from "vue"
import { usePartInventoryStore } from "../stores/partInventoryStore"
import { vBngOnUiNav } from "@/common/directives"
import { BngButton, BngCard, BngCardHeading, BngBinding } from "@/common/components/base"
import { CareerStatus } from "@/modules/career/components"
import PartList from "../components/partInventory/PartList.vue"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("partInventory")

const careerStatusRef = ref()

const { units } = useBridge()

const partInventoryStore = usePartInventoryStore()

const updateCareerStatus = () => {
  careerStatusRef.value.updateDisplay()
}

const start = () => {
  partInventoryStore.requestInitialData()
}

const kill = () => {
  partInventoryStore.partInventoryClosed()
  partInventoryStore.$dispose()
}

onBeforeMount(start)
onUnmounted(kill)

const close = () => {
  partInventoryStore.closeMenu()
}

const closeNewPartsPopup = () => {
  partInventoryStore.closeNewPartsPopup()
}

const getLocationName = part => {
  if (part.location == 0) {
    return "Inventory"
  } else {
    return "Vehicle No. " + part.location + " (" + part.vehicleModel + ")"
  }
}
</script>

<style scoped lang="scss">
.partListCard {
  width: 100%;
  overflow-y: hidden;
  height: 100vh;
  padding: 10px;
  color: white;
  background-color: rgba(0, 0, 0, 0.9);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.innerList {
  height: 95vh;
  overflow-y: scroll;
  padding: 20px;
}

.status {
  position: fixed;
  width: 10%;
  height: 10%;
  top: 10vh;
  right: 10vw;
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
</style>
