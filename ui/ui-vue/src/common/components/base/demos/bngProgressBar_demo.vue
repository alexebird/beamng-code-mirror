<template>
  <div>
    <h5>Default values</h5>
    <BngProgressBar
      :showValueLabel="showLabels"
      ref="defaultProgressBarRef"
      :value="10"
      :max="100"
      :min="0"
      :header-left="'Specialized'"
      :header-right="'lvl. 12'" />
    <div class="buttons">
      <button @click="defaultProgressBarRef.decreaseValueBy(10)">Decrease</button>
      <button @click="defaultProgressBarRef.increaseValueBy(10)">Increase</button>
      <input v-model="defaultProgressBarInput" type="number" />
      <button @click="defaultProgressBarRef.setValue(defaultProgressBarInput)">Set Value</button>
    </div>
  </div>
  <div>
    <h5>Negative values</h5>
    <BngProgressBar
      ref="negativeValueProgressBarRef"
      :value="-50"
      :max="100"
      :min="-100"
      :header-left="'Specialized'"
      :header-right="'lvl. 12'"
      :showValueLabel="showLabels"
      valueLabelFormat="Value Label:&nbsp;&nbsp;&nbsp; #value#" />
    <div class="buttons">
      <button @click="negativeValueProgressBarRef.decreaseValueBy(10)">Decrease</button>
      <button @click="negativeValueProgressBarRef.increaseValueBy(10)">Increase</button>
      <input v-model="negativeProgressBarInput" type="number" />
      <button @click="negativeValueProgressBarRef.setValue(negativeProgressBarInput)">Set Value</button><br /><br />
      <label>Show value labels?<input type="checkbox" v-model="showLabels" /></label>
    </div>
  </div>
</template>

<script setup>
import BngProgressBar from "@/common/components/base/bngProgressBar"
import { ref } from "vue"
const defaultProgressBarRef = ref(null),
  negativeValueProgressBarRef = ref(null)
const defaultProgressBarInput = ref(null),
  negativeProgressBarInput = ref(null)
const showLabels = ref(true)
</script>
