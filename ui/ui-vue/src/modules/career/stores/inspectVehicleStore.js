import { ref } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"

export const useInspectVehicleStore = defineStore("inspectVehicle", () => {
  const { events } = useBridge()

  const spawnedVehicleInfo = ref({})
  const claimPrice = ref(0)
  const testDriveTimer = ref(-1)
  const needsRepair = ref(false)
  const isTutorial = ref(false)
  const testDriveActive = ref(false)
  const testDroveOnce = ref(false)

  function startTestDrive() {
    testDriveTimer.value = -1 // some test drive don't require a timer. if -1 then it won't show in the UI
    lua.career_modules_inspectVehicle.startTestDrive()
  }

  events.on("inspectVehicleData", data => {
    spawnedVehicleInfo.value = data.spawnedVehicleInfo
    claimPrice.value = data.claimPrice
    needsRepair.value = data.needsRepair
    isTutorial.value = data.isTutorial
    testDroveOnce.value = data.didTestDrive
    testDriveActive.value = false
  })

  events.on("updateTestDriveTimer", data => {
    testDriveTimer.value = data
  })

  events.on("testDriveActive", data => {
    testDriveActive.value = data
  })

  function dispose() {
    events.off("inspectVehicleData")
    events.off("updateTestDriveTimer")
    events.off("testDriveActive")
  }

  return {
    spawnedVehicleInfo,
    testDriveTimer,
    startTestDrive,
    needsRepair,
    isTutorial,
    testDriveActive,
    testDroveOnce,
    dispose,
    claimPrice,
  }
})
