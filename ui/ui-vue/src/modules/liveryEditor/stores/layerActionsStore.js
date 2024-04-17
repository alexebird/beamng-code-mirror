import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"
import { NewLayerActions } from "@/modules/liveryEditor/models"
import { useLiveryEditorStore } from "./liveryEditorStore"
import { buildActionsDrawer } from "../services/actionsDrawerBuilder"
import { CAMERA_VIEWS } from "../enums/cameraViews"

const DECAL_ACTION_VALUE = "decal"
const FILL_ACTION_VALUE = "fill"

export const useLayerActionsStore = defineStore("createLayer", () => {
  const editorStore = useLiveryEditorStore()
  const { events } = useBridge()

  const newLayerActions = ref({ ...NewLayerActions })
  const selectedLayerActions = ref(null)
  const selectedLayers = ref(null)
  const loading = ref(false)

  const currentAction = ref(null)
  const currentActionArgs = ref({})

  events.on("LiverEditorLayerActionsUpdated", async data => {
    console.log("LiverEditorLayerActionsUpdated", data)

    if (!data || data.length === 0) {
      selectedLayerActions.value = null
    } else {
      selectedLayerActions.value = await parseSelectedLayerActions(data)
      setLayerActionsProperties()
    }
  })

  events.on("LiveryEditor_SelectedLayersDataUpdated", async data => {
    console.log("[layerActionsStore] LiveryEditor_SelectedLayersDataUpdated", data)
    selectedLayers.value = data
    if (selectedLayerActions.value) setLayerActionsProperties()
  })

  const layerActions = computed(() => {
    if (!editorStore.currentContext) return []

    if (editorStore.currentContext === "selectedLayer") return selectedLayerActions.value

    return newLayerActions.value
  })

  const singleSelectedLayer = computed(() => (selectedLayers.value && selectedLayers.value.length > 0 ? selectedLayers.value[0] : null))

  const aggregateIsVisible = computed(() => {
    if (!selectedLayers.value) return undefined

    return !selectedLayers.value.find(x => !x.enabled)
  })

  const aggregateIsLocked = computed(() => {
    if (!selectedLayers.value) return undefined

    return !selectedLayers.value.find(x => !x.locked)
  })

  watch(
    () => editorStore.currentContext,
    () => {
      // console.log("currentContextChanged", editorStore.currentContext)
    },
    { immediate: true }
  )

  async function onActionClicked(data, params) {
    // console.log("onActionClicked", data)

    const isActionableItem = !data.lazyLoadItems && !data.items

    if (!isActionableItem) return

    if (data.value === "camera_left") {
      await lua.extensions.ui_liveryEditor_camera.setCameraView(CAMERA_VIEWS.left)
    } else if (data.value === "camera_right") {
      await lua.extensions.ui_liveryEditor_camera.setCameraView(CAMERA_VIEWS.right)
    } else if (data.value === "camera_front") {
      await lua.extensions.ui_liveryEditor_camera.setCameraView(CAMERA_VIEWS.front)
    } else if (data.value === "camera_back") {
      await lua.extensions.ui_liveryEditor_camera.setCameraView(CAMERA_VIEWS.back)
    } else if (data.value === "camera_top") {
      await lua.extensions.ui_liveryEditor_camera.setCameraView(CAMERA_VIEWS.top)
    } else if (editorStore.currentContext === "newLayer") {
      if (currentAction.value === DECAL_ACTION_VALUE && data.value !== DECAL_ACTION_VALUE) await createDecalLayer(data)
      else if (currentAction.value === FILL_ACTION_VALUE && data.value !== FILL_ACTION_VALUE) await createFillLayer(data)
    } else if (editorStore.currentContext === "selectedLayer") {
      if (data.value === "visibility") {
        await lua.extensions.ui_liveryEditor_tools_settings.toggleVisibility()
      } else if (data.value === "lock") {
        await lua.extensions.ui_liveryEditor_tools_settings.toggleLock()
      } else if (data.value === "delete") {
        await lua.extensions.ui_liveryEditor_tools_settings.deleteLayer()
      } else if (data.value === "rename") {
        await lua.extensions.ui_liveryEditor_tools_settings.rename(params.name)
      } else if (data.value === "duplicate") {
        await lua.extensions.ui_liveryEditor_tools_misc.duplicate()
      } else if (data.value === "order_up") {
        await lua.extensions.ui_liveryEditor_tools_group.moveOrderUp()
      } else if (data.value === "order_down") {
        await lua.extensions.ui_liveryEditor_tools_group.moveOrderDown()
      } else if (data.value === "group") {
        await lua.extensions.ui_liveryEditor_tools_group.groupLayers()
      } else if (data.value === "ungroup") {
        await lua.extensions.ui_liveryEditor_tools_group.ungroupLayer()
      } else {
        await lua.extensions.ui_liveryEditor_tools.useTool(data.value)
      }
    }
  }

  async function onActionItemChanged(data, path) {
    // console.log("onActionItemChanged", data, path)

    if (path.length === 1) {
      currentAction.value = data.value
      currentActionArgs.value = {}
    }

    if (!data.lazyLoadItems || data.items) return

    loading.value = true

    if (data.value === DECAL_ACTION_VALUE && (!data.items || data.items.length === 0)) {
      const resource = await lua.extensions.ui_liveryEditor_resources.getTextureCategories()
      layerActions.value.items[1].items = resource.map(x => ({ ...x, lazyLoadItems: true }))
    } else if (path.length === 2 && path[0] === DECAL_ACTION_VALUE) {
      const categoryIndex = layerActions.value.items[1].items.findIndex(x => x.value === data.value)
      const textures = await lua.extensions.ui_liveryEditor_resources.getTexturesByCategory(data.value)
      layerActions.value.items[1].items[categoryIndex].items = textures.items.map(x => ({ ...x, label: undefined }))
    } else if (data.value === FILL_ACTION_VALUE && (!data.items || data.items.length === 0)) {
      const colorPalettes = await lua.extensions.ui_liveryEditor_layers_fill.getColorPalettes()
      layerActions.value.items[0].items = colorPalettes
    }

    loading.value = false
  }

  async function createDecalLayer(data) {
    await lua.extensions.ui_liveryEditor_layers_decals.createDecal({
      texture: data.preview,
    })
  }

  async function createFillLayer(data) {
    await lua.extensions.ui_liveryEditor_layers_fill.createLayer({
      colorPaletteMapId: data.value,
    })
  }

  async function setLayerActionsProperties() {
    const optionsIndex = selectedLayerActions.value.items.findIndex(x => x.value === "options")

    if (optionsIndex === -1) return

    const optionsItems = selectedLayerActions.value.items[optionsIndex].items

    if (!optionsItems || optionsItems.length === 0) return

    // set visibility properties
    const visibilityIndex = optionsItems.findIndex(x => x.value === "visibility")
    if (visibilityIndex > -1) {
      selectedLayerActions.value.items[optionsIndex].items[visibilityIndex].active = aggregateIsVisible.value
    }

    // set lock properties
    const lockIndex = optionsItems.findIndex(x => x.value === "lock")
    if (lockIndex > -1) {
      const lockAction = selectedLayerActions.value.items[optionsIndex].items[lockIndex]
      selectedLayerActions.value.items[optionsIndex].items[lockIndex].active = aggregateIsLocked.value
    }
  }

  async function parseSelectedLayerActions(layerActionKeys) {
    const layers = await lua.extensions.ui_liveryEditor_selection.getSelectedLayersData()
    console.log("parseSelectedLayers", layers)
    return {
      label: "Layer Actions",
      items: buildActionsDrawer(layerActionKeys),
    }
  }

  return { layerActions, singleSelectedLayer, loading, onActionClicked, onActionItemChanged }
})
