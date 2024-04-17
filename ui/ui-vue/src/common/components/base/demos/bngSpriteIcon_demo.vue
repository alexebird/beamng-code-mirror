<template>
  <span>Sprite Icons:</span>
  <div>
    <BngSpriteIcon class="demo-icon" style="width: 3em; height: 3em" src="map_mission_longjump_triangle" />
    <BngSpriteIcon class="demo-icon" style="width: 3em; height: 3em; filter: drop-shadow(0 0 0.5rem #fff8);" src="general_beamng_logo" />
    <BngSpriteIcon class="demo-icon" style="width: 3em; height: 3em" src="letter_j" />
  </div>
</template>

<script setup>
import { BngSpriteIcon } from "@/common/components/base"
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
