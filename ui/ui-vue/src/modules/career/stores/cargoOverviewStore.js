import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"
import { openConfirmation } from "@/services/popup"

const COUNTDOWN_INTERVAL = 1000

// custom 'forEach' to check if it's an array first - some empty data from Lua seems to come back as an empty object rather than []
const _forEach = (arr, func) => arr.length && arr.forEach(func)

export const useCargoOverviewStore = defineStore("cargoOverview", () => {
  const { events } = useBridge()

  // States
  const cargoData = ref()
  const dropDownData = ref({})
  const newCargoAvailable = ref(false)
  const cargoHighlighted = ref(false)

  let facilityId
  let parkingSpotPath
  let countdownRunning
  let queueCountdownStop

  function countDownCargoTimes() {
    if (queueCountdownStop) return countdownRunning = false

    countdownRunning = true
    _forEach(cargoData.value.player.vehicles, vehicleData => {
      _forEach(vehicleData.containers, containerData => {
        _forEach(containerData.cargo, cargoElement => {
          cargoElement.remainingOfferTime -= 1
          // countdown for modifiers
          if (cargoElement.modifiers) _forEach(cargoElement.modifiers, modifier => {
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
      _forEach(cargoData.value.facility.outgoingCargo, cargoElement => {
        processCargoElementTime(cargoElement)
        if (cargoElement.remainingOfferTime <= 0) {
          dropDownData.value[cargoElement.ids[cargoElement.ids.length - 1]].items = []
        }
      })

      _forEach(cargoData.value.facility.vehicleOffers, cargoElement => {
        processCargoElementTime(cargoElement)
      })

      _forEach(cargoData.value.facility.trailerOffers, cargoElement => {
        processCargoElementTime(cargoElement)
      })
    }

    setTimeout(countDownCargoTimes, COUNTDOWN_INTERVAL)
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

  function sortByRemainingOfferTime(data) {
    let result = Object.values(data)
    result.sort(({remainingOfferTime: a}, {remainingOfferTime: b}) => {
      if (a < 0 && b >= 0) {
        return 1 // Move items with negative remainingOfferTime to the end
      } else if (a >= 0 && b < 0) {
        return -1 // Move items with non-negative remainingOfferTime to the front
      } else {
        return a - b
      }
    })
    return result
  }

  const sortedOutgoingCargoFacility = computed(() => {
    if (!cargoData.value || !cargoData.value.facility) return []
    return sortByRemainingOfferTime(cargoData.value.facility.outgoingCargo)
  })

  const sortedVehicleOffers = computed(() => {
    if (!cargoData.value || !cargoData.value.facility) return []
    return sortByRemainingOfferTime(cargoData.value.facility.vehicleOffers)
  })

  const sortedTrailerOffers = computed(() => {
    if (!cargoData.value || !cargoData.value.facility) return []
    return sortByRemainingOfferTime(cargoData.value.facility.trailerOffers)
  })

  const sortedAcceptedOffers = computed(() => {
    if (!cargoData.value) return []
    return sortByRemainingOfferTime(cargoData.value.player.acceptedOffers)
  })

  const killWatchers = () => Object.values(dropDownData.value).forEach(data => data.watchStopHandle())

  const menuClosed = () => {
    killWatchers()
    queueCountdownStop = true
    cargoData.value = undefined
    dropDownData.value = {}
    lua.career_modules_delivery_cargoScreen.showCargoRoutePreview(undefined)
  }

  // Actions
  const requestCargoData = (_facilityId, _parkingSpotPath, updateMaxTimeStamp) => {
    killWatchers()
    facilityId = _facilityId
    parkingSpotPath = _parkingSpotPath
    lua.career_modules_delivery_cargoScreen.requestCargoDataForUi(facilityId, parkingSpotPath, updateMaxTimeStamp)
    if (updateMaxTimeStamp != false) newCargoAvailable.value = false
  }


  const moveCargoToLocation = (cargoId, targetLocation) => {
    lua.career_modules_delivery_cargoScreen.moveCargoFromUi(cargoId, targetLocation)
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
    _forEach(cargoList, cargoElement => {
      if (cargoElement.ids.length) {
        let cargoId = cargoElement.ids[cargoElement.ids.length - 1]
        let dropDownDate = {}

        dropDownDate.items = []
        let disableDropdown = true
        _forEach(cargoElement.targetLocations, targetLocationInfo => {
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

    _forEach(cargoData.value.player.vehicles, vehicleData => {
      _forEach(vehicleData.containers, containerData => {
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
    if (!countdownRunning) countDownCargoTimes()
  }

  const highlightCargoIds = highlightedIdMap => {
    cargoHighlighted.value = Object.keys(highlightedIdMap).length > 0

    if (cargoData.value && cargoData.value.facility) {
      _forEach(cargoData.value.facility.outgoingCargo, cargo => {
        cargo.highlight = highlightedIdMap[cargo.id]
      })
      _forEach(cargoData.value.facility.vehicleOffers, offer => {
        offer.highlight = highlightedIdMap[offer.id]
      })
      _forEach(cargoData.value.facility.trailerOffers, offer => {
        offer.highlight = highlightedIdMap[offer.id]
      })
    }

    if (cargoData.value && cargoData.value.player && cargoData.value.player.vehicles) {
      _forEach(cargoData.value.player.vehicles, vehicleData => {
        _forEach(vehicleData.containers, containerData => {
          _forEach(containerData.cargo, cargo => {
            cargo.highlight = highlightedIdMap[cargo.id]
          })
        })
      })
    }

  }



  const setAutomaticRoute = () => {
    lua.career_modules_delivery_cargoScreen.setBestRoute()
  }

  const dispose = () => {
    events.off("cargoDataForUiReady")
    events.off("newCargoAvailable")
    events.off("sendHighlightedCargoIds")
  }

  events.on("cargoDataForUiReady", setCargoData)
  events.on("newCargoAvailable", () => newCargoAvailable.value = true)
  events.on("sendHighlightedCargoIds", highlightCargoIds)

  return {
    cargoData,
    sortedOutgoingCargoFacility,
    sortedVehicleOffers,
    sortedTrailerOffers,
    sortedAcceptedOffers,
    dropDownData,
    newCargoAvailable,
    cargoHighlighted,
    requestCargoData,
    requestMoveCargoToLocation,
    menuClosed,
    dispose,
    setAutomaticRoute
  }
})
