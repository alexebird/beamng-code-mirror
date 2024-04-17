<!-- bngImageTile - a tile with a large image/icon (optionally labelled) -->
<template>
  <div class="tile">
    <AspectRatio class="image" :ratio="ratio" :image="image" imageSize="contain">
      <BngOldIcon v-if="oldIcon" class="icon" :type="oldIcon" span />
      <BngIcon v-if="icon" class="glyph" :type="icon" />
      <img v-else-if="src || externalSrc" class="icon" :src="assetURL" />
    </AspectRatio>
    <div class="label" v-if="label">{{ label }}</div>
    <div v-if="hasDefaultSlot" class="contents">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { BngOldIcon, BngIcon } from "@/common/components/base"
import { getAssetURL } from "@/utils"
import { computed, useSlots } from "vue"
import { AspectRatio } from "../utility"

const props = defineProps({
  oldIcon: String,
  src: String,
  externalSrc: String, // src for assets external to Vue projects
  label: String,
  image: String, // background-image that takes the full available frame
  icon: [Object, String],
  ratio: {
    type: String,
    default: "4:3",
  }
})

const slots = useSlots();
const hasDefaultSlot = computed(() => !!slots.default);

// const assetURL = computed(() => props.src && !props.src.startsWith("/") ? getAssetURL(props.src) : props.src)
const assetURL = computed(() => (props.externalSrc ? props.externalSrc : getAssetURL(props.src)))
</script>

<style lang="scss" scoped>
$text-color: white;
@import "@/styles/modules/mixins";

.tile {
  // Setting round corners and focus frame offset for focusable tile
  $f-offset: 0.25rem;
  $rad: $border-rad-1;

  position: relative;
  width: 8rem;
  display: flex;
  flex-direction: column;
  min-width: 6rem;
  justify-content: space-between;
  align-items: stretch;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: $rad;
  padding: 0.5rem;
  transition: background-color ease-in 75ms;
  color: $text-color;
  user-select: none;

  // Modify the focus frame radius and offset based on tile corner radius
  @include modify-focus($rad, $f-offset);

  .image {
    align-self: stretch;
  }

  &:not(:last-child) {
    margin-right: 0.2em;
  }

  &:focus,
  &:hover {
    background-color: rgba(var(--bng-cool-gray-700-rgb), 0.8);
  }

  &[disabled="disabled"] {
    pointer-events: none;
    opacity: 0.5;
  }

  &.active {
    background-color: rgba(var(--bng-cool-gray-800-rgb), 0.6);
  }

  &:active {
    background-color: rgba(var(--bng-cool-gray-700-rgb), 0.6);
  }

  .icon {
    width: 2rem;
    height: 2rem;
  }

  .glyph {
    font-size: 3em;
  }

  :deep(*) > .icon {
    width: 2rem;
    height: 2rem;
  }

  > .label {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0.5rem 0 0.25rem;
  }
  > .contents {
    padding: 0.5rem 0 0.25rem;
  }
}
</style>
