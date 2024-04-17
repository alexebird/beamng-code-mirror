<template>
  <div class="layer-tile">
    <div class="layer-checkbox">
      <span class="checkbox"></span>
    </div>
    <div class="layer-content">
      <slot name="content">
        {{ model.name }}
      </slot>
    </div>
    <div class="layer-preview">
      <AspectRatio v-if="model.type === 0" class="preview-image" ratio="4:3">
        <img :src="model.preview" />
      </AspectRatio>
      <AspectRatio v-else-if="model.type === 3" class="group-preview" ratio="4:3">
        <BngIcon :type="icons.group" />
      </AspectRatio>
      <div v-if="showStatusBar" class="status-indicators">
        <BngIcon v-if="model.locked" :type="icons.lockClosed"></BngIcon>
        <BngIcon v-if="!model.enabled" :type="icons.eyeOutlineClosed"></BngIcon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { getAssetURL } from "@/utils"
import { AspectRatio } from "@/common/components/utility"
import { BngButton, BngIcon, icons } from "@/common/components/base"

const props = defineProps({
  model: Object,
})

const previewBackground = computed(() => {
  if (!props.model) return "none"
  else if (props.model.type === 0) return `url(${getAssetURL("images/alpha_texture.png")})`

  return props.model.color ? toRgba255Styles(props.model.color) : "rgba(0, 0, 0, 0.25)"
})
const imagePreview = computed(() => `url(${props.model.preview})`)
const imagePreviewColor = computed(() => (props.model.color ? toRgba255Styles(props.model.color) : "white"))
const showStatusBar = computed(() => !props.model.enabled || props.model.locked)

const toRgba255Styles = colors => `rgba(${colors[0] * 255}, ${colors[1] * 255}, ${colors[2] * 255}, ${colors[3]})`
</script>

<style lang="scss" scoped>
.layer-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  // padding: 0.5rem;
  color: white;
  // border-left: 2px solid blue;

  > .layer-content {
    flex-grow: 1;
  }

  > .layer-preview {
    position: relative;
    width: 4rem;
    height: 4rem;
    padding: 0.25rem;
    background: v-bind(previewBackground);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    > .preview-image {
      height: 100%;

      mask-image: v-bind(imagePreview);
      -webkit-mask-image: v-bind(imagePreview);
      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;
      mask-size: cover;
      -webkit-mask-size: cover;
      background: v-bind(imagePreviewColor);

      img {
        width: 100%;
        height: 100%;
        mix-blend-mode: multiply;
      }
    }

    > .group-preview {
      height: 100%;
      font-size: 2rem;
    }

    > .status-indicators {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 1.5rem;
      left: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);

      > *:not(:last-child) {
        margin-right: 0.25rem;
      }
    }
  }

  > .layer-checkbox {
    position: absolute;
    display: none;
    justify-content: center;
    align-items: center;
    left: 0.5rem;

    > .checkbox {
      display: inline-block;
      padding: 0.5rem;
      background: rgba(grey, 0.8);
    }
  }
}
</style>
