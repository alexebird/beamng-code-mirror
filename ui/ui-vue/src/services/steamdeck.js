import { isRef, watch } from "vue"
import { lua } from "@/bridge"
import { useSettings } from "./settings.js"

const marker = "__BNG_SD_INPUT"
const inputTypes = {
  singleLine: 0,
  multiLine: 1,
}

function bindToInputs(elements) {
  const inputs = Array.isArray(elements) ? elements : [elements]
  for (const input of inputs) {
    if (marker in input) continue
    input[marker] = true
    let type
    const tag = input.tagName.toLowerCase()
    if (tag === "textarea") {
      type = inputTypes.multiLine
    } else if (tag === "input" && ["text", "number", "password", "search"].includes(input.type.toLowerCase())) {
      type = inputTypes.singleLine
    } else {
      continue
    }
    input.addEventListener("focus", () => {
      const rect = input.getBoundingClientRect()
      console.log("SteamDeck input focus:", type, rect)
      lua.Steam.showFloatingGamepadTextInput(type, rect.left, rect.top, rect.width, rect.height)
    })
  }
}

export async function useSteamDeckInput(inputs) {
  if (!inputs) throw new Error("inputs must be specified (ref, refs, element, elements)")
  // restrict this to steamdeck only
  const settings = await useSettings()
  if (settings.values.runningOnSteamDeck) {
    if (isRef(inputs))
      watch(inputs, bindToInputs, { immediate: true })
    else
      bindToInputs(inputs)
  }
}
