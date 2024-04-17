<!-- bngImageAsset - a simple image, with some custom features -->
<template>
  <span class="bng-image-asset" v-if="span || mask" :style="spanStyle"><slot></slot></span>
  <img class="bng-image-asset" v-else :src="assetURL" alt="" />
</template>

<script setup>
import { computed } from "vue"
import { getAssetURL } from "@/utils"

const
  props = defineProps({
    src: String,
    span: Boolean,
    mask: Boolean,
    bgColor: String,
  }),
  assetURL = computed(() => getAssetURL(props.src)),
  spanStyle = computed(() => ({
    [props.mask ? "maskImage" : "backgroundImage"]: `url(${assetURL.value})`,
    ...(props.bgColor && { backgroundColor: props.bgColor }),
  }))
</script>

<style lang="scss" scoped>
.bng-image-asset {
  align-self: center;
  background-repeat: no-repeat;
  background-size: contain;
  mask-repeat: no-repeat;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  display: inline-block;
}
</style>
