// UI Units Class

export default class {
/**
 * Please use SI units and terms where possible (i.e. Length instead of Distance)
 * - Do not add scaling in there (kilo, Mega, Giga, etc). The engine should perform these on the fly where fit and required.
 * - The settings should describe the system it uses: metric/imperial
 */

  // the default unit settings
  uiUnits = {
    'uiUnitLength':          'metric',
    'uiUnitTemperature':     'f',
    'uiUnitWeight':          'lb',
    'uiUnitConsumptionRate': 'imperial',
    'uiUnitTorque':          'imperial',
    'uiUnitEnergy':          'imperial',
    'uiUnitDate':            'us',
    'uiUnitPower':           'bhp',
    'uiUnitVolume':          'gal',
    'uiUnitPressure':        'psi'
  }

  mapping = {
    'length':          'uiUnitLength',
    'speed':           'uiUnitLength',
    'temperature':     'uiUnitTemperature',
    'weight':          'uiUnitWeight',
    'consumptionRate': 'uiUnitConsumptionRate',
    'torque':          'uiUnitTorque',
    'energy':          'uiUnitEnergy',
    'date':            'uiUnitDate',
    'power':           'uiUnitPower',
    'volume':          'uiUnitVolume',
    'pressure':        'uiUnitPressure',
    'lengthMinor':     'uiUnitLength',
  }

  eventBus = {}
  api = {}

  constructor(eventBus, api) {
    this.eventBus = eventBus
    this.api = api
    this.eventBus.on('SettingsChanged', data => this.onSettingsChanged(data))
    api.engineLua('settings.notifyUI()')
  }

  onSettingsChanged(data) {
    for (const name in this.uiUnits) {
      if (typeof data.values[name] !== "undefined") {
        this.uiUnits[name] = data.values[name]
      }
    }
  }


  /**
   * @ngdoc method
   * @name buildString
   * @param {String} Name of Ui.Units function to use for conversion
   * @param {Number} value to convert
   * @param {Number} numDec number of Decimals to use
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description returns a string with value and unit to be directly included in html
   */
  buildString(func, val, numDecs, system) {
    const unsupported = ["division", "buildString", "date"]
    if (unsupported.includes(func) || typeof this[func] !== 'function') {
      //console.log(arguments)
      throw new Error('Cannot use this function to build a string')
    }

    if (typeof this.mapping[func] !== "undefined" && typeof system === "undefined") {
      system = this.uiUnits[this.mapping[func]]
    }

    let helper = this[func](val, system)
    if (helper !== null) {
      if(typeof helper.val === 'string') {
        return helper.val
      } else if(typeof helper.val === 'number')  {
        return helper.val.toFixed(numDecs) + ' ' + helper.unit
      } else {
        //console.error('got invalid reply', arguments)
        return ''
      }
    } else {
      //console.error('got null', arguments)
      return ''
    }
  }

  division(func1, func2, val1, val2, numDecs, system1, system2) {
    const unsupported = ["division", "weightPower", "buildString", "date"]
    if (unsupported.includes(func1) || typeof this[func1] !== "function"
      || unsupported.includes(func2) || typeof this[func2] !== "function") {
      //console.log(arguments)
      throw new Error("Cannot use these functions")
    }

    let helper1 = this[func1](val1, system1)
    let helper2 = this[func2](val2, system2)

    if (helper1 !== null && helper2 !== null) {
      let newVal = helper1.val / helper2.val
      return {
        val: (typeof numDecs !== "undefined" ? Utils.roundDec(newVal) : newVal),
        unit: `${helper1.unit}/${helper2.unit}`
      }
    } else {
      console.error('got null', arguments)
      return null
    }
  }

  weightPower(x) {
    let helper = this.division('weight', 'power', 1, 1)

    if (helper !== null) {
      return {
        val: helper.val * x,
        unit: helper.unit
      }
    } else {
      return null
    }
  }

  /**
   * @ngdoc method
   * @name length
   * @param {Number} x length in meters.
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description Converts length to metric or imperial
   */
  length(meters, system = this.uiUnits.uiUnitLength) {
    if (system === 'metric') {
      if     (meters < 0.01) return { val: meters * 1000, unit: 'mm'}
      else if(meters < 1)    return { val: meters * 100, unit: 'cm'}
      else if(meters < 1000) return { val: meters, unit: 'm'}
      else return { val: meters * 0.001, unit: 'km'}
    } else if (system === 'imperial') {
      let yd = meters * 1.0936
      if     (yd < 1)    return { val: yd * 36, unit: 'in'}
      else if(yd < 3)    return { val: yd * 3, unit: 'ft'}
      else if(yd < 1760) return { val: yd, unit: 'yd'}
      else return { val: yd * 0.000568182, unit: 'mi'}
    }
    return null
  }

    /**
   * @ngdoc method
   * @name length
   * @param {Number} x length in meters.
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description Converts length to metric or imperial
   */
  lengthMinor(meters, system = this.uiUnits.uiUnitLength) {
    if (system === 'metric') {
      return { val: meters * 1, unit: 'm'}
    } else if (system === 'imperial') {
      return { val: meters * 1.0936 * 3, unit: 'ft'}
    }
    return null
  }

