<template>
  <div class="demo-area">
    <div>
      <h3>Default Picker in luminosity mode</h3>
      <BngColorPicker
        v-model="colour"
        @change="onValueChanged"
      />
    </div>
    <div>
      <h3>Picker in saturation mode (old style)</h3>
      <BngColorPicker
        v-model="colour"
        view="full_saturation"
        @change="onValueChanged"
      />
    </div>
    <div>
      <h3>Picker in simple mode</h3>
      <BngColorPicker
        v-model="colour"
        view="simple"
        @change="onValueChanged"
      />
    </div>
    <div>
      <h3>Disabled Picker</h3>
      <BngColorPicker
        v-model="colour"
        @change="onValueChanged"
        :disabled="true"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue"
import { BngColorPicker } from "@/common/components/base"

const colour = reactive({
  hue: 0.5,
  saturation: 1.0,
  luminosity: 0.5,
})

function onValueChanged(value) {
  console.log("valueChanged", value)
}
</script>

<style scoped>
.demo-area {
  display: flex;
  flex-wrap: wrap;
}
.demo-area > * {
  flex: 1 1 auto;
  width: 100%;
  max-width: 500px;
  padding: 0.5em;
}
</style>
