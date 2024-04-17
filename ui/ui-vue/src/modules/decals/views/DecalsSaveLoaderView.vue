<template>
  <LayoutSingle class="layout-content-full layout-align-center">
    <div :class="{ 'show-warning': true }" bng-ui-scope="decal-loader" v-bng-on-ui-nav:back,menu="goBack" class="decals-load-view">
      <BngCard class="load-card">
        <BngCardHeading>Dynamic Decals</BngCardHeading>
        <div v-if="showWarning" class="experimental-warning">
          <span class="warning-text">
            This is an early highly experimental preview of the Decal Editor. Please be aware that anything created with this feature may be lost in future
            hotfixes and updates. Do you wish to proceed?
          </span>
          <div class="experimental-actions">
            <BngButton @click="goBack">No</BngButton>
            <BngButton accent="attention" @click="store.proceedWarning">Yes, I'm buckled up and ready to go!</BngButton>
          </div>
        </div>
        <div v-else-if="isEditing" class="save-content">
          <div class="text">
            <template v-if="currentSaveFile">Save changes to file (overwrite)?</template>
            <template v-else>Save changes to new file</template>
          </div>
          <BngInput
            ref="saveFilenameInput"
            v-model="saveFilename"
            v-bng-tooltip:left="filenameValid && !filenameValid.valid ? filenameValid.description : null"
            class="input-control"
            floatingLabel="filename"
            suffix=".dynDecals.json"
            :validate="() => filenameValid.valid"
          />
          <div class="save-controls">
            <BngButton accent="text" @click="goBack">Cancel</BngButton>
            <BngButton accent="attention" @click="onCancel">Exit</BngButton>
            <BngButton :disabled="!saveFilename || !filenameValid.valid" @click="onSave">Save</BngButton>
          </div>
        </div>
        <div v-else>
          <div class="load-content">
            <span class="text">Load and edit an existing save file or create new.</span>
            <div class="controls">
              <BngDropdown
                bng-nav-item
                class="select-control"
                v-model="selectedSaveFile"
                :items="availableSaveFiles"
                :disabled="!availableSaveFiles || availableSaveFiles.length === 0"
              >
                <template v-if="!availableSaveFiles || availableSaveFiles.length === 0" #display> No available files </template>
              </BngDropdown>
              <BngButton :disabled="!selectedSaveFile" @click="onLoad">Load File</BngButton>
              <BngButton @click="store.createSaveFile">Create New</BngButton>
            </div>
          </div>
        </div>
      </BngCard>
    </div>
  </LayoutSingle>
</template>

<script setup>
import { ref, computed, onBeforeMount, onUnmounted, watchEffect } from "vue"
import { storeToRefs } from "pinia"
import { LayoutSingle } from "@/common/layouts"
import { BngButton, BngCard, BngCardHeading, BngInput, BngDropdown } from "@/common/components/base"
import { vBngTooltip, vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import { useDecalsSaveStore } from "@/modules/decals/stores/decalsSaveStore"

useUINavScope("decal-loader")

const store = useDecalsSaveStore()
const { showWarning, saveFilename, currentSaveFile, saveFiles, isEditing } = storeToRefs(store)

const saveFilenameInput = ref(null)
const selectedSaveFile = ref(null)
const exit = ref(false)

const availableSaveFiles = computed(() => saveFiles.value.map(x => ({ label: x.name, value: x.location })))

// onBeforeMount(() => {
//   if (!showWarning.value) store.init()
// })

const goBack = () => {
  if (isEditing.value) {
    window.bngVue.gotoGameState("decals-editor")
  } else {
    exit.value = true
    window.bngVue.gotoGameState("garagemode")
  }
}

const onLoad = () => store.loadSaveFile(selectedSaveFile.value)

const filenameValid = computed(() => (saveFilenameInput.value && saveFilenameInput.value.dirty ? store.canCreateFile(saveFilename.value) : { valid: true }))

const onSave = () => {
  exit.value = true
  store.saveChanges()
}

const onCancel = () => {
  exit.value = true
  store.cancelChanges()
}

onUnmounted(() => {
  if (exit.value) {
    store.$dispose()
  }
})

watchEffect(() => {
  if (!showWarning.value) store.init()
})
</script>

<style scoped lang="scss">
.decals-load-view {
  width: 80vh;
  height: 80vh;
  color: white;

  .load-content {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    padding-top: 0;

    > .controls {
      display: flex;

      > :deep(.select-control) {
        flex-grow: 1;
        padding-top: 0.62rem;
        padding-bottom: 0.62rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }

      > .bng-button {
        margin: 0.5rem;
        margin-left: 0;
      }
    }
  }

  .save-content {
    padding: 0.5rem;

    > .text {
      padding: 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 800;
    }

    > .input-control {
      padding: 0.5rem;
    }

    > .save-controls {
      display: flex;
      justify-content: flex-end;

      :deep(.bng-button):not(:last-child) {
        margin-right: 0.5rem;
      }
    }
  }

  .experimental-warning {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;

    > .warning-text {
      padding: 1rem 0.5rem;
      font-size: 1.125rem;
    }

    > .experimental-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }

  :deep(.load-card) {
    background: rgba(0, 0, 0, 0.7);

    > .card-cnt {
      padding: 0.75rem;
    }

    .button-actions {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
