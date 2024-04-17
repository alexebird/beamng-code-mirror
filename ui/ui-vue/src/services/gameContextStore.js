import { defineStore } from "pinia"
import { ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { openScreenOverlay, addPopup } from "@/services/popup"

import ActivityStart from "@/modules/activitystart/views/ActivityStart"
import Recovery from "@/modules/recovery/views/Recovery"

export const useGameContextStore = defineStore("gameContext", () => {
  const { events } = useBridge()

  const activities = ref([])
  let activityScreen = null
  let recoveryPrompt = null
  let deliveryEndScreen = null

  const startMission = missionId => {
    const mission = activities.value.find(x => x.id === missionId)

    if (!mission) console.error(`Mission not found ${missionId}. cannot start`)

    const settings = mission.settings,
      userSettings = mission && settings ? settings.reduce((a, b) => (a[b.key] = b.value), a) : {}
    lua.gameplay_markerInteraction.startMissionById(mission.id, userSettings)
  }

  const closeActivitiesPrompt = () => {
    lua.gameplay_markerInteraction.closeViewDetailPrompt(true)
  }

  async function openRecoveryPrompt() {
    recoveryPrompt = addPopup(Recovery).promise
  }

  const performActivityAction = activityActionIndex => lua.ui_missionInfo.performActivityAction(activityActionIndex)

  events.on("ActivityAcceptUpdate", onActivityAcceptUpdate)

  events.on("MenuOpenModule", closeActivitiesPopup)

  events.on("ChangeState", closeActivitiesPopup)

  events.on("OpenRecoveryPrompt", openRecoveryPrompt)

  const deliveryRewardData = ref(false)
  function showDeliveryEndScreen(data) {
    deliveryRewardData.value = data
    window.bngVue.gotoGameState("cargoDeliveryReward")
  }
  events.on("OpenDeliveryEndScreen", showDeliveryEndScreen)

  async function onActivityAcceptUpdate(data) {
    if (activityScreen && (activities.value || !data)) closeActivitiesPopup()

    if (window.location.hash !== "#/play") return

    activities.value = data

    if (activities.value && activities.value.length > 0) {
      activityScreen = openScreenOverlay(ActivityStart)
    }
  }

  function closeActivitiesPopup() {
    if (!activityScreen) return

    activityScreen.close(true)
    activityScreen = null
  }

  function closeRecoveryPrompt() {
    if (!recoveryPrompt) return

    recoveryPrompt.close(true)
    recoveryPrompt = null
  }

  function closeDeliveryEndScreen() {
    if (!deliveryEndScreen) return

    deliveryEndScreen.close(true)
    deliveryEndScreen = null
  }

  function dispose() {
    events.off("ActivityAcceptUpdate", onActivityAcceptUpdate)
  }

  return {
    activities,
    closeActivitiesPrompt,
    closeDeliveryEndScreen,
    closeRecoveryPrompt,
    deliveryRewardData,
    dispose,
    performActivityAction,
    startMission,
  }
})
