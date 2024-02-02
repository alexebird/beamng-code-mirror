<template>
  <h2>PropVal Demo</h2>
  <!-- Value Only -->
  <span>Value Only:</span>
  <BngPropVal :valueLabel="VALUE" />
  <!-- Key / Value -->
  <span>Key / Value:</span>
  <BngPropVal :keyLabel="KEY" :valueLabel="VALUE" />
  <!-- Icon / Key / Value -->
  <span>Icon / Key / Value:</span>
  <BngPropVal :iconType="icons.general.beambuck" :keyLabel="KEY" :valueLabel="VALUE" />
  <!-- ShrinkNum true -->
  <span>ShrinkNum true:</span>
  <BngPropVal :shrinkNum="true" :valueLabel="1000000000000000" />
  <!-- ShrinkNum false -->
  <span>ShrinkNum false:</span>
  <BngPropVal :shrinkNum="false" :valueLabel="1000000000000000" />
  <!-- IconColor -->
  <span>IconColor:</span>
  <BngPropVal :iconType="icons.general.beambuck" :keyLabel="KEY" :valueLabel="VALUE" :iconColor="'var(--bng-orange-b400)'" />
  <!-- Valueless -->
  <span>Empty value:</span>
  <BngPropVal :iconType="icons.general.beambuck" keyLabel="Valueless" valueLabel="" />
</template>

<script setup>
import { BngPropVal } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const KEY = "key is here"
const VALUE = "value is here"
</script>

<style scoped>
span {
  color: #666;
}
</style>
