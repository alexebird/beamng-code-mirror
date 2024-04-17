<template>
  <div
    class="layers-manager"
    :class="{
      'layers-edit': false,
    }">
    <div class="layers-manager__header">
      <BngCardHeading type="ribbon">{{ store.layers ? store.layers.length : 0 }} Layers</BngCardHeading>
      <div class="header--multiselect" v-if="multipleSelection">
        <BngButton accent="attention" @click="store.clearSelection">Cancel</BngButton>
        <span> {{ store.selectedLayers.length }} Layers </span>
      </div>
      <BngButton v-else class="add-button" accent="outlined" @click="editorStore.setNewLayerContext">
        <BngIcon :type="icons.plus" />
        New Layer
      </BngButton>
    </div>
    <div v-if="store.layers" class="layers-scrollable">
      <SortableTree
        class="layers-tree"
        v-model:selectedNodes="store.selectedLayers"
        :items="store.layers"
        :multiSelect="multipleSelection"
        :canSort="store.canSort"
        :disabled="multipleSelection"
        itemKey="id"
        @sorted="onSorted">
        <template #content="{ node, isSelected, isExpanded }">
          <LayerTile
            :model="node"
            :selected="isSelected"
            :class="{ expanded: isExpanded }"
            v-bng-click="{ clickCallback: onClick, holdCallback: onHold, holdDelay: 500, repeatInterval: 0 }">
            <template #content>
              <div class="layer-name">{{ node.name }}</div>
              <div v-if="!collapsed" class="quick-actions">
                <BngButton
                  :icon-left="node.enabled ? icons.eyeOutlineOpened : icons.eyeOutlineClosed"
                  accent="text"
                  @click.stop="$emit('visibilityClicked', node.uid)"></BngButton>
                <BngButton
                  :icon-left="node.locked ? icons.lockClosed : icons.lockOpened"
                  accent="text"
                  @click.stop="$emit('lockClicked', node.uid)"></BngButton>
              </div>
            </template>
          </LayerTile>
        </template>
      </SortableTree>
      <!-- <tree
        v-if="store.layers"
        :model="store.layers"
        class="layers-tree"
        :expandedNodes="expandedNodes"
        :selectedNodes="store.selectedLayers"
        :multiSelect="false"
        @selectedNodesChanged="onSelectedNodesChanged"
        @expandedNodesChanged="onExpandedNodesChanged"
      >
        <template #expandIcon="{ node, isExpanded }">
          <span>{{ isExpanded ? "X" : "O" }}</span>
        </template>

        <template #node="{ node, isSelected, isExpanded }">
          <LayerTile :model="node" :selected="isSelected" :class="{ expanded: isExpanded }">
            <template #content>
              <div class="layer-name">{{ node.name }}</div>
              <div class="quick-actions">
                <BngButton :icon-left="node.enabled ? icons.eyeOutlineOpened : icons.eyeOutlineClosed" accent="text" @click.stop="$emit('visibilityClicked', node.uid)"></BngButton>
                <BngButton :icon-left="node.locked ? icons.lockClosed : icons.lockOpened" accent="text" @click.stop="$emit('lockClicked', node.uid)"></BngButton>
              </div>
            </template>
          </LayerTile>
        </template>
      </tree> -->
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { storeToRefs } from "pinia"
import LayerTile from "./LayerTile.vue"
import { BngButton, BngCardHeading, BngIcon, icons } from "@/common/components/base"
import { SortableTree } from "@/common/components/utility"
import { vBngClick, vBngBlur } from "@/common/directives"
import { useLayersManagerStore, useLiveryEditorStore } from "@/modules/liveryEditor/stores"
import { INTERSECTION_TYPES } from "@/services/drag/sortable"

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["select", "visibilityClicked", "lockClicked"])

const editorStore = useLiveryEditorStore()
const store = useLayersManagerStore()

const { multipleSelection } = storeToRefs(store)

watch(
  () => store.selectedLayers,
  () => {
    console.log("[manager] selectedLayers changed", store.selectedLayers)
  }
)

const onClick = () => {
  console.log("clicked")
}

const onHold = () => {
  console.log("hold")
  multipleSelection.value = true
}

function onSorted(data) {
  console.log("layers on sorted", data)
  store.changeOrder(data.oldIndex, data.oldParentKey, data.newIndex, data.newParentKey)
}

// function getIntersectionOffsets(targetRect, point) {
//   return {
//     [INTERSECTION_TYPES.topLeft]: {
//       x: targetRect.left,
//       y: targetRect.top,
//       width: targetRect.width / 2,
//       height: targetRect.height / 2,
//     },
//     [INTERSECTION_TYPES.topRight]: {
//       x: targetRect.right - targetRect.width / 2,
//       y: targetRect.top,
//       width: targetRect.width / 2,
//       height: targetRect.height / 2,
//     },
//     [INTERSECTION_TYPES.bottomLeft]: {
//       x: targetRect.left,
//       y: targetRect.bottom - targetRect.height / 2,
//       width: 32,
//       height: targetRect.height / 2,
//     },
//     [INTERSECTION_TYPES.bottomRight]: {
//       x: targetRect.left + 32,
//       y: targetRect.bottom - targetRect.height / 2,
//       width: targetRect.width - 32,
//       height: targetRect.height / 2,
//     },
//   }
// }
</script>

<style lang="scss" scoped>
@mixin resetLayerTreeStyles {
  list-style: none !important;
  margin-block: 0;
  padding-inline: 0;
}

.layers-manager {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  height: 100%;
  width: 100%;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  overflow: hidden;

  > .layers-manager__header {
    display: flex;
    flex-direction: column;
    padding: 0.25rem;
    // width: 100%;

    > .header--multiselect {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.25rem;
    }

    :deep(.add-button) {
      display: inline-block;
      width: 100%;
      padding: 0.75rem;
      margin: 0;
      max-width: unset;
    }
  }

  &.layers-collapse {
    max-width: 7rem;
    padding-left: 1rem;
    margin-left: -1rem;

    .layers-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      width: 4rem;
      height: 4rem;
      background: grey;
    }

    :deep(.layer-tree) {
      .layer-tile {
        padding: 0.5rem;
        background: transparent !important;
        padding: 0;

        &:not(last-child) {
          padding-bottom: 0.25rem;
        }

        > .layer-content {
          display: none;
        }
      }

      ul ul[data-sub-tree] {
        padding-inline-start: 0.125rem;
      }
    }
  }

  &.layers-edit {
    > .layers-scrollable {
      position: relative;
      padding-left: 2.5rem;
    }

    :deep(.layer-tile) > .layer-checkbox {
      display: flex;
    }
  }

  :deep(.layer-tile) {
    .layer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      > .layer-name {
        width: 10rem;
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .quick-actions {
        display: flex;

        .bng-button {
          padding: 0.5rem;
          margin: 0;
          margin-right: 0.5rem;
        }
      }
    }
  }

  > .layers-scrollable {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 0 0.25rem;
    border-top: 1.5rem solid transparent;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
