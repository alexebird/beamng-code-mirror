<template>
  <div class="garage-blackscreen" v-bng-blur="blackscreen" :class="{ 'garage-blackscreen-active': blackscreen }"></div>

  <div class="garage-view" v-if="loaded.init" bng-ui-scope="garage" v-bng-on-ui-nav:menu="exit">
    <div class="garage-row-title">
      <div class="headingContainer">
        <div v-bng-blur="true">
          <h4>{{ $t("ui.mainmenu.garage") }}</h4>
        </div>
        <h2 v-bng-blur="true">{{ vehicle.name }}</h2>
      </div>
    </div>

    <div class="garage-row-main">
      <div class="garage-menu-container garage-menu-main">
        <!-- stand-alone garage -->
        <div class="garage-menu garage-menu-primary">
          <ButtonItem :active="vehcomp === 'parts'" @click="menuOpen('parts')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/engine.svg">{{
            $t("ui.garage.tabs.parts")
          }}</ButtonItem>
          <!-- title: ui.garage.tabs.parts -->
          <ButtonItem :active="vehcomp === 'tuning'" @click="menuOpen('tuning')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/gauge.svg">{{
            $t("ui.garage.tabs.tune")
          }}</ButtonItem>
          <!-- title: ui.garage.tune.tuning -->
          <ButtonItem :active="vehcomp === 'paint'" @click="menuOpen('paint')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/spray-can.svg">{{
            $t("ui.garage.tabs.paint")
          }}</ButtonItem>
          <!-- title: ui.garage.tabs.paint -->
          <ButtonItem :active="vehcomp === 'decals'" @click="launchDecalEditor" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/star.svg">{{
            $t("ui.garage.tabs.decals")
          }}</ButtonItem>
          <!-- <ButtonItem :active="vehcomp === 'decals'" @click="gotoLiveryEditor" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/star.svg">{{
            $t("ui.garage.tabs.decals")
          }}</ButtonItem> -->
          <!-- title: ui.garage.tabs.decals -->
        </div>
        <div v-show="!vehcomp" class="garage-menu garage-menu-secondary">
          <ButtonItem :active="vehcomp === 'vehicles'" @click="menuOpen('vehicles')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/vehicle.svg">{{
            $t("ui.garage.tabs.vehicles")
          }}</ButtonItem>
          <!-- title: none -->
          <ButtonItem :active="vehcomp === 'mycars'" @click="menuOpen('mycars')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/keys.svg">{{
            $t("ui.garage.tabs.load")
          }}</ButtonItem>
          <!-- title: ui.garage.load.loadCar -->
          <ButtonItem @click="menuOpen('photo')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/camera.svg">{{ $t("ui.garage.tabs.photo") }}</ButtonItem>
          <!-- title: ui.garage.tabs.photo -->
        </div>

        <!-- sub-views -->
        <div
          class="garage-config"
          v-if="vehcomp && vehcompview"
          v-bng-frustum-mover:left="true"
          bng-ui-scope="garage-config"
          v-bng-on-ui-nav:back="() => menuOpen()">
          <component :is="vehcompview" :with-background="true" />
        </div>
      </div>

      <div class="garage-sidemenu">
        <ButtonMenu :disable="!loaded.init" icon="/ui/assets/SVG/24/movie-cam.svg">
          <!-- engine.editor.menu.camera ui.options.camera ui.garage.photo.camera -->
          <template #toggle>{{ $t("ui.garage.photo.camera") }}</template>
          <template #left>
            <!-- engine.editor.menu.camera.perspective ui.options.camera.defaultMode -->
            <ButtonItem @click="setCamera('default')" icon="/ui/assets/SVG/24/camera-3fourth-1.svg">{{ $t("engine.editor.menu.standartCamera") }}</ButtonItem>
            <ButtonItem @click="setCamera('front')" icon="/ui/assets/SVG/24/camera-front-1.svg">{{ $t("engine.editor.menu.camera.front") }}</ButtonItem>
            <ButtonItem @click="setCamera('back')" icon="/ui/assets/SVG/24/camera-back-1.svg">{{ $t("engine.editor.menu.camera.back") }}</ButtonItem>
            <ButtonItem @click="setCamera('side')" icon="/ui/assets/SVG/24/camera-side-1.svg">{{ $t("engine.editor.menu.camera.right") }}</ButtonItem>
            <ButtonItem @click="setCamera('top')" icon="/ui/assets/SVG/24/camera-top-1.svg">{{ $t("engine.editor.menu.camera.top") }}</ButtonItem>
          </template>
        </ButtonMenu>
        <!-- vehicle features -->
        <ButtonMenu :disable="!loaded.vehicle || !loaded.status" icon="/ui/assets/SVG/24/vehicle-features-1.svg">
          <!-- ui.radialmenu2.electrics ui.options.controls.bindings.Vehicle -->
          <template #toggle>{{ $t("ui.radialmenu2.electrics.__text__") }}</template>
          <template #left>
            <ButtonItem :active="vehicle.electrics.lowbeam" @click="vehSwitch('lowbeam')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/lo-beam.svg">{{
              $t("ui.radialmenu2.electrics.headlights.low.__text__")
            }}</ButtonItem>
            <!-- ui.inputActions.vehicle.toggle_headlights.title ui.radialmenu2.electrics.headlights -->
            <ButtonItem :active="vehicle.electrics.highbeam" @click="vehSwitch('highbeam')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/hi-beam.svg">{{
              $t("ui.radialmenu2.electrics.headlights.high.__text__")
            }}</ButtonItem>
            <!-- ui.inputActions.vehicle.toggle_foglights.title -->
            <ButtonItem :active="vehicle.electrics.fog_lights" @click="vehSwitch('fog')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/foglight.svg">{{
              $t("ui.radialmenu2.electrics.fog_lights.__text__")
            }}</ButtonItem>
            <ButtonItem :active="vehicle.electrics.hazard" @click="vehSwitch('hazard')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/haz-lights.svg">{{
              $t("ui.radialmenu2.electrics.hazard_lights.__text__")
            }}</ButtonItem>
            <ButtonItem
              :active="vehicle.electrics.lightbar"
              @click="vehSwitch('lightbar')"
              :disable="!loaded.vehicle"
              icon="/ui/assets/SVG/24/strobe-lights.svg"
              >{{ $t("ui.radialmenu2.electrics.lightbar.__text__") }}</ButtonItem
            >
          </template>
        </ButtonMenu>
        <!-- garage features -->
        <ButtonMenu :disable="!loaded.init" icon="/ui/assets/SVG/24/garage-features-3.svg">
          <template #toggle>{{ $t("ui.garage2.features") }}</template>
          <template #left>
            <ButtonItem :active="lightState[0]" @click="lightToggle(0)" icon="/ui/assets/SVG/24/garagelight-left.svg">{{
              $t("ui.garage2.lights.west")
            }}</ButtonItem>
            <ButtonItem :active="lightState[1]" @click="lightToggle(1)" icon="/ui/assets/SVG/24/garagelight-middle.svg">{{
              $t("ui.garage2.lights.middle")
            }}</ButtonItem>
            <ButtonItem :active="lightState[2]" @click="lightToggle(2)" icon="/ui/assets/SVG/24/garagelight-right.svg">{{
              $t("ui.garage2.lights.east")
            }}</ButtonItem>
          </template>
        </ButtonMenu>
      </div>
    </div>

    <div class="garage-row-bottom garage-bottom">
      <!-- normal garage -->
      <ButtonItem :active="vehcomp === 'save'" @click="menuOpen('save')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/save-as.svg">{{
        $t("ui.vehicleconfig.save")
      }}</ButtonItem>
      <!-- <ButtonItem :active="vehcomp === 'save'" @click="mainMode('savedefault')"
        :disable="!loaded.vehicle"
        icon="/ui/assets/SVG/24/vehicle-favorite.svg"
      >[save def]</ButtonItem> -->
      <ButtonItem @click="menuOpen('test')" :disable="!loaded.vehicle" icon="/ui/assets/SVG/24/test-cone.svg">{{ $t("ui.common.test") }}</ButtonItem>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount, onUnmounted, inject, markRaw } from "vue"
