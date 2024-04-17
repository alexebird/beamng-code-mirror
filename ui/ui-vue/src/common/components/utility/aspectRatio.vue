<!-- AspectRatio - for displaying an image at a fixed aspect ratio, optionally with overlaid content -->
<template>
  <div class="aspect-ratio" :style="backgroundStyle">
    <!-- Slot for content -->
    <div class="slotted">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from "vue"
import { getAssetURL } from "@/utils"

const placeholderImageURL = getAssetURL("images/noimage.png")
const slots = useSlots()

// Prop for aspect ratio and image
const props = defineProps({
  ratio: {
    type: String,
    default: "16:9",
  },
  imageSize: {
    type: String,
    default: "cover",
    validator: value => ["cover", "contain"].includes(value),
  },
  image: {
    type: String,
    default: null,
  },
})

const padding = computed(() => {
  // Default to 16:9
  if (!props.ratio) return "56.25%"

  const [width, height] = props.ratio.split(":").map(Number)
  return `${(height / width) * 100}%`
})

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
</script>

<style lang="scss" scoped>
.aspect-ratio {
  position: relative;
  background-size: v-bind(imageSize);
  background-position: center;
  background-repeat: no-repeat;
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
