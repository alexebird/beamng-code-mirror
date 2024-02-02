<template>
  <div class="md-content" id="bng-hello-world-v" tabindex="0" @keypress="exit">
    <div>CONTROLLER UI INPUT EVENTS TEST</div>
    <br/>
    <div id="controllerEventDiv" v-on:ui_nav="processControllerEvent">PRESS BUTTONS <button>Focus here</button></div>
    <br/>
    <div> Most Recent Local Event: {{lastControllerEvent}} </div>
    <br/>
    <div> Most Recent Document Wide Event: {{lastDocumentControllerEvent}} </div>
    <br/>
    <br/>
    <div>CUSTOM JS EVENTS TEST</div>
    <button v-on:mousedown="fireTestEvent('btn_a',1,'')" v-on:mouseup="fireTestEvent('btn_a',0,'')">BTN A</button>
    <button v-on:mousedown="fireTestEvent('btn_b',1,'')" v-on:mouseup="fireTestEvent('btn_b',0,'')">BTN B</button>
    <button v-on:mousedown="fireTestEvent('btn_x',1,'')" v-on:mouseup="fireTestEvent('btn_x',0,'')">BTN X</button>
    <button v-on:mousedown="fireTestEvent('btn_y',1,'')" v-on:mouseup="fireTestEvent('btn_y',0,'')">BTN Y</button>
    <div id="lastEventDiv" v-on:basicTestEvent="processTestEvent"> Most Recent Event: {{lastEvent}} </div>
  </div>
</template>

<script setup>
import { lua } from '@/bridge'
import { onMounted, onUnmounted, ref, inject } from "vue"
import { getAssetURL } from "@/utils"

//init controller events
const $game = inject("$game")
$game.uiNavEvents.activate(true)

//Test recieving ui_nav events for the document
const lastDocumentControllerEvent = ref("N/A")
const processDocumentControllerEvent = e => lastDocumentControllerEvent.value = `name: ${e.detail.name} | value: ${e.detail.value} | modified: ${e.detail.modified}`
document.addEventListener("ui_nav", processDocumentControllerEvent)

//Test recieving ui_nav event on a specific element
const lastControllerEvent = ref("N/A")
function processControllerEvent(e) {
  //console.log("event captured: " + e.detail.name)
  lastControllerEvent.value = `name: ${e.detail.name} | value: ${e.detail.value} | modified: ${e.detail.modified}`
}

//Test Vue firing and recieving a simmilar basic custom JS input event with vue bindings
const lastEvent = ref("N/A")
function fireTestEvent(item, state, change) {
  document.querySelector("#lastEventDiv").dispatchEvent(new CustomEvent("basicTestEvent", {
    detail: {name: item, value: state, modified: change},
    bubbles: true,
    cancelable: true,
    composed: false,
  }))
}
function processTestEvent(e) {
  lastEvent.value = `name: ${e.detail.name} | value: ${e.detail.value} | modified: ${e.detail.modified}`
}

const exit = () => {
  running = false
  window.bngVue.gotoGameState("menu.mainmenu")
}
let running = true

const start = () => {
  //
}
const kill = () => {
  //
}
onMounted(start)
onUnmounted(kill)

</script>

<style scoped lang="scss">

.md-content {
  display: block;
  position: relative;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}

#bng-hello-world-v {
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at top left, #334455 0%, #000 100%);
  text-align: center;
  overflow: hidden;
  &:focus {
    outline: none !important;
    box-shadow: none !important;
    &::before {
      content: "" !important;
      border: none;
    }
  }
  color: white
}

</style>
