<!-- Tabs -->
<template>
  <div class="tab-container">
    <ul class="tab-list">
      <li bng-nav-item tabindex="0" v-for="(tab, i) in tabs" :key="i" @click="selectTab(i)" :class="tabHeaderClasses(tab)">{{ tab.heading }}</li>
    </ul>
    <slot></slot>
  </div>
</template>

<script setup>

import { shallowReactive, provide, onMounted, toRaw, watch } from "vue"

const
  tabs = shallowReactive([]),
  emit = defineEmits(['change']),
  props = defineProps({
    makeTabHeaderClasses: Function,
    selectedIndex: Number,
  })

const tabHeaderClasses = tab => ({
  'tab-item': true,
  'tab-active-tab': tab.active,
  ...(props.makeTabHeaderClasses && props.makeTabHeaderClasses(tab))
})


let
  nextTabID = 0,
  selectedTab

function addTab(tab) {
  tab.id = nextTabID++
  let rTab = shallowReactive(tab)
  tabs.push(rTab)
  if (typeof props.selectedIndex === "number")
    selectTab(props.selectedIndex)
  return rTab
}

provide('addTab', addTab)

watch(() => props.selectedIndex, index => selectTab(index))

function selectTab(index) {
  const prevTab = selectedTab
  let newTab
  tabs.forEach(tab => {
    if (tab.active = tab.id == index) newTab = toRaw(tab)
  })
  selectedTab = newTab
  if (newTab && prevTab && newTab.id != prevTab.id) emit('change', newTab, prevTab)
}

onMounted(() => {
  const
    initialTab = tabs.find(({selected=undefined})=>!!selected),
    selectedID = initialTab ? initialTab.id : 0
  selectTab(selectedID)
})

</script>

<style lang="scss" scoped>

.tab-container {

  color: var(--tab-container-fg);
  display: flex;
  flex-direction: column;

  .tab-list {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-start;
    width: 100%;
    position: relative;
    box-sizing: border-box;
    padding: 0.5em;
    background-color: var(--tab-bg);
    border-radius: var(--tab-list-corners);
    margin: 0 0 0.5em 0;
    flex: 0 0 auto;
    list-style: none;

    .tab-item {
      display: inline-flex;
      padding: 0.5em;
      min-width: 6ch;
      min-height: 1.75em;
      align-items: center;
      box-sizing: border-box;
      justify-content: center;
      position: relative;
      flex: 1 0 6ch;
      border-radius: var(--tab-corners);
      background-color: transparent;
      border: var(--tab-border);
      transition: all 0.15s ease-in-out;

      &:focus::before {
        border-radius: 0.725em;
      }

      &.tab-active-tab {
        background-color: var(--tab-bg-active);
      }

      &:hover {
        background-color: var(--tab-bg-hover);
      }

      &:not(:first-child) {
        margin-left: var(--tab-spacing);
      }

    }

  }

  :deep(.tab-content) {
    background-color: var(--tab-content-bg);
    flex: 1 auto;
    overflow: hidden;
    box-sizing: border-box;
    border-radius: var(--tab-content-corners);
  }

}
  
.bng-tabs {

  --tab-container-fg: white;

  --tab-bg: var(--bng-black-o6);
  --tab-bg-active: var(--bng-cool-gray-700);
  --tab-bg-hover: var(--bng-orange-700);

  --tab-content-bg: var(--bng-black-o6);

  --tab-list-corners: var(--bng-corners-3);
  --tab-corners: var(--bng-corners-2);
  --tab-content-corners: var(--bng-corners-2);

  --tab-border: 0.125em solid var(--bng-cool-gray-700);

  --tab-spacing: 0.25em;

  .tab-item {
    cursor: pointer;
  }

  .tab-item.tab-active-tab {
    font-weight: bold;
  }

}
  
</style>