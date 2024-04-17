<template>
  <div style="margin-top: 1em; width: 90%">
    Plain Pill
    <BngPill> All </BngPill>
  </div>
  <div style="margin-top: 1em; width: 90%">
    Plain Pill Marked
    <BngPill :marked="true"> All </BngPill>
  </div>
  <div style="margin-top: 1em; width: 90%">
    Interactive Pill
    <BngPill @click="onClick"> All </BngPill>
  </div>
  <div style="margin-top: 1em; width: 90%">
    Interactive Pill Marked
    <BngPill :marked="true" @click="onClick"> All </BngPill>
  </div>
</template>

<script setup>
import { BngPill } from "@/common/components/base"
function onClick() {
  console.log("clicked")
}
</script>

<style scoped></style>
