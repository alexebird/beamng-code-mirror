import { defineStore } from "pinia"
import { ref, computed } from "vue"

import MainMenu from "@/modules/career/computer/components/MainMenu.vue"
import VehicleInventory from "@/modules/career/computer/components/VehicleInventory.vue"
import PartInventory from "@/modules/career/computer/components/PartInventory.vue"
import VehicleShop from "@/modules/career/computer/components/VehicleShop.vue"
import PartShop from "@/modules/career/computer/components/PartShop.vue"
import Tuning from "@/modules/career/computer/components/Tuning.vue"
import { useLibStore } from '@/services'


const mainMenuLayout = [
  {
    key: "main",
    label: "Main",
    items: [
      { label: "Purchase Vehicles", key: "vehicleShop" },
      { label: "My Vehicles", key: "vehicleInventory" },
      { label: "My Parts", key: "partInventory" },
    ],
  },
  {
    key: "vehicle",
    label: "Your Vehicle",
    items: [
      { label: "Purchase Parts", key: "partShop" },
      { label: "Tuning", key: "tuning" },
    ],
  },
]

const defaultScreen = "mainmenu"

export const useComputerStore = defineStore("computer", () => {
  // START Game Context
  // Required data
  // isTutorial - to be able to set which menu items are enabled/disabled
  // currentVehicle or vehicle in garage - for the vehicle items list label and to show/hide or enable/disable items
  //    - vehicle name, vehicle id, needs repair,
  // What are
  // computerId
  // END Game Context

  // START Current Vehicle
  const currentVehicle = ref(null)
  // END Current Vehicle

  // START Navigation
  const navigationHistory = ref([])

  const mainMenuItems = computed(() =>
    mainMenuLayout.map(x => {
      if (x.key !== "vehicle") return x

      return {
        ...x,
        label: `${x.label} (${currentVehicle.value ? currentVehicle.value.name : "No vehicle"})`,
        disabled: !currentVehicle.value,
      }
    })
  )

  const screenMap = computed(() => ({
    mainmenu: {
      component: MainMenu,
      params: {
        menuItems: mainMenuItems.value,
      },
    },
    vehicleInventory: {
      component: VehicleInventory,
    },
    vehicleShop: {
      component: VehicleShop,
    },
    partInventory: {
      component: PartInventory,
    },
    partShop: {
      component: PartShop,
    },
    tuning: {
      component: Tuning,
    },
  }))
  const currentScreen = computed(() => {
    if (navigationHistory.value.length === 0) return screenMap.value[defaultScreen]

    const screen = navigationHistory.value[navigationHistory.value.length - 1]
    return screenMap.value[screen]
  })
  const canNavigatePrevious = computed(() => navigationHistory.value.length > 0)

  const navigateToScreen = screenKey => navigationHistory.value.push(screenKey)
  const navigatePrevious = () => navigationHistory.value.pop()
  // END Navigation

  return {
    currentScreen,
    canNavigatePrevious,
    navigateToScreen,
    navigatePrevious,

    currentVehicle,
  }
})