  area(squareMeters, system = this.uiUnits.uiUnitLength) {
    if(system === 'metric') {
      if(squareMeters < 1000) return { val: squareMeters, unit: 'sq m'}
      else return { val: squareMeters * 0.001 * 0.001, unit: 'sq km'}
    } else if (system === 'imperial') {
      let sqrYards = squareMeters * 1.0936 * 1.0936
      if(sqrYards < 1760) return { val: sqrYards, unit: 'sq yd'}
      else return { val: sqrYards * 0.000568182 * 0.000568182, unit: 'sq mi'}
    }
    return null
  }


  /**
   * @ngdoc method
   * @name temperature
   * @param {Number} x temperature in Kelvin.
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description Converts temperature Celsius to metric (Celsius) or imperial (Fahrenheit) system.
   */
  temperature(x, system = this.uiUnits.uiUnitTemperature) {
    switch (system) {
      case 'c': return { val: x,            unit: '°C' }
      case 'f': return { val: x * 1.8 + 32, unit: '°F' }
      case 'k': return { val: x + 273.15,   unit: 'K' }
      default: return null
    }
  }

  volume(x, system = this.uiUnits.uiUnitVolume) {
    switch (system) {
      case 'l':   return { val: x,          unit: 'L' }
      case 'gal': return { val: x * 0.2642, unit: 'gal' }
      default: return null
    }
  }

  pressure(x, system = this.uiUnits.uiUnitPressure) {
    switch (system) {
      case 'inHg': return { val: x * 0.2953,   unit: 'in.Hg' }
      case 'bar':  return { val: x * 0.01,     unit: 'Bar' }
      case 'psi':  return { val: x * 0.145038, unit: 'PSI' }
      case 'kPa':  return { val: x,            unit: 'kPa' }
      default: return null
    }
  }

  /**
   * @ngdoc method
   * @name weight
   * @param {Number} x weight in kilograms.
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description Converts weight from kilograms to metric (kilograms) or imperial (pounds) system.
   */
  weight(x, system = this.uiUnits.uiUnitWeight) {
    switch (system) {
      case 'kg': return { val: x,              unit: 'kg'  }
      case 'lb': return { val: 2.20462262 * x, unit: 'lbs' }
      default: return null
    }
  }

  /**
   * @ngdoc method
   * @name consumptionRate
   * @param {Number} x fuel consumption rate in L/m.
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description Converts fuel consumption rate from L/m to metric (liters per 100km) or imperial (miles per gallon) system.
   */
  consumptionRate(x, system = this.uiUnits.uiUnitConsumptionRate) {
    switch (system) {
      case 'metric':   return { val: 1e5 * x > 5e4 ? 'n/a' : 1e5 * x, unit: 'L/100km' }
      case 'imperial': return { val: (x === 0 ? 0 : 235 * 1e-5 / x),  unit: 'MPG'}
      default: return null
    }
  }

  /**
   * @ngdoc method
   * @name speed
   * @param {Number} x speed in meters per second.
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description Converts speed from meters per second to metric (kilometers per hour) or imperial (miles per hour) system.
   */
  speed(x, system = this.uiUnits.uiUnitLength) {
    switch (system) {
      case 'metric':   return { val: 3.6 * x,        unit: 'km/h' }
      case 'imperial': return { val: 2.23693629 * x, unit: 'mph'  }
      default: return null
    }
  }

  /**
   * @ngdoc method
   * @name power
   * @param {Number} x power in metric hp.
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description Converts power from metric hp to metric (metric hp) or imperial (imperial hp) system.
   */
  power(x, system = this.uiUnits.uiUnitPower) {
    switch (system) {
      case 'kw':   return { val: 0.735499 * x, unit: 'kW' }
      case 'hp':   return { val: x,            unit: 'PS' }
      case 'bhp':  return { val: 0.98632 * x,  unit: 'bhp' }
      default: return null
    }
  }

  /**
   * @ngdoc method
   * @name torque
   * @param {Number} x torque in Nm
   * @param {('metric' | 'imperial')} system System to convert to. If omitted uses the current ui unit system.
   * @description Converts torque from Nm to metric (Nm) or imperial (lb * ft) system.
   */
  torque(x, system = this.uiUnits.uiUnitTorque) {
    if(system === 'metric') system = 'kg'
    else if(system === 'imperial') system = 'lb'
    switch (system) {
      case 'kg': return {val: x,                unit: 'Nm'}
      case 'lb': return {val: 0.7375621495 * x, unit: 'lb-ft'}
      default: return null
    }
  }

  energy(x, system = this.uiUnits.uiUnitEnergy) {
    if(system === 'metric') system = 'j'
    else if(system === 'imperial') system = 'ft lb'
    switch (system) {
      case 'j':     return {val: x,                unit: 'J'   }
      case 'ft lb': return {val: 0.7375621495 * x, unit: 'ft lb'}
      default: return null
    }
  }

  date(x, system = this.uiUnits.uiUnitDate) {
    switch (system) {
      case 'ger': return x.toLocaleDateString('de-DE')
      case 'uk':  return x.toLocaleDateString('en-GB')
      case 'us':  return x.toLocaleDateString('en-US')
      default: return null
    }
  }

  beamBucks(x) {
    return Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(+x)
  }

  // backward compatibility:
  distance = this.length

}