import { useBridge } from "@/bridge"
import { openConfirmation, openExperimental } from "@/services/popup"
import { $translate } from "@/services/translation"
import { vBngBlur, vBngFrustumMover, vBngOnUiNav } from "@/common/directives"

import ButtonMenu from "../components/ButtonMenu.vue"
import ButtonItem from "../components/ButtonItem.vue"

import Paint from "@/modules/vehicleConfig/components/Paint.vue"
import Parts from "@/modules/vehicleConfig/components/Parts.vue"
import Tuning from "@/modules/vehicleConfig/components/Tuning.vue"
import Save from "@/modules/vehicleConfig/components/Save.vue"

import { runRaw } from "@/bridge/libs/Lua.js"

const components = {
  paint: Paint,
  parts: Parts,
  tuning: Tuning,
  save: Save,
}

const $game = inject("$game")
const bngVue = window.bngVue || { gotoGameState() {} }

const { lua, events, streams } = useBridge()
const streamsList = ["electrics"]

const launchDecalEditor = async () => {
  runRaw('extensions.core_vehicle_partmgmt.hasAvailablePart(be:getPlayerVehicle(0).JBeam .. "_skin_dynamicTextures")').then(dynDecalsCapable => {
    if (dynDecalsCapable) {
      menuOpen("decals")
    } else {
      openConfirmation("", $translate.instant("ui.garage.decals.notAvailableForVehicle"), [{ label: $translate.instant("ui.common.okay"), value: true }])
    }
  })
}

