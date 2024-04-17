<template>
  <LayoutSingle bng-ui-scope="cargoOverview" class="layout-content-full flex-column layout-paddings cargoScreen">
    <BngScreenHeading>Delivery Mode</BngScreenHeading>
    <Tabs
      ref="sectionTabs"
      @change="tabChange"
      class="bng-tabs cargoTabs"
      v-bng-on-ui-nav:tab_l="sectionTabs && sectionTabs.goPrev"
      v-bng-on-ui-nav:tab_r="sectionTabs && sectionTabs.goNext"
      v-if="cargoOverviewStore.cargoData">
      <TabList v-bng-blur />

      <Tab
        :heading="TAB_HEADINGS.parcels"
        :active="false"
        :load-on-demand="true"
        v-bng-blur
        v-if="cargoOverviewStore.cargoData && cargoOverviewStore.cargoData.availableSystems.parcelDelivery">
        <div class="cargoLists">
          <BngCard v-if="facilityId" class="cargoCard facilityCargo">
            <!-- <DeliverySystemUnlockInfo v-if="progress" :info="progress" skillKey="parcelDelivery" /> -->
            <CargoList :facilityId="facilityId" :parkingSpotPath="parkingSpotPath" @cargoHovered="hoveredFacilityCargo" />
          </BngCard>
          <BngCard class="cargoCard playerCargo">
            <CargoList ref="playerCargoRef" @cargoHovered="hoveredPlayerCargo" />
          </BngCard>
        </div>
      </Tab>

      <Tab
        :heading="TAB_HEADINGS.vehicles"
        :active="true"
        :load-on-demand="true"
        v-bng-blur
        v-if="cargoOverviewStore.cargoData && cargoOverviewStore.cargoData.availableSystems.vehicleDelivery">
        <div ref="acceptedVehiclesTarget">
          <BngCard v-if="facilityId" class="cargoCard facilityCargo">
            <!-- <DeliverySystemUnlockInfo v-if="progress" :info="progress" skillKey="vehicleDelivery" /> -->
            <VehicleOfferList
              :sortedOffers="cargoOverviewStore.sortedVehicleOffers"
              offerType="Vehicle"
              :facilityId="facilityId"
              :parkingSpotPath="parkingSpotPath" />
          </BngCard>
        </div>
      </Tab>

      <Tab
        :heading="TAB_HEADINGS.trailers"
        :active="true"
        :load-on-demand="true"
        v-bng-blur
        v-if="cargoOverviewStore.cargoData && cargoOverviewStore.cargoData.availableSystems.trailerDelivery">
        <div ref="acceptedVehiclesTarget">
          <BngCard v-if="facilityId" class="cargoCard facilityCargo">
            <!-- <DeliverySystemUnlockInfo v-if="progress" :info="progress" skillKey="trailerDelivery" /> -->
            <VehicleOfferList
              :sortedOffers="cargoOverviewStore.sortedTrailerOffers"
              offerType="Trailer"
              :facilityId="facilityId"
              :parkingSpotPath="parkingSpotPath" />
          </BngCard>
        </div>
      </Tab>

      <!--This code should be deleted after is ported to the progress page-->

      <!-- <Tab :heading="TAB_HEADINGS.progress" :active="false" :load-on-demand="true" v-bng-blur>
        <BngCard v-if="progress" class="cargoCard facilityCargo page-stats-wrapper">
          <BngProgressBar
            class="main-stat-progress-bar"
            :headerLeft="$ctx_t(progress.branch.name)"
            :headerRight="$ctx_t(progress.branch.levelLabel)"
            :min="progress.branch.min"
            :value="progress.branch.value"
            :max="progress.branch.max" />
          <div v-for="skill in progress.skills">
            <DeliverySystemUnlockInfo v-if="progress" :info="progress" :skillKey="skill.id" />
          </div>
        </BngCard>
      </Tab> -->
    </Tabs>

    <Teleport v-if="acceptedVehiclesTarget" :to="acceptedVehiclesTarget">
      <BngCard class="cargoCard facilityCargoSlim">
        <VehicleOfferList
          :sortedOffers="cargoOverviewStore.sortedAcceptedOffers"
          offerType="Accepted"
          header="My Active Deliveries"
          :parkingSpotPath="parkingSpotPath" />
      </BngCard>
    </Teleport>

    <div class="actions">
      <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="close" accent="secondary">
        <BngBinding ui-event="back" deviceMask="xinput" />Return to game
      </BngButton>
    </div>
  </LayoutSingle>
