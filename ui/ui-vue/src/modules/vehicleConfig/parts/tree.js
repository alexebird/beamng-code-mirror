import { roundDec } from "@/utils/maths"
import { emptyOptionName, formatOptions } from "./common"


export default {
  _generateTreeBranch(data, part, opts = { }, depth) {
    let res = []
    if (depth > 200) return

    const defaultHighlight = !data.partsHighlighted

    for (const slotName in part.slotInfoUi) {
      const slotInfo = part.slotInfoUi[slotName]
      const chosenPart = data.chosenParts[slotName]
      let isHighlighted = defaultHighlight

      if (chosenPart === "") {
        isHighlighted = false
      } else if (data.partsHighlighted && chosenPart in data.partsHighlighted) {
        isHighlighted = data.partsHighlighted[chosenPart]
      }

      const element = {
        name: slotName,
        description: slotInfo.description,

        type: slotInfo.type, // slots1
        allowTypes: slotInfo.allowTypes, // slots2
        denyTypes: slotInfo.denyTypes, // slots2

        val: "",
        options: [],
        highlight: isHighlighted,
      }
      let hasOptions = false
      const slotAllowedTypes = slotInfo.allowTypes || [slotInfo.type]
      for (const st of slotAllowedTypes) {
        if (!(st in data.slotMap)) continue
        for (const slotPartName of data.slotMap[st]) {
          if (slotPartName in data.availableParts) {
            const slotPart = data.availableParts[slotPartName]
            const part = {
              name: slotPartName,
              description: slotPart.description,
              isAuxiliary: slotPart.isAuxiliary,
              val: slotPartName,
            }
            element.options.push(part)
            hasOptions = true
            if (data.chosenParts[slotName] === slotPartName || data.chosenParts[st] === slotPartName) {
              element.val = slotPartName
              if (slotPart.slotInfoUi) {
                element.parts = this._generateTreeBranch(data, slotPart, opts, depth + 1)
              }
              if ("parts" in element && (!Array.isArray(element.parts) || element.parts.length === 0)) {
                delete element.parts
              }
            }
          } else {
            console.error("slot part not found: ", slotPartName)
          }
        }
      }
      if (!("coreSlot" in slotInfo) && hasOptions) {
        element.options.unshift({
          name: "<empty>",
          description: emptyOptionName,
          val: "",
        })
      } else {
        element.open = true
      }

      if (!opts.simple || element.options.length > 2 || (element.options.length > 1 && element.options[0].val !== "") || depth < 1) {
        element.options = formatOptions(element, opts)
        res.push(element)
      }
    }
    return res
  },

  generateTree(data, opts = { }) {
    return this._generateTreeBranch(data, data.availableParts[data.mainPartName], opts)
  },

  generateConfig(d, res) {
    res = res || {}
    if (!d) return res

    for (const part of d) {
      res[part.name] = part.val
      if (part.parts) this.generateConfig(part.parts, res)
    }
    return res
  },

  defaultVarValToDisVal(v) {
    const vData = (v.default - v.min) / (v.max - v.min) //lua ratio
    return roundDec(vData * (v.maxDis - v.minDis) + v.minDis, 7)
  },

  varValToDisVal(v) {
    const vData = (v.val - v.min) / (v.max - v.min) //lua ratio
    return roundDec(vData * (v.maxDis - v.minDis) + v.minDis, 7)
  },

  isDisValDefault(v) {
    return Math.abs(v.valDis - v.defaultValDis) <= 0.000001
  },

  getVariablesConfig(variables) {
    const configObj = {}
    for (const i in variables) {
      const v = variables[i]
      const vDis = (v.valDis - v.minDis) / (v.maxDis - v.minDis)
      v.val = roundDec(vDis * (v.max - v.min) + v.min, 7)
      configObj[v.name] = v.val
    }
    return configObj
  },

  getVariablesWithNonDefaultValuesConfig(variables) {
    const configObj = {}
    for (const i in variables) {
      const v = variables[i]
      if (!v.configDefaultDefined && this.isDisValDefault(v)) {
        continue
      }
      const vDis = (v.valDis - v.minDis) / (v.maxDis - v.minDis)
      v.val = roundDec(vDis * (v.max - v.min) + v.min, 7)
      configObj[v.name] = v.val
    }
    return configObj
  },

  async loadConfigList() {
    let configs = await lua.extensions.core_vehicle_partmgmt.getConfigList()
    //let list = configs.map((elem) => elem.slice(0, -3))
    configs = Array.isArray(configs) ? configs : []
    return configs
  },

  treeSort: function _treeSort(a, b) {
    if (a.parts) {
      a.parts.sort(_treeSort)
      if (!b.parts) return 1
    }

    if (b.parts) {
      b.parts.sort(_treeSort)
      if (!a.parts) return -1
    }

    return a.name.localeCompare(b.name)
  },

  calcTreeSync(config, opts = { }) {
    //console.log("config = ", config)

    let tree = this.generateTree(config, opts)
    tree.sort(this.treeSort)
    let configArray = []
    let variable_categories = {}

    for (let o in config.variables) {
      let v = config.variables[o]
      //if the variable wants to be hidden in the UI, skip it
      if (v.hideInUI === true) continue
      if (!variable_categories[v.category]) variable_categories[v.category] = true
      //v.defaultValDis = this.defaultVarValToDisVal(v)
      let defaultVal = config.defaults.vars[o]
      if (defaultVal === undefined) {
        defaultVal = v.default
        v.configDefaultDefined = false
      } else {
        v.configDefaultDefined = true
      }
      v.defaultValDis = this.varValToDisVal(v, defaultVal)
      v.valDis = this.varValToDisVal(v)
      configArray.push(v)
    }
    // console.table(configArray)

    // varsList.value = configArray.sort((a, b) => a.name.localeCompare(b.name))
    // varsCategories.value = Object.keys(variable_categories)
    // loadOpenSlots()

    // console.log("tree =", tree)

    return tree
  },
}