import { useUINavScope } from "@/services/uiNav"
useUINavScope("garage")

// DEBUG_ONLY >>
const testDecalEditor = () => bngVue.gotoGameState("decalEditor")
// << END_DEBUG_ONLY

const props = defineProps({
  component: String,
})

const lightState = ref([false, false, false])
async function lightToggle(idx) {
  lightState.value[idx] = !lightState.value[idx]
  await lua.extensions.gameplay_garageMode.setLighting(lightState.value)
}

async function setCamera(view) {
  await lua.extensions.gameplay_garageMode.setCamera(view)
}

// electric switches
const switches = reactive({
  lowbeam: { func: "setLightsState", value: "lights_state", on: 1, off: 0 },
  highbeam: { func: "setLightsState", value: "lights_state", on: 2, off: 0 },
  fog: { func: "set_fog_lights", value: "fog", on: 1, off: 0 },
  lightbar: { func: "set_lightbar_signal", value: "lightbar", on: 1, off: 0 },
  hazard: { func: "set_warn_signal", value: "hazard_enabled", on: 1, off: 0 },
})
for (let key in switches) switches[key].state = false

function vehSwitch(key, on) {
  if (!switches.hasOwnProperty(key)) return
  const svc = switches[key]
  if (typeof on === "undefined")
    // toggle if undefined
    on = !svc.state
  else if (on === svc.state) return
  $game.api.activeObjectLua(`electrics.${svc.func}(${on ? svc.on : svc.off})`)
}

const loaded = reactive({
  init: false,
  vehicle: false,
  status: false,
})
const vehicle = reactive({
  name: "Unknown",
  vehicle: null,
  electrics: {},
  state: {},
})

const blackscreen = ref(false)
const vehcomp = ref("")
const vehcompview = ref(null)
let tmrInit

