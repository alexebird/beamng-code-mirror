import { isProxy, toRaw } from "vue"
import { HSLToRGB, RGBToHSL } from "@/utils/color"

/**
 * HSLA/RGBA/Material paint class.
 * Note: By default it operates in 0..1 ranges. There are almost no sanity checks except type conversions.
 * @example
 * import { reactive } from "vue"
 * const paint = reactive(new Paint())
 */
export default class Paint {
  _hsl = [1, 1, 1]
  _rgb = [1, 1, 1]
  _alpha = 1 // chrominess

  _metallic = 0
  _roughness = 1
  _clearcoat = 1
  _clearcoatRoughness = 0

  _legacy = false // same format but with alpha (chrominess)

  _paintObjectNames = [
    "baseColor",
    "metallic",
    "roughness",
    "clearcoat",
    "clearcoatRoughness",
  ]

  _dirty = {
    hsl: false,
    rgb: false,
  }

  _precisionVal = 3

  /**
   * @param {Object}  [opts]              Options
   * @param {*}       [opts.paint=null]   Initial paint input
   * @param {boolean} [opts.legacy=false] Legacy mode with chrominess value (8 value paint instead of 7)
   */
  constructor({ paint = null, legacy = false } = {}) {
    this._legacy = !!legacy
    this.precision = this._precisionVal
    if (paint)
      this.paint = paint
  }


  ////////////////////// UTILS ///

  get legacy() {
    return this._legacy
  }
  set legacy(val) {
    this._legacy = !!val
  }

  get precision() {
    return this._precisionVal
  }
  set precision(val) {
    this._precisionVal = val = ~~val || 0
    if (val < 1) {
      this._precision = num => num
    } else if (val <= 15) {
      const prec = 10 ** val
      this._precision = num => ~~(num * prec) / prec
    } else {
      throw new TypeError("Precision can't go higher than 15")
    }
  }

  _sync({ hsl = false, rgb = false } = {}) {
    if (hsl && rgb)
      throw new Error("Cannot set both HSL and RGB changes at once")
    if (this._dirty.hsl && !hsl)
      this._rgb = HSLToRGB(...this._hsl)
    else if (this._dirty.rgb && !rgb)
      this._hsl = RGBToHSL(...this._rgb)
    this._dirty.hsl = hsl
    this._dirty.rgb = rgb
  }

  _parse(val) {
    let res
    if (isProxy(val))
      val = toRaw(val)
    if (typeof val === "string") {
      val = val.split(" ")
    }
    if (typeof val === "object") {
      if (Array.isArray(val)) {
        if (val.length < 3)
          throw new Error("Invalid colour array length")
        if (val.length === 3)
          val = [...val, 1]
        val = val.map(Number)
        for (let num of val) {
          if (isNaN(num))
            throw new Error("Values must be numbers")
        }
        res = val
      }
    }
    if (!res)
      throw new Error("Color must be either an array or a string")
    return res
  }


  ////////////////////// STRING GETTERS ///

  get hslString() {
    return this.hsl.join(" ")
  }
  get hslaString() {
    return this.hsla.join(" ")
  }
  get rgbString() {
    return this.rgb.join(" ")
  }
  get rgbaString() {
    return this.rgba.join(" ")
  }

  get saturationPercent() {
    return Math.round(this.saturation * 100)
  }
  get luminosityPercent() {
    return Math.round(this.luminosity * 100)
  }
  get alphaPercent() {
    return Math.round(this._alpha * 50) // because it goes in 0..2 range
  }
  get metallicPercent() {
    return Math.round(this._metallic * 100)
  }
  get roughnessPercent() {
    return Math.round(this._roughness * 100)
  }
  get clearcoatPercent() {
    return Math.round(this._clearcoat * 100)
  }
  get clearcoatRoughnessPercent() {
    return Math.round(this._clearcoatRoughness * 100)
  }


  ////////////////////// PAINT ///

  /** Paint as an array */
  get paint() {
    return [
      ...(this._legacy ? this.rgba : this.rgb),
      this.metallic,
      this.roughness,
      this.clearcoat,
      this.clearcoatRoughness,
    ].map(this._precision)
  }
  /** Paint as an string */
  get paintString() {
    return this.paint.join(" ")
  }
  /** Paint as an object */
  get paintObject() {
    const names = this._paintObjectNames
    return names.reduce((res, name) => ({ ...res, [name]: this[name] }), {})
  }
  /**
   * Sets paint.
   * Can be string, array or object.
   */
  set paint(val) {
    let data
    if (isProxy(val))
      val = toRaw(val)
    if (typeof val === "object") {
      if (!Array.isArray(val)) {
        data = { ...val }
        const names = this._paintObjectNames
        for (const name of names) {
          if (name === "baseColor") {
            this.baseColor = name in data ? data[name] : [1, 1, 1, 1]
            continue
          }
          let num = 0
          if (name in data) {
            num = Number(data[name])
            if (isNaN(num))
              num = 0
          }
          this[name] = num
        }
        return
      }
      data = val
    } else if (typeof val === "string") {
      data = val.split(" ")
    } else {
      throw new TypeError("Invalid data type")
    }
    // if array
    if (data.length === 8) { // legacy
      this.rgba = data.slice(0, 4)
    } else if (data.length === 7) {
      this.rgb = data.slice(0, 3)
    } else {
      throw new TypeError("Invalid data value")
    }
    [
      this._metallic,
      this._roughness,
      this._clearcoat,
      this._clearcoatRoughness
    ] = data.slice(-4)
  }


