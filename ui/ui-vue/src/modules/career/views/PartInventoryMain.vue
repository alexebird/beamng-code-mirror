<template>
  <div bng-ui-scope="partInventory">
    <BngCard class="partListCard">
      <div class="innerList" bng-nav-scroll-force>
        <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="close" accent="attention"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
        <BngCardHeading> Part Inventory </BngCardHeading>
        <PartList @partSold="updateCareerStatus" />
      </div>
    </BngCard>
  </div>
  <CareerStatus class="profileStatus" ref="careerStatusRef" />
</template>

<script setup>
import { onBeforeMount, onUnmounted, ref, watch, markRaw } from "vue"
import { usePartInventoryStore } from "../stores/partInventoryStore"
import { vBngOnUiNav } from "@/common/directives"
import { BngButton, BngCard, BngCardHeading, BngBinding } from "@/common/components/base"
import { CareerStatus } from "@/modules/career/components"
import PartList from "../components/partInventory/PartList.vue"
import PartInventoryAddedParts from "../components/partInventory/PartInventoryAddedParts.vue"
import { openConfirmation } from "@/services/popup"
import { $translate } from "@/services/translation"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("partInventory")

const careerStatusRef = ref()

const partInventoryStore = usePartInventoryStore()

// display repair popup when required
watch(
  () => partInventoryStore.newPartsPopupOpen,
  (newVal, oldVal) => newVal && confirmRepair()
)

const confirmRepair = async vehicle => {
  const res = await openConfirmation("", { component: markRaw(PartInventoryAddedParts), props: { parts: partInventoryStore.newParts } }, [
    { label: $translate.instant("ui.common.okay"), value: true },
  ])
  closeNewPartsPopup()
}

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
</script>

<style scoped lang="scss">
.partListCard {
  width: 50%;
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

.profileStatus {
  border-radius: var(--bng-corners-2);
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
