<template>
  <div class="filters-container-demo-page">
    <div>
      <label>Select Single</label>
      <BngPillFiltersContainer
        ref="bngPillFiltersContainerRef"
        :html-id="'filters-container-1'"
        :options="bngPillOptions"
        :select-many="false"
        :has-checked-icon="false"
      ></BngPillFiltersContainer>
      <div class="actions">
        <BngButton class="btn" @click="onSelectPrevious">Previous</BngButton>
        <BngButton class="btn" @click="onSelectNext">Next</BngButton>
      </div>
    </div>
    <div>
      <label>Focus Select</label>
      <BngPillFiltersContainer
        ref="bngPillFiltersContainerRef2"
        :html-id="'filters-container-2'"
        :options="bngPillOptions"
        :select-many="false"
        :select-on-navigation="false"
        :has-checked-icon="false"
      ></BngPillFiltersContainer>
      <div class="actions">
        <BngButton class="btn" @click="onFocusSelectPrevious">Previous</BngButton>
        <BngButton class="btn" @click="onFocusSelectNext">Next</BngButton>
        <BngButton class="btn" @click="onSelectCurrent">Select Current</BngButton>
      </div>
    </div>
    <div>
      <label>Required</label>
      <BngPillFiltersContainer
        ref="bngPillFiltersContainerRef3"
        :html-id="'filters-container-3'"
        :options="bngPillOptions"
        :select-on-navigation="false"
        :required="true"
        :has-checked-icon="false"
      ></BngPillFiltersContainer>
      <div class="actions">
        <BngButton class="btn" @click="onRequiredSelectPrevious">Previous</BngButton>
        <BngButton class="btn" @click="onRequiredSelectNext">Next</BngButton>
        <BngButton class="btn" @click="onRequiredSelectCurrent">Select Current</BngButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BngPillFiltersContainer from "@/common/components/base/bngPillFiltersContainer"
import { BngButton } from "@/common/components/base"
import { ref } from "vue"

const bngPillOptions = [
  { id: 1, value: 0, label: "All" },
  { id: 2, value: 1, label: "Body" },
  { id: 3, value: 2, label: "Engine" },
  { id: 4, value: 3, label: "Transmission" },
  { id: 5, value: 4, label: "Suspension" },
  { id: 6, value: 5, label: "Electrics" },
  { id: 7, value: 6, label: "Electrics1" },
  { id: 8, value: 7, label: "Electrics2" },
  { id: 9, value: 8, label: "Electrics3" },
]

const bngPillFiltersContainerRef = ref(null)
const bngPillFiltersContainerRef2 = ref(null)
const bngPillFiltersContainerRef3 = ref(null)

function onSelectPrevious() {
  bngPillFiltersContainerRef.value.selectPrevious()
}

function onSelectNext() {
  bngPillFiltersContainerRef.value.selectNext()
}

function onFocusSelectPrevious() {
  bngPillFiltersContainerRef2.value.selectPrevious()
}

function onFocusSelectNext() {
  bngPillFiltersContainerRef2.value.selectNext()
}

function onSelectCurrent() {
  bngPillFiltersContainerRef2.value.selectCurrent()
}

function onRequiredSelectPrevious() {
  bngPillFiltersContainerRef3.value.selectPrevious()
}

function onRequiredSelectNext() {
  bngPillFiltersContainerRef3.value.selectNext()
}

function onRequiredSelectCurrent() {
  bngPillFiltersContainerRef3.value.selectCurrent()
}
</script>

<style scoped lang="scss">
.actions {
  display: flex;

  .btn {
    margin: 4px;
  }
}
</style>
