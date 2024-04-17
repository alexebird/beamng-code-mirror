<template>
  <div class="bng-image-carousel">
    <Carousel v-bind="carouselSettings">
      <CarouselItem v-for="(image, index) in images" :key="index" :value="index">
        <div class="image-slide" :style="{ 'background-image': `url(${image})` }"></div>
      </CarouselItem>
    </Carousel>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { Carousel, CarouselItem } from "@/common/components/utility"
import { getAssetURL } from "@/utils"

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  current: {
    type: [String, Number],
  },
  transition: {
    type: Boolean,
  },
  transitionType: {
    type: String,
  },
  transitionTime: {
    type: Number,
    default: 3000,
  },
  loop: {
    type: Boolean,
    default: true,
  },
})

// const imageAssets = computed(() => props.images.map(x => getAssetURL(x)))
const carouselSettings = computed(() => ({
  current: props.current,
  transition: props.transition,
  transitionTime: props.transitionTime,
  transitionType: props.transitionType,
  loop: props.loop,
}))
</script>

<style scoped lang="scss">
.bng-image-carousel {
  // aspect-ratio: 2 / 1;

  :deep(.image-slide) {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
  }
}
</style>
