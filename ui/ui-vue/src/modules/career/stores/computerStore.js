import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { lua } from "@/bridge"

export const useComputerStore = defineStore("computer", () => {
  // States
  const computerData = ref({})
  const activeVehicleIndex = ref(0)

  const activeInventoryId = computed(() => {
    if (computerData.value.vehicles) {
      return computerData.value.vehicles[activeVehicleIndex.value].inventoryId
    }
    return "0"
  })

  const generalComputerFunctions = computed(() => {
    if (!computerData.value.computerFunctions) return []
    let result = []
    result = Object.values(computerData.value.computerFunctions.general)
    result.sort((a, b) => (a.label < b.label ? -1 : 1))
    return result
  })

  const vehicleSpecificComputerFunctions = computed(() => {
    if (!computerData.value.computerFunctions) return {}
    let result = {}
    for (const [inventoryId, computerFunctions] of Object.entries(computerData.value.computerFunctions.vehicleSpecific)) {
      let sortedFunctions = Object.values(computerFunctions)
      sortedFunctions.sort((a, b) => (a.label < b.label ? -1 : 1))
      result[inventoryId] = sortedFunctions
    }
    return result
  })

  const setComputerData = data => {
    computerData.value = data
    if (computerData.value.vehicles && computerData.value.vehicles.length <= activeVehicleIndex.value) {
      activeVehicleIndex.value = 0
    }
  }

  // Actions
  const requestComputerData = () => {
    lua.career_modules_computer.getComputerUIData().then(setComputerData)
  }

  const computerButtonCallback = (computerFunctionId, inventoryId) => {
    lua.career_modules_computer.computerButtonCallback(computerFunctionId, inventoryId ? Number(inventoryId) : undefined)
  }

  const onMenuClosed = () => {
    lua.career_modules_computer.onMenuClosed()
  }

  const switchActiveVehicle = offset => {
    activeVehicleIndex.value = (activeVehicleIndex.value + offset + computerData.value.vehicles.length) % computerData.value.vehicles.length
  }

  return {
    activeVehicleIndex,
    activeInventoryId,
    computerData,
    generalComputerFunctions,
    vehicleSpecificComputerFunctions,
    requestComputerData,
    computerButtonCallback,
    switchActiveVehicle,
    onMenuClosed,
  }
})
