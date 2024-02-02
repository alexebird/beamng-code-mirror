import { ref } from "vue"
import { defineStore } from "pinia"
import { useBridge, lua } from "@/bridge"

export const usePartShoppingStore = defineStore("partShopping", () => {
  const { events } = useBridge()

  // States
  let partShoppingData = ref({})
  let filteredSlots = ref([])
  let slot = ref("")
  let filteredParts = ref([])
  let category = ref("")

  let backAction = () => {}

  let slotsDict = {}
  let partFilter

  function doesNameContainString(name, searchStrings) {
    for (const searchString of searchStrings) {
      if (name.includes(searchString)) {
        return true
      }
    }
    return false
  }

  // Actions
  function filterParts() {
    filteredParts.value = []
    slotsDict = {}

    if (partShoppingData.value.partsInShop === null || partShoppingData.value.partsInShop === undefined) {
      return
    }
    for (const [partName, part] of Object.entries(partShoppingData.value.partsInShop)) {
      // filter either with the partFilter dict or by the "slot.value"
      if (partFilter) {
        if (doesNameContainString(partName, partFilter)) {
          filteredParts.value.push(part)
        }
      } else if (part.slot === slot.value) {
        filteredParts.value.push(part)
      }

      // build the slots dict
      let niceName = partShoppingData.value.slotsNiceName[part.slot]
      if (niceName !== null && niceName !== undefined) {
        slotsDict[part.slot] = niceName
      } else {
        slotsDict[part.slot] = part.slot
      }
    }
    filteredParts.value.sort((a, b) => {
      return a.description.description < b.description.description ? -1 : 1
    })
  }

  function filterSlots() {
    // TODO filter this based on "category"
    filteredSlots.value = []
    for (const [slot, niceName] of Object.entries(slotsDict)) {
      filteredSlots.value.push([slot, niceName])
    }
    filteredSlots.value.sort((a, b) => {
      // Move the tutorial slots to the top in the tutorial
      if (partShoppingData.value.tutorialSlots) {
        if (partShoppingData.value.tutorialSlots[a[0]]) {
          return -1
        }
        if (partShoppingData.value.tutorialSlots[b[0]]) {
          return 1
        }
      }

      return a[1] < b[1] ? -1 : 1
    })
  }

  function setSlot(_slot) {
    slot.value = _slot
    partFilter = undefined
    filterParts()
  }

  function setCategory(_category) {
    category.value = _category
    filterSlots()
    if (category.value == "everything" || category.value == "") {
      setSlot("")
    } else if(category.value == "cargo") {
      // set the slot to anything for now, so the part list is shown
      slot.value = "Blablabla"
      partFilter = ["cargo_load_box", "_roofbars"]
      filterParts()
    }
  }

  const requestInitialData = () => {
    lua.career_modules_partShopping.sendShoppingDataToUI()
  }

  const cancelShopping = () => {
    lua.career_modules_partShopping.cancelShopping()
    setCategory("")
  }

  const handleShoppingData = data => {
    partShoppingData.value = data
    filterParts()
    filterSlots()
  }

  // Lua events
  const listen = state => {
    const method = state ? "on" : "off"
    events[method]("partShoppingData", handleShoppingData)
  }
  listen(true)

  function dispose() {
    listen(false)
  }

  return {
    partShoppingData,
    slot,
    filteredSlots,
    filteredParts,
    category,
    setSlot,
    setCategory,
    requestInitialData,
    cancelShopping,
    dispose,
    set backAction(actionFunc) {
      backAction = actionFunc
    },
    get backAction() {
      return backAction
    },
  }
})
