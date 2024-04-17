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
  let expandedSlots = ref({})
  let searchString = ""
  let slotToScrollTo = ref()

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

    if (!partShoppingData.value.partsInShop) return

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

  function getSlotsFromSearchString() {
    let resultSlots = {}
    for (const [partName, part] of Object.entries(partShoppingData.value.partsInShop)) {
      if (part.description.description.toLowerCase().includes(searchString.toLowerCase())) {
        resultSlots[part.slot] = true
      }
    }
    for (const [slotName, slotNiceName] of Object.entries(slotsDict)) {
      if (slotNiceName.toLowerCase().includes(searchString.toLowerCase())) {
        resultSlots[slotName] = true
      }
    }
    return resultSlots
  }

  let filteredSlotsDict
  function doesSlotPassFilter(slot) {
    return filteredSlotsDict[slot.slotName]
  }

  function filterSlots() {
    if (searchString.length > 0) {
      // TODO filter this based on "category"
      let slotsList = Object.entries(slotsDict)
      slotsList.sort(([, aNiceName], [, bNiceName]) => {
        return aNiceName < bNiceName ? -1 : 1
      })

      filteredSlotsDict = getSlotsFromSearchString()
      filteredSlots.value = partShoppingData.value.searchSlotList.filter(doesSlotPassFilter)
    } else {
      filteredSlots.value = {}
    }

    if (Object.keys(expandedSlots.value).length === 0) {
      for (const name in slotsDict) {
        expandedSlots.value[name] = ref(false)
      }
    }
  }

  function setSlotExpanded(slot, expanded) {
    expandedSlots.value[slot] = expanded
  }

  function setSlot(_slot) {
    if (_slot == "") {
      slotToScrollTo.value = slot.value
    }
    slot.value = _slot
    partFilter = undefined
    filterParts()
  }

  function setCategory(_category) {
    category.value = _category
    filterSlots()
    if (category.value == "everything" || category.value == "") {
      setSlot("")
    } else if (category.value == "cargo") {
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
    expandedSlots.value = {}
    lua.career_modules_partShopping.cancelShopping()
    setCategory("")
  }

  // empty arrays from lua come as an empty object (so arr.length is undefined)
  function fixSlots(part) {
    if (!("slots" in part)) return
    if (!Array.isArray(part.slots)) part.slots = []
    for (const slot of part.slots) {
      if (slot.part) fixSlots(slot.part)
    }
  }

  const handleShoppingData = data => {
    if (data.partTree) fixSlots(data.partTree)
    partShoppingData.value = data
    filterParts()
    filterSlots()
  }

  const searchValueChanged = _searchString => {
    searchString = _searchString
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
    expandedSlots,
    slotToScrollTo,
    searchValueChanged,
    setSlot,
    setCategory,
    requestInitialData,
    cancelShopping,
    dispose,
    setSlotExpanded,
    set backAction(actionFunc) {
      backAction = actionFunc
    },
    get backAction() {
      return backAction
    },
  }
})
