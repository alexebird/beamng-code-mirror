<template>
  <div class="global-actions">
    <div class="history-actions">
      <BngButton oldIcons :icon-left="icons.decals.general.undo" @click="$emit('undo')" :disabled="!canUndo">Undo</BngButton>
      <BngButton oldIcons :icon-left="icons.decals.general.redo" @click="$emit('redo')" :disabled="!canRedo">Redo</BngButton>
    </div>
    <div class="view-actions">
      <BngImageTile
        :old-icon="icons.decals.camera.freecam"
        :class="{ active: expandViewItems }"
        bng-nav-item
        class="view-button"
        ratio="4:1"
        label="Change View"
        tabindex="0"
        @click="onChangeViewFocus"
      />
      <div v-if="expandViewItems" class="camera-items">
        <BngImageTile bng-nav-item :old-icon="icons.decals.camera.front" label="Front" tabindex="0" @click="$emit('cameraClicked', 'front')" />
        <BngImageTile bng-nav-item :old-icon="icons.decals.camera.left" label="Left" tabindex="0" @click="$emit('cameraClicked', 'left')" />
        <BngImageTile bng-nav-item :old-icon="icons.decals.camera.top" label="Top" tabindex="0" @click="$emit('cameraClicked', 'top')" />
        <BngImageTile bng-nav-item :old-icon="icons.decals.camera.right" label="Right" tabindex="0" @click="$emit('cameraClicked', 'right')" />
        <BngImageTile bng-nav-item :old-icon="icons.decals.camera.back" label="Back" tabindex="0" @click="$emit('cameraClicked', 'back')" />
      </div>
    </div>
    <div class="export-actions">
      <BngButton oldIcons :icon-left="icons.decals.general.save" @click="$emit('exportSkin')">Export skin</BngButton>
    </div>
    <BngButton class="exit-btn" accent="attention" @click="$emit('exit')"><BngBinding ui-event="menu" deviceMask="xinput" />Exit</BngButton>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { BngButton, BngImageTile, BngBinding } from "@/common/components/base"
import { icons } from "@/assets/icons"

const props = defineProps({
  history: {
    type: Object,
  },
})

defineEmits(["undo", "redo", "cameraClicked", "exportSkin", "exit"])

const expandViewItems = ref(false)

const canUndo = computed(() => props.history && props.history.undoStack && props.history.undoStack.length > 0)
const canRedo = computed(() => props.history && props.history.redoStack && props.history.redoStack.length > 0)

const onChangeViewFocus = () => (expandViewItems.value = !expandViewItems.value)
</script>

<style scoped lang="scss">
$background-color: rgba(0, 0, 0, 0.6);

.global-actions {
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

  > .export-actions {
    display: flex;

    > :deep(.bng-button) {
      padding: 0.5rem;
      width: 12.5rem;
      background: $background-color;
    }
  }

  > .view-actions {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    > :deep(.view-button) {
      width: 12.5rem;
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
      top: -0.5rem;
      right: 100%;
      padding: 0.5rem 0.25rem;
      overflow-x: auto;

      > :deep(.tile) {
        width: 6rem;
        height: 6rem;

        &:not(:last-child) {
          margin-right: 0.5rem;
        }
      }
    }
  }

  > :deep(.exit-btn) {
    padding: 0.5rem;
    margin: 0;
    margin-right: 0.25rem;
    width: 12.5rem;
  }
}
</style>
