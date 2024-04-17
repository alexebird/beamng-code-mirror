<!-- bngMainStars - for displaying stars -->
<template>
  <div class="bng-stars">
    <div class="stars-bar"></div>
  </div>
</template>

<script>
const STAR_WIDTH = 1.5
const STAR_WIDTH_UNIT = "rem"
</script>

<script setup>
import { getAssetURL } from "@/utils"
import { computed } from "vue"
const iconImageURL = getAssetURL("icons/general/star.svg") // TODO - fix hardcoded icon path - use from list

const props = defineProps({
  unlockedStars: {
    type: Number,
    default: 0,
    validator(value) {
      return value > -1
    },
  },
  totalStars: {
    type: Number,
    default: 1,
  },
})

const starBarsWidth = computed(() => `${props.totalStars * STAR_WIDTH}${STAR_WIDTH_UNIT}`)
const backgroundPosition = computed(() => `${100 - Math.floor((props.unlockedStars / props.totalStars) * 100)}%`)
const starIconUrlStyle = computed(() => `url(${iconImageURL})`)
</script>

<style scoped lang="scss">
@import "@/styles/modules/density";

$defaultStarColor: #ffff;
$starColor: var(--star-color, $defaultStarColor);

.bng-stars {
  border-radius: $border-rad-1;
  background: rgba(black, 0.6);
  padding: 0.5rem;

  > .stars-bar {
    background: no-repeat linear-gradient(90deg, $starColor 50%, rgba(255, 255, 255, 0.2) 50%) 0 0 / 200% 200%;
    mask-image: v-bind(starIconUrlStyle);
    -webkit-mask-image: v-bind(starIconUrlStyle);
    -webkit-mask-repeat: space;
    -webkit-mask-size: contain;
    -webkit-mask-position: 50% 50%;
    width: v-bind(starBarsWidth);
    height: 1.5rem;
    flex: 0 0 auto;
    transition: background-position 0.2s ease;
    background-position: v-bind(backgroundPosition);
    content: "";
  }
}
</style>
