import { vBngOnUiNav, vBngClick } from "@/common/directives"
import { UI_EVENTS } from "@/bridge/libs/UINavEvents.js"

const DIRECTIONS = {
  horizontal: {
    [UI_EVENTS.focus_l]: -1,
    [UI_EVENTS.focus_r]: 1,
  },
  vertical: {
    [UI_EVENTS.focus_d]: -1,
    [UI_EVENTS.focus_u]: 1,
  },
}

const HOLD_DELAY = 400
const REPEAT_INTERVAL = 100

const ELEMENT_FLAG = "__BNG_ONUINAVFOCUS"

/**
 * Convenience directive to bind on navigation focus move (discrete) events sent.
 *
 * Arguments:
 *  "horizontal" (default) - will bind to focus_l and focus_r events
 *  "vertical"             - will bind to focus_d and focus_u events
 *
 * Modifiers:
 *  "repeat"               - will repeat the callback after a short delay
 *
 * Value (function):
 *  callback(direction)    - callback with one integer argument (-1 or 1)
 *
 * Value (object):
 *  {
 *   direction             - binding direction (same as Argument; ignored if `events` are specified)
 *   events                - object with events to bind to, for example { focus_l: -1, focus_r: 1, }
 *   repeat                - callback repeat
 *   holdDelay             - delay before repeating will start
 *   repeatInterval        - how often repeat will occur
 *   min                   - minimum value (default: -Infinity)
 *   max                   - maximum value (default: Infinity)
 *   step                  - step (default: 1)
 *   value                 - function that will fetch the current value - this will enable calculation
 *   callback(dir, val)    - callback with one integer argument (-1 or 1) and resulting value
 *  }
 *
 * @example
 *  // the most basic use case
 *  <input v-bng-on-ui-nav-focus="dir => num += dir" v-model.number="num" ... />
 *
 *  const num = ref(0)
 *
 * @example
 *  // handle all step and range calculations
 *  <input v-bng-on-ui-nav-focus="{ callback: (dir, val) => num = val, value: () => num, min: -10, max: 10, step: 1 }" v-model.number="num" ... />
 *
 *  const num = ref(0)
 *
 * @example
 *  <input v-bng-on-ui-nav-focus:horizontal.repeat="change" v-model.number="num" ... />
 *
 *  const num = ref(0)
 *  function change(dir) {
 *    num.value += dir
 *  }
 *
 * @example
 *  // Without using this directive it will be like this
 *  // and will require to parse the event sent to `change` function
 *  <input
 *   v-bng-on-ui-nav:focus_l,focus_r.focusRequired.asMouse
 *   v-bng-click="{ clickCallback: change, holdCallback: change, holdDelay: 400, repeatInterval: 100 }"
 *   ...
 *  />
 */
export default {
  mounted: (element, binding, vnode) => {
    if (!binding.value) return

    const opts = {
      direction: binding.arg || "horizontal",
      repeat: !!binding.modifiers.repeat,
      holdDelay: HOLD_DELAY,
      repeatInterval: REPEAT_INTERVAL,
      min: -Infinity,
      max: Infinity,
      step: 1,
      value: null,
      callback: null,
      ...(typeof binding.value === "object" ? binding.value : typeof binding.value === "function" ? { callback: binding.value } : {}),
    }
    !opts.events && (opts.events = DIRECTIONS[opts.direction])

    function process(evt) {
      const detail = evt.fromController || evt.detail
      if (!detail || !(detail.name in opts.events)) return
      let dir = opts.events[detail.name]
      let val = undefined

      if (typeof opts.value === "function") {
        const cur = opts.value()
        // apply
        let res = cur + opts.step * dir
        // bounds
        if (dir < 0 && res < opts.min) {
          res = opts.min
        } else if (dir > 0 && res > opts.max) {
          res = opts.max
        }
        // floating point error fix
        const precision = 10 ** (opts.step.toString() + ".").split(/[.,]/)[1].length
        if (precision > 0) {
          res = Math.round(res * precision) / precision
        } else {
          res = Math.round(res)
        }
        // check and finalise
        if (cur !== res) {
          val = res
        } else {
          dir = 0
        }
      }

      dir && opts.callback && opts.callback(dir, val)
    }

    const dirUINav = {
      //v-bng-on-ui-nav:focus_l,focus_r.focusRequired.asMouse
      arg: Object.keys(opts.events).join(","),
      modifiers: {
        focusRequired: true,
        asMouse: true,
      },
    }

    const dirClick = {
      // v-bng-click="navEventOpts"
      value: {
        clickCallback: process,
        holdCallback: opts.repeat ? process : undefined,
        holdDelay: HOLD_DELAY,
        repeatInterval: REPEAT_INTERVAL,
      },
    }

    vBngOnUiNav(element, dirUINav, vnode)
    vBngClick.mounted(element, dirClick, vnode)

    element[ELEMENT_FLAG] = true
  },

  beforeUnmount: element => {
    element[ELEMENT_FLAG] && vBngClick.beforeUnmount(element)
  },
}
