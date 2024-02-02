import { ref, inject } from "vue"
import { defineStore } from "pinia"
import { roundDec, round } from "@/utils/maths"
import { lua } from "@/bridge"

export const useTuningStore = defineStore("tuning", () => {
  const $game = inject("$game")

  // States
  const buckets = ref({})
  const tuningVariables = ref({})

  const noapi = () => { throw new Error("Tuning store must be initialised first") }
  let api = {
    request: noapi,
    apply: noapi,
    close: noapi,
    menuClose: noapi,
  }

  async function init() {
    // detect if we're in career
    if (await lua.career_career.isActive()) {
      // init vehicle if in career
      await lua.career_modules_tuning.initVehicle(null)
      // career api
      api.request = async () => processTuningData(await lua.career_modules_tuning.getTuningData())
      api.apply = lua.career_modules_tuning.apply
      api.close = lua.career_modules_tuning.close
      api.menuClose = lua.career_modules_tuning.onMenuClosed
    } else {
      // normal api
      api.request = async () => await lua.extensions.core_vehicle_partmgmt.sendDataToUI()
      api.apply = lua.extensions.core_vehicle_partmgmt.setConfigVars
      api.close = () => {
        $game.events.off("VehicleFocusChanged", api.request)
        $game.events.off("VehicleConfigChange", processTuningData)
      }
      // add event listeners if out of career
      $game.events.on("VehicleFocusChanged", api.request)
      $game.events.on("VehicleConfigChange", processTuningData)
    }
    // remove undefined
    for (const name in api) {
      if (api[name] === noapi)
        api[name] = () => { }
    }
  }

  // Actions
  function apply() {
    const res = {}
    for (const [varName, varData] of Object.entries(tuningVariables.value)) {
      res[varName] = valDisToVal(varData)
    }
    api.apply(res)
  }

  const processTuningData = data => {
    // non-career data compatibility
    if (data.variables)
      data = data.variables

    // these are deleted explicitly for now. in the future these should have specific flags to hide them here
    delete data["$fuel"]
    delete data["$fuel_R"]
    delete data["$fuel_L"]

    buckets.value = {}
    tuningVariables.value = {}

    for (const varData of Object.values(data)) {
      // skip cargo box weight sliders
      if (varData.category === "Cargo")
        continue

      if (!varData.category) varData.category = "Other"
      if (!varData.subCategory) varData.subCategory = "Other"

      // create the buckets and put the variable data in
      const cat = buckets.value[varData.category] || (buckets.value[varData.category] = {})
      const list = cat[varData.subCategory] || (cat[varData.subCategory] = [])

      // TODO: same object as the one in tuningData. might be better to clone this
      // if data manipulation is needed and only copy needed properties by template
      list.push(varData)

      tuningVariables.value[varData.name] = {
        valDis: Number(valToValDis(varData)),
        minDis: varData.minDis,
        maxDis: varData.maxDis,
        min: varData.min,
        max: varData.max,
      }
    }
  }

  // https://stackoverflow.com/q/17369098
  function countDecimals(num) {
    if (typeof num !== "number" || ~~num === num) return 0
    return num.toString().split(".")[1].length || 0
  }

  function valToValDis(varData, useDef = false) {
    var vData = ((useDef ? varData.default : varData.val) - varData.min) / (varData.max - varData.min)
    return roundDec(round(vData * (varData.maxDis - varData.minDis), varData.stepDis) + varData.minDis, countDecimals(varData.stepDis))
  }

  function valDisToVal(varData) {
    var vData = (varData.valDis - varData.minDis) / (varData.maxDis - varData.minDis)
    return vData * (varData.max - varData.min) + varData.min
  }

  return {
    init,
    buckets,
    tuningVariables,
    apply,
    requestInitialData: () => api.request(),
    close: () => api.close(),
    notifyOnMenuClosed: () => api.menuClose(),
  }
})
