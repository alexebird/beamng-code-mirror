export const rainbow = (numOfSteps, step) => {
  // This function generates vibrant, "evenly spaced" colors (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
  // Adam Cole, 2011-Sept-14
  // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  var r, g, b
  var h = step / numOfSteps
  var i = ~~(h * 6)
  var f = h * 6 - i
  var q = 1 - f
  switch (i % 6) {
    case 0:
      [r, g, b] = [1, f, 0]
      break
    case 1:
      [r, g, b] = [q, 1, 0]
      break
    case 2:
      [r, g, b] = [0, 1, f]
      break
    case 3:
      [r, g, b] = [0, q, 1]
      break
    case 4:
      [r, g, b] = [f, 0, 1]
      break
    case 5:
      [r, g, b] = [1, 0, q]
      break
  }
  //var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2)
  return [r, g, b]
}

// from https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
export const hueToRGB = (p, q, t) => {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

export const HSLToRGB = (h, s, l) => {
  let r, g, b
  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToRGB(p, q, h + 1 / 3)
    g = hueToRGB(p, q, h)
    b = hueToRGB(p, q, h - 1 / 3)
  }
  return [r, g, b]
}

export const RGBToHSL = (r, g, b) => {
  const vmax = Math.max(r, g, b),
    vmin = Math.min(r, g, b)
  let h,
    s,
    l = (vmax + vmin) / 2

  if (vmax === vmin) {
    return [0, 0, l] // achromatic
  }

  const d = vmax - vmin
  s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin)
  if (vmax === r) h = (g - b) / d + (g < b ? 6 : 0)
  if (vmax === g) h = (b - r) / d + 2
  if (vmax === b) h = (r - g) / d + 4
  h /= 6

  return [h, s, l]
}
