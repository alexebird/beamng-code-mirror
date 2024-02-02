// Popup service
// See the list of available popup commands at the bottom

import { reactive, computed, markRaw } from "vue"

import { popupContainer, popupPosition, getPopupWrapperDefaults, getActivityWrapperDefaults } from "@/modules/popup/options"
export { popupContainer, popupPosition } // for convenience

// get available popup base components
import components from "./popup-components"

// popups amount that will be presented at the same time
// this affects performance when too many are shown and we don't know how complex they can be
const popupLimit = 5
const activityLimit = 3

// counter to give an id
let count = -1

/**
 * @typedef PopupItem
 * @type {object}
 * @prop {number} id Internal id
 * @prop {boolean} active If this popup is currently active
 * @prop {PopupType} type Type of the popup
 * @prop {*} component Base component
 * @prop {object} props Component props
 * @prop {Array<string>} position Popup position
 * @prop {object} wrapper Wrapper properties
 * @prop {boolean} wrapper.fade If all other elements on the screen should fade away to a semi-transparency
 * @prop {boolean} wrapper.blur If screen should be blurred
 * @prop {Array<string>} wrapper.style Array of style names
 * @prop {function} return Return function with optional result argument that will call `resolve`. If result is not specified, `reject` will be called instead.
 * @prop {Promise} promise Promise that will return the result value. Promise has `close([result])` method to force close the popup externally.
 * @prop {function} _resolve Promise `resolve()`
 * @prop {function} _reject Promise `reject()`
 */

/**
 * @typedef {number} PopupType
 */
/**
 * Popup type enum.
 * Number means order. Do not use duplicate values.
 * @enum {PopupType}
 */
export const PopupTypes = Object.freeze({
  /** Activity popup */
  activity: 10,
  /** Normal popup */
  normal: 100,
  /** Always on top */
  priority: 1000,
})

/**
 * All queued popups
 * @type {Array<PopupItem>}
 */
const popupsAll = reactive([])

const popupsFiltered = computed(() => popupsAll.filter(itm => itm.type >= PopupTypes.normal))
const activitiesFiltered = computed(() => popupsAll.filter(itm => itm.type < PopupTypes.normal))

/**
 * Data, used by Popup component to view the popups
 */
export const popupsView = reactive({
  /**
   * Viewed normal and priority popups, or null if there are none
   * @type {Array<PopupItem>|null}
   */
  popups: computed(() => popupsFiltered.value.length > 0 ? popupsFiltered.value.slice(-popupLimit) : null),
  /**
   * Accumulated wrapper settings to prevent blinking and such, when multiple popups are shown
   */
  popupsWrapper: computed(() => accumulateWrapper(popupsFiltered.value, getPopupWrapperDefaults())),
  /**
   * Viewed activity popups, or null if there are none
   * @type {Array<PopupItem>|null}
   */
  activities: computed(() => activitiesFiltered.value.length > 0 ? activitiesFiltered.value.slice(-activityLimit) : null),
  /**
   * Accumulated wrapper settings to prevent blinking and such, when multiple popups are shown
   */
  activitiesWrapper: computed(() => accumulateWrapper(activitiesFiltered.value, getActivityWrapperDefaults())),
})

function accumulateWrapper(popups, wrapper) {
  for (const popup of popups) {
    if (wrapper.fade !== popup.wrapper.fade)
      wrapper.fade = popup.wrapper.fade
    if (wrapper.blur !== popup.wrapper.blur)
      wrapper.blur = popup.wrapper.blur
    if (popup.wrapper.style)
      wrapper.style.push(...popup.wrapper.style)
  }
  return wrapper
}

/**
 * Adds a new popup
 * @param {object|string} componentOrName Name of the popup base component or a direct reference to the component
 * @param {object} [props={}] Properties that would go to the component
 * @param {PopupType} [type=PopupType.normal] Popup type
 * @returns {PopupItem} New popup data
 */
