import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"

const API = lua.extensions.ui_liveryEditor_layers_decals

export const useLayerSettingsStore = defineStore("layerSettings", () => {
  const { events } = useBridge()

  const targetLayer = ref({})
  const currentTool = ref(null)
  const toolsData = ref(null)

  const isStampMode = computed(() => toolsData.value && toolsData.value.mode === "stamp")

  events.on("LiveryEditor_SelectedLayersDataUpdated", async data => {
    console.log("LiveryEditor_SelectedLayersDataUpdated", data)
    // Only first layers properties can be displayed
    // lua backend will decide whether to update all if there are multiple selected layers.
    // For example, changing material for multiple layers
    if (data && Array.isArray(data) && data.length > 0) {
      targetLayer.value = data[0]
    }
  })

  events.on("LiveryEditorToolChanged", data => {
    console.log("LiverEditorToolChanged", data)
    currentTool.value = data
  })

  events.on("LiveryEditor_ToolDataUpdated", async data => {
    console.log("LiveryEditor_ToolDataUpdated", data)
    toolsData.value = data
  })

  const translate = async (x, y) => {
    await lua.extensions.ui_liveryEditor_tools_transform.translate(x, y)
  }

  const rotate = async (degrees, counterClockwise) => {
    console.log("sending to lua rotate", degrees)
    await lua.extensions.ui_liveryEditor_tools_transform.rotate(degrees, counterClockwise)
  }

  const setRotation = async degrees => {
    console.log("setRotation", degrees)
    await lua.extensions.ui_liveryEditor_tools_transform.setRotation(degrees)
  }

  const scale = async (scaleX, scaleY) => {
    await lua.extensions.ui_liveryEditor_tools_transform.scale(scaleX, scaleY)
  }

  const setScale = async (scaleX, scaleY) => {
    console.log("setScale", scaleX, scaleY)
    await lua.extensions.ui_liveryEditor_tools_transform.setScale(scaleX, scaleY)
  }

  const skew = async (skewX, skewY) => {
    await lua.extensions.ui_liveryEditor_tools_transform.skew(skewX, skewY)
  }

  const setSkew = async (skewX, skewY) => {
    await lua.extensions.ui_liveryEditor_tools_transform.setSkew(skewX, skewY)
  }

  const setMirrored = async (mirrored, flip) => {
    await lua.extensions.ui_liveryEditor_tools_settings.setMirrored(mirrored, flip)
  }

  const setColor = async color => {
    await lua.extensions.ui_liveryEditor_tools_material.setColor(color)
  }

  const setMetallicIntensity = async metallicIntensity => {
    await lua.extensions.ui_liveryEditor_tools_material.setMetallicIntensity(metallicIntensity)
  }

  const setNormalIntensity = async normalIntensity => {
    await lua.extensions.ui_liveryEditor_tools_material.setNormalIntensity(normalIntensity)
  }

  const setRoughnessIntensity = async roughnessIntensity => {
    await lua.extensions.ui_liveryEditor_tools_material.setRoughnessIntensity(roughnessIntensity)
  }

  const toggleStamp = async () => {
    if (toolsData.value && toolsData.value.mode === "stamp") {
      await lua.extensions.ui_liveryEditor_tools_transform.cancelStamp()
    } else {
      await lua.extensions.ui_liveryEditor_tools_transform.useStamp()
    }
  }

  const toggleUseMousePos = async () => {
    // await lua.extensions.ui_liveryEditor_controls.toggleUseMousePos()
  }

  const closeCurrentTool = tool => {
    lua.extensions.ui_liveryEditor_tools.closeCurrentTool()
  }

  return {
    toolsData,
    targetLayer,
    isStampMode,
    translate,
    setRotation,
    scale,
    setScale,
    rotate,
    skew,
    setSkew,
    setMirrored,
    setColor,
    setMetallicIntensity,
    setNormalIntensity,
    setRoughnessIntensity,
    toggleUseMousePos,
    toggleStamp,
    closeCurrentTool,
  }
})
