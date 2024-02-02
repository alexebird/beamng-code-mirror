<template>
  <div class="garage-blackscreen" v-bng-blur="blackscreen"
    :class="{ 'garage-blackscreen-active': blackscreen }"></div>

  <div class="garage-view"
    v-if="loaded.init"
    bng-ui-scope="garage"
    v-bng-on-ui-nav:back="exit"
  >

    <div class="garage-row-title">
      <div class="headingContainer">
        <div v-bng-blur="true">
          <h4>{{ $t("ui.mainmenu.garage") }}</h4>
        </div>
        <h2 v-bng-blur="true">{{ vehicle.name }}</h2>
        <!-- DEBUG_ONLY >> --><button @click='testDecalEditor'>Test Decal Editor</button><!-- << END_DEBUG_ONLY -->
      </div>
    </div>

    <div class="garage-row-main">

      <div class="garage-menu-container garage-menu-main">
        <!-- stand-alone garage -->
        <div v-if="!inCareer" class="garage-menu garage-menu-primary">
          <ButtonItem :active="vehcomp === 'paint'" @click="menuOpen('paint')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/spray-can.svg"
          >{{ $t("ui.garage.tabs.paint") }}</ButtonItem>
          <!-- title: ui.garage.tabs.paint -->
          <ButtonItem :active="vehcomp === 'parts'" @click="menuOpen('parts')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/engine.svg"
          >{{ $t("ui.garage.tabs.parts") }}</ButtonItem>
          <!-- title: ui.garage.tabs.parts -->
          <ButtonItem :active="vehcomp === 'tuning'" @click="menuOpen('tuning')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/gauge.svg"
          >{{ $t("ui.garage.tabs.tune") }}</ButtonItem>
          <!-- title: ui.garage.tune.tuning -->
        </div>
        <div v-if="!inCareer" v-show="!vehcomp" class="garage-menu garage-menu-secondary">
          <ButtonItem :active="vehcomp === 'vehicles'" @click="menuOpen('vehicles')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/vehicle.svg"
          >{{ $t("ui.garage.tabs.vehicles") }}</ButtonItem>
          <!-- title: none -->
          <ButtonItem :active="vehcomp === 'mycars'" @click="menuOpen('mycars')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/keys.svg"
          >{{ $t("ui.garage.tabs.load") }}</ButtonItem>
          <!-- title: ui.garage.load.loadCar -->
          <ButtonItem @click="menuOpen('photo')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/camera.svg"
          >{{ $t("ui.garage.tabs.photo") }}</ButtonItem>
          <!-- title: ui.garage.tabs.photo -->
        </div>

        <!-- career garage -->
        <div v-if="inCareer" class="garage-menu garage-menu-primary">
          <ButtonItem :active="vehcomp === 'mycars'" @click="menuOpen('mycars')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/keys.svg"
          >{{ $t("ui.garage.tabs.load") }}</ButtonItem>
          <!-- title: ui.garage.load.loadCar -->
          <ButtonItem :active="vehcomp === 'tuning'" @click="menuOpen('tuning')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/gauge.svg"
          >{{ $t("ui.garage.tabs.tune") }}</ButtonItem>
          <!-- title: ui.garage.tune.tuning -->
          <ButtonItem @click="menuOpen('photo')"
            :disable="!loaded.vehicle"
            icon="/ui/assets/SVG/24/camera.svg"
          >{{ $t("ui.garage.tabs.photo") }}</ButtonItem>
          <!-- title: ui.garage.tabs.photo -->
        </div>

        <!-- sub-views -->
        <!-- <BngCard
          class="garage-config"
          v-if="vehcomp && vehcompview"
          v-bng-blur="true"
          v-bng-frustum-mover:left="true"
          ref="elCard"
          bng-ui-scope="garage-config"
          v-bng-on-ui-nav:back="() => menuOpen()"
        >
          <component
            ref="elComp"
            :is="vehcompview"
            :buttonTarget="elCard && elCard.buttonsContainer"
            :closeButton="false"
          />
          <template #buttons></template>
        </BngCard> -->
        <div
          class="garage-config"
          v-if="vehcomp && vehcompview"
          v-bng-frustum-mover:left="true"
          bng-ui-scope="garage-config"
          v-bng-on-ui-nav:back="() => menuOpen()"
        >
          <component
            ref="elComp"
            :is="vehcompview"
            :with-background="true"
          />
        </div>
      </div>

      <div class="garage-sidemenu">
        <ButtonMenu
          :disable="!loaded.init"
          icon="/ui/assets/SVG/24/movie-cam.svg"
        >
          <!-- engine.editor.menu.camera ui.options.camera ui.garage.photo.camera -->
          <template #toggle>{{ $t("ui.garage.photo.camera") }}</template>
          <template #left>
            <!-- engine.editor.menu.camera.perspective ui.options.camera.defaultMode -->
            <ButtonItem @click="setCamera('default')"
              icon="/ui/assets/SVG/24/camera-3fourth-1.svg"
            >{{ $t("engine.editor.menu.standartCamera") }}</ButtonItem>
            <ButtonItem @click="setCamera('front')"
              icon="/ui/assets/SVG/24/camera-front-1.svg"
            >{{ $t("engine.editor.menu.camera.front") }}</ButtonItem>
            <ButtonItem @click="setCamera('back')"
              icon="/ui/assets/SVG/24/camera-back-1.svg"
            >{{ $t("engine.editor.menu.camera.back") }}</ButtonItem>
            <ButtonItem @click="setCamera('side')"
              icon="/ui/assets/SVG/24/camera-side-1.svg"
            >{{ $t("engine.editor.menu.camera.right") }}</ButtonItem>
            <ButtonItem @click="setCamera('top')"
              icon="/ui/assets/SVG/24/camera-top-1.svg"
            >{{ $t("engine.editor.menu.camera.top") }}</ButtonItem>
          </template>
        </ButtonMenu>
        <!-- vehicle features -->
        <ButtonMenu
          :disable="!loaded.vehicle || !loaded.status"
          icon="/ui/assets/SVG/24/vehicle-features-1.svg"
        >
          <!-- ui.radialmenu2.electrics ui.options.controls.bindings.Vehicle -->
          <template #toggle>{{ $t("ui.radialmenu2.electrics.__text__") }}</template>
          <template #left>
            <ButtonItem :active="vehicle.electrics.lowbeam" @click="vehSwitch('lowbeam')"
              :disable="!loaded.vehicle"
              icon="/ui/assets/SVG/24/lo-beam.svg"
            >{{ $t("ui.radialmenu2.electrics.headlights.low.__text__") }}</ButtonItem>
            <!-- ui.inputActions.vehicle.toggle_headlights.title ui.radialmenu2.electrics.headlights -->
            <ButtonItem :active="vehicle.electrics.highbeam" @click="vehSwitch('highbeam')"
              :disable="!loaded.vehicle"
              icon="/ui/assets/SVG/24/hi-beam.svg"
            >{{ $t("ui.radialmenu2.electrics.headlights.high.__text__") }}</ButtonItem>
            <!-- ui.inputActions.vehicle.toggle_foglights.title -->
            <ButtonItem :active="vehicle.electrics.fog_lights" @click="vehSwitch('fog')"
              :disable="!loaded.vehicle"
              icon="/ui/assets/SVG/24/foglight.svg"
            >{{ $t("ui.radialmenu2.electrics.fog_lights.__text__") }}</ButtonItem>
            <ButtonItem :active="vehicle.electrics.hazard" @click="vehSwitch('hazard')"
              :disable="!loaded.vehicle"
              icon="/ui/assets/SVG/24/haz-lights.svg"
            >{{ $t("ui.radialmenu2.electrics.hazard_lights.__text__") }}</ButtonItem>
            <ButtonItem :active="vehicle.electrics.lightbar" @click="vehSwitch('lightbar')"
              :disable="!loaded.vehicle"
              icon="/ui/assets/SVG/24/strobe-lights.svg"
            >{{ $t("ui.radialmenu2.electrics.lightbar.__text__") }}</ButtonItem>
          </template>
        </ButtonMenu>
        <!-- garage features -->
        <ButtonMenu v-if="!inCareer"
          :disable="!loaded.init"
          icon="/ui/assets/SVG/24/garage-features-3.svg"
        >
          <template #toggle>{{ $t("ui.garage2.features") }}</template>
          <template #left>
            <ButtonItem :active="lightState[0]" @click="lightToggle(0)"
              icon="/ui/assets/SVG/24/garagelight-left.svg"
            >{{ $t("ui.garage2.lights.west") }}</ButtonItem>
            <ButtonItem :active="lightState[1]" @click="lightToggle(1)"
              icon="/ui/assets/SVG/24/garagelight-middle.svg"
            >{{ $t("ui.garage2.lights.middle") }}</ButtonItem>
            <ButtonItem :active="lightState[2]" @click="lightToggle(2)"
              icon="/ui/assets/SVG/24/garagelight-right.svg"
            >{{ $t("ui.garage2.lights.east") }}</ButtonItem>
          </template>
        </ButtonMenu>
      </div>

    </div>

    <div v-if="!inCareer" class="garage-row-bottom garage-bottom">
      <!-- normal garage -->
      <ButtonItem :active="vehcomp === 'save'" @click="menuOpen('save')"
        :disable="!loaded.vehicle"
        icon="/ui/assets/SVG/24/save-as.svg"
      >{{ $t("ui.vehicleconfig.save") }}</ButtonItem>
      <!-- <ButtonItem :active="vehcomp === 'save'" @click="mainMode('savedefault')"
        :disable="!loaded.vehicle"
        icon="/ui/assets/SVG/24/vehicle-favorite.svg"
      >[save def]</ButtonItem> -->
      <ButtonItem @click="menuOpen('test')"
        :disable="!loaded.vehicle"
        icon="/ui/assets/SVG/24/test-cone.svg"
      >{{ $t("ui.common.test") }}</ButtonItem>
    </div>
    <div v-else class="garage-row-bottom garage-bottom">
      <!-- career garage -->
      <ButtonItem @click="exit()"
        :disable="!loaded.vehicle"
        icon="/ui/assets/SVG/24/exit.svg"
      >{{ $t("ui.common.exit") }}</ButtonItem>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount, onUnmounted, inject, markRaw } from "vue";
