<template>
  <div
    ref="elSlider"
    class="colour-slider"
    v-bng-disabled="disabled"
    :style="{
      '--colour-slider-track-fill': fill && fill.length > 0 ? `linear-gradient(90deg, ${fill.join(', ')})` : 'transparent',
      '--colour-slider-thumb-fill': indicator === 'inner' && current ? current : '#000',
      '--colour-slider-thumb-size': indicator === 'inner' && current ? '1em' : '0.25em',
      '--colour-slider-indicator-x': `${indicatorPos * 100}%`,
      '--colour-slider-indicator-r': `${indicatorRot}deg`,
    }">
    <span v-if="$slots.default && !vertical"><slot></slot></span>
    <div>
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        v-model.number="value"
        @input="notify"
        @change="notify"
        :tabindex="tabIndex"
        :class="{ 'colour-slider-vertical': vertical }"
        :orient="vertical ? 'vertical' : 'horizontal'"
        v-bng-on-ui-nav-focus.repeat="
          !uiNavFocus
            ? false
            : {
                callback: (dir, val) => {
                  value = val
                  notify()
                },
                value: () => value,
                min,
                max,
                step,
                ...uiNavFocus,
              }
        " />
      <div v-if="indicator === 'popout'" class="colour-slider-indicator-container">
        <div ref="elIndicator" class="colour-slider-indicator">
          <BngIconMarker marker="circlePin" :color="['#fff', current]" class="colour-slider-indicator-marker" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { BngIconMarker } from "@/common/components/base"
import { vBngDisabled, vBngOnUiNavFocus } from "@/common/directives"

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 1,
  },
  step: {
    type: Number,
    default: 0.001,
  },
  fill: {
    type: Array,
    default: ["rgb(0,0,0)", "rgb(255,255,255)"],
  },
  current: {
    type: String,
    default: null,
  },
  vertical: Boolean,
  disabled: Boolean,
  indicator: {
    type: String,
    default: "inner",
    validator: val => ["inner", "popout"].includes(val),
  },
  uiNavFocus: {
    type: [Boolean, Object],
    default: {},
    validator: val => (typeof val === "boolean" && !val) || typeof val === "object",
  },
})

const elSlider = ref()
const elIndicator = ref()

const tabIndex = computed(() => (props.disabled ? -1 : 0))

const value = ref(props.modelValue)

watch(
  () => props.modelValue,
  val => (value.value = Number(val))
)

const indicatorPos = computed(() => {
  if (props.indicator !== "popout") return 0
  const pos = (value.value - props.min) / (props.max - props.min)
  return pos
})

const indicatorRot = computed(() => {
  if (
    props.indicator !== "popout" ||
    !elSlider.value ||
    !elIndicator.value ||
    !elSlider.value.getBoundingClientRect ||
    !elIndicator.value.firstChild ||
    !elIndicator.value.firstChild.getBoundingClientRect
  )
    return 0
  const tilt = 40 // max tilt in degrees
  let rot = 0
  const srect = elSlider.value.getBoundingClientRect()
  const irect = elIndicator.value.firstChild.getBoundingClientRect()
  const abspos = indicatorPos.value * srect.width
  const iwidth = irect.width / 2
  if (abspos < iwidth) {
    rot = (1 - abspos / iwidth) * tilt
  } else if (srect.width - abspos < iwidth) {
    rot = (1 - (srect.width - abspos) / iwidth) * -tilt
  }
  return rot
})

const emitter = defineEmits(["update:modelValue", "change"])

function notify() {
  emitter("change", value.value)
  emitter("update:modelValue", value.value)
}
</script>

<style lang="scss" scoped>
@import "@/styles/modules/variables/z-index";

.colour-slider {
  position: relative;
  display: inline-block;
  width: 100%;

  &[disabled] {
    opacity: 0.5;
    filter: grayscale(50%);
    pointer-events: none;
  }

  > * {
    position: relative;
    display: block;
    width: 100%;
  }
  input[type="range"] {
    $height: 1.25em;
    display: block;
    width: 100%;
    position: relative;
    height: $height;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0.3em;
    background-color: white;
    background-image: var(--colour-slider-track-fill),
      url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><rect x='0' y='0' width='1' height='1' fill='rgb(170,170,170)' /><rect x='1' y='1' width='1' height='1' fill='rgb(170,170,170)' /></svg>");
    background-repeat: repeat;
    background-position: 50% 50%, 0% 0%;
    background-size: 100% 100%, 0.6em 0.6em;
    cursor: default;
    -webkit-appearance: none;

    &:focus {
      outline: none;
      // something from angular
      box-shadow: none;
    }

    &::-webkit-slider-runnable-track {
      height: 100%;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      position: relative;
      top: -0.3em;
      width: var(--colour-slider-thumb-size);
      height: 1.8em;
      background: var(--colour-slider-thumb-fill);
      border: 1px solid #fff;
      border-radius: 0.2em;
      z-index: $sliderKnob;
    }

    // &.colour-slider-vertical {
    //   transform: rotate(270deg);
    //   // width: $height;
    //   // height: 0;
    //   // padding-bottom: 100%;
    // }
  }

  .colour-slider-indicator-container {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - var(--colour-slider-thumb-size));
    height: 0;
    margin: 0 calc(var(--colour-slider-thumb-size) / 2);
    z-index: $sliderKnob;
    pointer-events: none;
    .colour-slider-indicator {
      $size: 2.5em;
      position: absolute;
      top: 0;
      left: var(--colour-slider-indicator-x);
      width: 0;
      height: 0;
      transform: rotate(var(--colour-slider-indicator-r));
      .colour-slider-indicator-marker {
        top: -1.125em;
        left: -0.5em;
        font-size: $size;
      }
    }
  }
  input:focus + .colour-slider-indicator-container {
    display: inline-block;
  }
}
</style>
