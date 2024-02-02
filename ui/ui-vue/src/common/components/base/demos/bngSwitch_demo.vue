<template>
  <div style="margin-top: 1em">
    Default Switch
    <bng-switch/>
  </div>
  <div style="margin-top: 1em">
    Disabled Switch
    <bng-switch :disabled="true"></bng-switch>
  </div>
  <div style="margin-top: 1em">
    Labeled switch <br />
    <bng-switch>Labelled-text</bng-switch>
  </div>
  <div style="margin-top: 1em">
    Disabled Labeled switch <br />
    <bng-switch :disabled="true">Labelled-text</bng-switch>
  </div>
</template>

<script setup>
import { BngSwitch } from "@/common/components/base"
</script>
