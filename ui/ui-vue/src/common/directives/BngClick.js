/**
 * @brief   a click directive that supports click and click-and-hold event types.
 * @description a click directive that supports click and click-and-hold event types. The parameter can either be the
 *              callback function `helloFn` or a configuration object as defined below.
 *
 * @param       {number}  holdDelay    *(optional) applicable only to **click-and-hold** event type*. Time in ms
 *                                        before registering click and hold event type. **Default value is 400.**
 * @param       {number}  repeatInterval  *(optional) applicable only to **click-and-hold** event type*. Time in ms
 *                                        between calling the **holdCallback** property. **Default value is 100.**
 * @param       {function}  clickCallback   the function to be called when **click** event type detected.
 * @param       {function}  holdCallback    the function to be called when **click-and-hold** event type is detected.
 *
 * @example
 *    `v-bng-click="helloFn"` for **click** event.
 * @example
 *    `v-bng-click="{clickCallback: helloFn}"` using configuration object for **click** event.
 * @example
 *    `v-bng-click.hold="hiFn"` for **click-and-hold** event.
 * @example
 *    `v-bng-click.hold="{holdCallback: hiFn, holdDelay: 400, repeatInterval: 100}"` using configuration object for **click-and-hold** event.
 * @example
 *    `v-bng-click="{clickCallback: helloFn, holdCallback: hiFn}"` for both **click** and **click-and-hold** event.
 * @example
 *    `v-bng-click="{clickCallback: helloFn, holdCallback: hiFn, holdDelay: 400, repeatInterval: 100}"` complete configuration properties.
 */

/**
 * `binding.value` but predictably formatted
 * @typedef {object} ClickBinding
 * @property {function}  [clickCallback]  Callback for click event
 * @property {function}  [holdCallback]   Callback for hold event
 * @property {number}    holdDelay        Hold delay
 * @property {number}    repeatInterval   Repeat interval
 */
/**
 * Mutable click data object
 * @typedef {object} ClickData
 * @property {number}        id           Unique ID
 * @property {HTMLElement}   element      An element
 * @property {object}        events       Events currently bound to `element`
 * @property {ClickBinding}  binding      "Fixed" source directive data from binding.value
 * @property {boolean}       hasClick     If it has click event
 * @property {boolean}       hasHold      If it has hold event
 */

const
  HOLD_ANIM_UPDATE_TIME_MS = 20,
  DEFAULT_HOLD_DELAY = 400,
  DEFAULT_REPEAT_INTERVAL = 100,
  HOLD_CSS_VAR = '--hold-completion',

  EVENT_CLICK = "click",
  EVENT_HOLD = "hold",

  ELEMENT_ID = "__BNG_CLICK_ID"

/** ID counter */
let curId = 0
/** @type {object<string,ClickData>} */
const datas = {}

/**
 * Create or update the element and data.
 * This function does the source data processing.
 * @param {HTMLElement} element An element
 * @param {*} binding Directive data
 * @returns {ClickData} Mutable click data object
 */
function update(element, binding) {
  const id = element[ELEMENT_ID] || (element[ELEMENT_ID] = ++curId)
  const data = datas[id] || (datas[id] = { id, element, events: {}, binding: {} })

  // "fix" binding.value into data.binding
  if (typeof binding.value === "object") {
    data.binding = binding.value
  } else if (typeof binding.value === "function") {
    // choose what event it is by checking arg
    const cbName = binding.arg && binding.arg === EVENT_HOLD ? "holdCallback" : "clickCallback"
    data.binding[cbName] = binding.value
  }

  data.hasClick = typeof data.binding.clickCallback === "function"
  data.hasHold = typeof data.binding.holdCallback === "function"

  // if no arg is specified, this timeout is used to determine the type of click interaction - click(normal) or hold
  if (typeof data.binding.holdDelay !== "number")
    data.binding.holdDelay = DEFAULT_HOLD_DELAY

  // applicable to 'hold' arg only
  if (typeof data.binding.repeatInterval !== "number")
    data.binding.repeatInterval = DEFAULT_REPEAT_INTERVAL

  return data
}

