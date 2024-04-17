<template>
  <div class="adjustment-container" v-bng-on-ui-nav:focus_lr,focus_ud="move">
    <BngImageTile class="mirror-tile" :icon="icons[mirror.mirrorIcon]" :label="mirror.description" ratio="1:1" />
    <div class="y-controls">
      <div class="slider-container">
        <BngSlider ref="inpY" class="slider-y" v-bind="range.y" :uiNavFocus="false" v-model="mirror.y" @valueChanged="onValueChanged" />
      </div>
      <div class="value-input">
        <BngBinding class="keybinding" action="menu_item_radial_y" :show-unassigned="true" :dark="false" />
        <BngInput class="value" v-model="mirror.y" type="number" v-bind="range.y" prefix="Y" suffix="°" />
      </div>
    </div>
    <div class="x-controls">
      <div class="slider-container">
        <BngSlider ref="inpX" class="slider-x" v-bind="range.x" :uiNavFocus="false" v-model="mirror.x" @valueChanged="onValueChanged" />
      </div>
      <div class="value-input">
        <BngBinding class="keybinding" action="menu_item_radial_x" :show-unassigned="true" :dark="false" />
        <BngInput class="value" v-model="mirror.x" type="number" v-bind="range.x" prefix="X" suffix="°" />
      </div>
    </div>
    <div class="reset-cont">
      <BngButton :disabled="!isChanged" @click="resetValues()">{{ $t("ui.common.reset") }}</BngButton>
    </div>
  </div>
</template>

<script>
const MIRROR_RANGE_DEFAULTS = {
  min: -20,
  max: 20,
  step: 0.01,
}
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { lua } from "@/bridge"
import { BngImageTile, BngSlider, BngInput, BngButton, BngBinding, icons } from "@/common/components/base"
import { vBngOnUiNav } from "@/common/directives"

const props = defineProps({
  mirror: Object,
})

const range = {
  x: {
    min: props.mirror.clampX ? props.mirror.clampX[0] : MIRROR_RANGE_DEFAULTS.min,
    max: props.mirror.clampX ? props.mirror.clampX[1] : MIRROR_RANGE_DEFAULTS.max,
    step: MIRROR_RANGE_DEFAULTS.step,
  },
  y: {
    min: props.mirror.clampY ? props.mirror.clampY[0] : MIRROR_RANGE_DEFAULTS.min,
    max: props.mirror.clampY ? props.mirror.clampY[1] : MIRROR_RANGE_DEFAULTS.max,
    step: MIRROR_RANGE_DEFAULTS.step,
  },
}

const [inpX, inpY] = [ref(), ref()]
const isChanged = computed(() => (inpX.value && inpX.value.dirty) || (inpY.value && inpY.value.dirty))

const mover = {
  x: 0,
  y: 0,
  drift: 0.2, // gamepad deadzone (maybe it should be taken from settings?)
  tmr: null,
  tmrInterval: 100,
}
function move(evt) {
  const val = evt.detail.value > mover.drift ? evt.detail.value - mover.drift : evt.detail.value < -mover.drift ? evt.detail.value + mover.drift : 0
  if (evt.detail.name === "focus_lr") {
    mover.x = val
  } else if (evt.detail.name === "focus_ud") {
    mover.y = val
  }
  // if (val !== 0) console.log(evt.detail.name, val)
}

const precision = 10 ** (MIRROR_RANGE_DEFAULTS.step.toString() + ".").split(/[.,]/)[1].length
const clamp = (val, axis = "x") => Math.round(Math.max(range[axis].min, Math.min(val, range[axis].max)) * precision) / precision

function resetValues() {
  props.mirror.x = inpX.value.currentCleanValue
  props.mirror.y = inpY.value.currentCleanValue
  onValueChanged()
}

function onValueChanged() {
  lua.extensions.core_vehicle_mirror.setAngleOffset(props.mirror.name, -props.mirror.y, -props.mirror.x, false, false)
}

onMounted(() => {
  lua.extensions.core_vehicle_mirror.focusOnMirror(props.mirror.name)
  mover.tmr = setInterval(() => {
    if (mover.x === 0 && mover.y === 0) return
    props.mirror.x = clamp(props.mirror.x + mover.x, "x")
    props.mirror.y = clamp(props.mirror.y + mover.y, "y")
    onValueChanged()
  }, mover.tmrInterval)
})
onUnmounted(() => {
  clearInterval(mover.tmr)
})
</script>

<style lang="scss" scoped>
.adjustment-container {
  display: grid;
  grid-template:
    "mirror-type y-adjustment" min-content
    "x-adjustment ." min-content / 1fr auto;
  // min-height: 32rem;
  .mirror-tile {
    grid-area: mirror-type;
    width: auto;
    pointer-events: none;
    :deep(.glyph) {
      font-size: 10rem;
    }
  }
  .y-controls {
    align-self: start;
    display: grid;
    gap: 0.5rem;
    grid-template:
      "slider input" 1fr
      / auto auto;
    .slider-container {
      grid-area: slider;
      position: relative;
      width: 2rem;
      height: 15rem;
      .slider-y {
        position: absolute;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        width: 15rem;
        height: 2rem;
        transform-origin: 0 0;
        transform: translateY(15rem) rotate(-90deg);
      }
    }
    .value-input {
      flex-flow: column;
    }
  }

  .x-controls {
    align-self: start;
    display: grid;
    gap: 0.5rem;
    grid-template:
      "slider" auto
      "input" auto /
      1fr;
    .slider-container {
      grid-area: slider;
      width: 15rem;
      height: 2rem;
    }
    .value-input {
      flex-flow: row nowrap;
    }
    padding-bottom: 1rem;
  }
  .value-input {
    grid-area: input;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  .keybinding {
    font-size: 2rem;
  }
  .value {
    max-width: 12ch;
  }
}

.reset-cont {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
