// Settings class

// import { reactive, watch, watchEffect } from "vue"
// import { run as runLua } from "./Lua.js"
import { useBridge } from "@/bridge/index.js"
import { sleep } from "@/utils"

let settings

export async function useSettings() {
  if (!settings) {
    const bridge = useBridge()
    settings = new Settings(bridge.events, bridge.lua)
  }
  while (!settings.loaded) { await sleep(10) }
  return settings
}

class Settings {
  // options = reactive({})
  // values = reactive({})
  values = {}

  loaded = false
  _lua
  // _watchers = {}

  constructor(eventBus, lua) {
    eventBus.on("SettingsChanged", data => {
      // Object.assign(this.options, data.options)
      Object.assign(this.values, data.values)
      this.loaded = true
    })
    // setTimeout(() => this.update(), 0)
    this._lua = lua
    this.update()
  }

  /** @async */
  update() {
    // runLua("settings.notifyUI", [], {})
    return this._lua.settings.notifyUI()
  }

  clone(data) {
    return JSON.parse(JSON.stringify(data))
  }

  /**
   * Read non-mutable clone of the data
   * @param {string} [field=null] Field name. If not specified, all settings will be returned.
   * @returns {*} Setting(s)
   */
  getValue(field = null) {
    if (field && !(field in this.values))
      return null
    return this.clone(field ? this.values[field] : this.values)
  }

  /**
   * @async
   * Save value to settings
   * @param {string} field Field name
   * @param {*} value Field value
   */
  write(field, value) {
    if (!(field in this.values))
      return
    const settings = this.clone(this.values)
    settings[field] = value
    // runLua("settings.setState", [settings], {})
    return this._lua.settings.setState(settings)
  }

  // /**
  //  * Watch for particular settings change
  //  * @param {string[]} fields Field name or array or field names
  //  * @param {function} callback callback(...new_field_values_in_order)
  //  * @param {boolean} [immediate=true] Set to false if you don't want callback to fire right on register
  //  * @returns {function} Unwatch function
  //  */
  // watch(fields, callback, immediate = true) {
  //   if (!Array.isArray(fields))
  //     fields = [fields]
  //   if (fields.length === 0 || typeof callback !== "function")
  //     return
  //   const unwatch = watch(
  //     fields.map(name => () => this.values[name]),
  //     (...data) => callback(...data.map(this.clone)),
  //     { immediate }
  //   )
  //   if (!(callback in this._watchers))
  //     this._watchers[callback] = []
  //   this._watchers[callback].push(unwatch)
  //   return () => this.unwatch(callback)
  // }

  // /**
  //  * Unwatch
  //  * @param {function} callback Callback that was registered before
  //  */
  // unwatch(callback) {
  //   if (callback in this._watchers) {
  //     for (const unwatch of this._watchers[callback])
  //       unwatch()
  //     delete this._watchers[callback]
  //   }
  // }

  // /**
  //  * @async
  //  * Wait for a change and return the value
  //  * @param {string} field Field name to wait change for
  //  * @returns Setting value
  //  */
  // waitFor(field) {
  //   return new Promise((resolve, reject) => {
  //     if (!(field in this.values))
  //       reject()
  //     const unwatch = watchEffect(() => {
  //       unwatch()
  //       resolve(this.clone(this.values[field]))
  //     })
  //   })
  // }
}