async function menuOpen(mode) {
  vehcomp.value = vehcomp.value === mode ? "" : mode
  let component = null
  switch (mode) {
    case "paint":
      lua.extensions.gameplay_garageMode.setGarageMenuState("paint")
      component = components.paint
      break
    case "decals":
      bngVue.gotoGameState("decals-loader")
      break
    case "parts":
      lua.extensions.gameplay_garageMode.setGarageMenuState("parts")
      component = components.parts
      break
    case "tuning":
      lua.extensions.gameplay_garageMode.setGarageMenuState("tuning")
      component = components.tuning
      break
    case "vehicles":
      lua.extensions.gameplay_garageMode.setGarageMenuState("vehicles")
      bngVue.gotoGameState("menu.vehicles", { params: { mode: "garageMode", garage: "all" } })
      break
    case "mycars":
      lua.extensions.gameplay_garageMode.setGarageMenuState("myCars")
      bngVue.gotoGameState("menu.vehicles", { params: { mode: "garageMode", garage: "own" } })
      break
    case "photo":
      bngVue.gotoGameState("menu.photomode")
      break
    case "save":
      component = components.save
      break
    case "savedefault":
      console.log("TODO: save as default")
      break
    case "test":
      vehcomp.value = ""
      lua.extensions.gameplay_garageMode.testVehicle()
      break
    default:
      vehcomp.value = ""
      break
  }

  if (component) vehcompview.value = markRaw(component)
}

// async function gotoLiveryEditor() {
//   const result = await openExperimental(
//     "Livery Editor",
//     `This is an early highly experimental preview of the Decal Editor. Please be aware that anything created with this feature may be lost in future
//     hotfixes and updates. Do you wish to proceed?`
//   )
//   if (result) bngVue.gotoGameState("livery-main")
// }

function exit() {
  if (vehcomp.value) {
    menuOpen()
  } else {
    window.bngVue.gotoGameState("menu.mainmenu")
  }
}

async function careerExitGarage() {
  let doExit = true
  if (vehicle.state.vehicleDirty || vehicle.state.switchedToNewVehicle) {
    doExit = await openConfirmation(null, $translate.instant("ui.career.garage.exitPrompt"), [
      { label: $translate.instant("ui.common.yes"), value: true },
      { label: $translate.instant("ui.common.no"), value: false },
    ])
  }
  if (doExit) {
    await lua.extensions.gameplay_garageMode.stop()
    bngVue.gotoGameState("play")
  }
}

// handles vehicle change
async function vehChange() {
  // this function init is at bottom of garage controller
  // reset menus // don't! if you do, check if it's not conflicting with parts change
  //vehcomp.value = ""
  // lock status
  loaded.vehicle = false
  loaded.status = false
  // reset vehicle
  vehicle.name = "Unknown"
  vehicle.vehicle = null
  vehicle.electrics = {}
  // enable electrics w/o ignition
  await $game.api.activeObjectLua("electrics.setIgnitionLevel(1)")
  // request info
  const data = await lua.core_vehicles.getCurrentVehicleDetails()
  if (tmrInit) {
    loaded.init = true // to unlock controls even on a wrong data
    clearTimeout(tmrInit)
    tmrInit = null
  }
  // console.log("VEHICLE", data)
  if (!data) return
  loaded.vehicle = true
  vehicle.vehicle = data
  if (data.model.Brand) vehicle.name = `${data.model.Brand} ${data.model.Name}`
  else vehicle.name = data.configs.Name
  if (data.configs.Configuration) {
    if (data.configs.Source === "BeamNG - Official") vehicle.name += ` - ${data.configs.Configuration}`
    else vehicle.name += " - Custom" // ?
  }
}

function onStreamsUpdate(streams) {
  if (!streams.electrics) return
  const data = streams.electrics
  loaded.status = data.ignitionLevel > 0 // check if electrics is on
  // console.log("ELECTRICS", data)
  for (let key in switches) {
    const svc = switches[key]
    svc.state = data.hasOwnProperty(svc.value) && data[svc.value] === svc.on
    vehicle.electrics[key] = svc.state
  }
}

