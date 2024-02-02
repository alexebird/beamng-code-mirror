import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { lua } from "@/bridge"

export const useVehicleShoppingStore = defineStore("vehicleShopping", () => {
  // States
  const vehicleShoppingData = ref({})
  const filteredVehicles = computed(() => {
    const d = vehicleShoppingData.value
    if (d.currentSeller == null || d.currentSeller === undefined) {
      return d.vehiclesInShop
    } else {
      let filtered = Object.keys(d.vehiclesInShop).reduce(function (filtered, key) {
        if (d.vehiclesInShop[key].sellerId === d.currentSeller) filtered[key] = d.vehiclesInShop[key]
        return filtered
      }, {})
      return filtered
    }
  })

  // Actions
  const requestVehicleShoppingData = () => {
    lua.career_modules_vehicleShopping.getShoppingData().then(data => (vehicleShoppingData.value = data))
  }

  return {
    vehicleShoppingData,
    filteredVehicles,
    requestVehicleShoppingData,
  }
})
