<!-- AspectRatio - for displaying an image at a fixed aspect ratio, optionally with overlaid content -->
<template>
  <div class="aspect-ratio" ref="root" :style="backgroundStyle">
    <!-- Slot for content -->
    <div class="slotted">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, useSlots, onMounted } from "vue"
import { getAssetURL } from "@/utils"

const placeholderImageURL = getAssetURL("images/noimage.png")
const slots = useSlots()

// Prop for aspect ratio and image
const props = defineProps({
  ratio: {
    type: String,
    default: "16:9",
  },
  image: {
    type: String,
    default: null,
  },
})

const root = ref()

// Compute padding based on the provided ratio
const padding = ref("56.25%") // Default to 16:9
if (props.ratio) {
  const [width, height] = props.ratio.split(":").map(Number)
  padding.value = `${(height / width) * 100}%`
}

// Compute background style
const backgroundStyle = computed(() => {
  if (!props.image) {
    return {
      "--padding": padding.value,
      backgroundImage: `none`,
    }
  } else if (props.image) {
    return {
      "--padding": padding.value,
      backgroundImage: `url(${props.image})`,
    }
  } else if (slots.default) {
    return {
      "--padding": padding.value,
      backgroundImage: `url(${placeholderImageURL})`,
    }
  }
  return {}
})

onMounted(() => {
  root.value.style["--padding"] = padding.value
})
</script>

<style lang="scss" scoped>
.aspect-ratio {
  position: relative;
  background-size: cover;
  background-position: center;
}

.aspect-ratio::after {
  content: "";
  display: block;
  padding-bottom: var(--padding);
}

.aspect-ratio > .slotted {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  white-space: normal;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
