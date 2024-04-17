// Store for Vehicle data

import { computed, inject, ref } from "vue"
import { defineStore } from "pinia"
import { lua } from "@/bridge"

const STORE_NAME = "vehicles"
let store

const OFFICIAL_CONFIG_SOURCE = "BeamNG - Official"

const makeStore = defineStore(STORE_NAME, () => {
  const $game = inject("$game")

  const currentVehicleData = ref(false)

  // Getters
  const currentData = computed(() => currentVehicleData.value)

  const currentName = computed(() => {
    let n,
      vData = currentVehicleData.value
    if (!vData) return ""
    if (vData.model && vData.model.Brand) {
      n = `${vData.model.Brand} ${vData.model.Name}`
    } else {
      n = vData.configs.Name
    }
    if (vData.configs.Configuration) {
      if (vData.configs.Source === OFFICIAL_CONFIG_SOURCE) {
        n += ` - ${vData.configs.Configuration}`
      } else {
        n += " - Custom"
      }
    }
    return n
  })

  function _getCurrentVehicleData() {
    return lua.core_vehicles.getCurrentVehicleDetails().then(data => (currentVehicleData.value = data))
  }

  function connect(state = true) {
    const method = state ? "on" : "off"
    $game.events[method]("VehicleChange", _getCurrentVehicleData)
  }

  function disconnect() {
    connect(false)
  }

  connect()
  _getCurrentVehicleData() // initial load of current vehicle

  return {
    getCurrentVehicleData: _getCurrentVehicleData,
    current: { data: currentData, name: currentName },
    connect,
    disconnect,
  }
})

// ** TODO ** - possible optimisation later - connect and disconnect on demand based on number of clients (see composables example - mounted, unmounted)?
const useStore = () => store || (store = makeStore())
export default useStore
