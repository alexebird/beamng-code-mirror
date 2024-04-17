import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"
import { INTERSECTION_TYPES } from "@/services/drag/sortable"

export const useLayersManagerStore = defineStore("layersManager", () => {
  const { events } = useBridge()

  const layers = ref(null)
  const multipleSelection = ref(false)

  const _selection = ref([])
  const selectedLayers = computed({
    get() {
      return _selection.value
    },
    set(newValue) {
      sendUpdatedSelection(newValue)
    },
  })

  events.on("LiveryEditorLayersUpdate", data => {
    console.log("LiveryEditorLayersUpdated", data)
    multipleSelection.value = data && layers.value && data.length === layers.value.length && multipleSelection.value
    layers.value = data
  })

  events.on("LiveryEditor_SelectedLayersChanged", data => {
    console.log("selected Layer Updated", data)
    _selection.value = data && Array.isArray(data) && data.length > 0 ? data : []
  })

  const sendUpdatedSelection = async selection => {
    console.log("sendUpdatedSelection", selection)
    if (selection.length === 0) {
      await lua.extensions.ui_liveryEditor_selection.clearSelection()
    } else if (multipleSelection.value) {
      await lua.extensions.ui_liveryEditor_selection.setMultipleSelected(selection)
    } else {
      await lua.extensions.ui_liveryEditor_selection.setSelected(selection)
    }
  }

  const canSort = data => {
    const item = getItemByPath(data.targetDataset.draggablePath)

    return !(data.intersectionType === INTERSECTION_TYPES.sub && item.type !== 3)
  }

  async function clearSelection() {
    multipleSelection.value = false
    selectedLayers.value = []
  }

  function getItemByPath(path) {
    const pathSegments = path ? path.split("/") : undefined

    if (!pathSegments) throw Error("Path not defined")

    const index = parseInt(pathSegments[0])
    let currentItem = layers.value[index]

    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      currentItem = currentItem.children[segment]
    }

    return currentItem
  }

  const changeOrder = (oldIndex, oldParentUid, newIndex, newParentUid) => {
    lua.extensions.ui_liveryEditor_tools_group.changeOrder(oldIndex + 1, oldParentUid ? oldParentUid : "", newIndex + 1, newParentUid ? newParentUid : "")
  }

  return { layers, selectedLayers, multipleSelection, canSort, changeOrder, clearSelection }
})
