<template>
  <div class="bng-pill-filters" tabindex="0">
    <div class="pills-wrapper" ref="scrollable">
      <div v-for="(pill, index) of pillConfigs" :key="pill.value" ref="pills" class="pill-wrapper">
        <BngPillCheckbox v-model="pill.selected" @valueChanged="value => onPillValueChanged(pill.value, value)" @focusin="onPillFocusIn(pill.value, index)">
          {{ pill.label }}
        </BngPillCheckbox>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BngPillCheckbox } from "@/common/components/base"
import { ref, onMounted, computed, toRaw } from "vue"

const props = defineProps({
  modelValue: Array,
  options: {
    type: Array,
    required: true,
  },
  selectOnFocus: Boolean,
  selectMany: Boolean,
  showCheckIcon: Boolean,
  required: Boolean,
})

const emit = defineEmits(["update:modelValue", "valueChanged"])

defineExpose({
  focusPrevious,
  focusNext,
  toggleFocusedPill,
  focusIndex,
})

const scrollable = ref(null)
const pills = ref([])
const currentPillIndex = ref(-1)
const defaultSelected = ref([])

const selectedValues = computed({
  get: () => (props.modelValue ? props.modelValue : defaultSelected.value),
  set: newValue => {
    if (props.modelValue) {
      emit("update:modelValue", newValue)
      emit("valueChanged", newValue)
    } else {
      defaultSelected.value = newValue
      emit("valueChanged", newValue)
    }
  },
})

const pillConfigs = computed(() =>
  toRaw(props.options).map(x => ({
    ...x,
    selected: selectedValues.value && selectedValues.value.length > 0 && selectedValues.value.includes(x.value),
  }))
)

function focusPrevious() {
  currentPillIndex.value = currentPillIndex.value > 0 ? currentPillIndex.value - 1 : 0
  pills.value[currentPillIndex.value].querySelector(".bng-pill").focus()
  console.log("currentPillIndex.value", currentPillIndex.value)
}

function focusNext() {
  if (currentPillIndex.value < pillConfigs.value.length - 1) currentPillIndex.value = currentPillIndex.value + 1
  console.log("currentPillIndex.value", currentPillIndex.value)
  pills.value[currentPillIndex.value].querySelector(".bng-pill").focus()
}

function focusIndex(pindex) {
  currentPillIndex.value = pindex
  pills.value[currentPillIndex.value].querySelector(".bng-pill").focus()
}

// Only applicable if `selectOnNav` is false
function toggleFocusedPill() {
  if (props.selectOnFocus) return

  const isPillSelected = pillConfigs.value[currentPillIndex.value].selected
  setPillValue(pillConfigs.value[currentPillIndex.value].value, !isPillSelected)
}

onMounted(() => {
  scrollable.value.addEventListener("wheel", evt => {
    evt.preventDefault()
    scrollable.value.scrollLeft += evt.deltaY
  })

  currentPillIndex.value = selectedValues.value.length > 0 ? pillConfigs.value.findIndex(x => x.value === selectedValues.value[0]) : -1

  if (currentPillIndex.value > -1) focusPill(currentPillIndex.value)
})

const onPillValueChanged = (key, value) => {
  if (props.selectOnFocus) return

  console.log("onPillValueChanged", key, value)
  setPillValue(key, value)
}

const onPillFocusIn = (key, index) => {
  focusPill(index)

  if (!props.selectOnFocus) return
  const checked = selectedValues.value.length > 0 && selectedValues.value.includes(key)
  setPillValue(key, !checked)
}

function setPillValue(key, checked) {
  currentPillIndex.value = pillConfigs.value.findIndex(x => x.value === key)

  if (props.required && !checked && selectedValues.value.includes(key) && selectedValues.value.length == 1) {
    selectedValues.value = [key]
    return
  }

  if (!props.selectMany) {
    selectedValues.value = checked ? [key] : []
    return
  }

  const isExisting = selectedValues.value.includes(key)

  if (checked && !isExisting) {
    selectedValues.value = [...selectedValues.value, key]
  } else if (!checked && isExisting) {
    selectedValues.value = selectedValues.value.filter(x => x !== key)
  }
}

function focusPill(index) {
  const pillEl = pills.value[index]
  const scrollableRect = scrollable.value.getBoundingClientRect()
  const pillRect = pillEl.getBoundingClientRect()

  const isFullyVisible = pillRect.left >= scrollableRect.left && pillRect.right <= scrollableRect.right

  if (isFullyVisible) return

  window.requestAnimationFrame(() => {
    scrollable.value.scrollBy({
      left: pillEl.getBoundingClientRect().right,
    })
  })
}
</script>

<style scoped lang="scss">
.bng-pill-filters {
  position: relative;
  display: flex;
  border-radius: 1rem;
  outline: 0.125rem solid transparent;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;

  &:focus {
    outline: 0.125rem solid var(--bng-orange-b400);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: inset 0.75rem 0 1rem -0.6rem rgba(0, 0, 0, 0.5), inset -0.75rem 0 1rem -0.6rem rgba(0, 0, 0, 0.5);
    z-index: 1;
    pointer-events: none;
  }

  > .pills-wrapper {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    overflow-x: auto;

    // Fix for gap until new CEF returns
    // TODO - remove fix when CEF is back
    //
    // gap: 0.5rem;
    & > *:not(:last-child) {
      margin-right: 0.5em;
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
