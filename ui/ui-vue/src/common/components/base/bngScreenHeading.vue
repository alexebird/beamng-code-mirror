<!-- bngScreenHeading - a main heading for a UI screen -->
<template>
  <div class="bng-screen-heading" :class="{ [`heading-style-${type}`]: true, prehead: preheadings }">
    <span v-if="preheadings" class="pre-header" :class="{ 'with-divider': divider }" v-bng-blur="blurVal">
      <span class="location" v-for="preheading in preheadings" :key="preheading">
        {{ preheading }}
      </span>
    </span>
    <h1 class="header" v-bng-blur="blurVal"><slot></slot></h1>
  </div>
</template>

<script setup>
import { vBngBlur } from "@/common/directives"
import {onMounted, ref} from "vue"

const blurVal = ref(false)

onMounted(()=>window.setTimeout(() => blurVal.value = true, ~~+props.blurDelay))

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

.bng-screen-heading {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0.65em 0 0.5em 0;
  padding-left: 4.5em;
  overflow: hidden;
  font-family: Overpass, var(--fnt-defs);
  color: white;
  min-height: 3.5em;
  flex: 0 0 auto;

  &::before {
    content: "";
    position: absolute;
    width: 2em;
    height: 3.5em;
    background: $decoration-color;
    transform: matrix(0.94, 0, -0.38, 1, 0, 0);
    left: 0.7em;
    top: 0;
  }

  &.prehead {
    padding-left: 5em;
    & > .header {
      border-top-left-radius: 0;
      border-top-right-radius: var(--bng-corners-2);
      border-bottom-left-radius: var(--bng-corners-2);
      border-bottom-right-radius: var(--bng-corners-2);
    }
    &::before {
      height: 5.25em;
      left: 1em;
    }
  }

  &.heading-style-ribbon {
    &::before {
      width: 6em;
      left: -3em;
    }
  }

  > .pre-header {
    display: inline-block;
    background: $heading-background-color;
    padding: 0.25em 0.5em;
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
    background: $heading-background-color;
    padding: 0.5rem 0.75rem 0.5rem 0.5rem;
    border-top-left-radius: var(--bng-corners-2);
    border-top-right-radius: var(--bng-corners-2);
    border-bottom-left-radius: var(--bng-corners-2);
    border-bottom-right-radius: var(--bng-corners-2);
    margin: 0;
    font-weight: 800;
    font-style: italic;
  }
}
</style>
