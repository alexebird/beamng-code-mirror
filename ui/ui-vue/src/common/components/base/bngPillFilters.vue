<!-- bngPillFilters - a series of pill checkboxes as a filter selector -->
<template>
  <div class="bng-pill-filters">
    <div v-for="option of props.options" :key="option.value" :id="`${htmlId}-${option.id}`" class="bng-pill-filter-item">
      <bng-pill-checkbox
        :ref="el => updateItemRef(el, option.id)"
        :marked="isSelected(option)"
        :marked-icon="hasCheckedIcon"
        @valueChanged="onItemClicked(option)"
        @focusin="onFocusIn(option)"
      >
        {{ option.name }}
      </bng-pill-checkbox>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, ref } from "vue"
import BngPillCheckbox from "@/common/components/base/bngPillCheckbox"

const props = defineProps({
  htmlId: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  selectOnNavigation: {
    type: Boolean,
    default: true,
  },
  required: Boolean,
  hasCheckedIcon: Boolean,
  selectMany: Boolean,
})
const emits = defineEmits(["valueChanged", "pillItemFocusIn"])

/* Start Expose */
defineExpose({
  // Only available if selectMany is false
  selectPrevious: function selectPrevious() {
    if (props.selectMany) return

    if (currentSelectedIndex.value > 0) {
      currentSelectedIndex.value -= 1
    }

    selectItem(currentSelectedIndex.value, !props.selectOnNavigation)
  },
  // Only available if selectMany is false
  selectNext: function selectNext() {
    if (props.selectMany) return

    if (currentSelectedIndex.value < props.options.length - 1) {
      currentSelectedIndex.value += 1
    }

    selectItem(currentSelectedIndex.value, !props.selectOnNavigation)
  },
  // Only available if selectMany is false
  // To be used only if props.selectOnNavigation is false
  // to select the focused item
  selectCurrent: function selectCurrent() {
    if (props.selectMany || props.selectOnNavigation || currentSelectedIndex.value < 0 || currentSelectedIndex >= props.options.length) return

    selectItem(currentSelectedIndex.value, false)
  },
})

function selectItem(index, focusOnly) {
  const item = props.options[index]

  if (!focusOnly) {
    const oldSelectedItems = selectedItems.value
    selectedItems.value = [item.value]
    emits("valueChanged", selectedItems.value, getPillItemId(props.options[index].id), oldSelectedItems)
  }

  const bngPillId = getPillItemId(item.id)
  const itemElement = document.querySelector(`#${bngPillId} .bng-pill`)
  itemElement.focus()
}
/* End Expose */

const selectedItems = ref([])
const currentSelectedIndex = ref(-1)

function onFocusIn(option) {
  emits("pillItemFocusIn", getPillItemId(option.id))
}

const itemRefs = {}

function updateItemRef(el, optionId) {
  itemRefs[optionId] = el
}

function onItemClicked(option) {
  const id = getPillItemId(option.id)
  const index = selectedItems.value.indexOf(option.value)
  const oldSelectedItems = selectedItems.value

  if (props.selectMany && index > -1 && !props.required) {
    selectedItems.value.splice(index, 1)
  } else if (props.selectMany) {
    selectedItems.value.push(option.value)
  } else if (index > -1 && props.required) {
    // Prevent de-select if required and only one item left.
    // Force refresh because bngPillCheckbox maintains its own state and will
    // its isChecked watcher will not be notified because props value has not been changed
    const itemRef = itemRefs[option.id]
    itemRef.setValue(true)
  } else if (index > -1) {
    selectedItems.value = []
  } else {
    selectedItems.value = [option.value]
    currentSelectedIndex.value = props.options.findIndex(item => item.id === option.id)
  }

  emits("valueChanged", selectedItems.value, id, oldSelectedItems)
}

function isSelected(option) {
  const optionIndex = selectedItems.value.findIndex(item => item === option.value)
  return optionIndex !== -1
}

// id - id property of option entry in props.options
function getPillItemId(id) {
  return `${props.htmlId}-${id}`
}
</script>

<style lang="scss" scoped>
.bng-pill-filters {
  display: flex;
  align-items: center;
  padding: 8px;

  > .bng-pill-filter-item {
    &:not(:last-child) {
      margin-right: 8px;
    }

    &:first-child {
      margin-left: 8px;
    }

    &:last-child {
      position: relative;

      &::before {
        content: "";
        display: block;
        position: absolute;
        right: -8px;
        width: 8px;
        height: 1px;
      }
    }
  }
}
</style>
