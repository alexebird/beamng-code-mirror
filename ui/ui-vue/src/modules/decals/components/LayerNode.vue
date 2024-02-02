<template>
  <!-- <div @click="toggleOpen">{{ model.name }} ({{ level }}) {{ model.mask && "*** has mask but shouldn't have ***"}}</div> -->
  <div bng-nav-item class="layer-node" :class="{ hidden: model.hidden, active: selectedNodeId === model.uid }" tabindex="1" @click.self="$emit('nodeClicked', model.uid)">
    <div class="node-expand">
      <bng-icon span :type="icons.general.arrow_small_left" @click="$emit('expandClicked', model.uid)" />
    </div>
    <div class="node-info">{{ model.name }}</div>
    <div class="node-img-wrapper">
      <AspectRatio class="node-img" ratio="4:3"></AspectRatio>
      <div class="node-indicators" v-if="showIndicators">
        <bng-icon :type="icons.decals.general.hide" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeMount, watch, reactive } from "vue"
import { BngIcon } from "@/common/components/base"
import { icons } from "@/assets/icons"
import { AspectRatio } from "@/common/components/utility"
import { LayerType } from "../enums/layerType"
import { getAssetURL } from "@/utils"
import Paint from "@/utils/paint"

const props = defineProps({
  model: Object,
  path: {
    type: Array,
  },
})

defineEmits(["nodeClicked", "expandClicked"])

const selectedNodeId = inject("selectedLayerNodeId")

const image = computed(() => {
  if (props.model.type === LayerType.decal) return `url(${props.model.decalColorTexturePath})`

  if (props.model.type === LayerType.group) return `url(${getAssetURL("icons/decals/group/group.svg")})`

  return "none"
})

const paint = reactive(new Paint())

onBeforeMount(() => {
  paint.rgba = props.model.color ? props.model.color : [1, 1, 1, 1]
})

const showIndicators = computed(() => props.model.enabled === false)
const imageColor = computed(() => `rgba(${paint.red255}, ${paint.green255}, ${paint.blue255}, ${paint.alpha})`)

watch(
  () => props.model.color,
  () => {
    paint.rgba = props.model.color ? props.model.color : [1, 1, 1, 1]
  }
)
</script>

<style lang="scss" scoped>
$activeBackgroundColor: #ff6600;

.layer-node {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.125rem;
  user-select: none;

  &.hidden {
    background-color: grey !important;
  }

  &.active:not(.hidden) {
    background-color: rgba($activeBackgroundColor, 0.5) !important;
  }

  &.expandable.expanded > .node-expand {
    :deep(.bngicon) {
      transform: rotate(90deg);
    }
  }

  &:not(.expandable) > .node-expand {
    opacity: 0;
  }

  &:focus::before {
    top: -0.5rem;
    bottom: -0.5rem;
    left: -0.5rem;
    right: -0.5rem;
    border-radius: 0.5rem;
    z-index: 3000;
  }

  > .node-expand {
    padding: 0 1rem 0 0.25rem;

    > :deep(.bngicon) {
      width: 1rem;
      height: 1rem;
      transform: rotate(-90deg);
    }
  }

  > .node-info {
    flex-grow: 1;
    line-height: 1.5em;
    cursor: pointer;
  }

  > .node-img-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 4.25rem;
    height: 4.25rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.25);

    :deep(.node-img) {
      -webkit-mask-image: v-bind(image);
      mask-image: v-bind(image);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      background: v-bind(imageColor);
      -webkit-mask-size: cover;
      mask-size: cover;
    }

    > .node-indicators {
      position: absolute;
      display: flex;
      bottom: 0;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 0.25rem;
      background: rgba(0, 0, 0, 0.4);

      > :deep(.bngicon) {
        height: 1rem;
        width: 1rem;
      }
    }

    > :deep(.aspect-ratio) {
      height: 100%;
      width: 100%;
    }
  }

  > .node-info,
  > .node-img-wrapper {
    pointer-events: none;
  }
}
</style>
