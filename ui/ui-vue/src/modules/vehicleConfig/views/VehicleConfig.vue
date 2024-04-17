<template>
  <LayoutSingle class="vehcfg layout-content-full layout-align-hstart"
    bng-ui-scope="vehicle-config"
    _v-bng-on-ui-nav:menu="exit"
  >

    <div class="vehconfig-new-ui" v-bng-blur="true" @click="backToOld()" bng-nav-item>
      Back to old UI
    </div>

    <Tabs class="bng-tabs" v-bng-frustum-mover.left="true">
      <TabList v-bng-blur />
      <Tab
        :selected="tab === 'parts'"
        :heading="$t('ui.vehicleconfig.parts')"
        :load-on-demand="true"
      ><Parts :with-background="true" /></Tab>
      <Tab
        :selected="tab === 'tuning'"
        :heading="$t('ui.vehicleconfig.tuning')"
        :load-on-demand="true"
      ><Tuning :with-background="true" /></Tab>
      <Tab
        :selected="tab === 'paint'"
        :heading="$t('ui.vehicleconfig.color')"
        :load-on-demand="true"
      ><Paint :with-background="true" /></Tab>
      <Tab
        :selected="tab === 'save'"
        :heading="$t('ui.vehicleconfig.save') + ' & ' + $t('ui.vehicleconfig.load')"
        :load-on-demand="true"
      ><Save :with-background="true" /></Tab>
      <!-- <Tab
        :selected="tab === 'debug'"
        :heading="$t('ui.debug.vehicle')"
        :load-on-demand="true"
      ><Debug :with-background="true" /></Tab> -->
    </Tabs>

  </LayoutSingle>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import { LayoutSingle } from "@/common/layouts"
import { Tabs, TabList, Tab } from "@/common/components/utility"
import { vBngBlur, vBngFrustumMover, vBngOnUiNav } from "@/common/directives"

import Parts from "../components/Parts.vue"
import Tuning from "../components/Tuning.vue"
import Paint from "../components/Paint.vue"
import Save from "../components/Save.vue"
// import Debug from "../components/Debug.vue"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("vehicle-config")

const props = defineProps({
  tab: {
    type: String,
    default: "parts",
    validator: val => !val || ["parts", "tuning", "paint", "save", "debug"].includes(val),
  },
})

function exit() {
  //
}

const root = () => [...document.getElementsByClassName("vue-app-main")][0]
onMounted(() => root().classList.add("vehcfg-click-through"))
onBeforeUnmount(() => root().classList.remove("vehcfg-click-through"))

const backToOld = () => window.bngVue.gotoGameState("menu.vehicleconfig.parts")
</script>

<style lang="scss">
.vehcfg-click-through {
  pointer-events: none;
  > * {
    pointer-events: all;
  }
}
</style>
<style lang="scss" scoped>
.vehcfg {
  padding-top: 2.5em;
  padding-bottom: 2.75em;
  pointer-events: none;
  > * {
    pointer-events: all;
  }
}
:deep(.bng-tabs) {
  width: 35em;
  .tab-item {
    white-space: nowrap;
    // &:not(.tab-active-tab) {
      text-overflow: ellipsis;
      overflow: hidden;
    // }
  }
  .tab-list {
    margin: 0;
  }
  .tab-list,
  .tab-content {
    border-radius: 0;
  }
}

.vehconfig-new-ui {
  position: absolute;
  display: inline-block;
  top: 2.9em;
  left: 35.35em;
  width: auto;
  height: auto;
  padding: 0.75em 1em;
  border-radius: 0.3em;
  text-align: center;
  background-color: rgba(0,0,0, 0.5);
  font-weight: 600;
  color: #fff;
}
.vehconfig-new-ui:hover,
.vehconfig-new-ui:focus {
  background-color: rgba(0,0,0, 0.7);
}
</style>
