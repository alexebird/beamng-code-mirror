<template>
  <div>
    <div v-for="popup in popups">
      <BngButton @click="popup.open()">{{ popup.name }}</BngButton>
      <span v-if="popup.result">Result: {{ popup.result }}</span>
    </div>
    <br/>
    <div>
      <BngButton @click="popupAll()">Open all (at once)</BngButton>
      <BngButton @click="popupAll(true)">Open all (sequential)</BngButton>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue"
import { BngButton } from "@/common/components/base"
import {
  openMessage,
  openConfirmation,
  openExperimental,
  openRecovery,
} from "@/services/popup"

const popups = reactive({
  message: {
    name: "Message",
    async open() {
      await openMessage(null, "Test message please ignore")
    },
  },
  message_title: {
    name: "Message, with title",
    async open() {
      await openMessage("Test", "Test message please ignore")
    },
  },
  confirm: {
    name: "Confirmation, with title",
    result: "",
    async open() {
      const res = await openConfirmation("Test", "Test confirmation please ignore")
      popups.confirm.result = res.toString()
    },
  },
  experimental: {
    name: "Experimental confirmation",
    result: "",
    async open() {
      const res = await openExperimental(
        "Experimental test",
        "Experimental-style confirmation...<br/>...please ignore",
        [
          { label: "ui.common.no", value: false },
          { label: "ui.career.experimentalAgree", value: true },
        ]
      )
      popups.experimental.result = res.toString()
    },
  },
  recovery: {
    name: "Recovery",
    async open() {
      await openRecovery()
    },
  },
})

async function popupAll(doAsync) {
  for (const popup of Object.values(popups)) {
    console.log(`Opening "${popup.name}"`)
    if (doAsync)
      await popup.open()
    else
      popup.open()
  }
}
</script>

<style>

</style>
