<template>
  <VehicleList />
</template>

<script setup>
import { lua } from "@/bridge"
import { onBeforeMount, onUnmounted } from "vue"
import { useVehicleInventoryStore } from "../../stores/vehicleInventoryStore"
import VehicleList from "./VehicleList.vue"

const vehicleInventoryStore = useVehicleInventoryStore()

defineExpose({
  closeMenu: vehicleInventoryStore.closeMenu,
})

onBeforeMount(() => {
  vehicleInventoryStore.requestInitialData()
})

onUnmounted(() => {
  lua.extensions.hook("onExitVehicleInventory")
  vehicleInventoryStore.menuClosed()
  vehicleInventoryStore.$dispose()
})
</script>
