// uiNavHandlers - functions for creating and managing handlers for UINav events

import { DOM_UI_NAVIGATION_EVENT } from '@/bridge/libs/UINavEvents'

const VALUE_BASED_EVENTS = [
  'zoom_out',
  'zoom_in',
  'subtab_l',
  'subtab_r',
  'move_ud',
  'move_lr',
  'focus_ud',
  'focus_lr',
  'rotate_h_cam',
  'rotate_v_cam'
]

/**
 * Add a UINav handler to a DOM Element.
 *
 * @param      {object}         domElement                The dom element
 * @param      {string|object}  uiNavHandlerOrDescriptor  Existing UINav handler (previously created by 'create', or a descriptor for creating a new one
 * @param      {function}       [handler=undefined]       Handler function (if creating a new UINav handler)
 * @return     {function}       The UINav handler that was added
 */
const add = (domElement, uiNavHandlerOrDescriptor, handler=undefined) => {
  // use the passed uiNavHandler, or build one using descriptor and handler
  let uiNavHandler = handler ? create(uiNavHandlerOrDescriptor, handler) : uiNavHandlerOrDescriptor
  domElement.addEventListener(DOM_UI_NAVIGATION_EVENT, uiNavHandler)
  return uiNavHandler
}


/**
 * Create a new UINav handler function.
 *
 * @param      {string|object}  eventDescriptor         The event descriptor (see _normaliseEventDescriptor)
 * @param      {function}       handler                 The handler
 * @return     {function}       Newly created UINav handler function
 */
const create = (eventDescriptor, handler) => {
  let descriptor
  if (!(descriptor = _normaliseEventDescriptor(eventDescriptor))) {
    throw new Error('Invalid event descriptor when trying to create a UINav handler. Expecting a String or an Object.')
  }

  let disabled = false
  const handlerFuncName = (handler && handler.name) || `uiNav_${_descriptorEventNameText(descriptor)}_Handler`

  // For dynamic naming of the UINav handler function (good for stack traces)
  const _ = {
    [handlerFuncName]: function (e) {
      const evData = e.detail || {}
      if (disabled || !_eventMatchesDescriptor(evData, descriptor)) return
      let result = handler(e)
      !result && e.stopPropagation() // propagation stops here unless told otherwise
      return result
    }
  }

  // UI Nav handlers can be instantly enabled/disabled using the 'disabled' property
  Object.defineProperty(_[handlerFuncName], 'disabled', {
    configurable: false,
    get: () => disabled,
    set: state => disabled = state
  })

  return _[handlerFuncName]
}

/**
 * Return a textual label for the 'name' part of a descriptor
 *
 * @param      {object}  descriptor  The descriptor
 * @return     {string}  Label for the 'name' part
 */
const _descriptorEventNameText = descriptor => {
  if (!descriptor.name) return 'ALL'
  if (typeof descriptor.name === 'function') return descriptor.name.name
  return descriptor.name
}


/**
 * Remove passed UINav handler from the element.
 *
 * @param      {object}  domElement    The dom element
 * @param      {function}  uiNavHandler  The navigation handler
 */
const remove = (domElement, uiNavHandler) => {
  domElement.removeEventListener(DOM_UI_NAVIGATION_EVENT, uiNavHandler)
}


/**
 * Normalise an event descriptor.
 * 
 * If a string, check for a simple event with that name (an on/down event in the case of a simple on/off type event)
 * If an object, fill a sensible default for value if it is missing (similar to string above)
 * 
 * Examples:
 *  'ok' - simple string - will normalise to checking for 'ok' event with an 'on' value (truthy)
 *  {name:'ok'} - will be same as string above
 *  {name:'ok', modified:true} - object with missing 'value' - will check for a modified 'ok' event with an 'on' value
 *  {name:'ok', value:undefined} - object with 'value' present but undefined - will check for an 'ok' event with any value
 *
 * @param      {string|object}  eventDescriptor  The event descriptor
 */
const _normaliseEventDescriptor = eventDescriptor => ({
  string: {name: eventDescriptor, value: _isOnOffEvent(eventDescriptor) ? _checkOn : undefined, modified: false, extras: undefined },
  object: {...eventDescriptor, value: eventDescriptor.hasOwnProperty('value') ?  eventDescriptor.value : (_isOnOffEvent(eventDescriptor.name) ? _checkOn : undefined) }
}[typeof eventDescriptor] || false)


/**
 * Determines whether the specified event type is an on/off event.
 *
 * @param      {string}   eventName  The event name
 * @return     {boolean}  True if the specified event descriptor is an on/off event, False otherwise.
 */
const _isOnOffEvent = eventName => !VALUE_BASED_EVENTS.includes(eventName)


/**
 * Determine if the passed event data is a match for the descriptor.
 *
 * @param      {object}   eventData   The event data
 * @param      {object}   descriptor  The descriptor (must be normalised)
 * @return     {boolean}  True if matched, False otherwise
 */
const _eventMatchesDescriptor = (eventData, descriptor) => {
  for(let [item, value] of Object.entries(descriptor)) {
    if (value !== undefined) {
      if (item === "focusRequired") {
        if (value && !value.contains(document.activeElement)) return false
      } else {
        if (!eventData.hasOwnProperty(item)) return false
        if (typeof value === 'function') {
          if (!value(eventData[item])) return false
        } else if (eventData[item] != value) {
          return false
        }
      }
    }
  }
  return true
}

/**
 * Check if given value is 'on' (truthy)
 *
 * @param      {any}  v       value to check
 * @return     {any}  truthy/falsy
 */
const _checkOn = v => v


export default {
  add,
  create,
  remove
}

export { _isOnOffEvent, _checkOn }
