<template>
  <BngActionsDrawer
    v-show="createLayerStore.layerActions"
    v-model:loading="createLayerStore.loading"
    :value="createLayerStore.layerActions"
    blur
    class="layer-actions"
    @actionClicked="onActionClicked"
    @actionItemChanged="createLayerStore.onActionItemChanged">
    <template #header="{ actionItem, canGoBack, goBack }">
      <div class="header-wrapper">
        <BngButton v-if="canGoBack" :icon="icons.arrowLargeLeft" accent="secondary" class="back-btn" @click="goBack">Back</BngButton>
        <BngButton v-else accent="secondary" :icon="icons.arrowLargeLeft" class="back-btn" @click="$emit('close')">Close</BngButton>
        {{ actionItem.label }}
      </div>
    </template>
    <template #item="{ actionItem, onClick }">
      <BngImageTile
        class="action-tile"
        :class="{ 'color-tile': actionItem.color255 }"
        :style="{
          '--tile-color': actionItem.color255
            ? `rgba(${actionItem.color255[0]},${actionItem.color255[1]},${actionItem.color255[2]},${actionItem.color255[3]})`
            : '',
        }"
        :label="actionItem.toggleAction && !actionItem.active ? actionItem.inactiveLabel : actionItem.label"
        :icon="actionItem.toggleAction && !actionItem.active ? actionItem.inactiveIcon : actionItem.icon"
        :image="actionItem.preview"
        @click="onClick">
      </BngImageTile>
    </template>
  </BngActionsDrawer>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useUINavScope } from "@/services/uiNav"
import { vBngOnUiNav, vBngBlur } from "@/common/directives"
import { BngActionsDrawer, BngImageTile, BngButton, icons } from "@/common/components/base"
import { useLiveryEditorStore, useLayerActionsStore } from "@/modules/liveryEditor/stores"
import { openConfirmation } from "@/services/popup"
import { openRenameLayerDialog } from "@/modules/liveryEditor/utils"

defineEmits(["close"])

const editorStore = useLiveryEditorStore()
const createLayerStore = useLayerActionsStore()
const { singleSelectedLayer } = storeToRefs(createLayerStore)

async function onActionClicked(actionItem) {
  let proceed = true
  const params = {}

  if (actionItem.value === "delete") {
    proceed = await openConfirmation(`Delete ${singleSelectedLayer.value.name}`)
  } else if (actionItem.value === "rename") {
    const formModel = { name: singleSelectedLayer.value.name }

    const res = await openRenameLayerDialog("Rename Layer", "", formModel, model => {
      return model.name !== null && model.name !== undefined && model.name !== "" && model.name !== singleSelectedLayer.value.name
    })

    if (res.success) {
      params.name = res.value.name
      proceed = true
    }
  }

  if (proceed) await createLayerStore.onActionClicked(actionItem, params)
}
</script>

<style lang="scss" scoped>
.layer-actions {
  :deep(.action-tile) {
    width: 8rem;
    margin: 0 0.5rem 0.5rem 0;

    &.color-tile {
      background-color: var(--tile-color);

      &:focus,
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
