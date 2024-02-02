<template>
  <LayoutSingle class="layout-content-full flex-column layout-paddings">
    <BngScreenHeading>Delivery Mode</BngScreenHeading>
    <div class="cargoLists" bng-ui-scope="cargoOverview">
      <BngCard v-if="facilityId" class="cargoCard facilityCargo" v-bng-blur>
        <CargoList
          :facility-id="facilityId"
          :parking-spot-path="parkingSpotPath"
          @hoveredCargo="hoveredFacilityCargo"
        />
      </BngCard>
      <BngCard class="cargoCard playerCargo" v-bng-blur>
        <CargoList
          ref="playerCargoRef"
          @hoveredCargo="hoveredPlayerCargo"
        />
      </BngCard>
      <div class="actions">
        <BngButton style="float: left;" v-bng-on-ui-nav:back,menu.asMouse @click="close" accent="secondary"><BngBinding ui-event="back" deviceMask="xinput" />Return to game</BngButton>
      </div>
    </div>
  </LayoutSingle>
</template>

<script setup>
  import { lua } from '@/bridge'
  import { useCargoOverviewStore } from '../stores/cargoOverviewStore'
  import { onMounted, onUnmounted, computed, ref } from "vue"
  import { BngButton, BngCard, BngCardHeading, BngScreenHeading, BngBinding } from '@/common/components/base'
  import { vBngOnUiNav, vBngBlur } from "@/common/directives"
  import { useUINavScope } from "@/services/uiNav"
  import CargoList from "../components/cargoOverview/CargoList.vue"
  import { LayoutSingle } from "@/common/layouts"
  useUINavScope('cargoOverview')

const props = defineProps({
  facilityId: String,
  parkingSpotPath: String,
})

const playerCargoRef = ref(null)

const cargoOverviewStore = useCargoOverviewStore()

const updateCargoDataAll = () => {
  cargoOverviewStore.requestCargoData(props.facilityId, props.parkingSpotPath)
}

const close = () => {
  lua.career_modules_delivery_deliveryManager.commitDeliveryConfiguration()
  lua.career_modules_delivery_deliveryManager.exitCargoOverviewScreen()
}

const exitMode = () => {
  lua.career_modules_delivery_deliveryManager.exitDeliveryMode()
  lua.career_modules_delivery_deliveryManager.exitCargoOverviewScreen()
}

const start = () => {
  updateCargoDataAll()
}

const hoveredFacilityCargo = cargo => {
  if (cargo) {
    if (cargo.remainingOfferTime > 0) {
      playerCargoRef.value.highlightEmptySlots(cargo.slots)
      lua.career_modules_delivery_deliveryManager.showCargoRoutePreview(cargo.id)
    }
  } else {
    playerCargoRef.value.highlightEmptySlots(0)
    lua.career_modules_delivery_deliveryManager.showCargoRoutePreview(undefined)
  }
}

const hoveredPlayerCargo = cargo => {
  if (cargo) {
    lua.career_modules_delivery_deliveryManager.showCargoRoutePreview(cargo.id)
  } else {
    lua.career_modules_delivery_deliveryManager.showCargoRoutePreview(undefined)
  }
}

const kill = () => {
  cargoOverviewStore.menuClosed()
  // cargoOverviewStore.$dispose()
}
onMounted(start)
onUnmounted(kill)
</script>

<style scoped lang="scss">
// .cargoOverview {
//   max-width: 80rem;

  :deep(.bng-card-wrapper > .card-cnt) {
    flex: 1 1 auto;
  }

  .facilityCargo {
    flex: 1 1 auto;
    margin-bottom: 1em;
    //position: fixed;
    //top: 0vh;
    //right: 1vw;
  }

  .playerCargo {
    flex: 1 1 60%;
    //padding-top: 1em;
    //position: fixed;
    //top: 0vh;
    //right: 1vw;
  }

  .cargoLists {
    // position: fixed;
    // height: auto;
    // //float: left;
    // top: 0vh;
    // left: 1vw;
    display: flex;
    align-self: flex-start;
    flex-flow: column;
    flex: 1 1 auto;
    max-width: 80em;
    // max-height: 60vh;
    & > *:not(:last-child) {
      margin-bottom: 0.75rem;
    }

    .cargoCard {
      color: white;
      background-color: rgba(63, 63, 63, 0.8);
    }
    .actions {
      flex: 0 0 auto;
    }
  }
// }
</style>
