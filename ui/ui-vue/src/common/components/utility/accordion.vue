<template>
  <div class="bng-accordion-container" v-bng-disabled="disabled">
    <slot></slot>
  </div>
</template>

<script setup>
import { watch, provide, inject, nextTick } from "vue"
import { vBngDisabled } from "@/common/directives"

const props = defineProps({
  singular: Boolean, // mode for a single expanded item
  expanded: Boolean, // expand all items
  disabled: Boolean, // disable all items
  animated: Boolean, // animate all items
  selectable: [Boolean, Object], // enable items selection
  selected: Boolean, // select all
  provideParent: Boolean, // for AccordionTree
})

let counter = 0
const items = []

let selopts = null
// let parentItem = null

const emit = defineEmits(["selected"])

watch(() => props.singular, val => val && toggle(items.find(itm => itm.expanded), true))
watch(() => props.expanded, val => toggle(null, val))
watch(() => props.animated, val => {
  for (const itm of items)
    itm.animated = val
}, { immediate: true })
watch(() => props.disabled, val => {
  for (const itm of items)
    itm.disabled = val
}, { immediate: true })
watch(() => props.selectable, val => {
  if (val) {
    selopts = {
      multi: false, // multiselect
    }
    if (typeof val === "object")
      selopts = { selopts, ...val }
  } else {
    selopts = null
  }
  for (const itm of items)
    itm.selectable = selopts
}, { immediate: true })
watch(() => props.selected, val => select(null, val))

/**
 * Expand/collapse items
 * @param {object|null}  [item=null]     If specified, operates on a single item. Otherwise, on all items.
 * @param {boolean|null} [expanded=null] If not specified, toggles the value.
 */
function toggle(item = null, expanded = null) {
  if (props.singular && !item && expanded) {
    if (items.length === 0)
      return
    item = items[0]
  }
  for (const itm of items) {
    let exp = !itm.expanded
    if (item && itm.id !== item.id)
      exp = props.singular ? false : itm.expanded
    else if (typeof expanded === "boolean")
      exp = expanded
    itm.expanded = exp
  }
}
provide("accordion-item-toggle", toggle)

/**
 * Select/deselect items
 * @param {object|null}  [item=null]     If specified, operates on a single item. Otherwise, on all items.
 * @param {boolean|null} [selected=null] If not specified, toggles the value.
 */
function select(item = null, selected = null) {
  // TODO: if not multi, deselect "dir" (parent AccItem) when a single nested item is deselected
  //       reason: when "dir" is selected, everything inside of it must be selected (already implemented)
  const state = []
  // if (parentItem) console.log(selopts.multi ? "multi" : "single", "parentItem.selected", parentItem.selected)
  // if (!item && parentItem && parentItem.selected)
  //   selected = true
  // let allsel = true
  // console.log("###", item, selected, item.selected)
  for (const itm of items) {
    let sel
    if (item && itm.id !== item.id)
      sel = !selopts.multi ? false : itm.selected
    else if (typeof selected === "boolean")
      sel = selected
    else
      sel = selopts.multi ? !itm.selected : true
    if (itm.selected !== sel) {
      itm.selected = sel
      // state.push({
      //   data: itm.data,
      //   selected: sel,
      // })
      state.push(itm)
    }
    // if (allsel)
    //   allsel = sel
  }
  // if (item && parentItem && !allsel && parentItem.selected !== allsel)
  //   parentItem.selected = allsel
  if (state.length > 0)
    emit("selected", state)
}
provide("accordion-item-select", select)
if (props.provideParent) {
  inject("accordion-item-childSelect")(select)
  // parentItem = inject("accordion-item-parent")
}

const waitForOptions = cb => selopts ? cb() : setTimeout(() => waitForOptions(cb), 50)

provide("accordion-item-register", item => {
  item.id = counter++
  if (props.expanded) item.expanded = props.expanded
  if (props.disabled) item.disabled = props.disabled
  if (props.selectable) item.selectable = props.selectable
  items.push(item)
  waitForOptions(() => {
    if (props.singular && item.expanded) toggle(item, true)
    if (item.selected) select(item, true)
  })
})

provide("accordion-item-unregister", item => {
  const idx = items.findIndex(itm => itm.id === item.id)
  idx > -1 && items.splice(idx, 1)
})
</script>

<style lang="scss" scoped>
.bng-accordion-container {
  position: relative;
  display: flex;
  flex-flow: column;
  height: auto;
  max-height: 100%;
  padding: 0 0.5rem;
}
</style>
