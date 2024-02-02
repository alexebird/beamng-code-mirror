import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"
import { openConfirmation } from "@/services/popup"

const COUNTDOWN_INTERVAL = 1000

export const useCargoOverviewStore = defineStore("cargoOverview", () => {
  const { events } = useBridge()

  // States
  const cargoData = ref()
  const dropDownData = ref({})
  const newCargoAvailable = ref(false)

  let facilityId
  let parkingSpotPath
  let countdownRunning
  let queueCountdownStop

  function countDownCargoTimes() {
    if (!queueCountdownStop) {
      countdownRunning = true
      cargoData.value.player.vehicles.length && cargoData.value.player.vehicles.forEach(vehicleData => {
        vehicleData.containers.length && vehicleData.containers.forEach(containerData => {
          containerData.cargo.length && containerData.cargo.forEach(cargoElement => {
            cargoElement.remainingOfferTime -= 1

            // countdown for modifiers
            if (cargoElement.modifiers) cargoElement.modifiers.length && cargoElement.modifiers.forEach(modifier => {
              if (modifier.type == "timed" && modifier.data.active) {
                if (modifier.data.remainingDeliveryTime > 0) {
                  modifier.data.remainingDeliveryTime = modifier.data.remainingDeliveryTime > 1 ? modifier.data.remainingDeliveryTime - 1 : 0
                } else if (modifier.data.remainingPaddingTime > 0) {
                  modifier.data.remainingPaddingTime = modifier.data.remainingPaddingTime > 1 ? modifier.data.remainingPaddingTime - 1 : 0
                }
              }
            })

          })
        })
      })

      if (cargoData.value && cargoData.value.facility) {

        cargoData.value.facility.outgoingCargo.length && cargoData.value.facility.outgoingCargo.forEach(cargoElement => {
          processCargoElementTime(cargoElement)
          if (cargoElement.remainingOfferTime <= 0) {
            dropDownData.value[cargoElement.ids[cargoElement.ids.length - 1]].items = []
          }
        })  

        cargoData.value.facility.incomingCargo.length && cargoData.value.facility.incomingCargo.forEach(cargoElement => {
          processCargoElementTime(cargoElement)
        })

      }

      setTimeout(countDownCargoTimes, COUNTDOWN_INTERVAL)
    } else {
      countdownRunning = false
    }
  }

  const processCargoElementTime = el => {
    el.remainingOfferTime -= 1
    if (el.showNewTimer != undefined) {
      el.showNewTimer -= 1
      if (el.showNewTimer <= 0) {
        el.showNewTimer = undefined
      }
    }
  }

  const sortedOutgoingCargoFacility = computed(() => {
    if (!cargoData.value.facility) return []

    let result = Object.values(cargoData.value.facility.outgoingCargo)

    result.sort((a, b) => {
      if (a.remainingOfferTime < 0 && b.remainingOfferTime >= 0) {
        return 1 // Move items with negative remainingOfferTime to the end
      } else if (a.remainingOfferTime >= 0 && b.remainingOfferTime < 0) {
        return -1 // Move items with non-negative remainingOfferTime to the front
      } else {
        return a.remainingOfferTime - b.remainingOfferTime
      }
    })

    return result
  })


  const sortedIncomingCargoFacility = computed(() => {
    if (!cargoData.value.facility) return []
    let result = Object.values(cargoData.value.facility.incomingCargo)
    result.sort((a, b) => a.distance - b.distance)
    return result
  })

  const killWatchers = () => Object.values(dropDownData.value).forEach(data => data.watchStopHandle())

  const menuClosed = () => {
    killWatchers()
    queueCountdownStop = true
    cargoData.value = undefined
    dropDownData.value = {}
    lua.career_modules_delivery_deliveryManager.showCargoRoutePreview(undefined)
  }

  // Actions
  const requestCargoData = (_facilityId, _parkingSpotPath, updateMaxTimeStamp) => {
    killWatchers()
    facilityId = _facilityId
    parkingSpotPath = _parkingSpotPath
    lua.career_modules_delivery_deliveryManager.requestCargoDataForUi(facilityId, parkingSpotPath, updateMaxTimeStamp)
    if (updateMaxTimeStamp != false) newCargoAvailable.value = false
  }


  const moveCargoToLocation = (cargoId, targetLocation) => {
    lua.career_modules_delivery_deliveryManager.moveCargoFromUi(cargoId, targetLocation)
    requestCargoData(facilityId, parkingSpotPath, false)
  }

  const requestMoveCargoToLocation = (cargoId, moveData) => {
    if (moveData.extraData) {
      openThrowAwayPopup(cargoId, moveData.location, "Throw this cargo away with a " + moveData.extraData.penalty.toFixed(2) + " penalty?")
    } else {
      moveCargoToLocation(cargoId, moveData.location)
    }
  }

  async function openThrowAwayPopup(cargoId, targetLocation, message) {
    const res = await openConfirmation(null, message)
    if (res) {
      moveCargoToLocation(cargoId, targetLocation)
    } else {
      // the value of the dropdown needs to be reset here and we do it in the lazy way by resetting all the cargo data
      setCargoData()
    }
  }

  const createDropDownDataForCargo = cargoList => {
    cargoList.length && cargoList.forEach(cargoElement => {
      if (cargoElement.ids.length) {
        let cargoId = cargoElement.ids[cargoElement.ids.length - 1]
        let dropDownDate = {}

        dropDownDate.items = []
        let disableDropdown = true
        cargoElement.targetLocations.length && cargoElement.targetLocations.forEach(targetLocationInfo => {
          if (targetLocationInfo.enabled) {
            dropDownDate.items.push({ label: targetLocationInfo.label, value: targetLocationInfo })
            disableDropdown = false
          }
        })

        dropDownDate.dropDownValue = ref({ label: "AAAAAAAAAAAAA" })
        dropDownDate.watchStopHandle = watch(
          () => dropDownDate.dropDownValue.value,
          (item, prev) => requestMoveCargoToLocation(cargoId, item)
        )

        if (disableDropdown) dropDownDate.disabled = true
        dropDownData.value[cargoId] = dropDownDate
      }
    })
  }

  const setCargoData = data => {
    if (data) cargoData.value = data

    dropDownData.value = {}
    if (!cargoData.value.player) return
    if (!cargoData.value.player.vehicles) return

    cargoData.value.player.vehicles.length && cargoData.value.player.vehicles.forEach(vehicleData => {
      vehicleData.containers.length && vehicleData.containers.forEach(containerData => {
        if (containerData.cargo.length > 0) {
          containerData.cargo.sort((a, b) => a.distance - b.distance)
          createDropDownDataForCargo(containerData.cargo)
        }
      })
    })

    if (cargoData.value.facility) {
      // Create the item and value table for the outgoing cargo dropdown menues
      createDropDownDataForCargo(cargoData.value.facility.outgoingCargo)
    }

    queueCountdownStop = false
    if (!countdownRunning) {
      countDownCargoTimes()
    }
  }

  const dispose = () => {
    events.off("cargoDataForUiReady")
    events.off("newCargoAvailable")
  }

  events.on("cargoDataForUiReady", setCargoData)

  events.on("newCargoAvailable", data => {
    newCargoAvailable.value = true
  })

  return {
    cargoData,
    sortedOutgoingCargoFacility,
    sortedIncomingCargoFacility,
    dropDownData,
    newCargoAvailable,
    requestCargoData,
    requestMoveCargoToLocation,
    menuClosed,
    dispose,
  }
})
