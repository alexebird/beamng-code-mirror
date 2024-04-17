<template>
  <div>
    <div v-for="popup in popups">
      <BngButton @click="popup.open()">{{ popup.name }}</BngButton>
      <span v-if="popup.result">Result: {{ popup.result }}</span>
    </div>
    <br />
    <div>
      <BngButton @click="popupAll()">Open all (at once)</BngButton>
      <BngButton @click="popupAll(true)">Open all (sequential)</BngButton>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue"
import { BngButton } from "@/common/components/base"
import { openMessage, openConfirmation, openExperimental } from "@/services/popup"
import { $translate } from "@/services/translation"

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
  confirmWithComponent: {
    name: "Confirmation, with component content",
    result: "",
    async open() {
      const res = await openConfirmation("", {component: BngButton, props:{label:'Hello'}})
      popups.confirm.result = res.toString()
    },
  },
  experimental: {
    name: "Experimental confirmation",
    result: "",
    async open() {
      const res = await openExperimental("Experimental test", "Experimental-style confirmation...<br/>...please ignore", [
        { label: $translate.instant("ui.common.no"), value: false },
        { label: $translate.instant("ui.career.experimentalAgree"), value: true },
      ])
      popups.experimental.result = res.toString()
    },
  },
  // recovery: { // might not work out of career
  //   name: "Recovery",
  //   async open() {
  //     await openRecovery()
  //   },
  // },
})

async function popupAll(doAsync) {
  for (const popup of Object.values(popups)) {
    console.log(`Opening "${popup.name}"`)
    if (doAsync) await popup.open()
    else popup.open()
  }
}
</script>

<style></style>
