<!-- bngPillFiltersContainer - a stylised container for a bngPillFilters component -->
<template>
  <div class="bng-filters-container" ref="bngFiltersContainer" tabindex="0" @focusout="onContainerFocusOut">
    <div class="fade-effect left-fade-effect"></div>
    <div class="fade-effect right-fade-effect"></div>
    <div class="scroll-container" ref="filtersContainer">
      <BngPillFilters
        ref="bngPillFiltersRef"
        :htmlId="htmlId"
        :options="options"
        :select-on-navigation="selectOnNavigation"
        :required="required"
        :select-many="selectMany"
        :has-checked-icon="hasCheckedIcon"
        @valueChanged="onValueChanged"
        @pillItemFocusIn="onPillItemFocusIn" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import BngPillFilters from "@/common/components/base/bngPillFilters"

const emit = defineEmits(["update:modelValue", "valueChanged"])

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
  selectMany: Boolean,
  hasCheckedIcon: Boolean,
})

const selectedItems = ref([])
const bngFiltersContainer = ref(null)
const filtersContainer = ref(null)
const bngPillFiltersRef = ref(null)

defineExpose({
  selectPrevious: () => bngPillFiltersRef.value.selectPrevious(),
  selectNext: () => bngPillFiltersRef.value.selectNext(),
  selectCurrent: () => bngPillFiltersRef.value.selectCurrent(),
  focusAndScrollToSelected: focusSelected,
})

let selectedItemId = ""

onMounted(() => {
  filtersContainer.value.addEventListener("wheel", evt => {
    evt.preventDefault()
    filtersContainer.value.scrollLeft += evt.deltaY
  })
})

function focusSelected() {
  if (props.selectMany || !props.selectOnNavigation) return

  scrollToElement(selectedItemId)
}

function onContainerFocusOut($event) {
  const isInsideContainer = $event.relatedTarget && bngFiltersContainer.value.contains($event.relatedTarget)

  if (!isInsideContainer && !props.selectMany && selectedItemId) {
    scrollToElement(selectedItemId)
  }
}

// id - html id of most recent selected item
// causing this event to trigger
function onValueChanged(items, id) {
  selectedItems.value = items
  selectedItemId = id
  emit("valueChanged", items, id)
}

function onPillItemFocusIn(id) {
  scrollToElement(id)
}

function scrollToElement(id) {
  const scrollableContainer = filtersContainer.value
  const el = scrollableContainer.querySelector(`#${id}`)

  if (el) {
    const scrollableContainerRect = scrollableContainer.getBoundingClientRect()
    const itemRect = el.getBoundingClientRect()

    const isFullyVisible = itemRect.left >= scrollableContainerRect.left && itemRect.right <= scrollableContainerRect.right

    if (isFullyVisible) return

    window.requestAnimationFrame(() => {
      const scrollValue =
        itemRect.left < scrollableContainerRect.left ? (scrollableContainerRect.left - itemRect.left) * -1 : itemRect.right - scrollableContainerRect.right

      scrollableContainer.scrollBy({
        left: scrollValue,
      })
    })
  }
}
</script>

<style scoped lang="scss">
$container-background-color: rgba(0, 0, 0, 0.5);
$container-padding-left: 0.5em;
$container-padding-right: 0.5em;
$container-padding-top: 0.5em;
$container-padding-bottom: 0.5em;
$container-max-width: 40em;
$container-highlight-color: var(--bng-orange-b400);
$container-fade-color: rgba(0, 0, 0, 0.25);
$container-fade-z-index: 1;
$border-radius: 1em;

// START Reset
// END Resett

* {
  box-sizing: border-box;
}

.highlight-container:focus {
  outline: 2px solid orange;

  &::before {
    display: none;
  }
}

.bng-filters-container {
  position: relative;
  background: $container-background-color;
  border-radius: $border-radius;
  max-width: $container-max-width;
  overflow: hidden;

  > .fade-effect {
    content: "";
    position: absolute;
    display: block;
    top: 0;
    width: 1em;
    height: 100%;
    z-index: $container-fade-z-index;
    background: $container-fade-color;
    filter: blur(2px);
  }

  > .left-fade-effect.fade-effect {
    left: -0.5em;
  }

  > .right-fade-effect.fade-effect {
    right: -0.5em;
  }

  &:focus {
    outline: 2px solid $container-highlight-color;
  }
}

.scroll-container {
  overflow-y: hidden;
  padding: 0.25em 0;

  &::-webkit-scrollbar {
    display: none;
  }
}

.bng-pill-filters {
  padding: 0.125em;
}
</style>
