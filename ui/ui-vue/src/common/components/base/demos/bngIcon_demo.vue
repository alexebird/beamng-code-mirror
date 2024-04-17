<template>
  Click this to browse and construct icons:
  <BngButton @click="gotoIconBrowser()">IconBrowser</BngButton>
  <h2>Icon Demo</h2>
  <div class="icons">
    <BngIcon :type="icons.beamNG" :color="randomColour()" />
    <BngIcon :type="icons.abandon" :color="randomColour()" />
    <BngIcon :type="icons.adjust" :color="randomColour()" />
    <BngIcon :type="icons.beamNG" :color="randomColour()" />
  </div>
  <h2>(asImage[mask/span])</h2>
  <div class="icons">
    <BngIcon asImage="mask" :type="icons.beamNG" :color="randomColour()" />
    <BngIcon asImage="mask" :type="icons.abandon" :color="randomColour()" />
    <BngIcon asImage="mask" :type="icons.adjust" :color="randomColour()" />
    <BngIcon asImage="mask" :type="icons.beamNG" :color="randomColour()" />
  </div>
  <h2>(asImage)</h2>
  <div class="icons as-image">
    <BngIcon asImage :type="icons.beamNG" :color="randomColour()" />
    <BngIcon asImage :type="icons.abandon" :color="randomColour()" />
    <BngIcon asImage :type="icons.adjust" :color="randomColour()" />
    <BngIcon asImage :type="icons.beamNG" :color="randomColour()" />
  </div>
  <h2>IconMarker Demo</h2>
  <div class="icons marker">
    <BngIconMarker :type="icons.beamNG" marker="circlePin" :color="[randomColour(), randomColour(), randomColour()]" />
    <BngIconMarker :type="icons.abandon" marker="markerRectanglePin" :color="[randomColour(), randomColour(), randomColour()]" />
    <BngIconMarker :type="icons.adjust" marker="markerTriangle" :color="[randomColour(), randomColour(), randomColour()]" />
  </div>
</template>

<script setup>
import { inject } from "vue"
import { BngIcon, BngIconMarker, BngButton, icons } from "@/common/components/base"

const randomColour = () => `rgba(${~~(Math.random() * 256)},${~~(Math.random() * 256)},${~~(Math.random() * 256)})`

const loadDemo = inject("loadDemo")
const gotoIconBrowser = () => loadDemo("IconBrowser")
</script>

<style scoped>
div {
  display: flex;
  flex-wrap: wrap;
}
.icons * {
  font-size: 2em;
}
[asImage] {
  height: 3em;
  width: 3em;
}
.as-image {
  background-color: #fc0;
}
.marker {
  font-size: 5em;
}
</style>
