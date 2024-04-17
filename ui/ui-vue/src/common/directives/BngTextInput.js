import { useBridge } from "@/bridge"
import { useSteamDeckInput } from "@/services/steamdeck"

let bridge
let focused = false

const focus = async () => {
  await bridge.lua.setCEFTyping(true)
  focused = true
}
const blur = async () => {
  await bridge.lua.setCEFTyping(false)
  focused = false
}

export default {
  mounted(el) {
    if (!bridge) {
      bridge = useBridge()
      bridge.events.on("CEFTypingLostFocus", () => focused && document.activeElement.blur())
    }
    el.addEventListener("focus", focus)
    el.addEventListener("blur", blur)
    useSteamDeckInput(el)
  },
  beforeUnmount(el) {
    el.removeEventListener("focus", focus)
    el.removeEventListener("blur", blur)
    blur()
  },
}
