<template>
  <LayoutSingle v-bng-blur bng-ui-scope="file-manager" v-bng-on-ui-nav:back,menu="goBack" class="layout-content-full layout-align-center">
    <div class="view-wrapper">
      <div class="heading-wrapper">
        <BngScreenHeading>File Manager</BngScreenHeading>
        <BngButton accent="attention" @click="goBack">Back</BngButton>
      </div>
      <div class="view-content">
        <div class="header">
          <BngPillFilters v-model="sortKeyValues" :options="sortOptions" :required="true"></BngPillFilters>
          <BngPillFilters v-model="sortOrderValues" :options="sortOrder" :required="true"></BngPillFilters>
        </div>
        <div class="files-list">
          <div
            v-for="file in files"
            :key="file.name"
            bng-nav-item
            :class="{ selected: selectedFile && selectedFile.name === file.name }"
            class="file-item"
            tabindex="0"
            @focusin="selectFile(file)">
            <div class="file-details">
              <div class="file-name">
                {{ file.name }}
              </div>
              <div class="file-attributes">
                <span>Modified {{ file.modifiedFormatted }}</span>
                <span>Size {{ file.fileSizeFormatted }}</span>
              </div>
              <!-- <span class="details-item">
                <span class="detail-label">
                  Modified
                </span>
                <span class="detail-value">
                  {{ file.modifiedFormatted }}
                </span>
              </span>
              <span class="details-item">
                <span class="detail-label">
                  Size
                </span>
                <span class="detail-value">
                  {{ file.fileSizeFormatted }}
                </span>
              </span> -->
            </div>
            <Transition name="slide-fade">
              <div v-if="selectedFile && selectedFile.name === file.name" class="file-actions">
                <BngButton :icon="icons.import" @click="loadFile"></BngButton>
                <BngButton :icon="icons.rename" accent="secondary" tabindex="0" @click="openRenameDialog"> </BngButton>
                <BngButton :icon="icons.trashBin2" accent="attention" tabindex="0" @click="openDeleteDialog"> </BngButton>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </LayoutSingle>
</template>

<script>
import { SORT_OPTIONS } from "@/modules/liveryEditor/stores/liveryFileStore"
import { openEditFileDialog } from "../utils"

const sortOptions = [
  { label: "Name", value: SORT_OPTIONS.name },
  { label: "Date Modified", value: SORT_OPTIONS.modified },
]
const sortOrder = [
  { label: "Asc", value: false },
  { label: "Desc", value: true },
]

const description = `
 Enter the new name you wish to give to the selected file
`
</script>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue"
import { storeToRefs } from "pinia"
import router from "@/router"
import { useUINavScope } from "@/services/uiNav"
import { vBngOnUiNav } from "@/common/directives"
import { vBngBlur } from "@/common/directives"
import { openConfirmation } from "@/services/popup"
import { useLiveryFileStore } from "@/modules/liveryEditor/stores/liveryFileStore"
import { LayoutSingle } from "@/common/layouts"
import { BngButton, BngScreenHeading, BngPillFilters, icons } from "@/common/components/base"

const uiNavScope = useUINavScope("file-manager")
const store = useLiveryFileStore()

const { files } = storeToRefs(store)
const selectedFile = ref(null)

const windowState = reactive({
  isAnyDialogOpen: false,
})

const sortOrderValues = computed({
  get: () => [store.sortDesc],
  set: newValues => (store.sortDesc = newValues[0]),
})
const sortKeyValues = computed({
  get: () => [store.sortKey],
  set: newValues => (store.sortKey = newValues[0]),
})

const selectFile = file => (selectedFile.value = file)

const loadFile = async () => {
  const res = await store.loadFile(selectedFile.value)
  if (res) {
    router.replace({ name: "LiveryEditor" })
  }
}

const openRenameDialog = async () => {
  windowState.isAnyDialogOpen = true

  const formModel = { name: selectedFile.value.name }

  const res = await openEditFileDialog("Rename file", description, formModel, model => {
    console.log("called validator", model)
    console.log("called validator formModel", formModel)
    return model.name !== null && model.name !== undefined && model.name !== "" && model.name !== selectedFile.value.name
  })
  // const res = await openFormDialog(FileEditForm, formModel, "Rename file", description)

  if (res.success) await store.renameFile(selectedFile.value, res.value.name)

  windowState.isAnyDialogOpen = false
}

const openDeleteDialog = async () => {
  windowState.isAnyDialogOpen = true

  const res = await openConfirmation("Delete", `Are you sure you want to delete ${selectedFile.value.name}`)
  if (res) await store.deleteFile(selectedFile.value)

  windowState.isAnyDialogOpen = false
}

onBeforeMount(async () => {
  await store.init()
})

const goBack = () => {
  if (!windowState.isAnyDialogOpen) {
    router.replace({ name: "LiveryMain" })
  }
}
</script>

<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all 0.1s linear;
}

.slide-fade-leave-active {
  transition: all 0.1s linear;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(1.25rem);
  opacity: 0;
}

.view-wrapper {
  display: flex;
  flex-direction: column;

  > .heading-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.view-content {
  display: flex;
  flex-direction: column;
  min-height: 40rem;
  padding: 1rem;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  user-select: none;

  > .header {
    display: flex;
    align-items: center;
    padding-bottom: 0.5rem;

    > * {
      &:not(:last-child) {
        margin-right: 0.5rem;
      }
    }
  }

  > .files-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 0.25rem 0.25rem;

    &::-webkit-scrollbar {
      display: none;
    }

    > .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      // border: 0.125rem solid transparent;
      // background: rgba(0, 0, 0, 1);

      &:not(:last-child) {
        margin-bottom: 0.5rem;
      }

      &.selected {
        // To reset angular style leak adding translucent background
        box-shadow: none;

        > .file-details {
          background: rgba(#ff6600, 0.6);
        }
      }

      > .file-details {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 0.75rem;
        border: 0.125rem solid transparent;
        border-radius: 0.25rem;
        background: rgba(0, 0, 0, 1);

        > .file-name {
          font-size: 1.5rem;
        }

        > .file-attributes {
          display: flex;
          align-items: baseline;

          > span:not(:last-child) {
            padding-right: 1rem;
          }
        }
      }

      > .file-actions {
        padding: 0 0.5rem;

        :deep(button) {
          padding: 0.75rem;

          span {
            font-size: 2rem;
          }
        }
      }
    }
  }
}
</style>
