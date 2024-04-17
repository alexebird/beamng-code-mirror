<template>
  <h2>PropVal Demo</h2>
  <!-- Value Only -->
  <p>Value Only:</p>
  <BngPropVal :valueLabel="VALUE" />
  <!-- Key / Value -->
  <p>Key / Value:</p>
  <BngPropVal :keyLabel="KEY" :valueLabel="VALUE" />
  <!-- Icon / Key / Value -->
  <p>Icon / Key / Value:</p>
  <BngPropVal :iconType="icons.beamCurrency" :keyLabel="KEY" :valueLabel="VALUE" />
  <!-- ShrinkNum true -->
  <p>ShrinkNum true:</p>
  <BngPropVal :shrinkNum="true" :valueLabel="-123400000" />
  <BngPropVal :shrinkNum="true" :valueLabel="745600000" />
  <!-- ShrinkNum false -->
  <p>ShrinkNum false:</p>
  <BngPropVal :shrinkNum="false" :valueLabel="100000000000" />
  <!-- IconColor -->
  <p>IconColor:</p>
  <BngPropVal :iconType="icons.beamCurrency" :keyLabel="KEY" :valueLabel="VALUE" :iconColor="'var(--bng-orange-b400)'" />
  <!-- Valueless -->
  <p>Empty value:</p>
  <BngPropVal :iconType="icons.beamCurrency" keyLabel="Valueless" valueLabel="" />
</template>

<script setup>
import { BngPropVal, icons } from "@/common/components/base"

const KEY = "key is here"
const VALUE = "value is here"
</script>

<style scoped>
p {
  color: #666;
}
</style>