import { lua, useBridge } from "@/bridge";
// import { BngCard } from "@/common/components/base"
import { vBngBlur, vBngFrustumMover, vBngOnUiNav } from "@/common/directives";
import ButtonMenu from "../components/ButtonMenu.vue";
import ButtonItem from "../components/ButtonItem.vue";

const components = {
  // see onBeforeMount for component wrapper
  garage: {
    paint: import("@/modules/vehicleConfig/components/Paint.vue"),
    // parts: import("@/modules/vehicleConfig/components/Parts.vue"),
    tuning: import("@/modules/vehicleConfig/components/Tuning.vue"),
    save: import("@/modules/vehicleConfig/components/Save.vue"),
  },
  career: {
    inventory: import("@/modules/career/components/vehicleInventory/VehicleInventory.vue"),
  },
}

const $game = inject("$game");
const bngVue = window.bngVue || { gotoGameState() { } };

const { streams } = useBridge();
const streamsList = ["electrics"];

import { useUINavScope } from "@/services/uiNav";
useUINavScope("garage");

// DEBUG_ONLY >>
const testDecalEditor = () => bngVue.gotoGameState('decalEditor')
// << END_DEBUG_ONLY

const elCard = ref(), elComp = ref();

const lightState = ref([false, false, false]);
async function lightToggle(idx) {
  lightState.value[idx] = !lightState.value[idx];
  await lua.extensions.gameplay_garageMode.setLighting(lightState.value);
}

