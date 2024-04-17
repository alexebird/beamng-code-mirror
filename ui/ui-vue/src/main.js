import * as Vue from "vue/dist/vue.esm-bundler.js"

// Polyfills for newer JS stuff in case of CEF reversion
import "@/utils/polyfills.js"

import { createApp } from "vue"
import { createPinia } from "pinia"

import { useBridge, setBridgeDependencies } from "@/bridge"
import logger from "@/services/logger"
import { contextTranslatePlugin, preprocessLocaleJSON } from "@/services/translation"

import Emitter from "tiny-emitter"

import App from "./App.vue"

import router from "@/router"

// UI Apps registration
import { registerApps } from "@/modules/apps/appManager"
import * as UiApps from "@/modules/apps"
import { useGameContextStore } from "@/services/gameContextStore"
import { customDisposePlugin } from "@/utils/storePlugins"

// make sure Vue available globally for legacy stuff depending on it
window.Vue = Vue

// set up the bridge with the game, and store it globally (vueService will need it - at least until we eventually retire that)
const deps = {
  Emitter,
  beamng: window.beamng,
}

// set an override if an API is already set up
if (window.bngApi) deps["overrideAPI"] = window.bngApi
setBridgeDependencies(deps)
let bridge = useBridge()
window.bridge = bridge

// switch on the UI Nav events & hook up a global handler (involving crossfire) to use them
bridge.uiNavEvents.activate()
bridge.uiNavEvents.hookGlobalEvents(true)

const pinia = createPinia()
  .use(() => ({ $game: bridge }))
  .use(customDisposePlugin)
const app = createApp(App).use(router).use(pinia).use(registerApps, UiApps)

// add global stores
// TODO: Create a wrapper function/file that aggregates all of them
useGameContextStore()

window.bngVue = {
  start: ({ i18n }) => {
    app.config.globalProperties.$game = bridge
    app.config.globalProperties.$console = logger
    app.config.globalProperties.$logger = logger

    app
      .use(i18n)
      .use(contextTranslatePlugin(app.config.globalProperties.$t || i18n.global.t))
      .provide("$game", bridge)
      .provide("$logger", logger)
      .provide("$console", logger)

      .mount("#vue-app")
  },
  startTest: () => {
    app.mount("#vue-app")
  },
  isProd: process.env.NODE_ENV === "production",
  preprocessLocaleJSON,
}

// start the app if we're outside the game
if (!window.beamng) {
  window.bngVue.start({
    i18n: window.i18n,
  })
}
