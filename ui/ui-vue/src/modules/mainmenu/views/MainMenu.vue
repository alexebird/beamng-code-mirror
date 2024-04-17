<!-- MainMenu -->
<template>
  <div bng-ui-scope="mainmenuUI" v-bng-on-ui-nav:menu,back="exit">
    <!-- Game logo TODO: don't use angular styles/assests -->
    <div class="mainmenu-buttons-all">
      <div class="mainmenu-title" style="margin: 0em !important; transform: scale(0.5);">
        <div class="logo-container">
          <div :class="`logo-${product()}`"></div>
        </div>
      </div>
      <div v-if="!showOtherButtons" class="primary-items">
        <MenuItem v-for="item in mainitems" :icon="item.icon" :bgimg="item.bg" @click="action(item.action)">{{item.title}}</MenuItem>
      </div>
      <div class="expanded-items"> </div>
      <BngScreenHeading v-if="showOtherButtons" :divider="true" type="line" style="margin-left: 5em;">
        Extra game modes (legacy)
      </BngScreenHeading>
      <div v-if="showOtherButtons" class="extra-items">
        <MenuItem v-for="item in otheritems" :icon="item.icon" @click="action(item.action)">{{item.title}}</MenuItem>
      </div>
      <div v-if="isdev && !showOtherButtons" class="debug-items">
        <MenuItem v-for="item in debugitems" :icon="item.icon" @click="action(item.action)">{{item.title}}</MenuItem>
      </div>
      <div class="bottom-items">
        <MenuItem v-for="item in bottomitems" @click="action(item.action)" :color="item.color ? item.color : 'rgba(0,0,0,0.6)'">{{item.title}}</MenuItem>
      </div>
    </div>
    <div class="bottom-bar" bng-no-nav="true"> 
      <div class="bottom-bar-stats">
        <BngImageAsset src="images/mainmenu/vertical-stub.svg" class="no-bg" />
        <span v-if="isOnline()" class="use-bg">ONLINE</span>
        <span v-if="isEosOnline()" class="use-bg">
          <BngImageAsset src="images/mainmenu/eosicon.png" />
        </span>
        <span v-if="isSteamOnline()" class="use-bg"> 
          <BngImageAsset src="images/mainmenu/steamicon.png" />
          {{steamInfo().playerName}} 
          {{steamInfo().branch != "public" ? "Branch:" + steamInfo().branch : ""}} 
        </span>
        <BngImageAsset v-if="isOnline() || isEosOnline() || isSteamOnline()" src="images/mainmenu/vertical-stub-short.svg" class="no-bg" />
        <span @click="toggleBuildInfo" class="use-bg">
          <span v-if="!showBuildInfo">Alpha v{{beamInfo().versionSimpleStr}}</span>
          <span v-if="showBuildInfo">Alpha v{{beamInfo().version}}</span>
          <span v-if="showBuildInfo">{{beamInfo().buildinfo}}</span>
        </span>
        <BngImageAsset src="images/mainmenu/angled-stub-right.svg" class="no-bg" />
      </div>
      <div class="bottom-bar-buttons">
        <BngImageAsset src="images/mainmenu/angled-stub-left.svg" class="no-bg" />
        <span class="use-bg">
          <BngIcon :type="icons.xboxDDefaultSolid" /> {{$translate.instant("ui.mainmenu.navbar.navigate")}}
        </span>
        <span class="use-bg">
          <BngBinding action="menu_item_select" deviceMask="xinput"></BngBinding> {{$translate.instant("ui.inputActions.menu.menu_item_select.title")}}
        </span>
        <span class="use-bg">
          <BngBinding action="menu_item_back" deviceMask="xinput"></BngBinding> {{$translate.instant("ui.inputActions.menu.menu_item_back.title")}}
        </span>
        <span v-if="!isMainMenu()" class="use-bg">
          <BngBinding action="menu_tab_left" deviceMask="xinput"></BngBinding> {{$translate.instant("ui.inputActions.menu.menu_tab_left.title")}}
        </span>
        <span v-if="!isMainMenu()" class="use-bg">
          <BngBinding action="menu_tab_right" deviceMask="xinput"></BngBinding> {{$translate.instant("ui.inputActions.menu.menu_tab_right.title")}}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from "vue"
