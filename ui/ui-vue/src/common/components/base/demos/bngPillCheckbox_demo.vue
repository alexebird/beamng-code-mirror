<template>
  <div class="entry-example">
    Checked
    <bng-pill-checkbox :marked="true" @value-changed="valChanged">Electronics</bng-pill-checkbox>
  </div>
  <div class="entry-example">
    Checked different icon
    <bng-pill-checkbox :marked="true" :marked-icon="icons.general.offbtn">Electronics</bng-pill-checkbox>
  </div>
  <div class="entry-example">
    Checked no icon
    <bng-pill-checkbox :marked="true" :marked-icon="false">Electronics</bng-pill-checkbox>
  </div>
  <div class="entry-example">
    Unchecked (default icon)
    <bng-pill-checkbox>Electronics</bng-pill-checkbox>
  </div>
</template>

<script setup>
import { BngPillCheckbox } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const valChanged = v => console.log(v)
</script>

<style scoped lang="scss">
.entry-example {
  margin-top: 8px;
}
</style>
