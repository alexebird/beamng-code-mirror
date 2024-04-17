import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { lua } from "@/bridge"

export const useVehicleShoppingStore = defineStore("vehicleShopping", () => {
  // States
  const vehicleShoppingData = ref({})
  const filteredVehicles = computed(() => {
    const d = vehicleShoppingData.value
    if (!d.vehiclesInShop) return []

    let filteredList = Object.keys(d.vehiclesInShop).reduce(function (result, key) {
      if (d.currentSeller) {
        if (d.vehiclesInShop[key].sellerId === d.currentSeller) result.push(d.vehiclesInShop[key])
      } else {
        result.push(d.vehiclesInShop[key])
      }

      return result
    }, [])

    if (filteredList.length) filteredList.sort((a, b) => a.Value - b.Value)

    return filteredList
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
