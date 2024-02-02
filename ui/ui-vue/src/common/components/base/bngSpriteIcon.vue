<template>
  <svg class="atlasIcon" :style="{ fill: color, pointerEvents: 'none', transform: `rotate(${deg}deg)` }" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <use :xlink:href="atlasURL" />
  </svg>
</template>

<script setup>
import { computed } from "vue"

// Props
const props = defineProps({
  atlasPath: {
    type: String,
    default: "sprites/svg-symbols.svg",
  },
  src: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#fff",
  },
  deg: {
    type: Number,
    default: 0,
  },
})

const atlasURL = computed(() => `${getAssetURL(props.atlasPath)}#${props.src.toLowerCase()}`)

// using our own getAssetURL here to get around the SVG cross domain issue in vue dev mode
const getAssetURL = assetPath =>
  bngVue.isProd ? `/ui/ui-vue/dist/${assetPath}` : bngApi.isMock ? `http://localhost:9000/${assetPath}` : `/ui/ui-vue/src/assets/${assetPath}`
</script>

<style scoped>
.atlasIcon {
  fill: currentColor;
  width: 1rem;
  height: 1rem;
}
</style>
