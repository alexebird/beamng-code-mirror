<!-- Aspect Ratio Demo -->
<template>
  <h2>Aspect Ratio Demo</h2>

  <span>Empty:</span>
  <AspectRatio class="aspectDemoItem" />

  <span>Image Only (default 16:9):</span>
  <AspectRatio class="aspectDemoItem" :image="demoValues.imgurl" />

  <span>Image 4:3:</span>
  <AspectRatio class="aspectDemoItem" :image="demoValues.imgurl" :ratio="demoValues.fourByThree" />

  <span>Image 3:4:</span>
  <AspectRatio class="aspectDemoItem" :image="demoValues.imgurl" :ratio="demoValues.threeByFour" />
</template>

<script setup>
import { AspectRatio } from "@/common/components/utility"
import { getAssetURL } from "@/utils"

const demoValues = {
  "imgurl": getAssetURL("beamngdrive.png"),
  "fourByThree": "4:3",
  "threeByFour": "3:4"
}
</script>

<style lang="scss" scoped>
.aspectDemoItem {
  width: 300px;
}
</style>
