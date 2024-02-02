<!-- BNGFrustumMover Directive Demo -->
<template>
  <span>To see this demo working, make sure you are running it in game.</span>
  <div class="frustum">
    <BngButton
      tabindex="1"
      @click="frustum.enabled = !frustum.enabled; contStyle(true);"
    >{{ frustum.enabled ? "Enabled" : "Disabled" }}</BngButton>
    <BngPillCheckbox
      tabindex="1"
      v-show="frustum.enabled"
      :marked="frustum.smooth"
      @click="changeSmooth(!frustum.smooth)"
    >Smooth (experimental)</BngPillCheckbox>
    <br/>
    <BngPillCheckbox
      v-for="direction in frustum.variants"
      tabindex="1"
      v-show="frustum.enabled"
      :marked="frustum.direction === direction"
      :marked-icon="false"
      @click="change(direction)"
    >{{ direction }}</BngPillCheckbox>
  </div>
  <span v-show="frustum.enabled">
    Notes:
    <ol>
      <li>"Up" misbehaves in GE. This is a known issue.</li>
      <li>Smoothing currently implemented in JS only to see how it looks. Don't use it.</li>
      <li>When switching between smoothing, demo glitches a bit, this is normal.</li>
    </ol>
  </span>
  <div class="frustum-mover" v-if="!frustum.smooth"
    v-bng-frustum-mover:[frustum.direction]="frustum.enabled"
  ></div>
  <div class="frustum-mover" v-else
    v-bng-frustum-mover:[frustum.direction].smooth="frustum.enabled"
  ></div>
</template>

<style scoped>
.frustum-mover {
  /* reference size that will be taken in account by the directive */
  width: 40vw;
  height: 40vh;
}
.frustum * {
  text-transform: capitalize;
}
</style>

<style lang="scss">
.components-demo.frustum-demo {
  position: absolute;
  &.frustum-left {
    top: 0;
    left: 0;
    right: unset;
    bottom: unset;
    width: 40vw !important;
    height: 100vh !important;
  }
  &.frustum-right {
    top: 0;
    left: unset;
    right: 0;
    bottom: unset;
    width: 40vw !important;
    height: 100vh !important;
  }
  &.frustum-up {
    top: 0;
    left: 0;
    right: unset;
    bottom: unset;
    width: 100vw !important;
    height: 40vh !important;
  }
  &.frustum-down {
    top: unset;
    left: 0;
    right: unset;
    bottom: 0;
    width: 100vw !important;
    height: 40vh !important;
  }
}
</style>

<script setup>
import { BngButton, BngPillCheckbox } from "@/common/components/base";
import { reactive, onMounted, onUnmounted } from "vue";

import { vBngFrustumMover } from "@/common/directives";

const frustum = reactive({
  enabled: false,
  direction: "left",
  variants: ["left", "right", "up", "down"],
  smooth: false,
});

function change(direction) {
  frustum.direction = direction;
  contStyle(true);
}

function changeSmooth(smooth) {
  frustum.smooth = !!smooth;
  contStyle(true);
}

function contStyle(state = true) {
  if (state)
    state = frustum.enabled;
  const container = document.querySelector(".components-demo");
  if (container) {
    container.classList[state ? "add" : "remove"]("frustum-demo");
    for (let dir of frustum.variants) {
      container.classList[
        dir === frustum.direction ? "add" : "remove"
      ]("frustum-" + dir);
    }
  }
}

onMounted(() => contStyle(true))
onUnmounted(() => contStyle(false))
</script>
