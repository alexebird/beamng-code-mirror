<template>
  <Accordion v-if="dataView.length > 0" class="acctree" :selectable="selectable" :provide-parent="isTreeElement" @selected="selected">
    <AccordionItem
      v-for="entry in dataView"
      v-bind="propsField ? entry[propsField] : undefined"
      :selected="selectedField ? entry[selectedField] : undefined"
      :static="(!entry[dataField] || entry[dataField].length === 0) && (!contentField || !entry[contentField])"
      :data="entry">
      <template #caption><slot name="caption" :entry="entry"></slot></template>
      <template #controls><slot name="controls" :entry="entry"></slot></template>
      <slot name="default" v-if="contentField && entry[contentField]" :entry="entry"></slot>
      <AccordionTree v-if="entry[dataField] && entry[dataField].length > 0" v-bind="props" :data="entry" :is-tree-element="true" @selected="branchSelected">
        <template #caption="{ entry }"><slot name="caption" :entry="entry"></slot></template>
        <template #controls="{ entry }"><slot name="controls" :entry="entry"></slot></template>
      </AccordionTree>
    </AccordionItem>
  </Accordion>
</template>

<script setup>
/*
TODO: consider how user should do multiselect

current behaviour:
  when props.selectable is defined, selection mode is enabled
  by default, it allows to select only one element
  when props.selectable.multi is set, multiselect becomes available

I think multi should be enabled with modifier keydown, such as Ctrl or LT/RT on gamepad
on keydown - props.selectable.multi set to true, on keyup - false
*/

import { computed, watch } from "vue"
import { Accordion, AccordionItem, AccordionTree } from "@/common/components/utility"

const props = defineProps({
  data: {
    type: [Array, Object],
    default: undefined,
  },
  dataField: {
    type: String,
    required: true,
  },
  propsField: {
    type: String,
    required: false,
  },
  contentField: {
    type: String,
    required: false,
  },
  selectable: {
    type: [Boolean, Object],
    default: false,
  },
  selectedField: {
    type: String,
  },
  isTreeElement: Boolean, // for use inside of this component only
})

const dataView = computed(() => (!props.data ? [] : props.data[props.dataField] || props.data || []))

const emit = defineEmits(["selected"])

if (!props.isTreeElement) {
  watch(() => dataView.value, refreshSelected)
  watch(() => props.selectedField && props.selectable && props.selectable.multi, refreshSelected)
  refreshSelected()
}

let prevState = []

function refreshSelected() {
  if (!props.selectedField || !props.selectable || !props.selectable.multi) return
  const state = []
  function deepScan(arr) {
    for (const itm of arr) {
      const data = itm.data || itm
      if (data[props.selectedField]) state.push({ data, selected: true })
      if (data[props.dataField]) deepScan(data[props.dataField])
    }
  }
  deepScan(dataView.value)
  // console.log("init state", state)
  selected(state)
}

function selected(state) {
  if (!props.isTreeElement) {
    if (!props.selectable.multi) {
      prevState = prevState.filter(itm => itm.selected)
      // console.log("deselecting", prevState)
      for (const itm of prevState) {
        if (!itm.selected) continue
        itm.item.selected = false
        if (props.selectedField) itm.item.data[props.selectedField] = false
        if (!state.includes(itm.item)) state.push(itm.item)
      }
      prevState = state.map(item => ({ selected: !!item.selected, item }))
    }
    if (props.selectedField) {
      function deepSet(arr, value = undefined) {
        for (const itm of arr) {
          const val = typeof value === "boolean" ? value : itm.selected
          const data = itm.data || itm
          data[props.selectedField] = val
          if (data[props.dataField])
            // deepSet(data[props.dataField], props.selectable.multi ? val : undefined)
            deepSet(data[props.dataField])
        }
      }
      deepSet(state)
    }
  }
  // console.log(state.map(itm => itm.selected))
  emit("selected", state)
}

function branchSelected(state) {
  if (props.isTreeElement) emit("selected", state)
  else selected(state)
}
</script>

<style lang="scss" scoped>
.acctree {
  > :deep(.bng-accitem) {
    &.bng-accitem-expanded {
      > .bng-accitem-caption .bng-dropdown {
        // make dropdown a bit darker in caption of expanded item
        background-color: var(--bng-cool-gray-800);
      }
    }
    // > .bng-accitem-caption,
    // > .bng-accitem-content {
    //   padding-top: 0.0rem;
    //   padding-bottom: 0.0rem;
    // }
  }
}
</style>
