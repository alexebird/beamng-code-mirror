<!-- bngScreenHeader - a main heading for a UI screen -->
<template>
  <div class="bng-screen-header" :class="{ [`heading-style-${type}`]: true, prehead: preheadings }">
    <div class="decorator"></div>
    <span v-if="preheadings" class="pre-header" :class="{ 'with-divider': divider }">
      <span class="location" v-for="preheading in preheadings" :key="preheading">
        {{ preheading }}
      </span>
    </span>
    <h1 class="header"><slot></slot></h1>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"

const blurVal = ref(false)

onMounted(() => window.setTimeout(() => (blurVal.value = true), ~~+props.blurDelay))

const props = defineProps({
  blurDelay: Number,
  preheadings: Array,
  divider: Boolean,
  type: {
    type: String,
    default: "line",
    validator: v => ["line", "ribbon"].includes(v) || v === "",
  },
})
</script>

<style scoped lang="scss">
$heading-background-color: rgba(0, 0, 0, 0.6);

$divider-color: white;
$divider-height: 0.9em;

$decoration-color: #ff6600;
$font-top-line-space: 1px;

.bng-screen-header {
  position: relative;
  display: grid;
  grid-template:
    "decorator preheader" auto
    "decorator header" auto / auto 1fr;
  // overflow: hidden;
  font-family: Overpass, var(--fnt-defs);
  color: white;
  min-height: 3.5em;
  flex: 0 0 auto;
  line-height: 1.25em;
  z-index: 2;

  .decorator {
    position: relative;
    grid-area: decorator;
    grid-row-end: span 2;
    width: 4.5rem;
    overflow: hidden;
    margin-bottom: -2rem;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 1em;
      width: 5em;
      height: 25em;
      background: $decoration-color;
      transform-origin: right top;
      transform: matrix(0.94, 0, -0.38, 1, 0, 0);
    }
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 0.5em;
      height: 25em;
      background: $decoration-color;
      transform-origin: right top;
      transform: matrix(0.94, 0, -0.38, 1, 0, 0);
    }
  }

  > .pre-header {
    display: inline-block;
    padding: 0.5em 0.5em 0.25em 0.5em;
    border-top-left-radius: var(--bng-corners-1);
    border-top-right-radius: var(--bng-corners-1);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: var(--bng-corners-1);
    font-weight: 400;

    > .location:not(:last-child) {
      padding-right: 0.5em;
    }

    &.with-divider > .location:not(:last-child) {
      position: relative;
      padding-right: 1.34em;

      &::after {
        content: "";
        position: absolute;
        top: calc(50% - ($divider-height / 2) - $font-top-line-space);
        right: 0.6em;
        width: 0.1em;
        height: $divider-height;
        background: $divider-color;
        transform: matrix(0.94, 0, -0.37, 1, 0, 0);
      }
    }
  }

  > .header {
    padding: 0.5rem 0.75rem 1rem 0;
    margin: 0;
    font-weight: 800;
    font-style: italic;
    font-size: 2em;
    line-height: 1.15em;
  }
}
</style>
