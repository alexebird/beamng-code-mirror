<template>
  <div style="margin-top: 1em">
    Default Slider
    <BngColorSlider
      v-model="values.default"
      @change="onValueChanged(values.default)"
    />
    <input type="number" min="0" max="1" step="0.001" v-model.number="values.default" />
  </div>
  <div style="margin-top: 1em">
    Labeled Slider with custom colours, range and step
    <BngColorSlider
      v-model="values.labeled"
      :min="-100"
      :max="100"
      :step="5"
      @change="onValueChanged(values.labeled)"
      :fill="['#f0f', 'rgba(0, 255, 255, 0.0)', 'rgba(0, 255, 255, 1.0)']"
    >Color slider label ({{ values.labeled }}%)</BngColorSlider>
    <input type="number" min="-100" max="100" step="5" v-model.number="values.labeled" />
  </div>
  <div style="margin-top: 1em">
    Disabled Slider
    <BngColorSlider
      v-model="values.disabled"
      @change="onValueChanged(values.disabled)"
      :disabled="true"
    >This one is disabled :( ({{ ~~(values.disabled * 100) }}%)</BngColorSlider>
    <input type="number" min="0" max="10" step="1" v-model.number="values.disabled" />
  </div>
</template>

<script setup>
import { reactive } from "vue"
import { BngColorSlider } from "@/common/components/base"

const values = reactive({
  default: 0.5,
  labeled: 0,
  disabled: 0.5,
})

function onValueChanged(value) {
  console.log("valueChanged", value)
}
</script>

<style scoped></style>
