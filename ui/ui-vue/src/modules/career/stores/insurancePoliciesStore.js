import { ref } from "vue"
import { defineStore } from "pinia"
import { useBridge, lua } from "@/bridge"

export const useInsurancePoliciesStore = defineStore("insurancePolicies", () => {
  const { events } = useBridge()

  // States
  let policiesData = ref({})
  let careerMoney = ref(0)
  let careerBonusStars = ref(0)
  let policyHistory = ref({})

  // Actions

  function requestInitialData() {
    lua.career_modules_insurance.sendUIData()
  }

  // Lua events
  events.on("insurancePoliciesData", data => {
    data.policiesData.sort((a, b) => a.initialBuyPrice - b.initialBuyPrice)
    careerBonusStars.value = data.careerBonusStars
    policiesData.value = data.policiesData
    careerMoney.value = data.careerMoney
    policyHistory.value = data.policyHistory
  })

  const closeMenu = lua.career_modules_insurance.closeMenu

  const dispose = () => {
    events.off("insurancePoliciesData")
  }

  return {
    dispose,
    policiesData,
    requestInitialData,
    closeMenu,
    careerMoney,
    policyHistory,
    careerBonusStars,
  }
})
