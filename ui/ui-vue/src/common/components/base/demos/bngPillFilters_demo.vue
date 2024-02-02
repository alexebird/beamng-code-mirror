<template>
  <div class="demo-entry">
    <label>Tab Like</label>
    <bng-pill-filters class="bng-pill-filters-demo" htmlId="tab-like" :required="true" :options="bngPillOptions" @valueChanged="onPillValueChanged" />
  </div>
  <div class="demo-entry select-one-demo">
    <label>Select One</label>
    <bng-pill-filters
      class="bng-pill-filters-demo"
      htmlId="select-one"
      ref="selectOneFilters"
      :options="bngPillOptions"
      :has-checked-icon="true"
      @valueChanged="onPillValueChanged"
    />
    <div class="actions">
      <bng-button @click="onSelectPrevious">Previous</bng-button>
      <bng-button @click="onSelectNext">Next</bng-button>
    </div>
  </div>
  <div class="demo-entry select-one-demo">
    <label>Select Focus Only</label>
    <bng-pill-filters
      class="bng-pill-filters-demo"
      htmlId="select-focus-only"
      ref="selectFocusOnlyFilters"
      :options="bngPillOptions"
      :has-checked-icon="true"
      :select-on-navigation="false"
      @valueChanged="onPillValueChanged"
    />
    <div class="actions">
      <bng-button @click="onFocusSelectPrevious">Previous</bng-button>
      <bng-button @click="onFocusSelectNext">Next</bng-button>
      <bng-button @click="onFocusSelectCurrent">Select Current</bng-button>
    </div>
  </div>
  <div class="demo-entry">
    <label>Select Many</label>
    <bng-pill-filters
      class="bng-pill-filters-demo"
      htmlId="select-many"
      :options="bngPillOptions"
      :has-checked-icon="true"
      :selectMany="true"
      @valueChanged="onPillValueChanged"
    />
  </div>
  <div class="demo-entry">
    <label>Required</label>
    <bng-pill-filters
      class="bng-pill-filters-demo"
      htmlId="select-many"
      :options="bngPillOptions"
      :required="true"
      :has-checked-icon="true"
      @valueChanged="onPillValueChanged"
    />
  </div>
</template>

<script setup>
import { ref } from "vue"
import { BngPillFilters, BngButton } from "@/common/components/base"

const bngPillOptions = [
  { id: 1, value: 0, name: "All" },
  { id: 2, value: 1, name: "Body" },
  { id: 3, value: 2, name: "Engine" },
  { id: 4, value: 3, name: "Transmission" },
  { id: 5, value: 4, name: "Suspension" },
  { id: 6, value: 5, name: "Electrics" },
]

const selectOneFilters = ref(null)
const selectFocusOnlyFilters = ref(null)

function onSelectNext() {
  selectOneFilters.value.selectNext()
}

function onSelectPrevious() {
  selectOneFilters.value.selectPrevious()
}

function onFocusSelectNext() {
  selectFocusOnlyFilters.value.selectNext()
}

function onFocusSelectPrevious() {
  selectFocusOnlyFilters.value.selectPrevious()
}

function onFocusSelectCurrent() {
  selectFocusOnlyFilters.value.selectCurrent()
}

function onPillValueChanged(value, b, oldValue) {
  console.log("pill values", [...value], b, [...oldValue])
}
</script>

<style scoped lang="scss">
.demo-entry {
  width: 100%;
  overflow: hidden;

  &.select-one-demo > .actions {
    display: flex;
  }
}

.bng-pill-filters-demo {
  overflow-x: scroll;
}
</style>
