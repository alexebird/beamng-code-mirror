<!-- bngIcon - a simple icon -->
<template>
  <div :class="['icon-marker', `icon-point-${point}`, `icon-type-${marker}`]">
    <BngIcon class="icon-back" :type="icon.back" :color="iconColour.back" />
    <BngIcon class="icon-front" :type="icon.front" :color="iconColour.front" />
    <BngIcon v-if="type" class="icon-inner" :type="type" :color="iconColour.icon" />
  </div>
</template>

<script setup>
import { computed } from "vue"
import { BngIcon } from "@/common/components/base"

const props = defineProps({
  marker: {
    type: String,
    default: "circlePin",
    validator: val => markers.includes(val),
  },
  type: [String, Object],
  color: [String, Array],
  point: {
    type: String,
    default: "down",
    validator: val => markerPoints.includes(val),
  },
})

const icon = computed(() => ({
  back: iconsBySize["56"][props.marker + "Back"],
  front: iconsBySize["56"][props.marker + "Front"],
}))

const iconColour = computed(() => ({
  back: (Array.isArray(props.color) ? props.color[0] : props.color) || "#fff",
  front: (Array.isArray(props.color) ? props.color[1] : null) || "#000",
  icon: (Array.isArray(props.color) ? props.color[2] || props.color[0] : props.color) || "#fff",
}))
</script>

<script>
import { icons, iconsBySize } from "@/common/components/base"
export { icons, iconsBySize }

const markerValidate = name =>
  (name.endsWith("Back") && Object.keys(iconsBySize["56"]).includes(name.replace(/Back$/, "Front"))) ||
  (name.endsWith("Front") && Object.keys(iconsBySize["56"]).includes(name.replace(/Front$/, "Back")))

export const markers = Object.keys(iconsBySize["56"])
  .filter(markerValidate)
  .map(name => name.replace(/Back$|Front$/, ""))
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  .reduce((res, name) => (res.includes(name) ? res : [...res, name]), [])

export const markerPoints = ["down", "up", "left", "right"]
</script>

<style lang="scss" scoped>
.icon-marker {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  > * {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1em;
  }

  &.icon-point-left {
    transform: rotate(90deg);
    .icon-inner {
      transform: rotate(-90deg);
    }
  }
  &.icon-point-right {
    transform: rotate(-90deg);
    .icon-inner {
      transform: rotate(90deg);
    }
  }
  &.icon-point-up {
    transform: rotate(180deg);
    .icon-inner {
      transform: rotate(-180deg);
    }
  }

  .icon-inner {
    font-size: 0.55em;
    top: 0.41em;
    left: 0.41em;
  }
  &.icon-type-circlePin {
    .icon-inner {
      font-size: 0.55em;
      top: 0.275em;
      left: 0.41em;
    }
  }
  &.icon-type-markerRectanglePin {
    .icon-inner {
      font-size: 0.63em;
      top: 0.262em;
      left: 0.295em;
    }
  }
  &.icon-type-markerTriangle {
    .icon-inner {
      font-size: 0.4em;
      top: 0.45em;
      left: 0.755em;
    }
  }
}
</style>
