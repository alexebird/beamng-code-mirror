<template>
  <h2>Icon Demo</h2>
  <span>Original Type:</span>
  <div>
    <bng-icon :title="type" span class="demo-icon" v-for="type in iconTypesList" :key="type" :type="type" :color="randomColour()" />
  </div>
  <span>Glyph Type:</span>
  <div>
    <bng-icon glyph="򾨁" :color="randomColour()" />
    <bng-icon glyph="򾨂" :color="randomColour()" />
    <bng-icon glyph="򾨃" :color="randomColour()" />
    <bng-icon glyph="򾨄" :color="randomColour()" />
  </div>
  <span>Sprite Icon:</span>
  <div>
    <BngSpriteIcon class="demo-icon" style="width: 3em; height: 3em" src="map_mission_longjump_triangle" />
  </div>
</template>

<script setup>
import { BngIcon, BngSpriteIcon } from "@/common/components/base"
import { iconTypesList } from "@/common/components/base/bngIcon.vue"

const randomColour = () => `rgba(${~~(Math.random() * 256)},${~~(Math.random() * 256)},${~~(Math.random() * 256)})`
</script>

<style scoped>
div {
  display: flex;
  flex-wrap: wrap;
}
.demo-icon {
  min-width: 1.5em;
  min-height: 1.5em;
  margin: 0.2em;
}
</style>