async function setCamera(view) {
  await lua.extensions.gameplay_garageMode.setCamera(view);
}

// electric switches
const switches = reactive({
  lowbeam:  { func: "setLightsState",      value: "lights_state",   on: 1, off: 0 },
  highbeam: { func: "setLightsState",      value: "lights_state",   on: 2, off: 0 },
  fog:      { func: "set_fog_lights",      value: "fog",            on: 1, off: 0 },
  lightbar: { func: "set_lightbar_signal", value: "lightbar",       on: 1, off: 0 },
  hazard:   { func: "set_warn_signal",     value: "hazard_enabled", on: 1, off: 0 },
});
for (let key in switches)
  switches[key].state = false;

function vehSwitch(key, on) {
  if (!switches.hasOwnProperty(key))
    return;
  const svc = switches[key];
  if (typeof on === "undefined") // toggle if undefined
    on = !svc.state;
  else if (on === svc.state)
    return;
  $game.api.activeObjectLua(`electrics.${svc.func}(${on ? svc.on : svc.off})`);
}

// const captureInput = InputCapturer({
//   backAction() { // action on Esc/B
//     if (!vehcomp.value)
//       return false; // allow default
//     vehcomp.value = "";
//     return true; // prevent default
//   }
// });

const loaded = reactive({
  init: false,
  vehicle: false,
  status: false,
});
const vehicle = reactive({
  name: "Unknown",
  vehicle: null,
  electrics: {},
  state: {},
});
const inCareer = ref(false);
const blackscreen = ref(false);
const vehcomp = ref(null);
const vehcompview = ref(null);
let tmrInit;