import { useBridge } from "@/bridge"
import { $translate } from "@/services"
import { vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import { BngBinding, BngIcon, BngScreenHeading, BngImageAsset, icons } from "@/common/components/base"
import MenuItem from "../components/MenuItem.vue"
import router from "@/router"

const $game = inject("$game")
const bngVue = window.bngVue || { gotoGameState() { } }
const { lua, events } = useBridge()
useUINavScope('mainmenuUI')

//top row / big items
const mainitems = {
  freeroam: {
    title: $translate.instant("ui.playmodes.freeroam"),
    icon: "icons/drive/freeroam.svg",
    bg: "images/mainmenu/freeroam.png",
    action: "freeroam"
  },
  career: {
    title: $translate.instant("ui.playmodes.career"),
    icon: "icons/drive/career.svg",
    bg: "images/mainmenu/career.png",
    action: "career"
  },
  others: {
    title: "Others",
    icon: "icons/drive/campaigns.svg",
    bg: "images/mainmenu/others.png",
    action: "others"
  }
}

// bottom row items, always show
const bottomitems = {
  modrepo: {
    title: $translate.instant("ui.mainmenu.mods"),
    icon: "",
    color: "rgba(135,62,35,0.6)",
    action: "modrepo"
  },
  credits: {
    title: $translate.instant("ui.mainmenu.credits"),
    icon: "",
    action: "credits"
  },
  options: {
    title: $translate.instant("ui.mainmenu.options"),
    icon: "",
    action: "options"
  },
  quitgame: {
    title: $translate.instant("engine.editor.menu.quit"),
    icon: "",
    color: "rgba(255,0,0,0.6)",
    action: "quitgame"
  }
}

//other submenu items
const otheritems = {
  campaigns: {
    title: $translate.instant("ui.playmodes.campaigns"),
    icon: "icons/drive/campaigns.svg",
    action: "campaigns"
  },
  scenarios: {
    title: $translate.instant("ui.playmodes.scenarios"),
    icon: "icons/drive/scenarios.svg",
    action: "scenarios"
  },
  quickplay: {
    title: $translate.instant("ui.playmodes.quickrace"),
    icon: "icons/drive/timetrials.svg",
    action: "quickplay"
  },
  garage: {
    title: $translate.instant("ui.mainmenu.garage"),
    icon: "icons/drive/garage.svg",
    action: "garage"
  },
  busroutes: {
    title: $translate.instant("ui.playmodes.bus"),
    icon: "icons/drive/busroutes.svg",
    action: "busroutes"
  },
  lightrunner: {
    title: $translate.instant("ui.playmodes.lightRunner"),
    icon: "icons/drive/lightrunner.svg",
    action: "lightrunner"
  },
  trackbuilder: {
    title: $translate.instant("ui.playmodes.trackBuilder"),
    icon: "icons/drive/autobahn.svg",
    action: "trackbuilder"
  },
  stats: {
    title: "Stats",
    icon: "icons/drive/stat.svg",
    action: "stats"
  }
}

//debug only items
const debugitems = {
  continuefreeroam: {
    title: "🐞Continue Freeroam (last map and vehicle)",
    icon: "icons/drive/play.svg",
    action: "continuefreeroam"
  },
  dynamictest: {
    title: "🐞Dynamic Test",
    icon: "icons/drive/campaigns.svg",
    action: "dynamictest"
  },
  tester: {
    title: "🐞Tester",
    icon: "icons/drive/freeroam.svg",
    action: "tester"
  }
}

//button-item actions
async function action(mode) {
  switch (mode) {
    case "career":
      bngVue.gotoGameState("menu.career")
      break
    case "credits":
      router.push("credits")
      break
    case "options":
      bngVue.gotoGameState('menu.options.display')
      break
    case "others":
      toggleOtherButtons();
      break
    case "quitgame":
      $game.api.engineLua('quit();')
      $game.api.engineLua("TorqueScript.eval('quit();')")
      break
    case "freeroam":
      bngVue.gotoGameState("menu.levels")
      break
    case "modrepo":
      bngVue.gotoGameState('menu.mods.local')
      break
    case "campaigns":
      bngVue.gotoGameState('menu.campaigns')
      break
    case "scenarios":
      bngVue.gotoGameState('menu.scenarios')
      break
    case "quickplay":
      bngVue.gotoGameState('menu.quickraceOverview')
      break
    case "garage":
      $game.api.engineLua(`gameplay_garageMode.start()`)
      break
    case "busroutes":
      bngVue.gotoGameState('menu.busRoutes')
      break
    case "lightrunner":
      bngVue.gotoGameState('menu.lightrunnerOverview')
      break
    case "trackbuilder":
      $game.api.engineLua("freeroam_freeroam.startTrackBuilder('glow_city')")
      break
    case "stats":
      bngVue.gotoGameState('menu.options.stats')
      break
    case "continuefreeroam":
      bngVue.gotoGameState('menu.continueFreeroam')
      //$game.api.engineLua('extensions.freeroam_continueFreeroam.start()');
      break
    case "dynamictest":
      bngVue.gotoGameState('menu.dynamicTest')
      break
    case "tester":
      bngVue.gotoGameState('menu.MPSessionOrList')
      break
    default:
      console.log(mode)
      break
  }
}

//toggles
const showBuildInfo = ref(false)
const toggleBuildInfo = () => {
  showBuildInfo.value = !showBuildInfo.value
}
const showOtherButtons = ref(false)
const toggleOtherButtons = () => {
  showOtherButtons.value = !showOtherButtons.value
}

////State and/or online info////
const isMainMenu = () => {
  return window.beamng && window.beamng.mainmenu
}

const isdev = () => {
  return window.beamng && !window.beamng.shipping
}

const product = () => {
  return window.beamng && window.beamng.product
}

const isOnline = () => {
  return window.beamng && window.beamng.onlineState
}

const isServiceProviderInfo = () => {
  return window.beamng && typeof window.beamng.serviceProviderInfo !== "undefined"
}

const isEosOnline = () => {
  if(isServiceProviderInfo()) {
    let spi = window.beamng.serviceProviderInfo
    return typeof spi.eos === "object" && spi.eos.loggedin
  }
  return false;
}

const isSteamOnline = () => {
  if(isServiceProviderInfo()) {
    let spi = window.beamng.serviceProviderInfo
    return typeof spi.steam === "object" && spi.steam.loggedin && spi.steam.working
  }
  return false
}

const steamInfo = () => {
  return isSteamOnline() ? window.beamng.serviceProviderInfo.steam : {}
}

const beamInfo = () => {
  return window.beamng ? window.beamng : {}
}

////On enter / exit////
const start = () => {
  if(history.state && history.state.current != "/menu") {
    //bngVue.gotoGameState("menu.mainmenu")
  }
}

const exit = () => {
  if(showOtherButtons.value) {
    toggleOtherButtons();
  } else {
    bngVue.gotoGameState("menu.mainmenu")
  }
}

const kill = () => {
  //
}
onMounted(start)
onUnmounted(kill)


</script>

<style lang="scss" scoped>
$heading-background-color: rgba(0, 0, 0, 0.6);

$divider-color: white;
$divider-height: 0.9em;

$decoration-color: #ff6600;
$font-top-line-space: 1px;
$bottom-bar-height: 3em;

.mainmenu-buttons-all {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  width: 100%;
  height: calc(100% - 3em);
}
.primary-items {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.debug-items {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  .menu-item {
    min-width: 16em;
  }
}
.extra-items {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  width: calc(16em * 5);
  margin-left: auto;
  margin-right: auto;
  .menu-item {
    width: 16em;
  }
}
.bottom-items {
  display: flex;
  flex-direction: row;
  justify-content: center;
  .menu-item {
    width: 16em;
  }
}
.bottom-bar {
  position: absolute;
  bottom: 1em;
  width: 100%;
  height: $bottom-bar-height;
  color: white;
  .use-bg {
    background-color: $heading-background-color;
    height: $bottom-bar-height;
    line-height: $bottom-bar-height;
  }
  .no-bg {
    height: $bottom-bar-height;
  }
  .bottom-bar-stats {
    position: absolute;
    bottom: 0;
    left: 0;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 1em;
    span {
      padding-left: 0.25em;
      padding-right: 0.25em;
    }
    .small-spacer {
      width: 2px;
      height: 24px;
      background-color: $decoration-color;
      padding: 0;
      margin: 0;
    }
  }
  .bottom-bar-buttons {
    position: absolute;
    bottom: 0;
    right: 0;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 1em;
    span:last-of-type {
      padding-right: 0.5em;
      border-top-right-radius: var(--bng-corners-1);
      border-bottom-right-radius: var(--bng-corners-1);
    }
    span {
      padding-left: 0.25em;
      padding-right: 0.25em;
    }
  }
}
</style>