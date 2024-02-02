<template>
  <LayoutSingle class="layout-content-full layout-align-start layout-align-hcenter layout-paddings flex-column">
    <BngCard v-if="inspectVehicleStore.spawnedVehicleInfo" class="inspectVehicle-menu" bng-ui-scope="inspectVehicle">
      <BngCardHeading> {{ inspectVehicleStore.spawnedVehicleInfo.name }} </BngCardHeading>
      <div v-if="inspectVehicleStore.testDriveTimer > 0 && inspectVehicleStore.testDriveActive" style="padding-left: 20px; float: left">
        <h4>Test drive will end in {{ inspectVehicleStore.testDriveTimer }} S</h4>
      </div>
      <div v-if="inspectVehicleStore.needsRepair" style="padding: 0px 20px">
        <p>You have returned the vehicle damaged. If you decide to leave, you will have to pay {{ inspectVehicleStore.claimPrice }} for the repairs</p>
      </div>
      <template #buttons>
        <BngButton
          v-if="!inspectVehicleStore.isTutorial && !inspectVehicleStore.testDriveActive && !inspectVehicleStore.testDroveOnce"
          @click="startTestDrive"
          :accent="'secondary'"
          >Start Test Drive</BngButton
        >
        <BngButton v-if="!inspectVehicleStore.testDriveActive" @click="buy">Purchase Info</BngButton>
        <BngButton v-if="inspectVehicleStore.testDriveActive" @click="endTestDrive" v-bng-on-ui-nav:menu.asMouse><span><BngBinding ui-event="menu" deviceMask="xinput" />End Test Drive</span></BngButton>
        <BngButton v-if="!inspectVehicleStore.testDriveActive && inspectVehicleStore.testDroveOnce" :accent="'attention'" @click="leaveInspectVehicle"
          >Abandon the sale</BngButton
        >
      </template>
    </BngCard>
  </LayoutSingle>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue"
import { vBngOnUiNav } from "@/common/directives"
import { BngButton, BngCard, BngCardHeading, BngBinding } from "@/common/components/base"
import { useInspectVehicleStore } from "../stores/inspectVehicleStore"
import { lua } from "@/bridge"
import { default as UINavEvents, UI_EVENTS, UI_EVENT_GROUPS } from "@/bridge/libs/UINavEvents"
import { LayoutSingle } from "@/common/layouts"

import { useUINavScope } from "@/services/uiNav"

const inspectVehicleStore = useInspectVehicleStore()

useUINavScope("inspectVehicle") 

function buy() {
  lua.career_modules_vehicleShopping.openPurchaseMenu("inspect", inspectVehicleStore.spawnedVehicleInfo.shopId)
}

function startTestDrive() {
  UINavEvents.setFilteredEvents(
    UI_EVENTS.back,
    UI_EVENTS.tab_l,
    UI_EVENTS.tab_r,
    UI_EVENTS.focus_ud,
    UI_EVENTS.focus_lr,
    UI_EVENTS.ok,
    UI_EVENTS.cancel,
    UI_EVENT_GROUPS.focusMove
  )
  inspectVehicleStore.startTestDrive()
}

function leaveInspectVehicle() {
  lua.career_modules_inspectVehicle.leaveInspectVehicle(inspectVehicleStore.needsRepair)
}

function endTestDrive() {
  UINavEvents.clearFilteredEvents()
  lua.career_modules_inspectVehicle.endTestDrive()
}

const start = () => {
  lua.career_modules_inspectVehicle.sendUIData()
  lua.career_modules_inspectVehicle.onInspectScreenChanged(true)
}

const kill = () => {
  lua.career_modules_inspectVehicle.onInspectScreenChanged(false)

  UINavEvents.clearFilteredEvents()
  UINavEvents.activate()

  inspectVehicleStore.$dispose()
}
onMounted(start)
onUnmounted(kill)
</script>

<style scoped lang="scss">
.inspectVehicle-menu {
  overflow: auto;
  //background: rgba(0,0,0,0.8);
  color: white;
  max-width: 30em;
  min-width: 20em;
  // position: absolute;
  // bottom: 30%;
  // left: 0;
  // width: 20%;
  // height: 30%;
  //text-align: center;
  .inspect-wrapper {
    display: flex;
    flex-flow: row wrap;
    padding: 0.5em 1em 1.5em 1em;
    justify-content: flex-end;
  }
}
</style>
