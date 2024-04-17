<template>
  <div style="margin-top: 1em">
    Default Switch
    <BngSwitch/>
  </div>
  <div style="margin-top: 1em">
    Disabled Switch
    <BngSwitch :disabled="true"></BngSwitch>
  </div>
  <div style="margin-top: 1em">
    Labeled switch <br />
    <BngSwitch>Labelled-text</BngSwitch>
  </div>
  <div style="margin-top: 1em">
    Disabled Labeled switch <br />
    <BngSwitch :disabled="true">Labelled-text</BngSwitch>
  </div>
</template>

<script setup>
import { BngSwitch } from "@/common/components/base"
</script>