</template>

<script>
const TAB_HEADINGS = {
  parcels: "Parcels",
  vehicles: "Vehicles",
  trailers: "Trailers",
  //progress: "Progress",
}
</script>

<script setup>
import { lua } from "@/bridge"
import { useCargoOverviewStore } from "../stores/cargoOverviewStore"
import { onMounted, onUnmounted, ref } from "vue"
import { BngButton, BngCard, BngScreenHeading, BngBinding, BngProgressBar } from "@/common/components/base"
import { Tabs, TabList, Tab } from "@/common/components/utility"
import { vBngOnUiNav, vBngBlur } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import CargoList from "../components/cargoOverview/CargoList.vue"
import VehicleOfferList from "../components/cargoOverview/VehicleOfferList.vue"
// import BranchUnlockInfo from "../components/branches/BranchUnlockInfo.vue"
import DeliverySystemUnlockInfo from "../components/branches/DeliverySystemUnlockInfo.vue"
import { LayoutSingle } from "@/common/layouts"

useUINavScope("cargoOverview")

const props = defineProps({
  facilityId: String,
  parkingSpotPath: String,
})

const playerCargoRef = ref(null)
const sectionTabs = ref()
const activeTabHeading = ref(TAB_HEADINGS.parcels)

const progress = ref()

const acceptedVehiclesTarget = ref()

const tabChange = tab => {
  activeTabHeading.value = tab.heading
  lua.career_modules_delivery_cargoScreen.setCargoScreenTab(tab.heading)
}
const cargoOverviewStore = useCargoOverviewStore()

const updateCargoDataAll = () => {
  cargoOverviewStore.requestCargoData(props.facilityId, props.parkingSpotPath)
}

const close = () => {
  lua.career_modules_delivery_cargoScreen.commitDeliveryConfiguration()
  lua.career_modules_delivery_cargoScreen.exitCargoOverviewScreen()
}

const exitMode = () => {
  lua.career_modules_delivery_cargoScreen.exitDeliveryMode()
  lua.career_modules_delivery_cargoScreen.exitCargoOverviewScreen()
}

const start = () => {
  updateCargoDataAll()
}

const hoveredFacilityCargo = cargo => {
  if (cargo) {
    if (cargo.remainingOfferTime > 0) {
      playerCargoRef.value.highlightEmptySlots(cargo.slots)
      lua.career_modules_delivery_cargoScreen.showCargoRoutePreview(cargo.id)
    }
  } else {
    playerCargoRef.value.highlightEmptySlots(0)
    lua.career_modules_delivery_cargoScreen.showCargoRoutePreview(undefined)
  }
}

const hoveredPlayerCargo = cargo => {
  if (cargo) {
    lua.career_modules_delivery_cargoScreen.showCargoRoutePreview(cargo.id)
  } else {
    lua.career_modules_delivery_cargoScreen.showCargoRoutePreview(undefined)
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
:deep(.bng-card-wrapper > .card-cnt) {
  flex: 1 1 auto;
}

.facilityCargo {
  flex: 1 1 auto;
  margin-bottom: 1em;
  min-height: 35vh;
}

.facilityCargoSlim {
  flex: 1 1 auto;
  margin-bottom: 1em;
  min-height: 15vh;
}

.playerCargo {
  flex: 1 1 60%;
}

.cargoScreen {
  max-width: 80em;
}

.cargoLists {
  display: flex;
  align-self: flex-start;
  flex-flow: column;
  flex: 1 1 auto;
  max-width: 80em;
  max-height: 70vh;
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

.cargoTabs > :deep(.tab-content) {
  height: 100%;
  overflow: hidden;
}

// progress
// .page-stats-wrapper > * {
//   width: 95%;
// }

.progressbar-fill {
  align-self: stretch;
  border-radius: var(--bng-corners-1);
  box-sizing: content-box;
  height: 0.8em;
}

.progressbar-background {
  align-self: stretch;
  border-radius: var(--bng-corners-1);
  height: 1.5em;
}

.main-stat-progress-bar {
  font-size: 1.5rem;
  padding: 0.5em 1em;
}
</style>
