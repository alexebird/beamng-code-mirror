// Store/service for Controls data

import { inject, ref } from "vue"
import { defineStore } from "pinia";
import { lua } from '@/bridge'
import { $translate } from '@/services'
import { defer } from '@/utils'
import { serializeCheck } from '@/bridge/libs/Lua'
import { ACTIONS_BY_UI_EVENT } from '@/bridge/libs/UINavEvents'
import logger from '@/services/logger'

const STORE_NAME = "controls"
let store

const DEVICE_ICONS = {
  key: 'keyboard', // keyboard
  mou: 'mouseLMB', // mouse
  vin: 'smartphone2', // vinput
  whe: 'steeringWheelCommon', // wheel
  gam: 'gamepadOld', // gamepad
  xin: 'gamepadOld', // xinput
  default: 'gamepad' // joystick and others
}

const CONTROL_ICONS = {
  xinput: {
    btn_a: "xboxA",
    btn_b: "xboxB",
    btn_x: "xboxX",
    btn_y: "xboxY",
    btn_back: "xboxView",
    btn_start: "xboxMenu",
    btn_l: "xboxLB",
    triggerl: "xboxLT",
    btn_r: "xboxRB",
    triggerr: "xboxRT",
    dpov: "xboxDDown",
    lpov: "xboxDLeft",
    rpov: "xboxDRight",
    upov: "xboxDUp",
    thumblx: "xboxXAxis",
    thumbly: "xboxYAxis",
    thumbrx: "xboxXRot",
    thumbry: "xboxYRot",
    btn_rt: "xboxRSButton",
    btn_lt: "xboxLSButton",
  },
  mouse: {
    button0: "mouseLMB",
    button1: "mouseRMB",
    button2: "mouseMMB",
    xaxis: "mouseXAxis",
    yaxis: "mouseYAxis",
    zaxis: "mouseWheel"
  }
}

// Device Ordering
const DEVICE_ORDER = [ "wheel", "joystick", "xinput", "gamepad", "mouse", "keyboard" ]