function menuOpen(mode) {
  vehcomp.value = vehcomp.value === mode ? "" : mode;
  switch (mode) {
    case "paint":
      $game.api.engineLua("gameplay_garageMode.setGarageMenuState('paint')");
      // bngVue.gotoGameState("menu.vehicleconfig.color");
      vehcompview.value = components.garage.paint;
      break;
    case "parts":
      $game.api.engineLua("gameplay_garageMode.setGarageMenuState('parts')");
      // bngVue.gotoGameState("menu.vehicleconfig.parts");
      // vehcompview.value = components.garage.parts;
      break;
    case "tuning":
      if (inCareer.value) {
        // $game.api.engineLua("career_modules_tuning.start()");
      } else {
        $game.api.engineLua("gameplay_garageMode.setGarageMenuState('tuning')");
        // bngVue.gotoGameState("menu.vehicleconfig.tuning");
      }
      vehcompview.value = components.garage.tuning;
      break;
    case "vehicles":
      $game.api.engineLua("gameplay_garageMode.setGarageMenuState('vehicles')");
      bngVue.gotoGameState("menu.vehicles", { params: { mode: "garageMode", garage: "all" } });
      break;
    case "mycars":
      if(inCareer.value) {
        // $game.api.engineLua("career_modules_inventory.openMenuInsideGarage()");
        vehcompview.value = components.career.inventory;
      } else {
        $game.api.engineLua("gameplay_garageMode.setGarageMenuState('myCars')");
        bngVue.gotoGameState("menu.vehicles", { params: { mode: "garageMode", garage: inCareer.value ? "own-career" : "own" } });
      }
      break;
    case "photo":
      bngVue.gotoGameState("menu.photomode");
      break;
    case "save":
      // bngVue.gotoGameState("menu.vehicleconfig.save");
      vehcompview.value = components.garage.save;
      break;
    case "savedefault":
      console.log("TODO: save as default");
      break;
    case "test":
      vehcomp.value = "";
      $game.api.engineLua("gameplay_garageMode.testVehicle()");
      break;
    default:
      vehcomp.value = "";
      break;
  }
}

function exit() {
  if (inCareer.value)
    careerExitGarage();
}

function careerExitGarage() {
  $game.api.engineLua("gameplay_garageMode.stop()", () => bngVue.gotoGameState("play"));
  // if (vehicle.state.vehicleDirty || vehicle.state.switchedToNewVehicle) {
  //   ConfirmationDialog.open(
  //     null, "ui.career.garage.exitPrompt",
  //     [
  //       { label: "ui.common.yes", key: true },
  //       { label: "ui.common.no", key: false, default: true, isCancel: true }
  //     ]
  //   ).then(res => {
  //     if (res) {
  //       $game.api.engineLua("gameplay_garageMode.stop()");
  //       bngVue.gotoGameState("play");
  //     }
  //   });
  // } else {
  //   $game.api.engineLua("gameplay_garageMode.stop()");
  //   bngVue.gotoGameState("play");
  // }
}

