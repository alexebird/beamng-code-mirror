<template>
  <div style="margin-top: 1em">
    Default Slider
    <BngSlider ref="iptChanged" :min="-100" :max="100" :step="1" v-model="defaultSliderValue" @valueChanged="onValueChanged" />
    {{ defaultSliderValue }}
    <input type="number" v-model.number="defaultSliderValue" min="-100" max="100" required />
    <BngButton v-if="iptChanged" :disabled="!iptChanged.dirty" @click="iptChanged.markClean()">Mark clean</BngButton>
    <span v-if="iptChanged">Value is {{ iptChanged.dirty ? "dirty" : "the same" }}</span>
  </div>
  <div style="margin-top: 1em">
    Step Slider
    <BngSlider :min="0" :max="100" :step="10" v-model="stepSliderValue" />
    {{ stepSliderValue }}
    <input type="number" v-model.number="stepSliderValue" />
  </div>
  <div style="margin-top: 1em">
    Disabled Slider
    <BngSlider :min="0" :max="100" v-model="disabledSliderValue" :disabled="true" />
  </div>
</template>

<script setup>
import { ref } from "vue"
import { BngSlider, BngButton } from "@/common/components/base"

const defaultSliderValue = ref(0)
const stepSliderValue = ref(0)
const disabledSliderValue = ref(50)

const iptChanged = ref()

function onValueChanged(value) {
  console.log("valueChanged", value)
}
</script>

<style scoped></style>
