<!-- TODO: should be replaced with BngImageTile -->

<template>
  <div
    :class="`garage-button ${addclass} ${active ? 'garage-button-active' : ''} ${disable ? 'garage-button-disabled' : ''}`"
    v-bng-disabled="disable"
    v-bng-focus-if="focus"
    v-bng-blur="true"
    v-bng-sound-class="'bng_click_hover_generic'"
    bng-nav-item
    _focus-on-hover>
    <div class="garage-button-icon" :style="{ '-webkit-mask-image': 'url(' + icon + ')' }"></div>
    <span class="garage-button-text"><slot></slot></span>
  </div>
</template>

<script setup>
import { vBngBlur, vBngSoundClass, vBngDisabled, vBngFocusIf } from "@/common/directives"

defineProps({
  icon: {
    type: String,
    default: "/ui/assets/SVG/24/test-cone.svg",
  },
  addclass: {
    type: String,
    default: "",
  },
  active: Boolean,
  focus: Boolean,
  disable: Boolean,
})
</script>

<style lang="scss">
.garage-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 4em;
  max-width: 6em;
  margin: 0.375em;
  padding: 0.5em 1em;
  font-size: 1em;
  font-weight: 800;
  line-height: 1.2em;
  color: white;
  background-color: rgba(#000, 0.6);
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  cursor: default;
  pointer-events: all !important;

  &:hover,
  &:focus {
    background-color: rgba(var(--bng-cool-gray-700-rgb), 0.8);
  }

  .garage-button-icon {
    min-width: 3em;
    min-height: 3em;
    background-color: #fff;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: contain;
    -webkit-mask-position: 50% 50%;
    margin-bottom: 0.25em;
  }
  .garage-button-text {
    font-family: Overpass;
    font-weight: 600;
    font-size: 1em;
    /* letter-spacing: 0.02em; */
    line-height: 1.2em;
  }
}

:not(.garage-menugroup) > .garage-button-active {
  background-color: var(--bng-orange);
}

.garage-menu1 .garage-button {
  padding-left: 0.75em;
  padding-right: 0.75em;
}

.garage-button-disabled,
.garage-button[disabled] {
  background-color: rgba(#000, 0.5) !important;
  color: #aaa !important;
  pointer-events: none !important;
}
.garage-button-active.garage-button-disabled,
.garage-button-active[disabled] {
  background-color: rgba(200, 200, 200, 0.5) !important;
}
.garage-button.garage-button-disabled .garage-button-icon,
.garage-button[disabled] .garage-button-icon {
  background-color: #aaa !important;
}

/* smaller screen */
@media (max-width: 1280px) {
  .garage-button-text {
    font-size: 1em;
  }
}

/* portrait mode */
@media (max-width: 1081px) and (orientation: portrait) {
  .garage-button-text {
    font-size: 1em;
  }
}
</style>
