<template>
  <div :class="{
    'colour-picker-container': true,
    'colour-picker-mode-picker': opts.picker,
    'colour-picker-mode-slider': opts.slider,
  }">
    <div
      v-if="opts.picker"
      :class="{
        'colour-picker': true,
        'colour-picker-saturation': opts.saturation,
        'colour-picker-luminosity': opts.luminosity,
      }"
      @mousemove="onMousemove"
      @mousedown="onMousedown"
      @mouseup="onMouseupLeave"
      @mouseleave="onMouseupLeave"
      v-bng-disabled="disabled"
    >
      <div class="colour-picker-dot" :style="{
        left: `${colorDot.x}%`,
        top:  `${colorDot.y}%`,
        '--colour-picker-dot-fill': `hsl(${current.hue}, ${opts.saturation ? current.saturation : 100}%, ${opts.luminosity ? current.luminosity : 50}%)`,
      }"></div>
    </div>
    <BngColorSlider
      v-if="opts.slider"
      v-model="colour.hue"
      @change="notify"
      :fill="['#f00', '#ff0', '#0f0', '#0ff , #00f', '#f0f', '#f00']"
      :current="`hsl(${current.hue}, 100%, 50%)`"
      :disabled="disabled"
    >{{ $t("ui.color.hue") }}</BngColorSlider>
    <BngColorSlider
      v-if="opts.slider || (opts.picker && opts.luminosity)"
      X:vertical="opts.picker"
      v-model="colour.saturation"
      @change="notify"
      :fill="[
        `hsl(${current.hue},   0%, ${current.luminosity}%)`,
        `hsl(${current.hue}, 100%, ${current.luminosity}%)`
      ]"
      :current="`hsl(${current.hue}, ${current.saturation}%, ${current.luminosity}%)`"
      :disabled="disabled"
    >{{ showText ? `${$t("ui.color.saturation")} (${current.saturation}%)` : null }}</BngColorSlider>
    <BngColorSlider
      v-if="opts.slider || (opts.picker && opts.saturation)"
      X:vertical="opts.picker"
      v-model="colour.luminosity"
      @change="notify"
      :fill="[
        `hsl(${current.hue}, ${current.saturation}%,   0%)`,
        `hsl(${current.hue}, ${current.saturation}%,  50%)`,
        `hsl(${current.hue}, ${current.saturation}%, 100%)`,
      ]"
      :current="`hsl(${current.hue}, ${current.saturation}%, ${current.luminosity}%)`"
      :disabled="disabled"
    >{{ showText ? `${$t("ui.color.brightness")} (${current.luminosity}%)` : null }}</BngColorSlider>
  </div>
</template>

<script>
const views = {
  simple: "simple",
  full_saturation: "full_saturation",
  full_luminosity: "full_luminosity",
}
// const models = {
//   hsl: "hsl",
//   rgb: "rgb",
// }
</script>

<script setup>
import { ref, reactive, computed, watch, nextTick } from "vue"
import { BngColorSlider } from "@/common/components/base"
import { vBngDisabled } from "@/common/directives"

const views = {
  simple: { slider: true, picker: false, saturation: false, luminosity: false },
  full_saturation: { slider: false, picker: true, saturation: true, luminosity: false },
  full_luminosity: { slider: false, picker: true, saturation: false, luminosity: true },
}
// const models = {
//   hsl: { hsl: true, rgb: false },
//   rgb: { hsl: false, rgb: true },
// }

const props = defineProps({
  modelValue: {
    // NOTE: when Paint class is provided through the model, it may lead to errors after compilation
    //       to avoid the error, simply wrap provided variable in ref()
    type: Object,
    default: { hue: 0.5, saturation: 1, luminosity: 0.5 },
  },
  view: {
    type: String,
    default: "full_luminosity",
  },
  // model: {
  //   type: String,
  //   default: "hsl",
  // },
  showText: {
    type: Boolean,
    default: true,
  },
  disabled: Boolean,
})

// const opts = reactive({ ...views[props.view], ...models[props.model] })
const opts = reactive({ ...views[props.view] })
watch(() => props.view, val => {
  for (const key in views[val])
    opts[key] = views[val][key]
  setColorDot()
})
// watch(() => props.model, val => {
//   for (const key in models[val])
//     opts[key] = models[val][key]
// })

