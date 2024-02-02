<template>
  <h3>Decals Test</h3>
  <div>
    Select a mode:<br>
    <button v-for="(mode,name) of ActionModes" @click="setMode(name)">{{ name }}</button>
  </div>
  <br><br>&nbsp;
  <BngActionsDrawer :header="store.actionMode.header" :actions="store.actionMode.actions" @actionClick="onActionClicked"></BngActionsDrawer>
  <br><br>
  <div>
    <button @click="test">Test</button>
  </div>
</template>

<script setup>
import { ActionModes } from '../actionsConfig'
import { BngActionsDrawer } from "@/common/components/base"

import useDecalsStore from "../stores/decalsStore"

const store = useDecalsStore()

const test = () => store.getStack().then(stack=>console.log(stack))
window.test = test


function setMode(mode) {
  store.setActionMode(mode)
}

function onActionClicked(action) {
  console.log("action clicked", action)
}
</script>

<style scoped lang="scss"></style>
