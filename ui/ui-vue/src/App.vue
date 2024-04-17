<template>
  <div class="vue-app-main" v-if="route.name !== 'unknown'">
    <router-view />
  </div>
  <Popup type="activity" />
  <Popup />
  <VueDebug />
  <div id="vue-app-container">
    <div v-for="app of apps" :key="app.appKey">
      <Teleport :to="app.teleport">
        <component :is="app.comp" v-bind="app.props"></component>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRoute } from "vue-router"
import { spawnUiApp, destroyUiApp } from "@/modules/apps/appManager"

import VueDebug from "@/modules/debug/components/VueDebug.vue"
import Popup from "@/modules/popup/views/Popup.vue"
import router from "@/router"

const apps = ref([])

const bngVue = window.bngVue || {}

bngVue.gotoGameState = (state = "ui-test", { params = false, tryAngularJS = true } = {}) => {
  const a = history.state
  if (!router.hasRoute(state)) {
    window.location.hash = "#/" + state
    if (tryAngularJS && window.angular) angular.element(document.querySelector("body")).controller().changeAngularStateFromVue(state, params)
  } else {
    window.angular && window.angular.element(document.querySelector("body")).controller().changeAngularStateFromVue("blank")
    window.location.hash = router.resolve({ name: state, params }).href
    router.replace({ name: state, params })
  }
  history.replaceState(a, "", window.location.toString())
}

bngVue.getCurrentRoute = () => router.currentRoute.value

bngVue.spawnApp = (appName, appId, params = null) => spawnUiApp(appName, appId, params, apps.value)

bngVue.destroyApp = appName => destroyUiApp(appName, apps.value)

const route = useRoute()
</script>

<style scoped lang="scss" src="@/styles/main.scss" />

<style>
.vue-app-main {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zorder_index_fullscreen_default);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  font-family: var(--fnt-defs);
  overflow: hidden;
}
</style>
