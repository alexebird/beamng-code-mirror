import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"
import useControls from "@/services/controls"
import bindingsInfoData from "@/modules/liveryEditor/models/bindingsInfoData"

export const useBindingsInfoStore = defineStore("bindingsInfoStore", () => {
  const { events } = useBridge()
  const controls = useControls()

  const currentTool = ref(null)
  const toolsData = ref(null)

  const isController = computed(() => controls.deviceNames().find(x => x.startsWith("xinput")))

  const actions = computed(() => {
    if (!currentTool.value) return null

    const mode = toolsData.value && toolsData.value.mode ? toolsData.value.mode : "default"
    const data = bindingsInfoData[currentTool.value] ? bindingsInfoData[currentTool.value][mode] : undefined

    console.log("bindings data", data)

    if (!data) return undefined

    const actionGroups = []

    for (let actionGroup of data) {
      // if ((isController.value && !actionGroup.bindings.xinput) || (!isController.value && !actionGroup.bindings.keyboard)) continue

      const inputBindings = isController.value && actionGroup.bindings.xinput ? actionGroup.bindings.xinput : actionGroup.bindings.keyboard

      actionGroups.push({
        type: actionGroup.type,
        label: actionGroup.label,
        inputType: isController.value ? "xinput" : "keyboard",
        modifiers: inputBindings.modifiers,
        actions: inputBindings.actions,
      })
    }

    console.log("actionGroups", actionGroups)

    return actionGroups
  })

  events.on("LiveryEditorToolChanged", data => {
    console.log("LiveryEditorToolChanged", data)
    currentTool.value = data
  })

  events.on("LiveryEditor_ToolDataUpdated", async data => {
    console.log("LiveryEditor_ToolDataUpdated", data)
    toolsData.value = data
  })

  return { actions }
})
