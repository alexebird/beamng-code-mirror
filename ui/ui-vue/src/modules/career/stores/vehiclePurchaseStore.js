import { ref } from "vue"
import { defineStore } from "pinia"
import { useBridge, lua } from "@/bridge"

export const useVehiclePurchaseStore = defineStore("vehiclePurchase", () => {
  const { events } = useBridge()

  const purchaseType = ref("")
  const vehicleInfo = ref({})
  const playerMoney = ref(0)
  const inventoryHasFreeSlot = ref(false)
  const tradeInVehicleInfo = ref({})
  const tradeInEnabled = ref(false)
  const forceTradeIn = ref(false)
  const locationSelectionEnabled = ref(false)
  const forceNoDelivery = ref(false)
  const ownsRequiredInsurance = ref(false)
  const makeDelivery = ref(false)
  const buyRequiredInsurance = ref(false)
  const prices = ref({})

  const handlePurchaseData = data => {
    vehicleInfo.value = data.vehicleInfo
    playerMoney.value = data.playerMoney
    inventoryHasFreeSlot.value = data.inventoryHasFreeSlot
    purchaseType.value = data.purchaseType
    tradeInEnabled.value = data.tradeInEnabled
    locationSelectionEnabled.value = data.locationSelectionEnabled
    forceNoDelivery.value = data.forceNoDelivery
    ownsRequiredInsurance.value = data.ownsRequiredInsurance
    prices.value = data.prices
    makeDelivery.value = false
    buyRequiredInsurance.value = false

    forceTradeIn.value = data.forceTradeIn

    if (data.tradeInVehicleInfo !== undefined) {
      tradeInVehicleInfo.value = data.tradeInVehicleInfo
    } else {
      tradeInVehicleInfo.value = {}
    }

    if (!ownsRequiredInsurance.value) {
      if (!buyRequiredInsurance.value) {
        makeDelivery.value = true
      }
    }
  }

  function toggleInsurancePurchase() {
    if (!buyRequiredInsurance.value) {
      makeDelivery.value = true
    }

    let value = vehicleInfo.value.requiredInsurance.initialBuyPrice
    if (!buyRequiredInsurance.value) {
      value = -value
    }
    prices.value.finalPrice += value
  }

  function requestPurchaseData() {
    lua.career_modules_vehicleShopping.sendPurchaseDataToUi()
  }

  function buyVehicle(makeDelivery) {
    lua.career_modules_vehicleShopping.buyFromPurchaseMenu(purchaseType.value, makeDelivery)
  }

  function chooseTradeInVehicle() {
    lua.career_modules_vehicleShopping.openInventoryMenuForTradeIn()
  }

  function removeTradeInVehicle() {
    lua.career_modules_vehicleShopping.removeTradeInVehicle()
  }

  function cancel() {
    lua.career_modules_vehicleShopping.cancelPurchase(purchaseType.value)
  }

  function dispose() {
    listen(false)
  }

  // Lua events
  const listen = state => {
    const method = state ? "on" : "off"
    events[method]("vehiclePurchaseData", handlePurchaseData)
  }
  listen(true)

  return {
    vehicleInfo,
    playerMoney,
    inventoryHasFreeSlot,
    tradeInVehicleInfo,
    tradeInEnabled,
    locationSelectionEnabled,
    forceTradeIn,
    forceNoDelivery,
    ownsRequiredInsurance,
    prices,
    makeDelivery,
    buyRequiredInsurance,
    buyVehicle,
    chooseTradeInVehicle,
    removeTradeInVehicle,
    requestPurchaseData,
    cancel,
    dispose,
    toggleInsurancePurchase
  }
})
