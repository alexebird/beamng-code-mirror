// expose available styles for intellisense

export function getPopupWrapperDefaults() {
  return {
    fade: true,
    blur: true,
    style: [popupContainer.default],
  }
}

export function getActivityWrapperDefaults() {
  return {
    fade: false,
    blur: false,
    style: [popupContainer.clickthrough],
  }
}

/**
 * Popup container style
 */
export const popupContainer = Object.freeze({
  // container-style-...
  default: "default",
  transparent: "transparent",
  clickthrough: "clickthrough",
})

/**
 * Popup position
 */
export const popupPosition = Object.freeze({
  // content-position-...
  default: "center",
  top: "top",
  left: "left",
  right: "right",
  bottom: "bottom",
  center: "center",
  fullscreen: "fullscreen",
})
