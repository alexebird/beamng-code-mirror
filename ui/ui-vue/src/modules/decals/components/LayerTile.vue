<template>
  <div class="layer-tile" :style="{ background: tileBackground }">
    <span v-if="layerImage" class="layer-image" ></span>
  </div>
</template>

<script setup>
import { getAssetURL } from "@/utils";
import { computed } from "vue"

const props = defineProps({
  rgbaColor: {
    type: Array,
    default: [255, 255, 255, 1],
  },
  image: {
    type: String,
  },
})

const color = computed(() => `rgba(${props.rgbaColor[0]},${props.rgbaColor[1]},${props.rgbaColor[2]},${props.rgbaColor[3]})`)

const layerImage = computed(() => props.image ? `url(${props.image})` : "none")

const tileBackground = computed(() => props.image ? `url(${getAssetURL('images/alpha_texture.png')}` : color.value)
</script>

<style scoped lang="scss">
@import "@/styles/modules/mixins";

$backgroundColor: rgba(0, 0, 0, 0.6);
$f-offset: 0.25rem;
$rad: $border-rad-1;

.layer-tile {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 5rem;
  width: 5rem;
  border-radius: 0.25rem;
  background: $backgroundColor;

  @include modify-focus($rad, $f-offset);

  .layer-image {
    display: inline-block;
    height: 2.5rem;
    width: 2.5rem;
    background: v-bind(layerImage);
    background-size: cover;
    background-repeat: no-repeat;
  }
}
</style>
