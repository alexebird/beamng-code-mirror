import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"

export const useVehicleInventoryStore = defineStore("vehicleInventory", () => {
  const { events } = useBridge()

  // *** There seems to be something wrong below - data.currentVehicleId always seems to be undefined ***
  // ****************************************************************************************************

  // States
  let vehicleInventoryData = ref({})
  let vehIdToChooseAfterRepairPopup = ref(0)

  const filteredVehicles = computed(() => {
    const data = vehicleInventoryData.value
    if (!data.vehicles) return []
    Object.values(data.vehicles).forEach(vehicle => {
      if (data.currentVehicleId === vehicle.id) vehicle.niceName = vehicle.niceName + " (Current Vehicle)"
    })
    return Object.values(data.vehicles)
  })

  let menuOpen = false

  // Actions
  function requestInitialData() {
    lua.career_modules_inventory.sendDataToUi()
  }

  function closeMenu() {
    lua.career_modules_inventory.closeMenu()
  }

  function countDownVehicleDelays() {
    if (menuOpen) {
      for (let vehicle of filteredVehicles.value) {
        if (vehicle.timeToAccess) {
          vehicle.timeToAccess = vehicle.timeToAccess - 1
        }
      }
      setTimeout(countDownVehicleDelays, 1000)
    }
  }

  // Lua events
  events.on("vehicleInventoryData", data => {
    vehicleInventoryData.value = data
    vehIdToChooseAfterRepairPopup.value = 0
    if (!menuOpen) {
      menuOpen = true
      countDownVehicleDelays()
    }
  })

  function menuClosed() {
    menuOpen = false
  }

  function repairPopupAccept() {
    const data = vehicleInventoryData.value
    lua.career_modules_inventory.chooseVehicleFromMenu(vehIdToChooseAfterRepairPopup.value, 1, true)
    vehIdToChooseAfterRepairPopup.value = 0
  }

  function repairPopupDecline() {
    lua.career_modules_inventory.chooseVehicleFromMenu(vehIdToChooseAfterRepairPopup.value, 1, false)
    vehIdToChooseAfterRepairPopup.value = 0
  }

  function chooseVehicle(vehId, buttonIndex) {
    let showRepairPopup = false
    const data = vehicleInventoryData.value
    if (data.currentVehicleId !== undefined && vehId !== data.currentVehicleId) {
      showRepairPopup = vehicleInventoryData.value.vehicles[data.currentVehicleId].needsRepair
    }
    if (showRepairPopup) {
      vehIdToChooseAfterRepairPopup.value = vehId
      return
    }
    lua.career_modules_inventory.chooseVehicleFromMenu(vehId, buttonIndex + 1, false)
  }

  function dispose() {
    events.off("vehicleInventoryData")
  }

  return {
    filteredVehicles,
    vehIdToChooseAfterRepairPopup,
    vehicleInventoryData,
    requestInitialData,
    chooseVehicle,
    repairPopupAccept,
    repairPopupDecline,
    menuClosed,
    closeMenu,
    dispose,
  }
})
