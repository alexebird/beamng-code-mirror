// Useful DOM utilities
function isRef(r) {
  return !!(r && r.__v_isRef === true)
}

export const isVisibleFast = node => node.offsetWidth && node.offsetHeight

export function isVisible(node, _style = null) {
  let tmp = node
  if (!_style) _style = document.defaultView.getComputedStyle(tmp, null)
  while (tmp.tagName !== "HTML") {
    if (!tmp.isConnected || tmp.nodeType !== Node.ELEMENT_NODE) return false
    _style = document.defaultView.getComputedStyle(tmp, null)
    if (_style.display === "none" || _style.visibility === "hidden" || _style.opacity === "0") return false
    tmp = tmp.parentNode
  }
  return true
}

export function isOccluded(element, rect, dontIgnoreOffscreen) {
  // returns true only when element is on viewport AND other HTML element is occluding it on screen (preventing user from seeing/clicking it)
  // "dontIgnoreOffscreen" - if we should not assume it's visible (not occluded) when offscreen
  const x = (rect.left + rect.right) / 2,
    y = (rect.top + rect.bottom) / 2
  const topElement = document.elementFromPoint(x, y)
  if (!topElement)
    // outside viewport
    return !!dontIgnoreOffscreen
  let tmp = topElement
  while (tmp.tagName !== "HTML") {
    // check if we clicked on our desired element, or any of its ancestors
    if (tmp == element) return false
    if (tmp.tagName === "MD-TOOLTIP" || tmp.noOcclude)
      // nasty tooltips...
      return false
    tmp = tmp.parentNode
  }
  return true
}

export function dispatchKey(key, elem=window.document) {
  // key should be ther number of the keycode one wants to dispatch
  if (typeof key !== 'number') {
    throw new Error('Invalid key')
  }

  // Default to document
  let target = elem || document

  // actual event to be dipatched
  let ev = document.createEvent('KeyboardEvent')

  // Hack Idea from: http://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key/10520017#10520017
  // Basically what this does is it overwrites the inhereted in cef buggy and not working property keyCode
  Object.defineProperty(ev, 'keyCode', {
    get : function() {
      return this.keyCodeVal
    }
  })

  // Also tested with keypress, but apparently that does not work in cef for arrow keys but only most other ones
  ev.initKeyboardEvent('keydown', true, true)

  // Used for the getter of the keyCode property
  // Stored as ownproperty so the function execution does not leave an open closure
  ev.keyCodeVal = key

  // Dispatch keypress and return if it worked
  return target.dispatchEvent(ev)
}


export const eventDispatcherForElement = element => (type, extras = {}) => (isRef(element) ? element.value : element).dispatchEvent(Object.assign(new Event(type), extras))
