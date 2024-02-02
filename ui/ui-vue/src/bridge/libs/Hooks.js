// Handlers and associated tooling for window hooks

const handlers = {}

// These two functions are called from \ui\entrypoints\comms.js
window.streamUpdate = data => _runHandlers("stream", data)
window.multihookUpdate = hooksData => {
  for (const i in hooksData) {
    const hook = hooksData[i]
    trigger(hook[0], hook[1])
  }
}

// This is called from \ui\entrypoints\comms.js and is available globally at window.HookManager
// and on the bridge at .hooks.trigger
window.HookManager = { trigger }

// Default Handlers ============================================

// Streams --------------------------------
const streamUpdateHandler = function (data) {
  // TODO: use new format
  // FOR NOW: merge them all :D
  //console.log("streamUpdate", arguments[0])
  let oldFormat = {}
  if (data.globalStreams) {
    for (let sn in data.globalStreams) {
      oldFormat[sn] = data.globalStreams[sn]
    }
  }
  if (data.vehicleStreams && data.vehicleStreams["player_0"]) {
    for (let sn in data.vehicleStreams["player_0"]) {
      oldFormat[sn] = data.vehicleStreams["player_0"][sn]
    }
  }
  //console.log("got streams: ", arguments, "converting to old format for now: ", oldFormat)
  if (window.globalAngularRootScope) window.globalAngularRootScope.$broadcast("streamsUpdate", oldFormat)
  window.vueEventBus && window.vueEventBus.emit("onStreamsUpdate", oldFormat)
  if (window.vueGlobalStore) window.vueGlobalStore["streams"] = oldFormat
}
add("streamMain", streamUpdateHandler, "stream")

// Hooks ------------------------------------
const mainHookHandler = function (hookName, args) {
  if (args && !Array.isArray(args)) {
    console.error(
      "HookManager.trigger unsupported arguments (needs to be a list): " + JSON.stringify(hookName) + " - " + JSON.stringify(args).substring(0, 30) + " ... "
    )
  }
  if (window.vueEventBus) window.vueEventBus.emit(hookName, ...args)
  if (window.globalAngularRootScope) window.globalAngularRootScope.$broadcast(hookName, ...args)
}

add("hooksMain", mainHookHandler)

// ============================================

function add(id, func, type = "hook") {
  if (!handlers[type]) handlers[type] = {}
  handlers[type][id] = func
}

function remove(id, type = "hook") {
  if (handlers[type]) delete handlers[type][id]
}

function trigger(hookName, args) {
  _runHandlers("hook", hookName, args)
}

function _runHandlers(type, ...data) {
  if (handlers[type]) {
    const toRun = Object.values(handlers[type])
    toRun.length && toRun.forEach(f => f(...data))
  }
}

export default {
  add,
  remove,
  trigger,
}
