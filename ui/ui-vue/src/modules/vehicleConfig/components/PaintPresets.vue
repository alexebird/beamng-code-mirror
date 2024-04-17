<template>
  <div class="paint-presets" bng-ui-scope="paint_presets">
    <div v-for="group in presetGroups" class="paint-presets-group">
      <span class="paint-presets-name">
        {{ $t(`ui.color.${group.name}`) }}:
        <span v-if="showText && editable && group.editable" class="paint-presets-hint">({{ $t("ui.colorpicker.holdToDel") }})</span>
      </span>
      <div
        v-for="preset in group.presets"
        class="paint-presets-item"
        :style="{ backgroundColor: preset.css }"
        tabindex="1"
        v-bng-tooltip:right="group.showTooltip ? preset.name : undefined"
        :show-hold="editable && group.editable"
        bng-nav-item
        v-bng-on-ui-nav:ok.asMouse.focusRequired
        v-bng-click="{
          clickCallback: () => emit('apply', preset),
          holdCallback: editable && group.editable ? () => removePreset(preset.name) : undefined,
          holdDelay: 1000,
          repeatInterval: 0,
        }"></div>
      <!-- TODO: icon instead of a label -->
      <!-- FIXME: consider replacing a button with just an icon -->
      <BngButton
        v-if="editable && group.editable"
        class="paint-presets-button"
        accent="outlined"
        @click="addPreset"
        Xicon="save"
        v-bng-tooltip:right="$t('ui.colorpicker.colToPre')"
        >+</BngButton
      >
    </div>
  </div>
</template>

