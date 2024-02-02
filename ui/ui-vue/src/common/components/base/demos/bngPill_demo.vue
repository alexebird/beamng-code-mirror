<template>
  <div style="margin-top: 1em; width: 90%">
    Plain Pill
    <bng-pill> All </bng-pill>
  </div>
  <div style="margin-top: 1em; width: 90%">
    Plain Pill Marked
    <bng-pill :marked="true"> All </bng-pill>
  </div>
  <div style="margin-top: 1em; width: 90%">
    Interactive Pill
    <bng-pill @click="onClick"> All </bng-pill>
  </div>
  <div style="margin-top: 1em; width: 90%">
    Interactive Pill Marked
    <bng-pill :marked="true" @click="onClick"> All </bng-pill>
  </div>
</template>

<script setup>
import { BngPill } from "@/common/components/base"
function onClick() {
  console.log("clicked")
}
</script>

<style scoped></style>
