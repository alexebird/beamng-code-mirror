<template>
  <LayoutSingle class="layout-content-full">
    <div bng-ui-scope="decal-editor" v-bng-on-ui-nav:back,menu="goBack" class="decals-editor" :class="{ closed: !editorState.showLayerSelector }">
      <BngScreenHeading :preheadings="preheadings" @click="() => toggleLayers()">{{ $t("ui.decalsEditor.title") }}</BngScreenHeading>
      <div class="main-content">
        <div class="layer-selector-drawer">
          <LayerSelector :layers-data="layersData" :disabled="disableLayerSelector" @nodeClicked="selectLayer">
            <template #header>
              <BngButton
                tabindex="1"
                class="new-decal"
                accent="outlined"
                @click="onNewLayer"
                :disabled="!editorState.enableAddLayerButton || disableLayerSelector"
                :icon="icons.plus">
                <span class="label">Add Layer</span>
              </BngButton>
            </template>
          </LayerSelector>
        </div>
        <div class="layer-controls">
          <GlobalActions
            v-if="showGlobalActions"
            :history="history"
            @redo="redo"
            @undo="undo"
            @cameraClicked="changeCameraView"
            @exportSkin="onToggleShowExportSkin(true)"
            @exit="goBack" />
          <div class="layer-settings" v-if="showLayerActionsAndSettings">
            <LayerSettings
              v-if="showLayerSettings"
              bng-ui-scope="layer-settings"
              v-bng-on-ui-nav:back,menu="onCancelLayerSettings"
              class="settings-main"
              :type="configuredLayer.type"
              :showSaveButton="configuredLayer.type !== LayerType.decal || (configuredLayer.uid !== null && configuredLayer.uid !== undefined)"
              :model="configuredLayer"
              @valueChanged="updateConfiguredLayer"
              @settingClicked="onSettingClicked"
              @save="onSaveLayerSettings"
              @cancel="onCancelLayerSettings" />
            <div class="layer-subsetting-selector" bng-ui-scope="layer-subsettings" v-if="editorState.showLayerSubsettings">
              <BngActionsDrawer
                v-bng-on-ui-nav:back,menu="closeSubsettingsWindow"
                expanded
                :actions="textureResources"
                :header="'Select decal'"
                :headerActions="headerActions"
                :grouped="true"
                @actionClick="texture => onTextureSelected(texture)"
                @headerActionClicked="closeSubsettingsWindow" />
            </div>
          </div>
          <div class="layer-actions" bng-ui-scope="layer-actions" v-if="showLayerActions">
            <BngActionsDrawer
              v-bng-on-ui-nav:back,menu="() => onHeaderActionClicked('back')"
              :actions="contextActions.actions"
              :header="contextActions.header"
              :showHeaderActions="showHeaderActions"
              :header-actions="headerActions"
              @action-click="onLayerActionClicked"
              @headerActionClicked="onHeaderActionClicked" />
          </div>
        </div>
        <div v-if="editorState.showExportWindow" class="export-view">
          <ExportSkin
            bng-ui-scope="export-skin"
            v-bng-on-ui-nav:back,menu="() => onToggleShowExportSkin(false)"
            @cancel="onToggleShowExportSkin(false)"
            @export="onExportSkin" />
        </div>
      </div>
    </div>
  </LayoutSingle>

  <!-- DEBUG ONLY >> -->
  <!-- <div id="testing">
    <button @click="store.launchEditor">Launch edit mode</button>
    <button @click="store.startEditorUpdates">Start updates</button>
    <button @click="store.stopEditorUpdates">Stop updates</button>
    <button @click="() => store.toggleActions(true)">Enable Action Map</button>
    <button @click="() => store.toggleActions(false)">Disable Action Map</button>
  </div> -->
  <!-- << END_DEBUG_ONLY -->
</template>

<script></script>

<script setup>
import { ref, computed, reactive, watch, provide, onUnmounted, onBeforeMount } from "vue"
import { storeToRefs } from "pinia"
import useVehicles from "@/services/vehicles"
import useDecalStore from "../stores/decalsStore"
import { LayoutSingle } from "@/common/layouts"
import { BngScreenHeading, BngActionsDrawer, BngButton, BngIcon, icons } from "@/common/components/base"
import { LayerSelector, LayerSettings } from "../components"
import { LayerType } from "../enums/layerType"
import GlobalActions from "../components/GlobalActions.vue"
import ExportSkin from "../components/ExportSkin.vue"

import { vBngOnUiNav } from "@/common/directives"

import { useUINavScope } from "@/services/uiNav"
const uiNavScope = useUINavScope("decal-editor")

const store = useDecalStore()
const vehicles = useVehicles()
const { current: vehicle } = vehicles
const { layersData, selectedLayerId, contextActions, configuredLayer, textureResources, history } = storeToRefs(store)
const {
  selectLayer,
  invokeContextAction,
  cancelContextAction,
  createOrUpdateLayer,
  updateConfiguredLayer,
  changeCameraView,
  redo,
  undo,
  exportSkin,
  toggleApplyingDecal,
} = store

const preheadings = computed(() => [vehicle.name])
const toggleLayers = () => (editorState.showLayerSelector = !editorState.showLayerSelector)

provide("selectedLayerNodeId", selectedLayerId)

const showHeaderActions = ref(true)
const headerActions = [
  {
    label: "Back",
    accent: "attention",
    value: "back",
  },
]
const onHeaderActionClicked = action => {
  if (action === "back") {
    selectLayer(null)
    closeLayerActionsWindow()
  }
}

const editorState = reactive({
  showLayerActions: false,
  showLayerSelector: true,
  showLayerSettings: false,
  showLayerSubsettings: false,
  enableAddLayerButton: true,
  showExportWindow: false,
})

