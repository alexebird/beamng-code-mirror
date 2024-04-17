import { defineStore } from "pinia"
import { ref } from "vue"
import data from "./data.json"

export const MODES = Object.freeze({
  NORMAL: 0,
  SELECT: 1,
  MULTI_SELECT: 2,
  MOVE: 3,
})

export const useLayerManager = defineStore("layerManager", () => {
  const state = ref({
    mode: MODES.NORMAL,
    selection: [],
  })

  const exitMode = () => {
    state.value.mode = MODES.NORMAL
    state.value.selection = []
  }

  const subscribeEvents = el => {
    el.value.addEventListener("layerClick", data => {
      //   console.log("click event received", data);
      handleEvent("layerClick", data.detail)
    })
    el.value.addEventListener("layerLongPress", data => {
      //   console.log("long press event received", data.detail);
      handleEvent("layerLongPress", data.detail)
    })
  }

  const triggerLongPress = (el, data) => {
    el.value.dispatchEvent(new CustomEvent("layerLongPress", { bubbles: true, detail: data }))
  }

  const triggerClick = (el, data) => {
    el.value.dispatchEvent(
      new CustomEvent("layerClick", {
        bubbles: true,
        detail: data,
      })
    )
  }

  function handleEvent(eventType, data) {
    const isSuccess = detectAndSetMode(eventType)

    if (!isSuccess) return

    switch (state.value.mode) {
      case MODES.MULTI_SELECT:
        handleMultiSelect(data.id)
        break
      case MODES.SELECT:
        handleSelect(data)
        break
    }
  }

  let isLongPressStarted = false
  function detectAndSetMode(eventType) {
    switch (eventType) {
      case "layerLongPress":
        // Ignore if mode is already MULTI_SELECT and will be processed by layerClick
        if (state.value.mode === MODES.MULTI_SELECT) {
          return false
        }
        isLongPressStarted = true
        state.value.mode = MODES.MULTI_SELECT
        return true
      case "layerClick":
        // Ignore event if it's a click event right after starting layerLongPress
        if (isLongPressStarted) {
          isLongPressStarted = false
          return false
        } else if (state.value.mode === MODES.MULTI_SELECT) {
          return true
        } else if (state.value.mode === MODES.SELECT || state.value.mode === MODES.NORMAL) {
          state.value.mode = MODES.SELECT
          return true
        }
      default:
        return false
    }
  }

  function handleMultiSelect(id) {
    const index = state.value.selection.findIndex(x => x.id === id)
    if (index === -1) {
      state.value.selection.push({ id })
    } else {
      state.value.selection.splice(index, 1)
    }
  }

  function handleSelect(node) {
    state.value.selection = [node]
  }

  return {
    state,
    subscribeEvents,
    triggerLongPress,
    triggerClick,
    exitMode,
  }
})