// handles vehicle change
async function vehChange() { // this function init is at bottom of garage controller
  // reset menus // don't! if you do, check if it's not conflicting with parts change
  //vehcomp.value = "";
  // lock status
  loaded.vehicle = false;
  loaded.status = false;
  // reset vehicle
  vehicle.name = "Unknown";
  vehicle.vehicle = null;
  vehicle.electrics = {};
  // enable electrics w/o ignition
  await $game.api.activeObjectLua("electrics.setIgnitionLevel(1)");
  // request info
  const data = await lua.core_vehicles.getCurrentVehicleDetails();
  if (tmrInit) {
    loaded.init = true; // to unlock controls even on a wrong data
    clearTimeout(tmrInit);
    tmrInit = null;
  }
  // console.log("VEHICLE", data);
  if (!data)
    return;
  loaded.vehicle = true;
  vehicle.vehicle = data;
  if (data.model.Brand)
    vehicle.name = `${data.model.Brand} ${data.model.Name}`;
  else
    vehicle.name = data.configs.Name;
  if (data.configs.Configuration) {
    if (data.configs.Source === "BeamNG - Official")
      vehicle.name += ` - ${data.configs.Configuration}`;
    else
      vehicle.name += " - Custom"; // ?
  }
}

function onStreamsUpdate(streams) {
  if (!streams.electrics)
    return;
  const data = streams.electrics;
  loaded.status = data.ignitionLevel > 0; // check if electrics is on
  // console.log("ELECTRICS", data);
  for (let key in switches) {
    const svc = switches[key];
    svc.state = data.hasOwnProperty(svc.value) && data[svc.value] === svc.on;
    vehicle.electrics[key] = svc.state;
  }
}

onBeforeMount(async () => {
  for (const group in components) {
    for (const comp in components[group])
      components[group][comp] = await markRaw((await components[group][comp]).default)
  }

  // // see also play.js
  // $scope.$watch("$parent.app.gameState", gameState => {
  //   // this is to make garage disappear when garage was opened inside freeroam or else
  //   if (gameState !== "garage")
  //     $state.go("play");
  // });

  // captureInput(true);

  streams.add(streamsList);

  tmrInit = setTimeout(() => {
    console.log("Unable to get vehicle details in time. Forcing to init...");
    loaded.init = true;
    tmrInit = null;
  }, 3000);

  $game.events.on("VehicleChange", vehChange);
  $game.api.activeObjectLua("electrics.setIgnitionLevel(1)"); // enable electrics w/o ignition

  // track electrics state
  $game.events.on("onStreamsUpdate", onStreamsUpdate);

  $game.events.on("garageVehicleDirtied", function (evt, data) {
    if (typeof data !== "object")
      return;
    vehicle.state.vehicleDirty = data.vehicleDirty;
    vehicle.state.switchedToNewVehicle = data.switchedToNewVehicle;
  });

  // garage configs are registered in angular vehicle controller

  $game.api.engineLua("career_career.isActive()", data => {
    inCareer.value = !!data;
    // VehicleSelectConfig.configs.garageMode.inCareer = inCareer.value;
  });

  $game.events.on("GarageModeBlackscreen", (evt, data) => blackscreen.value = data.active);

  vehChange(); // init

  // garage lighting
  $game.api.engineLua("gameplay_garageMode.getLighting()", data => lightState.value = data );

  // .service("GarageVehicleState", ["$rootScope", function ($rootScope) {
  //   let state = {};
  //   $rootScope.$on("garageVehicleDirtied", function (event, data) {
  //     if (typeof data !== "object")
  //       return;
  //     state.vehicleDirty = data.vehicleDirty;
  //     state.switchedToNewVehicle = data.switchedToNewVehicle;
  //   });
  //   return state;
  // }])
});

onUnmounted(() => {
  $game.events.off("onStreamsUpdate", onStreamsUpdate);
  streams.remove(streamsList);
  // captureInput(false);
});
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
  background-color: rgba(0,0,0, 0.9);
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
