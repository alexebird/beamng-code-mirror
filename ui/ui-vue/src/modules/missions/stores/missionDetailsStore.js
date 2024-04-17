import { computed, ref, watch, watchEffect, toRaw } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"

export const useMissionDetailsStore = defineStore("missionDetails", () => {
  const { events } = useBridge()

  const missions = ref([])
  const selectedMissionId = ref(null)
  const userSettingsModel = ref({})
  const repairOptions = ref(null)
  const startOptionModel = ref(null)
  const activeRewards = ref({})

  // TODO: Change this and rename into basic info
  const selectedMission = computed(() => {
    if (!missions.value || missions.value.length === 0) return null

    const missionIndex = missions.value.findIndex(x => x.id === selectedMissionId.value)

    if (missionIndex === -1) return null

    const data = missions.value[missionIndex]

    const ratings =
      data.currentProgressKey &&
      data.formattedProgress &&
      data.formattedProgress.formattedProgressByKey &&
      data.formattedProgress.formattedProgressByKey[data.currentProgressKey]
        ? data.formattedProgress.formattedProgressByKey[data.currentProgressKey].ownAggregate
        : null

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      missionTypeLabels: [data.missionTypeLabel],
      images: data.previews,
      ratings: ratings,
      startableDetails: {
        startable: data.unlocks.startable,
      },
      order: missionIndex,
    }
  })

  const currentMission = computed(() => {
    if (!missions.value || missions.value.length === 0) return null

    const missionIndex = missions.value.findIndex(x => x.id === selectedMissionId.value)

    if (missionIndex === -1) return null

    return missions.value[missionIndex]
  })

  const missionBasicInfo = computed(() => {
    if (!currentMission.value) return null

    return {
      id: currentMission.value.id,
      name: currentMission.value.name,
      description: currentMission.value.description,
      missionTypeLabels: [currentMission.value.missionTypeLabel],
      images: currentMission.value.previews,
    }
  })

  const missionProgress = computed(() => {
    if (
      !currentMission.value ||
      !currentMission.value.formattedProgress ||
      !currentMission.value.formattedProgress.unlockedStars ||
      !currentMission.value.formattedProgress.unlockedStars.stars
    )
      return null

    const stars = currentMission.value.formattedProgress.unlockedStars.stars

    if (!stars || stars.length === 0) return null

    let activeStars = []

    for (let star of stars) {
      let active = true

      if (activeRewards.value && activeRewards.value.activeStars) {
        active = activeRewards.value.activeStars[star.key]
      }

      activeStars.push({
        active,
        order: star.globalStarIndex,
        isDefaultStar: star.isDefaultStar,
        key: star.key,
        label: star.label,
        rewards: star.rewards,
        unlocked: star.unlocked,
      })
    }

    return {
      stars: activeStars,
      message: activeRewards.value.message,
      showMessage: activeStars.filter(x => !x.active).length > 0,
    }
  })

  const missionSettings = computed(() =>
    currentMission.value.userSettings && currentMission.value.userSettings.length > 0
      ? currentMission.value.userSettings.filter(x => !x.isVehicleSelector)
      : undefined
  )

  const missionStartableDetails = computed(() => {
    if (!currentMission.value || !currentMission.value.unlocks) return null

    const startable = currentMission.value.unlocks.startable

    if (!repairOptions.value && !startable) return null

    if (startOptionModel.value === "defaultStart") return { startable: currentMission.value.unlocks.startable }

    const needsRepair = repairOptions.value ? repairOptions.value.length > 0 : false
    const repairType = repairOptions.value ? repairOptions.value.find(x => x.type === startOptionModel.value) : null

    return {
      needsRepair,
      repairOptions: repairOptions.value,
      selectedRepairTypeLabel: repairType ? repairType.label : null,
      startable: !needsRepair || repairType.enabled,
      selectedRepairType: startOptionModel.value,
    }
  })

  const missionRatings = computed(() => {
    if (!currentMission.value) return null

    return currentMission.value.currentProgressKey &&
      currentMission.value.formattedProgress &&
      currentMission.value.formattedProgress.formattedProgressByKey &&
      currentMission.value.formattedProgress.formattedProgressByKey[data.currentProgressKey]
      ? data.formattedProgress.formattedProgressByKey[data.currentProgressKey].ownAggregate
      : null
  })

  const availableVehicles = computed(() => {
    const settings = currentMission.value.userSettings ? currentMission.value.userSettings.find(x => x.isVehicleSelector) : undefined

    if (!settings) return undefined

    return settings.values.map(x => ({
      label: x.l,
      value: x.v,
      meta: x.meta,
      settingsKey: settings.key,
      selected: userSettingsModel.value[settings.key] === x.v,
    }))
  })

  events.on("missionStartingOptionsForUserSettingsReady", data => {
    // console.log("missionStartingOptionsForUserSettingsReady", data)
    repairOptions.value = data.options && Array.isArray(data.options) && data.options.length > 0 ? data.options.filter(x => x.type) : null
    startOptionModel.value = repairOptions.value && repairOptions.value.length > 0 ? repairOptions.value[0].type : null
  })

  const stopSelectedMissionWatcher = watch(
    () => selectedMissionId.value,
    () => {
      if (!currentMission.value) return

      const updatedSettings = {}
      currentMission.value.userSettings.forEach(x => (updatedSettings[x.key] = x.value))
      userSettingsModel.value = updatedSettings
    }
  )

  const stopSettingsWatcher = watch(
    () => userSettingsModel.value,
    async () => {
      // Get Active Stars
      const settings = Object.keys(userSettingsModel.value).map(key => ({ key, value: userSettingsModel.value[key] }))
      const activeStars = await lua.extensions.gameplay_missions_missionScreen.getActiveStarsForUserSettings(selectedMissionId.value, settings)
      activeRewards.value = { ...activeRewards.value, ...activeStars }

      // Get Start/Repair Options
      lua.gameplay_markerInteraction.changeUserSettings(selectedMissionId.value, settings)
      lua.extensions.gameplay_missions_missionScreen.requestStartingOptionsForUserSettings(selectedMissionId.value, settings)
    },
    { deep: true }
  )

  const changeSettings = (key, value) => (userSettingsModel.value[key] = value)

  const changeRepairType = type => (startOptionModel.value = type)

  const selectMission = missionId => {
    selectedMissionId.value = missionId
    console.log("###", missionId, missions.value)
  }

  const selectPreviousMission = () => {
    const index = missions.value.findIndex(x => x.id === selectedMissionId.value)
    const previousIndex = index > 0 ? index - 1 : missions.value.length - 1
    selectMissionByIndex(previousIndex)
  }

  const selectNextMission = () => {
    const index = missions.value.findIndex(x => x.id === selectedMissionId.value)
    const nextIndex = index < missions.value.length - 1 ? index + 1 : 0
    selectMissionByIndex(nextIndex)
  }

  const startMission = () => {
    const settings = Object.keys(userSettingsModel.value).map(key => ({ key, value: userSettingsModel.value[key] }))
    const startingOptions = startOptionModel.value ? { repair: {type: startOptionModel.value}} : {}
    lua.extensions.gameplay_missions_missionScreen.startMissionById(selectedMissionId.value, settings, startingOptions)
  }

  const init = async () => {
    const data = await lua.extensions.gameplay_missions_missionScreen.getMissionScreenData()
    // console.log("mission details data", data)

    let preselectedMissionId = null

    if (Array.isArray(data)) {
      missions.value = data
    } else if (data.hasOwnProperty("missions")) {
      missions.value = data.missions
      preselectedMissionId = data.selectedMissionId
    }

    if (missions.value) selectedMissionId.value = preselectedMissionId ? preselectedMissionId : missions.value[0].id

    userSettingsModel.value = {}
  }

  function selectMissionByIndex(index) {
    if (index < 0 || index > missions.value.length - 1) {
      console.warn("Selected mission id not valid", index)
      return
    }

    selectedMissionId.value = missions.value[index].id
  }

  function dispose() {
    stopSelectedMissionWatcher()
    stopSettingsWatcher()
    events.off("missionStartingOptionsForUserSettingsReady")
  }

  return {
    missions,
    // availableMissions,
    selectedMission,
    missionBasicInfo,
    missionProgress,
    missionSettings,
    missionStartableDetails,
    missionRatings,
    availableVehicles,
    userSettingsModel,
    selectMission,
    selectPreviousMission,
    selectNextMission,
    startMission,
    changeSettings,
    changeRepairType,
    init,
    dispose,
  }
})
