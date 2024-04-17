import { useBridge } from "@/bridge/index.js"

let bridge
const stateStack = []

function add(stateName) {
  stateStack.push(stateName)
}
function rem(stateName) {
  const idx = stateStack.lastIndexOf(stateName)
  if (idx > -1)
    stateStack.splice(idx, 1)
}

const luaStringify = any => JSON.stringify(any).replace(/^\[(.*)\]$/, "{$1}")
const luaReport = (stateName, opened) => bridge.api.engineLua(`extensions.hook("onUIStateTriggered", ${luaStringify(stateName)}, ${luaStringify(!!opened)}, ${luaStringify(stateStack)})`)

/**
 * State reporting function
 * @param {string} stateName State name
 * @param {boolean} opened True if opened
 * @param {string} [prevName=null] Specify previous state name if it is replaced with current one
 */
export function reportState(stateName, opened, prevName = null) {
  if (!bridge) bridge = useBridge()

  if (prevName) {
    rem(prevName)
    luaReport(prevName, false)
  }

  if (opened) add(stateName)
  else rem(stateName)

  luaReport(stateName, opened)
}

/**
 * Popup service state reporting function
 * @param {object} popup Popup object
 * @param {boolean} opened True if opened
 */
export function reportPopupState(popup, opened) {
  // console.log("popup", state ? "open" : "close", popup.typeName, popup.componentName)
  const name = `/popup/${popup.componentName}/${popup.wrapper.blur ? "fullscreen" : "aside"}`
  reportState(name, opened)
}
