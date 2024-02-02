import { defineStore } from "pinia"
import { ref } from "vue"
import { useBridge } from "@/bridge"

export const useVehicleInventoryStore = defineStore("vehicleInventory", () => {
  const { events } = useBridge()

  const vehicles = ref([])

  events.on("vehicleInventoryData", data => {
    console.log("vehicleInventoryData", data)
    vehicles.value = data
  })

  return {
    vehicles,
  }
})
