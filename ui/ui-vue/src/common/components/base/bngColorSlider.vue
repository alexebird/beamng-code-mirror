<template>
  <div
    class="colour-slider"
    v-bng-disabled="disabled"
  >
    <span v-if="$slots.default && !vertical"><slot></slot></span>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      v-model="value"
      @input="notify()"
      @change="notify()"
      :tabindex="tabIndex"
      :style="{
        '--colour-slider-track-fill': fill && fill.length > 0 ? `linear-gradient(90deg, ${fill.join(', ')})` : 'transparent',
        '--colour-slider-thumb-fill': current || '#000',
        '--colour-slider-thumb-size': current ? '1em' : '0.25em',
      }"
      :class="{
        'colour-slider-vertical': vertical,
      }"
      :orient="vertical ? 'vertical' : 'horizontal'"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { vBngDisabled } from "@/common/directives"

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
})

const tabIndex = computed(() => (props.disabled ? -1 : 0))

const value = ref(props.modelValue)

watch(() => props.modelValue, val => value.value = Number(val))

const emitter = defineEmits(["update:modelValue", "change"])

function notify() {
  emitter("change", value.value)
  emitter("update:modelValue", value.value)
}
</script>

<style lang="scss" scoped>
.colour-slider {
  display: inline-block;
  width: 100%;

  &[disabled] {
    opacity: 0.5;
    filter: grayscale(50%);
    pointer-events: none;
  }

  > * {
    display: block;
    width: 100%;
  }
  input[type=range] {
    $height: 1.25em;
    position: relative;
    height: $height;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0.3em;
    background-color: white;
    background-image: var(--colour-slider-track-fill), url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><rect x='0' y='0' width='1' height='1' fill='rgb(170,170,170)' /><rect x='1' y='1' width='1' height='1' fill='rgb(170,170,170)' /></svg>");
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
    }

    // &.colour-slider-vertical {
    //   transform: rotate(270deg);
    //   // width: $height;
    //   // height: 0;
    //   // padding-bottom: 100%;
    // }
  }
}
</style>