function addPopup(componentOrName, props = {}, type = PopupTypes.normal) {
  const component = typeof componentOrName === "string" ? components[componentOrName] : componentOrName
  if (!component) {
    throw new Error(
      `There is no popup base component named "${componentOrName}".` +
      `Available components: "${Object.keys(components).join('", "')}"`
    )
  }

  /**
   * New popup data
   * @type {PopupItem}
   */
  const popup = {
    id: ++count,
    active: false,
    type,
    component: markRaw({ ref: component }), // FIXME: there should be a better way
    props,
    position: [popupPosition.default],
    wrapper: type >= PopupTypes.normal ? getPopupWrapperDefaults() : getActivityWrapperDefaults(),
  }

  if (component.position) {
    popup.position = Array.isArray(component.position)
      ? component.position
      : [component.position]
  }
  if ("wrapper" in component) {
    if (typeof component.wrapper.fade === "boolean")
      popup.wrapper.fade = component.wrapper.fade
    if (typeof component.wrapper.blur === "boolean")
      popup.wrapper.blur = component.wrapper.blur
    if (component.wrapper.style) {
      popup.wrapper.style = Array.isArray(component.wrapper.style)
        ? component.wrapper.style
        : [component.wrapper.style]
    }
  }

  // create a promise for return and save resolve & reject for return
  popup.promise = new Promise((resolve, reject) => {
    popup._resolve = resolve
    popup._reject = reject
  })

  // create return function
  // it will treat a lack of result as an error, so reject will be called for the promise
  popup.return = result => {
    // find and remove the popup
    for (let i = 0; i < popupsAll.length; i++) {
      if (popupsAll[i].id === popup.id) {
        popupsAll.splice(i, 1)
        if (popupsAll.length > 0)
          popupsAll[popupsAll.length - 1].active = true
        break
      }
    }
    // resolve the promise
    if (typeof result !== "undefined")
      popup._resolve(result)
    else
      popup._reject()
  }

  // add to the promise for convenience in async code
  popup.promise.close = popup.return

  // append to popups, taking in account the priority
  for (let i = 0; i < popupsAll.length; i++) {
    if (popupsAll[i].type > type) {
      // put a new less prioritised popup before the first one with a higher priority
      // note: there's no need to change active flag in this case
      popupsAll.splice(i, 0, popup)
      return popup
    }
  }

  // change active flag to a new popup
  if (popupsAll.length > 0)
    popupsAll[popupsAll.length - 1].active = false
  popup.active = true
  // append
  popupsAll.push(popup)

  return popup
}


export function registerListener() {
  // TODO: register a listener for incoming events from Lua
}


// expose basic functionality for easy access
// and to deal with a possible base popup modifications

/**
 * Open a simple confirmation popup dialog with OK button only
 * @param {string} [title] Text message title
 * @param {string} message Text/HTML message
 * @returns {Promise} Result from button's value
 */
export const openMessage = (title, message) =>
  addPopup("Confirmation", { title, message, buttons: [{ label: "ui.common.okay", value: true }] }).promise

/**
 * Open a simple confirmation popup dialog
 * @param {string} [title] Text message title
 * @param {string} message Text/HTML message
 * @param {array} [buttons] Buttons, with default "OK" and "Cancel" buttons if not specified
 * @returns {Promise} Result from button's value
 */
export const openConfirmation = (title, message, buttons) =>
  addPopup("Confirmation", { title, message, buttons }).promise

/**
 * Open a simple confirmation popup dialog with OK button only
 * @param {string} [title] Text message title
 * @param {string} message Text/HTML message
 * @param {array} [buttons] Optional buttons. Default are []
 * @returns {Promise} Result from button's value
 */
export const openExperimental = (title, message, buttons = [
  { label: "ui.common.no", value: false },
  { label: "ui.common.yes", value: true },
]) =>
  addPopup("Confirmation", { title, message, buttons, appearance: "experimental" }).promise


/**
 * Open a full screen overlay view
 * @param {Object} [component] Component view to display
 * @returns 
 */
export const openScreenOverlay = (component) =>
  addPopup("ScreenOverlay", { view: markRaw(component) }, PopupTypes.activity).promise

/**
 * Recovery popup
 * @returns {Promise}
 */
export const openRecovery = () =>
  addPopup("Recovery").promise
