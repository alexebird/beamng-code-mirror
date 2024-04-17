<template>
  <h2>Image Asset Demo</h2>
  <span>Plain image:</span>
  <div>
    <BngImageAsset :title="icon" class="demo-icon" v-for="icon in iconTypesList" :src="iconURL(icon)" />
  </div>
  <span><br />Image as '<code>span</code>' background image:</span>
  <div>
    <BngImageAsset span :title="icon" class="demo-icon" v-for="icon in iconTypesList" :src="iconURL(icon)" />
  </div>
  <span><br />Image as '<code>span</code>' mask image:</span>
  <div>
    <BngImageAsset mask :title="icon" class="demo-icon" v-for="icon in iconTypesList" :src="iconURL(icon)" :bg-color="randomColour()" />
  </div>
</template>

<script setup>
import { BngImageAsset } from "@/common/components/base"
import { iconTypesList } from "@/assets/icons"

const randomColour = () => `rgba(${~~(Math.random() * 256)},${~~(Math.random() * 256)},${~~(Math.random() * 256)})`
const iconURL = icon => `icons/${icon}.svg`
</script>

<style scoped>
div {
  display: flex;
  flex-wrap: wrap;
}
.demo-icon {
  min-width: 1.5em;
  min-height: 1.5em;
  width: 1.5em;
  height: 1.5em;
  margin: 0.2em;
}
</style>
