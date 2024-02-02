import { ref } from "vue"
import { defineStore } from "pinia"
import { useBridge, lua } from "@/bridge"

export const usePartInventoryStore = defineStore("partInventory", () => {
  const { events } = useBridge()

  // States
  let partInventoryData = ref({})
  let newPartsPopupOpen = ref(false)
  let newParts = ref([])

  // Actions
  function requestInitialData() {
    // TODO refactor this to use the return value method
    lua.career_modules_partInventory.sendUIData()
  }

  function closeNewPartsPopup() {
    newPartsPopupOpen.value = false
  }

  function closeMenu() {
    lua.career_modules_partInventory.closeMenu()
  }

  function partInventoryClosed() {
    lua.career_modules_partInventory.partInventoryClosed()
  }

  function dispose() {
    events.off("partInventoryData")
    events.off("openNewPartsPopup")
  }

  // Lua events
  events.on("partInventoryData", data => {
    partInventoryData.value = data
  })

  events.on("openNewPartsPopup", newPartIds => {
    newPartsPopupOpen.value = true

    newParts.value = []
    for (let i = 0; i < partInventoryData.value.partList.length; i++) {
      let part = partInventoryData.value.partList[i]
      for (let j = 0; j < newPartIds.length; j++) {
        if (part.id == newPartIds[j]) {
          newParts.value.push(part)
          break
        }
      }
    }
  })

  return {
    partInventoryData,
    newParts,
    newPartsPopupOpen,
    requestInitialData,
    closeNewPartsPopup,
    closeMenu,
    partInventoryClosed,
    dispose,
  }
})
