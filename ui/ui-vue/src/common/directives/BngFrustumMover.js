// this directive translates the view frustum a bit to make up for lost space behind side menu and alike
// use it like this: <div bng-frustum-mover="left">
// note: it does not take into account position nor parent size, so use this on containers only

import { debounce } from "@/utils/rateLimit"

const elems = new WeakMap()

let curHorizontal = 0,
  curVertical = 0

function updateGE(horizontal = 0, vertical = 0) {
  curHorizontal = horizontal
  curVertical = vertical
  bngApi.engineLua(`scenetree.OnlyGui:setFrustumCameraCenterOffset(Point2F(${horizontal}, ${vertical}))`)
}

const moveSpeed = 1.0
let smoothingUpdate

function updateGEsmooth(horizontal = 0, vertical = 0) {
  // do not use
  if (smoothingUpdate) {
    smoothingUpdate(horizontal, vertical)
    return
  }
  let dirH = 1,
    dirV = 1
  function setDir() {
    dirH = horizontal >= curHorizontal ? 1 : -1
    dirV = vertical >= curVertical ? 1 : -1
  }
  setDir()
  smoothingUpdate = (h = 0, v = 0) => {
    horizontal = h
    vertical = v
    setDir()
  }
  window.requestAnimationFrame(function (ms) {
    const speed = moveSpeed / 1000 // per ms
    let movH = curHorizontal,
      movV = curVertical,
      lastTime = ms,
      smoother = 0
    window.requestAnimationFrame(function step(ms) {
      if (curHorizontal === horizontal && curVertical === vertical) {
        smoothingUpdate = null
        return
      }
      smoother += (ms - lastTime - smoother) * 0.02
      lastTime = ms
      const moveDelta = smoother * speed
      movH += moveDelta * dirH
      movV += moveDelta * dirV
      if ((dirH > 0 && movH > horizontal) || (dirH < 0 && movH < horizontal)) movH = horizontal
      if ((dirV > 0 && movV > vertical) || (dirV < 0 && movV < vertical)) movV = vertical
      updateGE(movH, movV)
      window.requestAnimationFrame(step)
    })
  })
}

// multiplier for the resulting offset
const power = 0.65

export default {
  mounted: (el, binding) => {
    const updateDebounce = debounce(updateFrustum, 50),
      updateWrapper = () => updateDebounce(),
      resizeObserver = new ResizeObserver(updateWrapper)
    resizeObserver.observe(el)

    elems.set(el, {
      updateFrustum: updateDebounce,
      destroy: () => {
        resizeObserver.disconnect()
        window.removeEventListener("resize", updateWrapper)
        elems.delete(el)
        updateDebounce(0, 0)
      },
    })

    window.addEventListener("resize", updateWrapper)

    let curDirection = binding.arg || "left"
    let curSmooth = binding.modifiers.smooth
    let curState = typeof binding.value === "undefined" ? true : !!binding.value

    function updateFrustum(direction, enabled, smooth) {
      if (!direction) direction = curDirection
      if (!["left", "right", "up", "down"].includes(direction)) {
        console.error("Frustum mover only supports left/right/up/down directions")
        enabled = false
      } else {
        curDirection = direction
      }

      if (typeof enabled !== "boolean") enabled = curState
      curState = enabled

      if (typeof smooth !== "boolean") smooth = curSmooth
      curSmooth = smooth

      const updater = smooth ? updateGEsmooth : updateGE

      if (!enabled) {
        updater()
        return
      }

      const side = direction === "left" || direction === "right" ? "width" : "height"
      const screenSize = window.screen[side]
      const elSize = el.getBoundingClientRect()[side]
      let movePower = (elSize / screenSize) * power

      if (movePower < 0.001) movePower = 0
      else if (direction === "left" || direction === "down") movePower = -movePower

      // console.log(`Adjusting frustum side offset to ${direction} side: ${screenSize}, ${elSize}, ${movePower}`);
      updater(direction === "left" || direction === "right" ? movePower : 0, direction === "up" || direction === "down" ? movePower : 0)
    }
  },

  updated: (el, binding) => {
    const itm = elems.get(el)
    itm && itm.updateFrustum(binding.arg, !!binding.value, !!binding.modifiers.smooth)
  },

  unmounted: (el, binding) => {
    const itm = elems.get(el)
    itm && itm.destroy()
  },
}
