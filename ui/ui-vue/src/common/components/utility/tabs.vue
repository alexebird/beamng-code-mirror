<!-- Tabs -->
<template>
  <div class="tab-container">
    <TabList v-if="!slotHasTabList" :makeTabHeaderClasses="makeTabHeaderClasses" />
    <slot></slot>
  </div>
</template>

<script setup>

import { shallowReactive, provide, onMounted, toRaw, watch, useSlots, computed } from "vue"
import { TabList } from "@/common/components/utility"

const
  tabs = shallowReactive([]),
  emit = defineEmits(['change']),
  props = defineProps({
    makeTabHeaderClasses: Function,
    selectedIndex: Number,
  }),
  slots = useSlots(),
  slotHasTabList = computed(() => slots.default().map(vn=>vn.type).includes(TabList))

provide('tabs', tabs)

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
provide('selectTab', selectTab)


const goNext = () => selectTab((selectedTab.id+1) % tabs.length)
const goPrev = () => selectTab((selectedTab.id+tabs.length-1) % tabs.length)

defineExpose({
  goNext,
  goPrev
})

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

  .tab-list, :deep(.tab-list) {
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

  --tab-list-corners: var(--bng-corners-1);
  --tab-corners: var(--bng-corners-2);
  --tab-content-corners: var(--bng-corners-1);

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