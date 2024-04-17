<!-- bngSlider - a slider control -->
<template>
  <input
    class="bng-slider"
    ref="slider"
    type="range"
    v-model.number="value"
    :min="+min"
    :max="+max"
    :step="+step"
    :tabindex="tabIndex"
    :disabled="disabled"
    @input="notify"
    v-bng-on-ui-nav-focus.repeat="
      !uiNavFocus
        ? false
        : {
            callback: (dir, val) => {
              value = val
              notify()
            },
            value: () => value,
            min: +min,
            max: +max,
            step: +step,
            ...uiNavFocus,
          }
    " />
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue"
import { vBngOnUiNavFocus } from "@/common/directives"
import { useDirty } from "@/services/dirty"

const props = defineProps({
  modelValue: Number,
  min: {
    type: [Number, String],
    default: 0,
  },
  max: {
    type: [Number, String],
    required: true,
  },
  step: {
    type: [Number, String],
    default: 0,
  },
  disabled: Boolean,
  uiNavFocus: {
    type: [Boolean, Object],
    default: {},
    validator: val => (typeof val === "boolean" && !val) || typeof val === "object",
  },
})
const emit = defineEmits(["change", "valueChanged", "update:modelValue"])
const slider = ref(null)
const tabIndex = computed(() => (props.disabled ? -1 : 0))

const value = ref(props.modelValue)

watch(
  () => props.modelValue,
  val => {
    value.value = Number(val)
    updateSliderBackground()
  }
)

const dirty = useDirty(value, null, updateSliderBackground)
defineExpose(dirty)

onMounted(() => {
  updateSliderBackground()
})

function notify() {
  emit("update:modelValue", value.value)
  emit("valueChanged", value.value)
  emit("change", value.value)
  updateSliderBackground()
}

function updateSliderBackground() {
  const current = ((value.value - props.min) / (props.max - props.min)) * 100
  let init = [-100, -100]
  if (typeof dirty.currentCleanValue.value === "number" && !isNaN(dirty.currentCleanValue.value)) {
    // if we have a mark to show, switch between 0 (foreground) and 1 (background)
    // depending on value, for a better visual representation
    const initpos = ((dirty.currentCleanValue.value - props.min) / (props.max - props.min)) * 100
    init[current < initpos ? 0 : 1] = initpos
  }
  slider.value.style.backgroundPosition = `${init[0]}% 50%, ${100 - current}% 50%, ${init[1]}% 50%`
}
</script>

<style lang="scss" scoped>
$knob-color: #fff;
$knob-highlight-color: var(--bng-orange-b400);
$knob-shadow-color: rgba(#000, 0.5);

// START RESET
// Make sure to reset styles back to initial due to
// main.css styles leaking into vue
.bng-slider {
  position: initial;
  height: initial;
  padding: initial;
  background-color: initial;
  color: initial;
  border-width: initial;
  border-radius: initial;
  transition: initial;
  &:focus {
    display: initial;
    &::before {
      content: none;
    }
  }
}
// END RESET

.bng-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  margin: 0.7em 0; // FIXME: needs some tuning
  border-bottom: 0;
  position: relative;
  background-repeat: no-repeat;
  // background mark shows up when value is over initial, and vice versa
  background-image: linear-gradient(90deg, #555 0% 100%),
    // foreground mark
    linear-gradient(105deg, #fff 0% 50%, #333 50% 100%),
    // track
    linear-gradient(90deg, #777 0% 100%); // background mark
  background-size: 0.3em 0.65em,
    // foreground mark
    200% 0.15em,
    // track (must be 200% size)
    0.3em 0.65em; // background mark

  // if you need to disable resizing with font-size,
  // remove the next line and add "font-size: 1rem;"
  height: 1em;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: $knob-color;
    cursor: pointer;
    border-radius: 0.03em;
    width: 0.5em;
    height: 1em;
    transform: skewX(-20deg);
    box-shadow: 0 0 0.5em 0.125em $knob-shadow-color;
  }

  &:focus {
    &::-webkit-slider-thumb {
      background-color: $knob-highlight-color;
      box-shadow: 0 0 0 0.25rem rgba(255, 102, 0, 0.5), 0 0 0.5rem 0.125rem $knob-shadow-color;
    }
  }

  &.bng-slider-rounded::-webkit-slider-thumb {
    width: 0.6em;
    height: 0.6em;
    border-radius: 50%;
    transform: none;
  }
}
</style>
