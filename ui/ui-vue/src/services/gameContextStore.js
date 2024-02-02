import { defineStore } from "pinia"
import { ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { openScreenOverlay } from "@/services/popup"

import ActivityStart from "@/modules/activitystart/views/ActivityStart"

export const useGameContextStore = defineStore("gameContext", () => {
  const { events } = useBridge()
  const activities = ref([])
  let activityScreen = null

  const startMission = missionId => {
    const mission = activities.value.find(x => x.id === missionId)

    if (!mission) console.error(`Mission not found ${missionId}. cannot start`)

    const settings = mission.settings,
      userSettings = mission && settings ? settings.reduce((a, b) => (a[b.key] = b.value), a) : {}
    lua.gameplay_markerInteraction.startMissionById(mission.id, userSettings)
  }

  const closeActivitiesPrompt = () => {
    // closeActivitiesPopup()
    lua.gameplay_markerInteraction.closeViewDetailPrompt(true)
  }

  const performActivityAction = activityActionIndex => lua.ui_missionInfo.performActivityAction(activityActionIndex)

  events.on("ActivityAcceptUpdate", onActivityAcceptUpdate)

  events.on("MenuOpenModule", closeActivitiesPopup)

  events.on("ChangeState", closeActivitiesPopup)

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

  function dispose() {
    events.off("ActivityAcceptUpdate", onActivityAcceptUpdate)
  }

  return {
    activities,
    startMission,
    performActivityAction,
    closeActivitiesPrompt,
    dispose,
  }
})