<script setup>
import { ref, toRaw, computed, watch, inject } from "vue"
import { lua } from "@/bridge"
import { vBngClick, vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import { vBngTooltip } from "@/common/directives"
import { BngButton } from "@/common/components/base"
import Paint from "@/utils/paint"

useUINavScope("paint_presets")

const $game = inject("$game")

const props = defineProps({
  presets: {
    type: Object,
    required: true,
  },
  showText: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  current: {
    // current paint so it could be saved to user presets
    type: Object,
  },
})

const emit = defineEmits(["apply"])

const factoryPresets = ref({})
function loadFactory(val) {
  const presets = {}
  if (typeof val === "object" && !Array.isArray(val)) {
    const paint = new Paint()
    for (const name in val) {
      try {
        paint.paint = val[name]
        presets[name] = paint.paintObject
      } catch (err) {
        // console.warn(`Paint "${name}" is invalid`, val[name])
      }
    }
  }
  // console.log(val, presets)
  factoryPresets.value = presets
}
watch(() => props.presets, loadFactory)
loadFactory(props.presets)

const userPresets = ref({})
let settingsState = {}

const presetGroups = computed(() => {
  // build group sequence with sources
  const res = []
  // factory (supplied) paint selection
  if (Object.keys(factoryPresets.value).length) {
    res.push({
      name: "factory",
      showTooltip: true,
      editable: false,
      presets: factoryPresets.value,
    })
  }
  // user paint
  if (props.editable) {
    res.push({
      name: "user",
      showTooltip: false,
      editable: true,
      presets: userPresets.value || {},
    })
  }
  // rebuild presets
  for (const group of res) {
    let presets = Object.keys(group.presets).map(colname => ({
      name: colname,
      ...group.presets[colname],
      // note: user presets might have alpha 0..2 instead of 0..1
      css: `rgb(${group.presets[colname].baseColor.slice(0, 3).map(val => val * 255)})`,
    }))
    if (group.name !== "user") presets = sortColors(presets)
    group.presets = presets
    // console.log(group.name, group.presets.map(itm => itm.name))
  }
  // console.log(res)
  return res
})

function average(arr) {
  return arr.reduce((a, b) => a + b) / arr.length
}

function valComparable(col, thres = 0.05) {
  let bool = true
  const av = average(col)
  for (let i = 0; i < col.length; i++) {
    bool = bool && av - thres <= col[i] && av + thres >= col[i]
  }
  bool = bool && (av > 0.8 || av < 0.2)
  return bool
}

function colorHigherHelper(itm) {
  const av = average(itm.orig.baseColor.slice(0, 3))
  const al = itm.orig.baseColor[3] / 2
  const res = Math.abs(av - 1) * al
  return res === 0 ? (av + al) / 2 : res + 1
}

function colorHigher(a, b) {
  const aColor = valComparable(a.orig.baseColor.slice(0, 3))
  const bColor = valComparable(b.orig.baseColor.slice(0, 3))
  if (aColor && bColor) {
    return colorHigherHelper(b) - colorHigherHelper(a)
  } else if (aColor && !bColor) {
    return 1
  } else if (!aColor && bColor) {
    return -1
  } else {
    for (let i = 0; i < 3; i++) {
      if (a.val[i] !== b.val[i]) return a.val[i] - b.val[i]
    }
    return 0
  }
}

// Thanks to: http://www.alanzucconi.com/2015/09/30/colour-sorting/
function colorValue(arr) {
  let repitions = 8
  let rgb = []
  for (let i = 0; i < 3; i++) {
    rgb[i] = (1 - arr[3] / 2) * arr[i] + (arr[3] / 2) * arr[i]
  }
  let lum = Math.sqrt(0.241 * rgb[0] + 0.691 * rgb[1] + 0.068 * rgb[2])
  let hsl = Paint.rgbToHsl(rgb)
  let out = [hsl[0], lum, hsl[1]].map(elem => elem * repitions)
  if (out[0] % 2 === 1) {
    out[1] = repitions - out[1]
    out[2] = repitions - out[2]
  }
  out.push(arr[3])
  return out
}

function sortColors(list) {
  return list
    .map(elem => {
      return {
        val: colorValue(elem.baseColor),
        orig: elem,
      }
    })
    .sort(colorHigher)
    .map(elem => elem.orig)
}

function addPreset() {
  if (!props.current) return
  const colour = {
    ...props.current,
    baseColor: toRaw(props.current.baseColor),
  }
  let idx = 1
  while (`Custom ${idx}` in userPresets.value) idx++
  userPresets.value[`Custom ${idx}`] = colour
  savePresets()
}

function removePreset(name) {
  delete userPresets.value[name]
  savePresets()
}

function savePresets() {
  settingsState.userPaintPresets = JSON.stringify(Object.values(userPresets.value))
  lua.settings.setState(settingsState)
}

$game.events.on("SettingsChanged", data => {
  settingsState = data.values
  let paints = {}
  if (settingsState.userPaintPresets) {
    paints = JSON.parse(settingsState.userPaintPresets.replace(/'/g, '"'))
    if (typeof paints === "object") {
      // convert array to object if needed
      if (Array.isArray(paints)) {
        paints = paints.reduce((res, paint, idx) => ({ ...res, [`Custom ${idx}`]: paint }), {})
      }
      const test = new Paint()
      for (const name in paints) {
        try {
          // test if it's valid
          test.paint = paints[name]
          paints[name] = test.paintObject
        } catch (fire) {
          // console.warn("Invalid paint:", paints[name])
          delete paints[name]
        }
      }
    }
  }
  // console.log("userPresets", paints)
  userPresets.value = paints
})

lua.settings.notifyUI()
</script>

<style lang="scss" scoped>
.paint-presets {
  display: flex;
  flex-direction: column;
  width: 100%;

  .paint-presets-group {
    max-width: 100%;
    margin: 0.5em 0;

    .paint-presets-name {
      display: block;
    }

    $size: 1.6em;

    .paint-presets-item {
      display: inline-block;
      background-color: white;
      cursor: pointer;
    }

    .paint-presets-item,
    .paint-presets-button {
      // in case of button, this is wrong
      // consider replacing a button with just an icon
      width: $size !important;
      height: $size !important;
      min-width: $size !important;
      min-height: $size !important;
      max-width: $size !important;
      max-height: $size !important;
      margin: 0.2em;
    }
    .paint-presets-button {
      // in case of button, this is wrong
      top: -0.5em;
    }

    .paint-presets-hint {
      float: right;
      font-size: 0.8em;
    }
  }
}
</style>
