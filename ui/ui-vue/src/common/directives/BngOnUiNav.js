// BngOnUiNav Directive - for adding/removing UINav handlers to dom handlers
import { default as UINavHandlers, _isOnOffEvent, _checkOn } from "@/services/uiNavHandlers"
import { UI_SCOPE_ATTR } from "@/bridge/libs/UINavEvents"
import { eventDispatcherForElement } from "@/utils/DOM"


const UINAV_HANDLER_PROP_PREFIX = "___uiNavHandler"
const UINAV_ELEMENT_ID_PROP = "___uiNavID"
const UINAV_MOUSEDOWN_MARKER_PROP = "___ui_nav_mousedown"

/**
 * HTML attribute used to inform the element if it has a UI Event handler attached (the name of the event is stored)
 *
 * The attribute can be used in conjunction with the `watchUINavEventChange` composable from the UINav service to watch for changes
 */
const UINAV_EVENT_ATTR = "ui-nav-event"

const isOnOffEventOrEvents = eventNameOrNames => eventNameOrNames? !(eventNameOrNames.split(",").find(name => !_isOnOffEvent(name))) : false

let UINavElementCounter = 0

export default (element, { arg: eventNameOrNames, value: handler, modifiers }, vnode) => {

  const handlerPropertyName = _makeHandlerPropertyName(element, eventNameOrNames, modifiers)

  const allOnOffEvents = isOnOffEventOrEvents(eventNameOrNames)

  // work out on which element the handler function will be placed
  const handlerElement = _getHandlerElement(element)

  // remove old handler if there is one
  if (_isUINavHandler(element[handlerPropertyName])) {
    UINavHandlers.remove(handlerElement, element[handlerPropertyName])
    element.removeAttribute(UINAV_EVENT_ATTR)
    delete element[handlerPropertyName]
  }


  // 'asMouse' modifier handling - will emulate click, mouseup and mousedown if component supports it and event is on/off type
  if (modifiers.asMouse) {
    // const eventFirer = vnode.el.__vueParentComponent.exposed && vnode.el.__vueParentComponent.exposed.fireEvent
    //const eventFirer = vnode.ctx.exposed && vnode.ctx.exposed.fireEvent
    const eventFirer = _getEventFirer(vnode)
    const checkElementDisabled = _getDisabledChecker(vnode)
    // get and check for 'fireEvent' and make sure we have an on/off event
    if (!allOnOffEvents) {
      console.error("UINav directive 'asMouse' modifier is only supported for on/off type events")
      return
    }
    // up and down modifiers not applicable with .asMouse
    delete modifiers.down
    delete modifiers.up
    handler = ({detail}) => {
      if (checkElementDisabled()) return
      const fromControllerMarker = { fromController: detail }
      if (detail.value) {
        eventFirer('mousedown', fromControllerMarker)
        element[UINAV_MOUSEDOWN_MARKER_PROP] = true
      } else {
        eventFirer('mouseup', fromControllerMarker)
        if (element[UINAV_MOUSEDOWN_MARKER_PROP]) {
          element[UINAV_MOUSEDOWN_MARKER_PROP] = false
          eventFirer('click', fromControllerMarker)
        }
      }
    }
  }

  // put in the correct 'value' checker
  let valueChecker
  if (modifiers.down) {
    // button 'down'
    valueChecker = _checkOn // anything non-zero
  } else if (modifiers.up) {
    // button 'up'
    valueChecker = 0
  } else if (allOnOffEvents && !modifiers.asMouse) {
    // no modifier specified, but it's an on-off event(s), so assume 'down'
    valueChecker = _checkOn
  }

  // allow comma separated list of event names
  let combinedEventName
  if (eventNameOrNames.includes(",")) {
    eventNameOrNames = eventNameOrNames.split(",")
    combinedEventName = eventNameOrNames.join("_")
  }

  // * is the same as all event names
  if (eventNameOrNames == "*") eventNameOrNames = undefined

  // Set the handler if we have a function, otherwise do nothing (effectively remove the handler if we're given anything other than a function)
  if (typeof handler === "function") {
    let descriptorName = Array.isArray(eventNameOrNames) ? { [combinedEventName]: name => eventNameOrNames.includes(name) }[combinedEventName] : eventNameOrNames
    element[handlerPropertyName] = UINavHandlers.add(
      handlerElement,
      {
        name: descriptorName,
        value: valueChecker,
        modified: modifiers.modified || false,
        focusRequired: modifiers.focusRequired ? element : undefined,
      },
      handler
    )
    if (typeof eventNameOrNames == "string") element.setAttribute(UINAV_EVENT_ATTR, eventNameOrNames)
  }
}

/** Checks if passed item is a UINavHandler function */
const _isUINavHandler = i => i && typeof i === "function" && i.hasOwnProperty("disabled")

/** Construct a name for the property that will hold the handler */
const _makeHandlerPropertyName = (element, eventName, modifiers) => {
  const modifierNames = Object.keys(modifiers).sort()
  const id = _getUINavElementId(element)
  return `${UINAV_HANDLER_PROP_PREFIX}_${eventName || "ALL"}${modifierNames.length ? "_" + modifierNames.join("_") : ""}_${id}`
}

/** Create a unique UINavElementId for the passed element, checking if it already has one first */
const _getUINavElementId = element => element[UINAV_ELEMENT_ID_PROP] || (element[UINAV_ELEMENT_ID_PROP] = ++UINavElementCounter)

/** Work out which element should carry the Nav event handler for the passed element (the surrounding UI scope element, or the element itself) */
const _getHandlerElement = element => element.closest(`[${UI_SCOPE_ATTR}]`) || element

/** Retrieve or create an eventFirer **/
const _getEventFirer = vnode => (vnode.ctx.exposed && vnode.ctx.exposed.fireEvent) || eventDispatcherForElement(vnode.el)

/** Retrieve or create a disabled checker **/
const _getDisabledChecker = vnode => (vnode.ctx.exposed && vnode.ctx.exposed.getDisabledState) || (() => vnode.el.hasAttribute("disabled"))
