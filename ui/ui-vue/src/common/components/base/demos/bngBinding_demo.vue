<template>
  <div>
    <h2>Binding Component</h2>
    <p>Show a visual representation of the current binding for the given action. Will update live if bindings or active controllers change (try plugging/unplugging a controller whilst viewing this demo)</p>
    <button tabindex="1" @click="swapLightDark">Swap light/dark</button>
    <h3>Actions (light + dark variants)</h3>
    <ul>
      <li v-for="action in actions" :key="action"><span class="sample"><BngBinding :action="action" :show-unassigned="true" :dark="!dark"/>&nbsp;&nbsp;<BngBinding :action="action" :show-unassigned="true" :dark="dark"/></span> - {{ action }}</li>
    </ul>
  </div>
</template>

<script setup>
import { BngBinding } from "@/common/components/base"
import { inject, ref } from "vue"
import { runInBrowser, getMockedData } from "@/utils/"

const dark = ref(true)

const swapLightDark = () => dark.value =!dark.value

const actions = [
  "menu_item_select",
  "toggleBigMap",
  "bigMapMouseClick",
  "bigMapNextFilter",
  "bigMapPreviousFilter",
  "bigMapMoveForward",
  "bigMapMoveLeft",
  "bigMapMoveBackward",
  "bigMapMoveRight",
  "bigMapMoveForwardBackward",
  "bigMapMoveLeftRight",
  "bigMapZoom",
  "bigMapZoomIn",
  "bigMapZoomOut",
  "bigMapControllerZoom"
]

const $game = inject("$game")

runInBrowser(() => getMockedData('inputBindings.sample').then(data => $game.events.emit('InputBindingsChanged', data)))

</script>

<style scoped>
  .sample {
    display: inline-block;
    padding: 10px;
    margin: 0.25em 0;
    background-color: var(--bng-ter-blue-gray-700);
    border-radius: 0.3em;
  }
  ul {
    overflow-y: auto;
    height: 520px;
  }

</style>