onBeforeMount(async () => {
  // // see also play.js
  // $scope.$watch("$parent.app.gameState", gameState => {
  //   // this is to make garage disappear when garage was opened inside freeroam or else
  //   if (gameState !== "garage")
  //     $state.go("play")
  // })

  streams.add(streamsList)

  tmrInit = setTimeout(() => {
    console.log("Unable to get vehicle details in time. Forcing to init...")
    loaded.init = true
    tmrInit = null
  }, 3000)

  events.on("VehicleChange", vehChange)
  $game.api.activeObjectLua("electrics.setIgnitionLevel(1)") // enable electrics w/o ignition

  // track electrics state
  events.on("onStreamsUpdate", onStreamsUpdate)

  events.on("garageVehicleDirtied", (evt, data) => {
    if (typeof data !== "object") return
    vehicle.state.vehicleDirty = data.vehicleDirty
    vehicle.state.switchedToNewVehicle = data.switchedToNewVehicle
  })

  // garage configs are registered in angular vehicle controller

  events.on("GarageModeBlackscreen", (evt, data) => (blackscreen.value = data.active))

  vehChange() // init

  // garage lighting
  lightState.value = await lua.extensions.gameplay_garageMode.getLighting()

  props.component && menuOpen(props.component)
})

onUnmounted(() => {
  events.off("onStreamsUpdate", onStreamsUpdate)
  streams.remove(streamsList)
})
</script>

<style lang="scss" scoped>
.garage-view,
.garage-view * {
  position: relative;
  font-family: "Overpass", var(--fnt-defs);
}

.garage-view {
  position: absolute;
  top: 2em;
  left: 2em;
  right: 2em;
  bottom: 2em;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  font-size: 16px !important;
}

.garage-row-title,
.garage-row-footer {
  flex: 0 0 auto;
}
.garage-row-main {
  flex: 0 1 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  // overflow: hidden; // TODO: in future, this should be handled
}

.garage-menu-container {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  min-height: 0;
  width: 30em;
  margin-left: -0.375em;
}

.garage-menu-container > * {
  flex: 0 0 auto;
}

.garage-menu {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  padding-bottom: 0.25em;
  margin-bottom: 0.5em;
  /* max-width: 400px; */
}
.garage-menu > * {
  flex: 0 0 10%;
  width: 10%;
}
.garage-menu > * {
  flex-grow: 1;
}
.garage-menu-main .garage-menu::after {
  content: "";
  position: absolute;
  bottom: -0.1em;
  left: 0.5em;
  right: 0.5em;
  border-bottom: 0.2em solid var(--bng-orange);
}
:not(.garage-menu-main) > .garage-menu-secondary {
  display: none;
}
.garage-menu-main :deep(.garage-button) {
  max-width: unset !important;
}

.garage-config {
  flex: 1 1 auto;
  height: 100%;
  margin: 0.5em;
  overflow: hidden;
  > :deep(*) {
    // width: 100% !important;
    // height: 100% !important;
    // overflow: hidden;
    color: #fff;
    pointer-events: auto;
    > .card-cnt {
      height: 100%;
      overflow: auto;
    }
  }
}

.garage-bottom {
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  justify-content: flex-start;
  margin-left: -0.5em;
  margin-bottom: -0.5em;
}

/* smaller screen */
@media (max-width: 1280px) {
  .garage-view {
    font-size: 1.094vw !important;
  }
  .garage-menu-container {
    width: 36em;
  }
}

/* portrait mode */
@media (max-width: 1081px) and (orientation: portrait) {
  .garage-view {
    font-size: 1.95vw !important;
  }
  .garage-menu-container {
    width: 80%;
  }
  .garage-row-main {
    flex-direction: column;
  }
}

.garage-blackscreen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  pointer-events: none;
  opacity: 0;
  /* transition: opacity 100ms; */
  z-index: calc(var(--zorder_main_menu_navigation_focus) + 1);
}
.garage-blackscreen-active {
  opacity: 1;
  pointer-events: all !important;
}
</style>
