<template>
  <div class="normal-mode-actions">
    <div class="history-actions">
      <BngButton v-bng-blur :icon-left="iconsByTag.decals.undo" @click="$emit('undoClicked')" :disabled="!undoEnabled"> Undo </BngButton>
      <BngButton v-bng-blur :icon-left="iconsByTag.decals.redo" @click="$emit('redoClicked')" :disabled="!redoEnabled"> Redo </BngButton>
    </div>
    <div class="view-actions">
      <BngImageTile
        v-bng-blur
        :class="{ active: expandViewItems }"
        :icon="icons.movieCamera"
        ratio="3:1"
        bng-nav-item
        class="view-button"
        label="Change View"
        tabindex="0"
        @click="onChangeViewFocus" />
      <div v-if="expandViewItems" class="camera-items">
        <BngImageTile
          v-for="(button, index) in cameraButtons"
          :key="index"
          bng-nav-item
          v-bng-blur
          v-bind="button"
          ratio="2:1"
          tabindex="0"
          @click="onCameraViewClicked(button.value)" />
      </div>
    </div>
  </div>
</template>

<script>
const cameraButtons = [
  {
    label: "Front",
    icon: icons.cameraFront1,
    value: CAMERA_VIEWS.front,
  },
  {
    label: "Left",
    icon: icons.cameraSideLeft,
    value: CAMERA_VIEWS.left,
  },
  {
    label: "Top",
    icon: icons.cameraTop1,
    value: CAMERA_VIEWS.cameraTop1,
  },
  {
    label: "Right",
    icon: icons.cameraSideRight,
    value: CAMERA_VIEWS.right,
  },
  {
    label: "Bottom",
    icon: icons.cameraBack1,
    value: CAMERA_VIEWS.back,
  },
]
</script>

<script setup>
import { ref } from "vue"
import { BngButton, BngImageTile, iconsByTag, icons } from "@/common/components/base"
import { vBngBlur } from "@/common/directives"
import { CAMERA_VIEWS } from "@/modules/liveryEditor/enums/cameraViews"

const props = defineProps({
  undoEnabled: {
    type: Boolean,
    default: true,
  },
  redoEnabled: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(["undoClicked", "redoClicked", "cameraClicked"])

const expandViewItems = ref(false)

const onCameraViewClicked = view => {
  emit("cameraClicked", view)
  expandViewItems.value = false
}

const onChangeViewFocus = () => (expandViewItems.value = !expandViewItems.value)
</script>

<style scoped lang="scss">
$background-color: rgba(0, 0, 0, 0.6);

.normal-mode-actions {
  display: flex;
  flex-direction: column;

  > .history-actions {
    display: flex;

    > :deep(.bng-button) {
      width: 6rem;
      min-width: 6rem;
      background: $background-color;
    }
  }

  > .view-actions {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    > :deep(.view-button) {
      width: 100%;
      margin: 0 0.25rem;

      &.active {
        background: var(--bng-orange-b400);
      }
    }

    > .camera-items {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      top: -0.25rem;
      right: 100%;
      padding: 0.5rem 0.25rem;
      overflow-x: auto;

      > * {
        width: 8rem;

        &:not(:last-child) {
          margin-right: 0.5rem;
        }
      }
    }
  }
}
</style>
