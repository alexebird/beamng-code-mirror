<template>
  <div>
    <BngCondition :integrity="integrity" :color="color" />
    <BngSlider v-model="integrity" :min="0.0" :max="1.0" :step="0.01" />
    <BngInput v-model="color" />
  </div>
</template>

<script setup>
import { ref } from "vue"
import { BngCondition, BngSlider, BngInput } from "@/common/components/base"

const integrity = ref(0.5)
const color = ref("#f60")
</script>

<style scoped>
</style>
