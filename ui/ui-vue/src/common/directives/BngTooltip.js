/**
 * @brief BngTooltip
 * @description a directive that adds a tooltip to an element
 * @usage `v-bng-tooltip:top="top text"`
 * @usage `v-bng-tooltip:left="left text"`
 * @usage `v-bng-tooltip:right="right text"`
 * @usage `v-bng-tooltip:bottom="bottom text"`
 * @usage `v-bng-tooltip:top="{'text': 'tooltip text', hideDelay: 500}"
 */

import { createPopper } from "@popperjs/core"

const TOOLTIP_CLASS = "bng-tooltip"
const showTooltipEvents = ["mouseover", "focus"]
const hideTooltipEvents = ["mouseout", "blur"]

export default {
  mounted(el, binding) {
    setupBinding(el, binding)

    showTooltipEvents.forEach(eventName => el.addEventListener(eventName, handleMouseOver))
    hideTooltipEvents.forEach(eventName => el.addEventListener(eventName, handleMouseOut))
  },
  updated(el, binding) {
    setupBinding(el, binding)

    if (el.__tooltipText && el.__tooltip) {
      el.__tooltip.querySelector(".text").textContent = el.__tooltipText
      el.__popperInstance.update()
    } else if (!el.__tooltipText && el.__tooltip) {
      cleanup(el)
    }
  },
  beforeUnmount(el, binding, vnode, prevVnode) {
    showTooltipEvents.forEach(eventName => el.removeEventListener(eventName, handleMouseOver))
    hideTooltipEvents.forEach(eventName => el.removeEventListener(eventName, handleMouseOut))
  },
  unmounted(el, binding, vnode, prevVnode) {
    cleanup(el)
  },
}

function setupBinding(el, binding) {
  el.__tooltipText = typeof binding.value === "object" && binding.value ? binding.value.text : binding.value
  el.__tooltipPosition = binding.arg || "top"
  el.__tooltipHideDelay = typeof binding.value === "object" && binding.value && binding.value.hideDelay ? binding.value.hideDelay : 0
}

function handleMouseOver(event) {
  if (this.__tooltip) return

  if (this.__tooltipText && this.__tooltipDelayTimer) {
    clearTimeout(this.__tooltipDelayTimer)
    this.__tooltipDelayTimer = null
  } else if (this.__tooltipText) {
    createTooltip(this)
  }
}

function handleMouseOut(event) {
  const el = this
  if (this.__tooltipHideDelay > 0) {
    this.__tooltipDelayTimer = setTimeout(() => {
      removeTooltip(el)
    }, this.__tooltipHideDelay)
  } else {
    removeTooltip(el)
  }
}

const getRoot = () => document.getElementById("vue-app").getElementsByClassName("vue-app-main")[0]

function createTooltip(el) {
  const tooltip = document.createElement("div")
  tooltip.classList.add(TOOLTIP_CLASS)
  tooltip.noOcclude = true

  const text = document.createElement("span")
  text.classList.add("text")
  text.textContent = el.__tooltipText
  text.noOcclude = true
  tooltip.appendChild(text)

  const arrow = document.createElement("span")
  arrow.classList.add("arrow")
  arrow.setAttribute("data-popper-arrow", "")
  arrow.noOcclude = true
  tooltip.appendChild(arrow)

  el.__popperInstance = createPopper(el, tooltip, {
    placement: el.__tooltipPosition || "top",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
      {
        name: "preventOverflow",
        options: {
          element: "document",
        },
      },
    ],
  })
  el.__tooltip = tooltip

  getRoot().appendChild(tooltip)
}

function removeTooltip(el) {
  if (el.__tooltip) {
    el.__tooltip.remove()
    el.__tooltip = null
  }

  if (el.__popperInstance) {
    el.__popperInstance.destroy()
    el.__popperInstance = null
  }

  if (el.__tooltipDelayTimer) {
    clearTimeout(el.__tooltipDelayTimer)
    el.__tooltipDelayTimer = null
  }
}

function cleanup(el) {
  removeTooltip(el)
  el.__tooltipText = null
  el.__tooltipPosition = null
}
