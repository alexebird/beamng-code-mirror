import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"
import { ActionModes } from "../actionsConfiguration"
import { LayerType } from "../enums/layerType"

import { lua, useBridge } from "@/bridge"

const API = lua.extensions.ui_dynamicDecals

export default defineStore("decals", () => {
  const { events } = useBridge()

  /** Start Editor Setup */
  const resources = ref(null)
  const textureResources = computed(() => {
    if (!resources.value || !resources.value.decalTextures) return []

    const decalTextures = resources.value.decalTextures
    const categories = {}
    for (let category of Object.keys(decalTextures)) {
      if (typeof decalTextures[category] === "object") {
        categories[category] = {
          category: category,
          items: decalTextures[category].textures.map((x, index) => ({
            id: index + 1,
            name: x.name,
            externalSrc: x.location,
            value: x.location,
          })),
        }
      }
    }

    return categories
  })
  const textureCategories = computed(() => (textureResources.value ? Object.keys(textureResources.value) : []))

  const currentDecalSettings = computed(() => (resources.value ? resources.value.decalSettings : {}))
  const currentFillSettings = computed(() => (resources.value ? resources.value.fillSettings : {}))
  /** End Editor Setup */

  const layersData = ref({})
  const selectedLayer = ref(null)
  const highlightedLayer = ref(null)
  const currentAction = ref(null)
  const configuredLayer = ref(null)
  const history = ref(null)

  const selectedLayerId = computed(() => (selectedLayer.value ? selectedLayer.value.uid : null))

  const contextActions = computed(() => {
    if (!selectedLayer.value) {
      return ActionModes.newLayer
    }

    let actionMode

    if (selectedLayer.value.type === LayerType.decal) {
      actionMode = ActionModes.decalLayer
    }

    if (selectedLayer.value.type === LayerType.fill) {
      actionMode = ActionModes.fillLayer
    }

    if (selectedLayer.value.type === LayerType.group) {
      actionMode = ActionModes.groupLayer
    }

    let actions = actionMode.actions

    if (selectedLayer.value.enabled === true) {
      actions = actions.filter(x => x.value !== "show")
    } else {
      actions = actions.filter(x => x.value !== "hide")
    }

    return { ...actionMode, actions }
  })

  const init = () => {
    API.requestUpdatedData()
    // startEditorUpdates()
  }

  const updateConfiguredLayer = newValue => {
    configuredLayer.value = newValue
  }

  const invokeContextAction = async action => {
    currentAction.value = action

    switch (action) {
      case "decal":
        // API.toggleApplyingDecal(true)
        updateConfiguredLayer({
          color: currentDecalSettings.value.color,
          decalColorTexturePath: currentDecalSettings.value.texture,
          decalScale: currentDecalSettings.value.scale,
          decalScaleLock: false,
          decalRotation: currentDecalSettings.value.rotation,
          decalSkew: currentDecalSettings.value.skew,
          type: LayerType.decal,
          applyMultiple: currentDecalSettings.value.applyMultiple,
          resetOnApply: currentDecalSettings.value.resetOnApply,
        })
        createConfiguredLayerWatchers()
        API.toggleStampActionMap(true)
        break
      case "fill":
        updateConfiguredLayer({
          colorPaletteMapId: currentFillSettings.value.colorPaletteMapId,
          colorPalettes: currentFillSettings.value.colorPaletteMapValues,
          type: LayerType.fill,
        })
        break
      case "group":
        updateConfiguredLayer({
          name: null,
          type: LayerType.group,
        })
        break
      case "highlight":
        toggleHighlighting()
        break
      case "hide":
      case "show":
        toggleVisibility()
        break
      case "move_up":
        moveLayer(1)
        break
      case "move_down":
        moveLayer(-1)
        break
      case "delete":
        deleteLayer()
        break
      case "edit":
        editLayer()
        break
    }
  }

  const cancelContextAction = () => {
    // API.toggleApplyingDecal(false)
    disposeConfiguredLayerWatchers()
    currentAction.value = null
    configuredLayer.value = null
    API.toggleStampActionMap(false)
  }

  const createOrUpdateLayer = () => {
    if (configuredLayer.value.uid) {
      API.updateLayer(configuredLayer.value)
    } else {
      API.createLayer(configuredLayer.value)
    }
    updateConfiguredLayer(null)
  }

  const editLayer = () => {
    const layer = {
      uid: selectedLayer.value.uid,
      name: selectedLayer.value.name,
      type: selectedLayer.value.type,
    }

    switch (selectedLayer.value.type) {
      case LayerType.decal:
        layer.color = selectedLayer.value.color
        layer.decalRotation = selectedLayer.value.decalRotation
        layer.decalScale = selectedLayer.value.decalScale
        layer.decalSkew = selectedLayer.value.decalSkew
        layer.decalColorTexturePath = selectedLayer.value.decalColorTexturePath
        break
      case LayerType.fill:
        layer.color = selectedLayer.value.color
        layer.colorPaletteMapId = selectedLayer.value.colorPaletteMapId
        layer.colorPalettes = currentFillSettings.value.colorPaletteMapValues
        break
    }

    updateConfiguredLayer(layer)
    createConfiguredLayerWatchers()
  }

  const toggleHighlighting = () => {
    API.toggleLayerHighlight(selectedLayer.value.uid)
  }

  const toggleVisibility = () => {
    API.toggleLayerVisibility(selectedLayer.value.uid)
  }

  const moveLayer = steps => {
    const order = selectedLayer.value.order + steps
    API.moveSelectedLayer(order)
  }

  const selectLayer = layerUid => {
    API.selectLayer(layerUid)
  }

  const deleteLayer = () => {
    API.deleteSelectedLayer()
  }

  const changeCameraView = view => {
    lua.extensions.gameplay_garageMode.setCamera(view)
  }

  const toggleApplyingDecal = enable => API.toggleApplyingDecal(enable)

  const undo = () => API.undo()

  const redo = () => API.redo()

  const exportSkin = skinName => {
    API.exportSkin(skinName)
  }

  events.on("DynamicDecalsDataUpdated", data => {
    if (!data || !data.layers || data.layers.length === 0) {
      layersData.value = {}
      return
    }

    const layers = data.layers.length > 0 ? data.layers.map(x => ({ ...x, hidden: false })) : []
    layersData.value = { uid: "", children: layers, hidden: false }

    history.value = data.history

    if (configuredLayer.value && configuredLayer.value.type === LayerType.decal && currentAction.value === "decal" && !configuredLayer.value.applyMultiple) {
      disposeConfiguredLayerWatchers()
      configuredLayer.value = null
    }
  })

  events.on("DynamicDecalsLayerSelected", data => {
    // console.log("DynamicDecalsLayerSelected", data)
    selectedLayer.value = data ? data : null
  })

  events.on("DynamicDecalsHighlightedLayerChanged", data => {
    if (data && data.uid && data.highlighted) highlightedLayer.value = data.uid

    highlightedLayer.value = null
  })

  events.on("DynamicDecalsLayerVisibilityUpdated", data => {
    // console.log("DynamicDecalsLayerVisibilityUpdated", data)
    if (!data || !data.uid) return

    let layers = layersData.value

    for (let ancestorUid in data.path) {
      layers = layers.find(x => x.uid === ancestorUid)
    }

    const layer = layers.children.find(x => x.uid === data.uid)

    layer.enabled = data.visible
  })

  events.on("DynamicDecalsLayerUpdated", data => {
    // console.log("DynamicDecalsLayerUpdated", data)
    if (!data || !data.uid) return

    if (data.uid === selectedLayer.value.uid) {
      selectedLayer.value = data
    }

    let currentLayer = layersData.value
    let layers = layersData.value.children

    if (data.path && data.path.length > 0) {
      for (let i = 0; i < data.path.length; i++) {
        const ancestorUid = data.path[i]

        currentLayer = layers.find(x => x.uid === ancestorUid)

        if (!currentLayer || !currentLayer.children || currentLayer.children.length === 0) break

        layers = currentLayer.children
      }
    }

    if (currentLayer.uid !== data.uid) {
      console.error("DynamicDecalsLayerUpdated specified layer not found with", { uid: data.uid, path: data.path })
      return
    }

    Object.assign(currentLayer, data)
  })

  events.on("DynamicDecalsResourcesUpdated", data => {
    // console.log("DynamicDecalsResourcesUpdated", data)

    if (!data) resources.value = null

    resources.value = data

    if (!configuredLayer.value) return

    if (configuredLayer.value.type === LayerType.fill || configuredLayer.value.type === LayerType.decal) {
      configuredLayer.value.color = currentDecalSettings.value.color
    }

    if (configuredLayer.value.type === LayerType.decal) {
      configuredLayer.value.decalColorTexturePath = currentDecalSettings.value.texture
      configuredLayer.value.decalScale = currentDecalSettings.value.scale
      configuredLayer.value.decalRotation = currentDecalSettings.value.rotation
      configuredLayer.value.decalSkew = currentDecalSettings.value.skew
    }
  })

  let decalPainterWatchers = {}
  function createConfiguredLayerWatchers() {
    if (!configuredLayer.value) return

    decalPainterWatchers["name"] = watch(
      () => configuredLayer.value.name,
      () => {
        if (currentAction.value === "edit" && configuredLayer.value && configuredLayer.value.uid) {
          API.updateLayer(configuredLayer.value)
        }
      }
    )

    if (configuredLayer.value.type === LayerType.decal || configuredLayer.value.type === LayerType.fill) {
      // if (configuredLayer.value.type === LayerType.decal) {
      decalPainterWatchers["color"] = watch(
        () => configuredLayer.value.color,
        () => {
          if (currentAction.value === "edit" && configuredLayer.value && configuredLayer.value.uid) {
            API.updateLayer(configuredLayer.value)
          } else {
            API.setDecalColor(configuredLayer.value.color)
          }
        },
        { deep: true }
      )
    }

    if (configuredLayer.value.type === LayerType.fill) {
      decalPainterWatchers["colorPaletteMapId"] = watch(
        () => configuredLayer.value.colorPaletteMapId,
        () => {
          if (currentAction.value === "edit" && configuredLayer.value && configuredLayer.value.uid) {
            API.updateLayer(configuredLayer.value)
          }
        },
        { deep: true }
      )
    }

    if (configuredLayer.value.type === LayerType.decal) {
      decalPainterWatchers["texture"] = watch(
        () => configuredLayer.value.decalColorTexturePath,
        () => {
          if (currentAction.value === "edit" && configuredLayer.value && configuredLayer.value.uid) {
            API.updateLayer(configuredLayer.value)
          } else if (configuredLayer.value.decalColorTexturePath) {
            API.setDecalTexture(configuredLayer.value.decalColorTexturePath)
          }
        }
      )

      // decalPainterWatchers["color"] = watch(
      //   () => configuredLayer.value.color,
      //   () => {
      //     if (currentAction.value === "edit" && configuredLayer.value && configuredLayer.value.uid) {
      //       API.updateLayer(configuredLayer.value)
      //     } else {
      //       API.setDecalColor(configuredLayer.value.color)
      //     }
      //   },
      //   { deep: true }
      // )

      decalPainterWatchers["scale"] = watch([() => configuredLayer.value.decalScale.x, () => configuredLayer.value.decalScale.y], (newValue, oldValue) => {
        const newX = newValue[0],
          newY = newValue[1],
          oldX = oldValue[0],
          oldY = oldValue[1]
        let x = configuredLayer.value.decalScaleLock && newY !== oldY ? newY : newX
        let y = configuredLayer.value.decalScaleLock && newX !== oldX ? newX : newY

        configuredLayer.value.decalScale.x = x
        configuredLayer.value.decalScale.y = y

        if (currentAction.value === "edit" && configuredLayer.value && configuredLayer.value.uid) {
          API.updateLayer(configuredLayer.value)
        } else {
          API.setDecalScale(configuredLayer.value.decalScale)
        }
      })

      decalPainterWatchers["rotation"] = watch(
        () => configuredLayer.value.decalRotation,
        () => {
          if (currentAction.value === "edit" && configuredLayer.value && configuredLayer.value.uid) {
            API.updateLayer(configuredLayer.value)
          } else {
            API.setDecalRotation(configuredLayer.value.decalRotation)
          }
        }
      )

      decalPainterWatchers["skew"] = watch(
        () => configuredLayer.value.decalSkew,
        () => {
          if (currentAction.value === "edit" && configuredLayer.value && configuredLayer.value.uid) {
            API.updateLayer(configuredLayer.value)
          } else {
            API.setDecalSkew(configuredLayer.value.decalSkew)
          }
        },
        { deep: true }
      )

      decalPainterWatchers["applyMultiple"] = watch(
        () => configuredLayer.value.applyMultiple,
        () => API.setDecalApplyMultiple(configuredLayer.value.applyMultiple)
      )

      decalPainterWatchers["resetOnApply"] = watch(
        () => configuredLayer.value.resetOnApply,
        () => API.setDecalResetOnApply(configuredLayer.value.resetOnApply)
      )
    }
  }

  function disposeConfiguredLayerWatchers() {
    for (let watcherName in decalPainterWatchers) {
      decalPainterWatchers[watcherName]()
    }
    decalPainterWatchers = {}
  }

  function dispose() {
    events.off("DynamicDecalsResourcesUpdated")
    events.off("DynamicDecalsLayerUpdated")
    events.off("DynamicDecalsDataUpdated")
    events.off("DynamicDecalsLayerSelected")
    events.off("DynamicDecalsHighlightedLayerChanged")
    events.off("DynamicDecalsLayerVisibilityUpdated")

    // if (configuredLayerWatcher) configuredLayerWatcher()
    // console.log("decalsStore disposed")
  }

  return {
    textureResources,
    textureCategories,
    layersData,
    history,
    selectedLayer,
    selectedLayerId,
    configuredLayer,
    contextActions,
    init,
    selectLayer,
    invokeContextAction,
    cancelContextAction,
    updateConfiguredLayer,
    createOrUpdateLayer,
    changeCameraView,
    redo,
    undo,
    exportSkin,
    toggleApplyingDecal,
    dispose,
  }
})
