export const BNG_DRAGGABLE_NAME = "bng-draggable",
  BNG_DRAGGABLE_GHOST_NAME = "bng-draggable-ghost"

const DRAG_START_EVENT_NAME = "bngDragStart",
  DRAG_OVER_EVENT_NAME = "bngDragOver",
  DRAG_END_EVENT_NAME = "bngDragEnd"

export const DRAG_EVENTS = Object.freeze({
  dragStart: DRAG_START_EVENT_NAME,
  dragOver: DRAG_OVER_EVENT_NAME,
  dragEnd: DRAG_END_EVENT_NAME,
})

function onMouseDown(el, binding, event) {
  el._dragstarted = true
  el.dispatchEvent(
    new CustomEvent(DRAG_EVENTS.dragStart, {
      detail: {
        pointer: { x: event.clientX, y: event.clientY },
        el: el,
      },
      bubbles: true,
      cancelable: true,
    })
  )
}

function onMouseUp(el, binding, event) {
  if (el._dragging === true) {
    el.dispatchEvent(
      new CustomEvent(DRAG_EVENTS.dragEnd, {
        detail: {
          pointer: { x: event.clientX, y: event.clientY },
          el: el,
          ghostEl: getGhostElement(),
        },
        bubbles: true,
        cancelable: true,
      })
    )
    removeGhostElement()
  }

  el._dragstarted = false
  el._dragging = false
}

function onMouseMove(el, binding, event) {
  if (el._dragstarted !== true) return

  el._dragging = true

  let ghostEl = getGhostElement()
  if (!ghostEl) ghostEl = createGhostElement(el)

  el.dispatchEvent(
    new CustomEvent(DRAG_EVENTS.dragOver, {
      detail: {
        pointer: { x: event.clientX, y: event.clientY },
        el: el,
        ghostEl: ghostEl,
      },
      bubbles: true,
      cancelable: true,
    })
  )

  if (ghostEl) {
    requestAnimationFrame(() => {
      const x = event.clientX - ghostEl.offsetLeft
      const y = event.clientY - ghostEl.offsetTop
      // const centerX = x - ghostEl.offsetWidth / 2
      // const centerY = y - ghostEl.offsetHeight / 2
      const offset = 8
      const offsetX = x - offset
      const offsetY = y - offset
      ghostEl.style.left = event.clientX - ghostEl.offsetWidth / 2 + "px"
      ghostEl.style.top = event.clientY - ghostEl.offsetHeight / 2 + "px"
      // ghostEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    })
  }
}

export default {
  mounted(el, binding, vnode, prevVnode) {
    if (binding.value === false) return

    setupDraggable(el, binding)
  },
  updated(el, binding, vnode, prevVnode) {
    el._dragstarted = false
    el._dragging = false

    // Previously enabled and current disabled
    if (binding.value === false && binding.oldValue !== false) {
      teardownDraggable(el, binding)
    }
    // Previously disabled and currently enabled
    if (binding.value !== false && binding.oldValue === false) {
      setupDraggable(el, binding)
    }
  },
  beforeUnmount(el, binding, vnode, prevVnode) {
    teardownDraggable(el, binding)
  },
  unmounted(el, binding, vnode, prevVnode) {},
}

function setupDraggable(el, binding) {
  el.setAttribute(BNG_DRAGGABLE_NAME, "")

  el._dragging = false
  el._mousedownCallback = e => onMouseDown(el, binding, e)
  el._mouseupCallback = e => onMouseUp(el, binding, e)
  el._mousemoveCallback = e => onMouseMove(el, binding, e)
  el.addEventListener("mousedown", el._mousedownCallback)
  document.addEventListener("mouseup", el._mouseupCallback)
  document.addEventListener("mousemove", el._mousemoveCallback)
}

function teardownDraggable(el, binding) {
  el.removeAttribute(BNG_DRAGGABLE_NAME)

  const ghostEl = getGhostElement()
  if (ghostEl) ghostEl.remove()

  if (el._mousedownCallback) {
    el.removeEventListener("mousedown", el._mousedownCallback)
  }

  if (el._mouseupCallback) {
    document.removeEventListener("mouseup", el._mouseupCallback)
  }

  if (el._mousemoveCallback) {
    document.removeEventListener("mousemove", el._mousemoveCallback)
  }
}

function createGhostElement(el) {
  const ghostElement = el.cloneNode(false)
  ghostElement.style.left = el.offsetLeft + "px"
  ghostElement.style.top = el.offsetTop + "px"
  // ghostElement.style.width = el.offsetWidth + "px"
  // ghostElement.style.height = el.offsetHeight + "px"
  ghostElement.style.setProperty("--width", el.offsetWidth + "px")
  ghostElement.style.setProperty("--height", el.offsetHeight + "px")

  ghostElement.setAttribute(BNG_DRAGGABLE_GHOST_NAME, "")
  ghostElement.removeAttribute(BNG_DRAGGABLE_NAME)

  getRoot().appendChild(ghostElement)

  console.log("ghost", ghostElement)

  return ghostElement
}

function removeGhostElement() {
  const ghostEl = getGhostElement()
  if (ghostEl) ghostEl.remove()
}

const getGhostElement = () => getRoot().querySelector(`[${BNG_DRAGGABLE_GHOST_NAME}]`)
const getRoot = () => document.getElementById("vue-app").getElementsByClassName("vue-app-main")[0]
