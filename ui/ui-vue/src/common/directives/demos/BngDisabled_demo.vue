<template>
  <BngSwitch v-model="disabled">Disabled</BngSwitch>
  <br/>
  <BngButton v-bng-disabled="disabled" accent="secondary">Button</BngButton>
  <br/>
  <div v-bng-disabled="disabled">
    Something inside a div.
  </div>
</template>

<script setup>
import { ref } from "vue"
import { vBngDisabled } from "@/common/directives"
import { BngButton, BngSwitch } from "@/common/components/base"

const disabled = ref(true)
</script>

<style lang="scss" scoped>
div[disabled] {
  opacity: 0.5;
  pointer-events: none;
}
</style>
