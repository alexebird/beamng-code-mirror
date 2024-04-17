<template>
  <div style="display: flex; flex-direction: column">
    <div>
      <label>Select One</label>
      <BngPillFilters ref="selectOneFilters" selectOnFocus :options="bngPillOptions" />
      <div class="actions">
        <BngButton @click="onSelectPrevious">Previous</BngButton>
        <BngButton @click="onSelectNext">Next</BngButton>
      </div>
    </div>
    <div>
      <label>Select Focus Only</label>
      <BngPillFilters ref="selectFocusOnlyFilters" :options="bngPillOptions" />
      <div class="actions">
        <BngButton @click="onFocusSelectPrevious">Previous</BngButton>
        <BngButton @click="onFocusSelectNext">Next</BngButton>
        <BngButton @click="onFocusSelectCurrent">Select Current</BngButton>
      </div>
    </div>
    <div>
      <label>Select Many</label>
      <BngPillFilters selectMany :options="bngPillOptions" />
    </div>
    <div>
      <label>Required</label>
      <BngPillFilters :options="bngPillOptions" required />
    </div>
    <div>
      <label>Switch Data</label>
      <BngPillFilters ref="selectOneFilters" selectOnFocus :options="data" />
      <div class="actions">
        <BngButton @click="switchData">Switch Data</BngButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { BngPillFilters, BngButton } from "@/common/components/base"

const bngPillOptions = ref([
  { value: 0, label: "All" },
  { value: 1, label: "Body" },
  { value: 2, label: "Engine" },
  { value: 3, label: "Transmission" },
  { value: 4, label: "Suspension" },
  { value: 5, label: "Electrics" },
])

const bngPillOptions2 = ref([
  { value: 6, label: "Random" },
  { value: 7, label: "Value" },
  { value: 8, label: "Here" },
])

const shouldSwitchData = ref(false)
const data = computed(() => (shouldSwitchData.value ? bngPillOptions.value : bngPillOptions2.value))

const selectOneFilters = ref(null)
const selectFocusOnlyFilters = ref(null)

const switchData = () => {
  shouldSwitchData.value = !shouldSwitchData.value
}

function onSelectNext() {
  selectOneFilters.value.focusNext()
}

function onSelectPrevious() {
  selectOneFilters.value.focusPrevious()
}

function onFocusSelectNext() {
  selectFocusOnlyFilters.value.focusNext()
}

function onFocusSelectPrevious() {
  selectFocusOnlyFilters.value.focusPrevious()
}

function onFocusSelectCurrent() {
  selectFocusOnlyFilters.value.toggleFocusedPill()
}
</script>

<style scoped lang="scss"></style>
