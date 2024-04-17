<template>
  <h2>Old Icon Demo</h2>
  <span>Original Type:</span>
  <div>
    <BngOldIcon :title="type" span class="demo-icon" v-for="type in iconTypesList" :key="type" :type="type" :color="randomColour()" />
  </div>
</template>

<script setup>
import { BngOldIcon } from "@/common/components/base"
import { iconTypesList } from "@/assets/icons"

const randomColour = () => `rgba(${~~(Math.random() * 256)},${~~(Math.random() * 256)},${~~(Math.random() * 256)})`
</script>

<style scoped>
div {
  display: flex;
  flex-wrap: wrap;
}
.demo-icon {
  min-width: 1.5em;
  min-height: 1.5em;
  margin: 0.2em;
}
</style>