const colour = ref(props.modelValue)
function updColour() {
  colour.value = props.modelValue
  // console.log(colour.value.paintString)
  setColorDot()
}
watch(() => props.modelValue, updColour)
watch(() => props.modelValue.hue, updColour)
watch(() => props.modelValue.saturation, updColour)
watch(() => props.modelValue.luminosity, updColour)

const emitter = defineEmits(["update:modelValue", "change"])

const current = computed(() => ({
  hue: ~~(colour.value.hue * 360),
  saturation: ~~(colour.value.saturation * 100),
  luminosity: ~~(colour.value.luminosity * 100),
}))

function notify() {
  emitter("change", colour.value)
  emitter("update:modelValue", colour.value)
}

const colorDot = ref({ x: 0, y: 0 })
let isMousedown = false

function onMousedown() { isMousedown = true }
function onMousemove(evt) { updateColor(evt) }
function onMouseupLeave(evt) { updateColor(evt, true) }

function getPosition(evt) {
  const rect = evt.target.getBoundingClientRect()
  if (rect.width < 20)
    return colorDot.value
  return {
    x: (evt.x - rect.left) / rect.width * 100,
    y: (evt.y - rect.top) / rect.height * 100,
  }
}

function updateColor(evt, mouseLeave = false) {
  if (!isMousedown)
    return
  if (mouseLeave)
    isMousedown = false
  const pos = getPosition(evt)
  colour.value.hue = Math.max(0, Math.min(pos.x, 100)) / 100
  const secondary = 1 - Math.max(0, Math.min(pos.y, 100)) / 100
  if (opts.saturation)
    colour.value.saturation = secondary
  else
    colour.value.luminosity = secondary
  setColorDot()
  nextTick(notify)
}

function setColorDot() {
  colorDot.value = {
    x: colour.value.hue * 100,
    y: (1 - (opts.saturation ? colour.value.saturation : colour.value.luminosity)) * 100,
  }
}

if (opts.picker)
  setColorDot()
</script>

<style lang="scss" scoped>
.colour-picker-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: row;

  &.colour-picker-mode-picker {
    display: block;
  }
  /// WIP
  // &.colour-picker-mode-picker {
  //   flex-wrap: nowrap;
  //   > .colour-picker {
  //     $width: calc(100% - 2.5rem);
  //     flex: 0 0 $width;
  //     width: $width !important;
  //   }
  //   > :deep(.colour-slider) {
  //     $factor: 2.666;
  //     $width: 2.5rem * $factor;
  //     flex: 0 0 $width;
  //     width: $width !important;
  //     height: 100% * $factor;
  //     font-size: $factor * 1rem;
  //     // overflow: hidden;
  //     .colour-slider-vertical {
  //       transform-origin: 0% 100%;
  //       transform: rotate(270deg) translate(-$width / $factor, $width / $factor) scale(1 / $factor);
  //     }
  //   }
  // }

  &.colour-picker-mode-slider {
    flex-wrap: wrap;
    justify-content: space-between;
    > * {
      $width: calc(50% - 0.5em);
      flex: 0 0 $width;
      width: $width;
    }
    > *:first-child {
      flex: 0 0 100%;
      width: 100%;
    }
  }
}

.colour-picker {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 37.5%;
  overflow: hidden;
  &[disabled] {
    opacity: 0.5;
    filter: grayscale(50%);
    pointer-events: none;
  }
  &.colour-picker-saturation {
    --colour-picker-vertical: linear-gradient(180deg, hsla(0, 0%, 0%, 0) 0%, hsl(0, 0%, 50%) 100%);
  }
  &.colour-picker-luminosity {
    --colour-picker-vertical: linear-gradient(180deg, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%);
  }
  background-image:
    var(--colour-picker-vertical),
    linear-gradient(90deg, #F00, #FF0, #0F0, #0FF, #00F, #F0F, #F00);
  cursor: crosshair;
  .colour-picker-dot {
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    width: 0;
    height: 1px;
    height: 0;
    pointer-events: none;
    &::before, &::after {
      content: "";
      box-sizing: border-box;
      position: absolute;
      $size: 1rem;
      left: #{-$size * 0.5};
      top: #{-$size * 0.5};
      width: $size;
      height: $size;
      border-radius: $size;
      border: 0.2rem solid #fff;
    }
    &::before {
      background-color: var(--colour-picker-dot-fill);
    }
    &::after {
      border: 0.1rem solid #000;
    }
  }
}

</style>