  ////////////////////// MATERIAL ///

  get metallic() {
    return this._precision(this._metallic)
  }
  set metallic(val) {
    this._metallic = Number(val)
  }
  get roughness() {
    return this._precision(this._roughness)
  }
  set roughness(val) {
    this._roughness = Number(val)
  }
  get clearcoat() {
    return this._precision(this._clearcoat)
  }
  set clearcoat(val) {
    this._clearcoat = Number(val)
  }
  get clearcoatRoughness() {
    return this._precision(this._clearcoatRoughness)
  }
  set clearcoatRoughness(val) {
    this._clearcoatRoughness = Number(val)
  }

  /** Chrominess (legacy) */
  get alpha() {
    return this._precision(this._alpha)
  }
  set alpha(val) {
    const type = typeof val
    if (type === "undefined")
      return
    if (type === "number")
      this._alpha = val
    else
      this._alpha = Number(val)
  }


  ////////////////////// HSL & RGB BASE ///

  get hsl() {
    this._sync()
    return this._hsl.map(this._precision)
  }
  set hsl(val) {
    const arr = this._parse(val)
    this._sync({ hsl: true })
    this._hsl = arr.slice(0, 3)
    this.alpha = arr[3]
  }

  get rgb() {
    this._sync()
    return this._rgb.map(this._precision)
  }
  get rgb255() {
    return this.rgb.map(val => Math.round(val * 255))
  }
  set rgb(val) {
    const arr = this._parse(val)
    this._sync({ rgb: true })
    this._rgb = arr.slice(0, 3)
    this.alpha = arr[3]
  }
  set rgb255(val) {
    const arr = this._parse(val)
    this.rgb = [
      ...arr.slice(0, 3).map(val => val / 255),
      arr[3]
    ]
  }

  get hsla() {
    return [...this.hsl, this.alpha]
  }
  set hsla(val) {
    this.hsl = val
  }

  get rgba() {
    return [...this.rgb, this.alpha]
  }
  set rgba(val) {
    this.rgb = val
  }
  get baseColor() {
    return this.rgba
  }
  set baseColor(val) {
    this.rgba = val
  }


  ////////////////////// HSL COMPONENTS ///

  get hue() {
    return this.hsl[0]
  }
  get hue360() {
    return this.hsl[0] * 360
  }
  set hue(val) {
    this._sync({ hsl: true })
    this._hsl[0] = Number(val)
  }
  set hue360(val) {
    this.hue = Number(val) / 360
  }
  get saturation() {
    return this.hsl[1]
  }
  set saturation(val) {
    this._sync({ hsl: true })
    this._hsl[1] = Number(val)
  }
  get luminosity() {
    return this.hsl[2]
  }
  set luminosity(val) {
    this._sync({ hsl: true })
    this._hsl[2] = Number(val)
  }

  ////////////////////// RGB COMPONENTS ///

  get red() {
    return this.rgb[0]
  }
  get red255() {
    return this.rgb[0] * 255
  }
  set red(val) {
    this._sync({ rgb: true })
    this._rgb[0] = Number(val)
  }
  set red255(val) {
    this.red = Number(val) / 255
  }
  get green() {
    return this.rgb[1]
  }
  get green255() {
    return this.rgb[1] * 255
  }
  set green(val) {
    this._sync({ rgb: true })
    this._rgb[1] = Number(val)
  }
  set green255(val) {
    this.green = Number(val) / 255
  }
  get blue() {
    return this.rgb[2]
  }
  get blue255() {
    return this.rgb[2] * 255
  }
  set blue(val) {
    this._sync({ rgb: true })
    this._rgb[2] = Number(val)
  }
  set blue255(val) {
    this.blue = Number(val) / 255
  }


  ////////////////////// STATIC HELPERS ///

  static hslCssStr(arr) {
    return `${Math.round(arr[0] * 360)}, ${Math.round(arr[1] * 100)}%, ${Math.round(arr[2] * 100)}%`
  }

  static rgbToHsl(rgb) { return RGBToHSL(...rgb) }
  static hslToRgb(hsl) { return HSLToRGB(...hsl) }
}

