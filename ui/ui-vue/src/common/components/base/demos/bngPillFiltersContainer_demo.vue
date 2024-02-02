<template>
  <div class="filters-container-demo-page">
    <div>
      <label>Select Single</label>
      <bng-pill-filters-container
        ref="bngPillFiltersContainerRef"
        :html-id="'filters-container-1'"
        :options="bngPillOptions"
        :select-many="false"
        :has-checked-icon="false"
      ></bng-pill-filters-container>
      <div class="actions">
        <bng-button class="btn" @click="onSelectPrevious">Previous</bng-button>
        <bng-button class="btn" @click="onSelectNext">Next</bng-button>
      </div>
    </div>
    <div>
      <label>Focus Select</label>
      <bng-pill-filters-container
        ref="bngPillFiltersContainerRef2"
        :html-id="'filters-container-2'"
        :options="bngPillOptions"
        :select-many="false"
        :select-on-navigation="false"
        :has-checked-icon="false"
      ></bng-pill-filters-container>
      <div class="actions">
        <bng-button class="btn" @click="onFocusSelectPrevious">Previous</bng-button>
        <bng-button class="btn" @click="onFocusSelectNext">Next</bng-button>
        <bng-button class="btn" @click="onSelectCurrent">Select Current</bng-button>
      </div>
    </div>
    <div>
      <label>Required</label>
      <bng-pill-filters-container
        ref="bngPillFiltersContainerRef3"
        :html-id="'filters-container-3'"
        :options="bngPillOptions"
        :select-on-navigation="false"
        :required="true"
        :has-checked-icon="false"
      ></bng-pill-filters-container>
      <div class="actions">
        <bng-button class="btn" @click="onRequiredSelectPrevious">Previous</bng-button>
        <bng-button class="btn" @click="onRequiredSelectNext">Next</bng-button>
        <bng-button class="btn" @click="onRequiredSelectCurrent">Select Current</bng-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import BngPillFiltersContainer from "@/common/components/base/bngPillFiltersContainer"
import { BngButton } from "@/common/components/base"
import { ref } from "vue"

const bngPillOptions = [
  { id: 1, value: 0, name: "All" },
  { id: 2, value: 1, name: "Body" },
  { id: 3, value: 2, name: "Engine" },
  { id: 4, value: 3, name: "Transmission" },
  { id: 5, value: 4, name: "Suspension" },
  { id: 6, value: 5, name: "Electrics" },
  { id: 7, value: 6, name: "Electrics1" },
  { id: 8, value: 7, name: "Electrics2" },
  { id: 9, value: 8, name: "Electrics3" },
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
