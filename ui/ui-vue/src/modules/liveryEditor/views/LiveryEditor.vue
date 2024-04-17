<template>
  <div class="editor" bng-ui-scope="livery-editor" v-bng-on-ui-nav:back,menu="openExitDialog">
    <div class="editor-header">
      <BngScreenHeading :preheadings="preheadings">Livery Editor</BngScreenHeading>
      <div class="header-actions">
        <BngButton @click="() => save(false)" :disabled="editorState.saving">Save</BngButton>
        <BngButton accent="attention" @click="openExitDialog">Exit</BngButton>
      </div>
    </div>
    <div
      class="editor-content"
      :class="{
        'settings-open': windowState.showLayerSettings,
        'layers-collapse': !expandLayers,
      }">
      <LayersManager :collapsed="!expandLayers" class="editor-layers" @visibilityClicked="store.toggleVisibility" @lockClicked="store.toggleLock" />
      <div v-show="showLayerActions" bng-ui-scope="layer-actions" v-bng-on-ui-nav:back,menu="onActionsBack" class="layer-actions-wrapper">
        <LayerActions v-if="showLayerActions" class="layer-actions" @close="onActionsBack" />
      </div>
      <LayerSettings v-if="selectedTool"></LayerSettings>
      <NormalModeActions
        v-if="!showLayerActions && !selectedTool"
        :redoEnabled="store.canRedo"
        :undoEnabled="store.canRedo"
        @undoClicked="store.undo"
        @redoClicked="store.redo"
        @cameraClicked="store.setCameraView" />
    </div>
    <div class="editor-footer">
      <BindingsInfoBar v-if="bindingsInfoStore.actions" :items="bindingsInfoStore.actions" />
    </div>
  </div>
</template>

<script>
const EXIT_SAVE = 1
const EXIT_WITHOUT_SAVING = 0
const CANCEL = -1

const EXIT_DIALOG_BUTTONS = [
  { label: "Save and exit", value: EXIT_SAVE },
  { label: "Exit without saving", value: EXIT_WITHOUT_SAVING },
  { label: "Cancel", value: CANCEL },
]
</script>

<script setup>
import { reactive, computed, onMounted, onUnmounted, watch, ref } from "vue"
import { storeToRefs } from "pinia"
import router from "@/router"
import { openConfirmation } from "@/services/popup"
import { useUINavScope } from "@/services/uiNav"
import { vBngOnUiNav, vBngBlur } from "@/common/directives"
import LayersManager from "@/modules/liveryEditor/components/layersManager/LayersManager.vue"
import { LayerSettings } from "@/modules/liveryEditor/components/layerSettings"
import { BngButton, BngScreenHeading, BngActionsDrawer, BngImageTile } from "@/common/components/base"
import LayerActions from "../components/layerActions/LayerActions.vue"
import { openEditFileDialog } from "@/modules/liveryEditor/utils"
import { useLiveryEditorStore, useLayerActionsStore, useLayerSettingsStore, useLayersManagerStore } from "@/modules/liveryEditor/stores"
import NormalModeActions from "@/modules/liveryEditor/components/NormalModeActions"
import BindingsInfoBar from "../components/BindingsInfoBar.vue"
import { useBindingsInfoStore } from "../stores/bindingsInfoStore"

const uiNavScope = useUINavScope("livery-editor")
const store = useLiveryEditorStore()
const layerActionsStore = useLayerActionsStore()
const layerSettingsStore = useLayerSettingsStore()
const bindingsInfoStore = useBindingsInfoStore()
const layersManagerStore = useLayersManagerStore()

const { selectedTool, currentFile } = storeToRefs(store)
const editorState = reactive({
  isOpenExitDialog: false,
  exitDialogResult: null,
  saving: false,
})

const onActionsBack = () => {
  console.log("actions back")
  store.requestDismissLayerActions()
}

onMounted(async () => {
  await store.startEditor()
})

onUnmounted(() => {
  // store.exitEditor()
})

const windowState = reactive({
  showLayerSettings: false,
  expandLayers: true,
})

const expandLayers = computed(() => layersManagerStore.multipleSelection || !store.currentContext)
const showLayerActions = computed(() => store.currentContext && layerActionsStore.layerActions && !selectedTool.value)
const preheadings = computed(() => [currentFile.value ? currentFile.value.name : "New file"])

function openExitDialog() {
  if (editorState.isOpenExitDialog) return

  editorState.isOpenExitDialog = true
  openConfirmation("Exit Livery Editor", "", EXIT_DIALOG_BUTTONS).then(res => {
    editorState.exitDialogResult = res
    editorState.isOpenExitDialog = false
  })
}

watch(
  () => editorState.exitDialogResult,
  async (newValue, oldValue) => {
    if (newValue === CANCEL) return
    else if (newValue === EXIT_WITHOUT_SAVING) {
      await exit()
    } else if (newValue === EXIT_SAVE) {
      const res = await save(true)

      if (!res) {
        openExitDialog()
      } else {
        await exit()
      }
    }
  }
)

watch([showLayerActions, selectedTool], () => {
  if (selectedTool.value) return

  if (showLayerActions.value) {
    uiNavScope.set("layer-actions")
  } else {
    uiNavScope.set("livery-editor")
  }
})

async function exit() {
  router.replace({ name: "garagemode" })
  await store.exitEditor()
}

async function save(forceOpenPopup = false) {
  console.log("save", currentFile.value, forceOpenPopup)
  if (!currentFile.value || forceOpenPopup) {
    editorState.isOpenExitDialog = true

    const model = { name: currentFile.value ? currentFile.value.name : "" }
    const res = await openEditFileDialog("Save file", "Enter name of your new save file", model, model => {
      return model.name !== null && model.name !== undefined && model.name !== ""
    })

    if (res.success) {
      editorState.saving = true
      await store.save(res.value.name)
      editorState.saving = false
    }

    editorState.isOpenExitDialog = false

    return res.success
  } else {
    editorState.saving = true
    await store.save(currentFile.value.name)
    editorState.saving = false
  }
}

// DEBUG PURPOSES SHOULD BE DELETED

watch(
  () => uiNavScope.current.value,
  () => {
    console.log("scope changed", uiNavScope.current.value)
  }
)
</script>

<style lang="scss" scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  > .editor-header {
    display: flex;
    align-items: center;
    // justify-content: space-between;
    height: 6rem;
  }

  > .editor-content {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    max-height: calc(100% - 6rem);
    padding: 0.5rem;
    gap: 0.5rem;

    &.settings-open {
      justify-content: space-between;
    }

    &.layers-collapse {
      .editor-layers {
        margin-left: -18rem;
        pointer-events: none;
      }

      .layer-actions-wrapper {
        max-width: calc(100% - 7.5rem);
      }
    }

    > .editor-layers {
      flex-basis: 24rem;
    }

    > .layer-actions-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      flex-grow: 1;
      overflow-x: hidden;
    }

    > .layer-settings {
      justify-self: flex-end;
    }
  }
}
</style>
