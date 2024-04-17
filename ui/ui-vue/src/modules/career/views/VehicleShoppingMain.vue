<template>
  <LayoutSingle class="layout-content-full layout-align-start layout-align-hstart layout-paddings flex-column">
    <!-- <div class="md-content" id="bng-vehicle-shopping" tabindex="0" @keypress="exit">-->
    <div class="heading-container">
      <BngScreenHeading>Car dealers</BngScreenHeading>
      <div class="profile-status" v-bng-blur>
        <CareerStatus />
        <div class="slots-available">Free Inventory Slots: {{ vehicleShoppingStore.vehicleShoppingData.numberOfFreeSlots }}</div>
      </div>
    </div>
    <VehicleList />
    <!--</div>-->
  </LayoutSingle>
</template>

<script setup>
import { onBeforeMount, onUnmounted } from "vue"
import { useVehicleShoppingStore } from "../stores/vehicleShoppingStore"
import { LayoutSingle } from "@/common/layouts"
import VehicleList from "../components/vehicleShopping/VehicleList.vue"
import { BngScreenHeading, BngCard } from "@/common/components/base"
import { CareerStatus } from "@/modules/career/components"
import { vBngBlur } from "@/common/directives"
import { lua } from "@/bridge"

const vehicleShoppingStore = useVehicleShoppingStore()

const start = () => {
  vehicleShoppingStore.requestVehicleShoppingData()
}

const kill = () => {
  lua.career_modules_vehicleShopping.onShoppingMenuClosed()
  vehicleShoppingStore.$dispose()
}

onBeforeMount(start)
onUnmounted(kill)
</script>

<style scoped lang="scss">
.heading-container {
  flex: 0 0 auto;

  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;

  box-sizing: border-box;
  align-self: stretch;
  padding: 0.5rem 0;

  & > :deep(.bng-screen-heading) {
    margin: 0;
    flex: 1 auto;
  }
}
.flex-column {
  display: flex;
  flex-flow: column nowrap;
}

#bng-vehicle-shopping {
  text-align: center;
  &:focus {
    outline: none !important;
    box-shadow: none !important;
    &::before {
      content: "" !important;
      border: none;
    }
  }
}
.profile-status {
  border-radius: var(--bng-corners-2);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  & .slots-available {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    padding: 0.25rem 0.5rem;
  }
}
</style>
