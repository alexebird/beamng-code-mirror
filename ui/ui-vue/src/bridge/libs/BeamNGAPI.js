// BeamNG API Class
let eventBus, beamNG

export default class {
  callbackId = 0
  apiCallbacks = {}

  constructor(bus, beamng) {
    eventBus = bus
    beamNG = beamng
    eventBus.on('onBNGAPICallback', (idx, result) => this.onBNGAPICallback(idx, result))
  }

  onBNGAPICallback(idx, result) {
    //console.log('onBNGAPICallback', idx, result, this.apiCallbacks)
    if (idx in this.apiCallbacks) {
      this.apiCallbacks[idx](result)
      delete this.apiCallbacks[idx]
    }
  }

  engineScript(cmd, callback) {
    if (!callback) {
      beamNG.sendGameEngine(cmd)
      return
    }

    this.apiCallbacks[++this.callbackId] = callback
    if (cmd.charAt(cmd.length - 1) == ";") {
      cmd = cmd.substr(0, cmd.length-1)
    }
    //console.log('TS << ' + cmd + " --- " + this.callbackId)
    beamNG.sendGameEngine('queueHookJS("onBNGAPICallback","["@' + this.callbackId + '@","@strreplace(' + cmd + ',"\\\"","\\\\\\\"")@"]");')
  }

  activeObjectLua(cmd, callback) {
    if (!callback) {
      beamNG.sendActiveObjectLua(cmd)
      return
    }

    if (!cmd) {
      console.error("activeObjectLua cmd null", arguments)
      return
    }

    this.apiCallbacks[++this.callbackId] = callback
    //console.log('AO << ' + cmd)
    beamNG.sendActiveObjectLua('guihooks.trigger("onBNGAPICallback",' + this.callbackId + ',' + cmd + ')')
  }

  subscribeToEvents(data) {
    beamNG.subscribeToEvents(data)
  }

  engineLua(cmd, callback) {
    if (!beamNG) return

    if (!callback) {
      //console.log('EL << ' + cmd)
      beamNG.sendEngineLua(cmd)
      return
    }

    if (!cmd) {
      cmd = "nop"
    }

    this.apiCallbacks[++this.callbackId] = callback
    //console.log('ELC << ' + cmd)
    beamNG.sendEngineLua('guihooks.trigger("onBNGAPICallback",' + this.callbackId + ',' + cmd + ')')
  }

  queueAllObjectLua(cmd) {
    //console.log('AO << ' + cmd)
    beamNG.queueAllObjectLua(cmd)
  }

  serializeToLuaCheck(text) {
    let encoded = encodeURIComponent(text)
    this.engineLua(`
      nop([[
        ================================
        There are bugs when processing language-specific characters.

        If you are a user/modder:
          Please notify the BeamNG support team that you are getting this message in your logs.

        If you are a developer:
          You can reproduce this bug in your computer by running the following JS snippet:
            bngApi.engineLua(\`nop(\${bngApi.serializeToLua(decodeURIComponent("${encoded}"))})\`)
          Also please check jira ticket GE-3042.
        ================================
      ]])
      nop(${bngApi.serializeToLua(text)}) -- (actually run the lua check)
    `)
  }

  serializeToLua(obj) {
    let tmp
    if (obj === undefined || obj === null) { return 'nil'; } //nil'
    switch (obj.constructor) {
      case String:
        //return JSON.stringify(obj) // this will not work correctly for non-english languages (such as the word 'keyboard' in czech lang), due to generating escape sequences that the LUA interpreter is unable to parse. Leading to LUA interpreter errors and no LUA code being executed. Uncomment with extreme caution, as it's likely to break the game in computers configured to non-english languages (regardless of in-game chosen language). See also GE-3042
        if (obj.search(/\\|\"|\n|\t|\r/) != -1) {
          return `"${obj.replace(/\\/g, '\\\\').replace(/\"/g, '\\"').replace(/\n|\r/g, "\\n").replace(/\t/g, "\\t")}"`
        } else {
          return `"${obj}"`
        }
      case Number:
        return isFinite(obj) ? obj.toString() : null
      case Boolean:
        return obj ? 'true' : 'false'
      case Array:
        tmp = []
        for (let i = 0; i < obj.length; i++) {
          if (obj[i] != null) {
              tmp.push(this.serializeToLua(obj[i]))
          }
        }
        return '{' + tmp.join(',') + '}'
      case Function:
        return 'nil'
      default:
        if (typeof obj == 'object') {
          tmp = []
          for (let attr in obj) {
            if (typeof obj[attr] != 'function') {
              tmp.push('["' + attr + '"]=' + this.serializeToLua(obj[attr]))
            }
          }
          return '{' + tmp.join(',') + '}'
        } else {
          return obj.toString()
        }
    }
  }
}