const goBack = () => window.bngVue.gotoGameState("decals-loader")

const disableLayerSelector = computed(() => editorState.showExportWindow || (editorState.showLayerActions && (!selectedLayerId.value || configuredLayer.value)))

const showLayerActionsAndSettings = computed(() => (configuredLayer.value && !editorState.showLayerSubsettings) || editorState.showLayerSubsettings)

const showLayerSettings = computed(() => configuredLayer.value && !editorState.showLayerSubsettings)

const showGlobalActions = computed(() => !(editorState.showLayerSubsettings || showLayerSettings.value))

const showLayerActions = computed(() => !configuredLayer.value && contextActions.value && editorState.showLayerActions)

function onLayerActionClicked(action) {
  invokeContextAction(action)
}

function onNewLayer() {
  openLayerActionsWindow()
}

function onSaveLayerSettings(layerData) {
  createOrUpdateLayer()
  closeLayerSettingsWindow()
}

function onCancelLayerSettings() {
  cancelContextAction()
  closeLayerSettingsWindow()
}

function onSettingClicked(settingName) {
  if (settingName === "decalType") {
    editorState.showLayerSettings = false
    editorState.showLayerSubsettings = true
  }
}

function onTextureSelected(action) {
  configuredLayer.value.decalColorTexturePath = action
  closeSubsettingsWindow()
}

function openLayerActionsWindow() {
  editorState.showLayerActions = true
  editorState.enableAddLayerButton = false
}

function closeLayerActionsWindow() {
  editorState.showLayerActions = false
  editorState.enableAddLayerButton = true
}

function closeSubsettingsWindow() {
  editorState.showLayerSettings = true
  editorState.showLayerSubsettings = false
}

function openLayerSettingsWindow() {
  editorState.enableAddLayerButton = false
  editorState.showLayerActions = false
  editorState.showLayerSettings = true
}

function closeLayerSettingsWindow() {
  editorState.showLayerSettings = false
  editorState.showLayerActions = true
}

function onToggleShowExportSkin(show) {
  editorState.showExportWindow = show
}

function onExportSkin(skinName) {
  exportSkin(skinName)
  editorState.showExportWindow = false
}

onBeforeMount(() => {
  store.init()
})

// onBeforeUnmount(() => {
//   store.save()
//   store.reset()
// })

onUnmounted(() => {
  store.$dispose()
})

// watch(configuredLayer, () => {
//   console.log("watcher configuredLayer changed", configuredLayer.value)
//   if (!configuredLayer.value) {
//     closeLayerSettingsWindow()
//     closeLayerActionsWindow()
//   } else {
//     openLayerSettingsWindow()
//   }
// })

watch(selectedLayerId, () => {
  if (selectedLayerId.value) {
    openLayerActionsWindow()
  } else {
    closeLayerSettingsWindow()
    closeLayerActionsWindow()
  }
})

watch([showLayerSettings, showLayerActions, () => editorState.showLayerSubsettings, () => editorState.showExportWindow], () => {
  if (editorState.showExportWindow) {
    uiNavScope.set("export-skin")
  } else if (editorState.showLayerSubsettings) {
    uiNavScope.set("layer-subsettings")
  } else if (showLayerSettings.value) {
    uiNavScope.set("layer-settings")
  } else if (showLayerActions.value) {
    uiNavScope.set("layer-actions")
  } else {
    uiNavScope.set("decal-editor")
  }

  toggleApplyingDecal(showLayerSettings.value && configuredLayer.value && configuredLayer.value.type === LayerType.decal && !configuredLayer.value.uid)
})
</script>

<style lang="scss" scoped>
.decals-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  user-select: none;
  .layer-selector-drawer {
    .new-decal {
      max-width: none;
      min-height: 3rem;
      &:deep(.bngiconGlyph) {
        font-size: 1.5em;
        margin-right: 0.25em;
      }
    }
  }

  &.closed {
    > .main-content {
      > .layer-selector-drawer {
        width: 110px;
        transform: translateX(-340px);
      }
    }
  }

  > .main-content {
    display: flex;
    flex-grow: 1;
    overflow: hidden;

    > .layer-controls {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex-grow: 1;
      padding-left: 0.5rem;
      overflow: hidden;

      :deep(.global-actions) {
        align-items: flex-end;
      }

      > .layer-settings {
        display: flex;
        height: 100%;
        width: 100%;
        justify-content: flex-end;
        align-items: flex-start;

        > .settings-main {
          // width: 20rem;
        }

        > .layer-subsetting-selector {
          height: 100%;
          width: 100%;
        }
      }

      > .layer-actions {
        width: fit-content;
      }
    }

    > .export-view {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
    }
  }
}

$textcolor: #fff;
$fontsize: 1rem;

/* DEBUG_ONLY >> */

#testing {
  position: absolute;
  right: 1em;
  top: 5%;
  width: 30%;
  background: #0008;
  padding: 1em;
  border-radius: 0.5em;
}

/* << END_DEBUG_ONLY */

.layout-content {
  color: $textcolor;
  font-size: $fontsize;
  padding: 1em;
}

// .container {
//   position: absolute;
//   left: 32px;
//   top: 1em;
//   bottom: 64px;
// }

// .layer-selector-drawer {
//   position: absolute;
//   left: 0;
//   bottom: 0;
//   height: auto;
//   width: 450px;
//   top: 7em;
//   transition: width 0.3s, opacity 1s;
// }

// .layers-out-of-action .layer-selector-drawer {
//   width: 68px;
//   opacity: 0.5;
// }
</style>