const makeStore = defineStore(STORE_NAME, () => {

  const $game = inject('$game')

  const
    actions = ref([]),
    categories = ref({}),
    categoriesList = ref([]),
    bindings = ref([]),
    bindingsUniqueDevices = ref({}),
    bindingTemplate = ref({}),
    controllers = ref({}),
    players = ref({})

  const
    _receiveControlsData = data => (controllers.value = data, _updateDeviceNotes()),
    _receivePlayersData = data => players.value = data,
    _receiveBindingsData = _processBindingsData

  const _getBindingsData = () => lua.extensions.core_input_bindings.notifyUI("Vue controls service needs the data")

  const
    connect = (state=true) => {
      const method = state ? "on" : "off"
      $game.events[method]('ControllersChanged', _receiveControlsData)
      $game.events[method]('AssignedPlayersChanged', _receivePlayersData)
      $game.events[method]('InputBindingsChanged', _receiveBindingsData)
    },

    disconnect = () => connect(false),

    deviceIcon = deviceName => DEVICE_ICONS[(deviceName||'').slice(0,3)] || DEVICE_ICONS['default'],

    findBindingForAction = (action, devname) => {
      for (let binding of bindings.value) {
        if (devname && devname !== binding.devname) break
        let found = binding.contents.bindings.find(b => b.action == action)
        if (found) {
          let help = getBindingDetails(binding.devname, found.control, action)
          help.devName = binding.devname
          return help
        }
      }
      return undefined
    },

    getBindingDetails = (device, control, action) => {
      let
        deviceBindings = bindings.value.find(b => b.devname == device).contents.bindings,
        details = deviceBindings.find(b => b.control == control && b.action == action) || defaultBindingEntry(action, control),
        common = {
          icon: deviceIcon(device),
          title: actions.value[action].title,
          desc: actions.value[action].desc
        }
      return {
        ...bindingTemplate.value,
        ...details,
        ...common
      }
    },

    defaultBindingEntry = (action, control) => ({
      ...bindingTemplate.value,
      action,
      control
    }),

    isAxis = (device, control) => {
      let c = controllers.value[device].controls[control]
      return c && c.control_type == "axis"
    },

    deviceNames = () => bindings.value.map(b => b.devname),

    // A conflicting binding refers to the same control of the same device, and the two actions belong to the same actionMap.
    // returns an array of the conflicting bindings
    bindingConflicts = (device, control, action) => {
      let
        dev = bindings.value.find(b > b.devname == device),
        others = dev.contents.bindings.filter(b => b.control = control),
        conflicts = []
      others.forEach(binding => binding.action != action && conflicts.push({binding, resolved: false}))
      return conflicts
    },

    // Captures user input
    captureBinding = devName => {
      let
        controlCaptured = false,
        eventsRegister = {},
        d = defer(),
        capturingBinding = true

      lua.ActionMap.enableInputCommands(false) // prevent keypresses from running their bound actions (such as ESC keypress closing the entire menu when you attempt to rebind it)

      // Set up the event listener and a function to remove it
      $game.events.on('RawInputChanged', _listener)
      _captureHelper.stopListening = () => $game.events.off('RawInputChanged', _listener)

      function _listener(data) {
        if (!capturingBinding) return // Not trying to capture bindings, ignore
        if (controlCaptured) return // No business listening to incoming events

        const devName = data.devName
        if (!eventsRegister[devName]) eventsRegister[devName] = { axis: {}, button: {}, key: [null, null] }

        d.notify(eventsRegister)
        let valid = false

        // Register the received input. The control types are handled
        // separately, because different criteria apply to each one of them
        switch (data['controlType']) {
          case 'axis':
            let detectionThreshold = devName.startsWith('mouse') ? 1 : 0.5
            if (!eventsRegister[devName].axis[data.control]) {
              eventsRegister[devName].axis[data.control] = { first: data.value, last: data.value, accumulated: 0 }
            } else {
              eventsRegister[devName].axis[data.control].accumulated += Math.abs(eventsRegister[devName].axis[data.control].last - data.value) / detectionThreshold
              eventsRegister[devName].axis[data.control].last = data.value
            }
            // If we are working with axes (i.e. the axis property has been populated) we
            // should be a little strict because there will probably be noise (mouse movements
            // are a perfect example). The criterion is if there is *enough* accumulated motion
            valid = eventsRegister[devName].axis[data.control].accumulated >= 1
            break

          case 'button':
          case 'pov':
            if (!eventsRegister[devName].button[data.control]) {
              eventsRegister[devName].button[data.control] = 1
            } else {
              eventsRegister[devName].button[data.control] += 1
            }
            // Buttons are the easiest, we just have to listen to 2 events of
            // the same button (i.e. an on-off event cycle).
            valid = eventsRegister[devName].button[data.control] > 1
            break

          case 'key':
            eventsRegister[devName].key.push(data.control)
            eventsRegister[devName].key = eventsRegister[devName].key.slice(-2)

            // Keys are easy too but not as trivial as buttons, because there can be
            // key combinations. We keep track of the last two key events, if they
            // coincide (again an on-off event cycle, like the case with buttons), we
            // can assign the control.
            valid = eventsRegister[devName].key[0] == eventsRegister[devName].key[1]
            break

          default:
            console.error("Unrecognised raw input controlType: " + JSON.stringify(data))
        }

        // Want to blacklist something? Put it here!
        if (valid) {
          // No right mouse click
          if(data.devName.startsWith('mouse') && data.control == 'button1') valid = false
        }

        if (valid) {
          controlCaptured = true
          capturingBinding = false
          lua.ActionMap.enableInputCommands(true)
          data.direction = data['controlType'] == 'axis' ? Math.sign(eventsRegister[devName].axis[data.control].last - eventsRegister[devName].axis[data.control].first) : 0
          d.resolve(data)
          _captureHelper.stopListening()
        }

      }

      return d.promise

    },

    removeBinding = (device, control, action, mockSave) => {
      let deviceContents = {...bindings.value.find(b => b.devname == device).contents }
      deviceContents.bindings = [...deviceContents.bindings]
      let entryIndex = deviceContents.bindings.findIndex(b => b.control == control && b.action == action) || null
      if (!~entryIndex) return
      deviceContents.bindings.splice(entryindex, 1)
      if (mockSave) {
        let deviceIndex = bindings.value.findIndex(b => b.devname == device)
        bindings.value[deviceIndex].contents = deviceContents
      } else {
        serializeCheck(deviceContents.name) // log potential errors in computers set to non-english language
        lua.extensions.core_input_bindings.saveBindingsToDisk(deviceContents)
      }
    },

    addBinding = (device, bindingData, replace, mockSave) => {
      let deviceContents = {...bindings.value.find(b => b.devname == device).contents }
      deviceContents.bindings = [...deviceContents.bindings]
      if (replace) {
        let deprecatedIndex = deviceContents.bindings.findIndex(b => b.control == bindingData.details.control && b.action == bindingData.details.action)
        deviceContents[deprecatedIndex] = bindingData
      } else {
        serializeCheck(deviceContents.name) // log potential errors in computers set to non-english language
        lua.extensions.core_input_bindings.saveBindingsToDisk(deviceContents)
      }
    },

    isFFBBound = () => {
      for (let i = 0; i < bindings.value.length; i++) {
        let b = bindings.value[i]
        if (['key', 'mou'].includes(b.devname.slice(0, 3))) continue
        let bs = b.contents.bindings
        for (let j = 0; j < bs.length; j++) {
          if (bs[j].action === 'steering') return true
        }
      }
      return false
    },

    isFFBEnabled = () => {
      for (let i = 0; i < bindings.value.length; i++) {
        let b = bindings.value[i]
        if (b.devname.slice(0, 3) === 'xin') continue // skip xinput vibration gamepads
        let bs = b.contents.bindings
        for (let j = 0; j < bs.length; j++) {
          if (bs[j].action === 'steering' && bs[j].isForceEnabled) return true
        }
      }
      return false
    },

    isFFBCapable = () => {
      for (let controller in Object.values(controllers.value)) {
        if (controller.ffbAxes && Object.keys(controller.ffbAxes).length) return true
      }
      return false
    },

    isWheelFound = vendorId => {
      for (let b of bindings.value) {
        if (b.devname.slice(0, 3) === 'whe') {
          let vid = b.contents.vidpid.slice(4,8)
          if (vid == vendorId) return true
        }
      }
      return false
    },

    isPidVidFound = (desiredVid, desiredPid) => {
      for (let b of bindings.value) {
        const vid = desiredVid === undefined ? desiredVid : b.contents.vidpid.slice(4,8)
        const pid = desiredPid === undefined ? desiredPid : b.contents.vidpid.slice(0,4)
        const vidFound = vid == desiredVid
        const pidFound = pid == desiredPid
        if (vidFound && pidFound) return true
      }
      return false
    }

  const _captureHelper = { devName:null, stopListening: null }

  function _updateDeviceNotes() {
    ////// ** TODO ** Check the above is doing same as this original
    Object.values(bindings.value).forEach(({contents: bindingContents}) => {
      for (let id in controllers.value) {
        let controller = controllers.value[id]
        if (bindingContents.vidpid == controller.vidpid) {
          controller.notes = bindingContents.notes
          break
        }
      }
    })
  }

  let lastBindingsData = null

  function _processBindingsData(data) {

    ////// ** TODO ** Check all of this is doing same as this original (options.js:1424-)

    let newBindingsData = JSON.stringify(data)
    if (lastBindingsData == newBindingsData) return
    lastBindingsData = newBindingsData

    // sometimes bindings[deviceIndex].contents.bindings is an object instead of an array!
    // should be fixed, but let's cover this up until then.
    // NOTE: This is really REALLY bad.
    data.bindings && data.bindings.length && data.bindings.forEach(binding => {
      if (!Array.isArray(binding.contents.bindings)) {
        console.log('Converting bindings content to an array')
        binding.contents.bindings = Object.values(binding.contents.bindings)
      }
    })

    categories.value = data.actionCategories
    bindingTemplate.value = data.bindingTemplate
    bindings.value = data.bindings

    if (!Array.isArray(bindings.value)) logger.debug("Bindings are weird! : ", bindings.value)

    if (!(data.actionCategories && data.bindingTemplate && data.bindings)) {
      logger.debug("Did not receive bindings data. Timing issue?")
      return
    }

    // remove bindings from same-type devices. this avoids displaying an XBOX gamepad binding 4 times when you connect 4 gamepads
    let uniqueDevices = {}
    data.bindings.forEach(binding => {
      let v = binding.contents
      let type = ["mouse", "keyboard"].includes(v.devicetype) ? v.devicetype : v.vidpid.toLowerCase()
      uniqueDevices[type] = binding
    })
    bindingsUniqueDevices.value = uniqueDevices

    // order the devices, so we display e.g. gamepad bindings rather than keyboard bindings, if both kinds of devices are plugged
    bindings.value = bindings.value.sort((a, b) => {
      // first get devicetype from device name (remove trailing numbers, xinput4 --> xinput)
      let dt1 = a.devname.replace(/\d+$/, '')
      let dt2 = b.devname.replace(/\d+$/, '')
      return DEVICE_ORDER.indexOf(dt1) - DEVICE_ORDER.indexOf(dt2)
    })


    // Normally, the key in data actions is the action name. However, in vehicle specific
    // bindings, the key is of the form {vehicle}__actionName, so get the actionName field
    // from the object to be sure.
    let acts = {}
    for (let act in data.actions) acts[act] = { actionName: act, ...data.actions[act] }
    actions.value = acts

    data.bindings.forEach((binding, i) => bindings.value[i].icon = deviceIcon(binding.devname))
    // This doesn't do anything? no uniquedevices come from Lua?
    // data.bindingsUniqueDevices.forEach((binding, i) => bindingsUniqueDevices.value[i].icon = deviceIcon(binding.devname))

    // Refactor categories and actions
    for (let cat in categories.value) {
      if (typeof categories.value[cat] === "object") categories.value[cat].actions = []
    }
    for (let act in actions.value) {
      let obj = { key: act, ...actions.value[act] }
      if (!actions.value[act].cat in categories.value) {
        categories.value[actions.value[act].cat] = {
          "order": 99,
          "icon": "symbol_exclamation",
          "title": "UNDEFINED CATEGORY: " + actions.value[act].cat,
          "desc": "",
          "actions": []
        }
      }
      categories.value[actions.value[act].cat].actions.push(obj)
    }

    categoriesList.value = []
    Object.entries(categories.value).forEach(([catName, cat]) => categoriesList.value.push({
      key: catName, ...cat
    }))

    // Translations
    for (let x in categoriesList.value) {
      for (let y in categoriesList.value[x].actions) {
        categoriesList.value[x].actions[y].titleTranslated = $translate.instant(categoriesList.value[x].actions[y].title)
        categoriesList.value[x].actions[y].descTranslated = $translate.instant(categoriesList.value[x].actions[y].desc)
        for (let z in categoriesList.value[x].actions[y].tags) {
          if (!categoriesList.value[x].actions[y].tagsTranslated) {
            categoriesList.value[x].actions[y].tagsTranslated = []
          }
          categoriesList.value[x].actions[y].tagsTranslated[z] = $translate.instant(categoriesList.value[x].actions[y].tags[z])
        }
      }
    }

    _updateDeviceNotes()

  }


  function makeViewerObj({deviceKey, device, action, uiEvent}) {
    if (uiEvent) action = ACTIONS_BY_UI_EVENT[uiEvent]
    let viewerObj
    if (deviceKey !== undefined) {
      viewerObj = {
        icon: deviceIcon(device),
        control: deviceKey,
        devName: device,
      }
    } else if (action !== undefined) {
      viewerObj = findBindingForAction(action, device)
    }
    if (viewerObj) {
      // convert from devname to devtype (if there's indeed custom icons for this device type)
      // e.g. "xinput3" --> "xinput"
      let devType = viewerObj.devName && Object.keys(CONTROL_ICONS).find(key => viewerObj.devName.startsWith(key))
      if (devType && CONTROL_ICONS[devType][viewerObj.control]) {
        viewerObj = {
          ...viewerObj,
          special: true,
          // probably change this to match BngIcon stuff
          ownIcon: `${CONTROL_ICONS[devType][viewerObj.control]}`,
        }
      } else {
        viewerObj.special = false
      }
    }
    return viewerObj
  }


  // Setup
  connect()
  _getBindingsData()


  return {
    connect,
    disconnect,
    deviceIcon,
    findBindingForAction,
    getBindingDetails,
    defaultBindingEntry,
    isAxis,
    deviceNames,
    bindingConflicts,
    captureBinding,
    removeBinding,
    addBinding,
    isFFBBound,
    isFFBEnabled,
    isFFBCapable,
    isWheelFound,
    isPidVidFound,
    makeViewerObj
  }

})


// ** TODO ** - possible optimisation later - connect and disconnect on demand based on number of clients (see composables example - mounted, unmounted)?
const useStore = () => store || (store = makeStore())
export default useStore