/**
 * Removes the data and unbinds its events.
 * @param {HTMLElement} element An element
 */
function remove(element) {
  const data = element[ELEMENT_ID]
  if (!data)
    return
  // remove events
  updateEvents(data.id)
  // forget this element
  delete datas[data.id]
  delete element[ELEMENT_ID]
}

/**
 * Replaces or removes events on an element.
 * @param {number} id Data ID
 * @param {object} [events] New events to replace old ones with
 */
function updateEvents(id, events = {}) {
  const data = datas[id]
  if (!data)
    return
  // remove previous events
  for (const event in data.events)
    data.element.removeEventListener(event, data.events[event])
  // add new events if any
  for (const event in events)
    data.element.addEventListener(event, events[event])
  data.events = events
}


export default {

  mounted: (el, binding) => {

    const data = update(el, binding)

    updateEvents(data.id, {
      mousedown: e => {
        // set default event to 'click' if allowed
        if (canInvokeEventType(EVENT_CLICK))
          detectedEventType = EVENT_CLICK
        if (data.hasHold)
          startHoldDelayTimer()
      },
      mouseup: e => {
        stopHoldDelayTimer()
        switch (detectedEventType) {
          case EVENT_CLICK:
            doAction(EVENT_CLICK)
            break
          case EVENT_HOLD:
            stopHoldTimer()
            break
        }
        detectedEventType = null
      },
      mouseleave: e => {
        stopHoldDelayTimer()
        switch (detectedEventType) {
          case EVENT_HOLD:
            stopHoldTimer()
            break
        }
        detectedEventType = null
      },
    })

    let detectedEventType
    let holdDelayTimer

    let holdDelayCompletion = 0
    let holdDelayCompletionStep
    let holdDelayCompletionTimer

    let holdTimer

    function startHoldDelayTimer() {
      holdDelayCompletionStep = 100 * HOLD_ANIM_UPDATE_TIME_MS / data.binding.holdDelay
      holdDelayCompletionTimer = setInterval(updateHoldDelayCompletion, HOLD_ANIM_UPDATE_TIME_MS)
      holdDelayTimer = setTimeout(() => {
        detectedEventType = EVENT_HOLD
        startHoldTimer()
      }, data.binding.holdDelay)
    }

    function stopHoldDelayTimer() {
      holdDelayCompletionTimer && clearInterval(holdDelayCompletionTimer)
      updateHoldDelayCompletion(0)
      if (holdDelayTimer) {
        clearTimeout(holdDelayTimer)
        holdDelayTimer = null
      }
    }

    function updateHoldDelayCompletion(value = undefined) {
      if (value == undefined) {
        holdDelayCompletion += holdDelayCompletionStep
      } else {
        holdDelayCompletion = value
      }
      el.style.setProperty(HOLD_CSS_VAR, holdDelayCompletion + "%")
    }

    function startHoldTimer() {
      clearInterval(holdDelayCompletionTimer)
      updateHoldDelayCompletion()
      doAction(EVENT_HOLD)
      if (data.binding.repeatInterval) {
        holdTimer = setInterval(() => {
          doAction(EVENT_HOLD)
        }, data.binding.repeatInterval)
      }
    }

    function stopHoldTimer() {
      if (holdTimer) {
        clearInterval(holdTimer)
        holdTimer = null
      }
    }

    function doAction(eventType) {
      const callback = getCallback(eventType)
      if (eventType == EVENT_HOLD && holdDelayCompletion < 100) updateHoldDelayCompletion(100)
      if (callback) eventType == EVENT_HOLD ? setTimeout(callback, 100) : callback()
    }

    function getCallback(arg) {
      switch (arg) {
        case EVENT_CLICK:
          return data.binding.clickCallback
        case EVENT_HOLD:
          return data.binding.holdCallback
      }
      return null
    }

    function canInvokeEventType(eventType) {
      switch (eventType) {
        case EVENT_CLICK:
          return data.hasClick
        case EVENT_HOLD:
          return data.hasHold
      }
      return false
    }
  },

  updated: update,
  beforeUnmount: remove,
}
