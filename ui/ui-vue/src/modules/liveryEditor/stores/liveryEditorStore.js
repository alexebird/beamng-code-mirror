import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"
import { NewLayerActions } from "@/modules/liveryEditor/models"
import bindingsInfoData from "@/modules/liveryEditor/models/bindingsInfoData"

const EDITOR_CONTEXT = {
  selectedLayer: "selectedLayer",
  newLayer: "newLayer",
}

export const useLiveryEditorStore = defineStore("liveryEditor", () => {
  const { events } = useBridge()
  const layers = ref(null)
  const selectedTool = ref(null)
  const currentFile = ref(null)
  const filename = ref(null)
  const currentContext = ref(null)
  const history = ref(null)

  const canUndo = computed(() => history.value && history.value.undoStack && history.value.undoStack.length > 0)
  const canRedo = computed(() => history.value && history.value.redoStack && history.value.redoStack.length > 0)
  const actionGroup = computed(() => (selectedTool.value ? bindingsInfoData[selectedTool.value] : null))

  events.on("LiveryEditorLoadedFile", data => {
    console.log("LiveryEditorLoadedFile", data)
    currentFile.value = data
  })

  events.on("LiveryEditorLayersUpdate", data => {
    console.log("LiveryEditorLayersUpdated", data)
    layers.value = data
  })

  events.on("LiveryEditor_onHistoryUpdated", data => {
    console.log("LiveryEditor_onHistoryUpdated", data)
    history.value = data
  })

  events.on("LiveryEditor_SelectedLayersChanged", data => {
    console.log("selected Layer Updated", data)
    currentContext.value = data.length > 0 ? EDITOR_CONTEXT.selectedLayer : null
  })

  events.on("LiveryEditorToolChanged", data => {
    console.log("LiverEditorToolChanged", data)
    selectedTool.value = data
  })

  const setNewLayerContext = () => {
    currentContext.value = EDITOR_CONTEXT.newLayer
    console.log("setNewLayerContext", currentContext.value)
  }

  const requestDismissLayerActions = () => {
    if (currentContext.value === EDITOR_CONTEXT.newLayer) {
      currentContext.value = null
    } else if (currentContext.value === EDITOR_CONTEXT.selectedLayer) {
      clearSelection()
    }
  }

  const selectTool = tool => {
    lua.extensions.ui_liveryEditor_tools.useTool(tool)
  }

  const closeCurrentTool = tool => {
    lua.extensions.ui_liveryEditor_tools.closeCurrentTool()
  }

  const createDecal = () => {
    lua.extensions.ui_liveryEditor_editor.applyDecal()
  }

  const translate = (x, y) => {
    lua.extensions.ui_liveryEditor_layers_decals.translate(x, y)
  }

  const rotate = (degrees, counterClockwise) => {
    lua.extensions.ui_liveryEditor_layers_decals.rotate(degrees, counterClockwise)
  }

  const scale = (stepsX, stepsY) => {
    lua.extensions.ui_liveryEditor_layers_decals.scale(stepsX, stepsY)
  }

  const selectSingle = async layerUid => {
    await lua.extensions.ui_liveryEditor_selection.setSelected(layerUid)
  }


  async function clearSelection() {
    await lua.extensions.ui_liveryEditor_selection.clearSelection()
  }

  async function toggleVisibility(layerUid) {
    await lua.extensions.ui_liveryEditor_tools_settings.toggleVisibilityById(layerUid)
  }

  async function toggleLock(layerUid) {
    await lua.extensions.ui_liveryEditor_tools_settings.toggleLockById(layerUid)
  }

  const startEditor = async () => {
    await lua.extensions.ui_liveryEditor_editor.startEditor()
    await lua.extensions.ui_liveryEditor_editor.startSession()
    // await lua.extensions.ui_liveryEditor_controls.toggleUseMousePos()
    lua.extensions.ui_liveryEditor_camera.setCameraView(4)
  }

  const createSaveFile = async filename => {
    await lua.extensions.ui_liveryEditor_userData.createSaveFile(filename)
  }

  const save = async newFilename => {
    filename.value = newFilename
    await lua.extensions.ui_liveryEditor_editor.save(newFilename)
  }

  const exitEditor = () => lua.extensions.ui_liveryEditor_editor.exitEditor()

  const setCameraView = cameraView => lua.extensions.ui_liveryEditor_camera.setCameraView(cameraView)

  const undo = () => lua.extensions.ui_liveryEditor_history.undo()
  const redo = () => lua.extensions.ui_liveryEditor_history.redo()

  return {
    layers,
    selectedTool,
    currentFile,
    currentContext,
    actionGroup,

    setNewLayerContext,
    requestDismissLayerActions,

    selectTool,
    closeCurrentTool,
    createSaveFile,
    toggleVisibility,
    toggleLock,

    createDecal,
    startEditor,
    exitEditor,
    save,
    setCameraView,
    undo,
    redo,

    translate,
    rotate,
    scale,
    // cameraLeft,
    // cameraRight,
    // cameraFront,
    // cameraBack,
    // cameraTop,
    selectSingle,
    clearSelection,
  }
})
