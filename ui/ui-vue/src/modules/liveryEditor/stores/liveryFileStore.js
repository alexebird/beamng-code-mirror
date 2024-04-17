import { computed, ref, watch, watchEffect } from "vue"
import { defineStore } from "pinia"
import { lua, useBridge } from "@/bridge"

export const SORT_OPTIONS = Object.freeze({
  name: "name",
  modified: "modified",
})

export const useLiveryFileStore = defineStore("liveryFile", () => {
  const { events } = useBridge()
  const dataFiles = ref(null)
  const sortKey = ref(SORT_OPTIONS.modified)
  const sortDesc = ref(true)

  const files = computed(() => {
    if (!dataFiles.value) return []

    const sortOrder = sortDesc.value? -1 : 1
    return dataFiles.value.sort((a, b) => {
      if (a[sortKey.value] < b[sortKey.value]) return -1 * sortOrder
      if (a[sortKey.value] > b[sortKey.value]) return 1 * sortOrder
      return 0
    })
  })

  const init = async () => {
    await lua.extensions.ui_liveryEditor_userData.requestUpdatedData()
  }

  const loadFile = async file => await lua.extensions.ui_liveryEditor_editor.loadFile(file.location)

  const renameFile = async (file, newFilename) => {
    const success = await lua.extensions.ui_liveryEditor_userData.renameFile(file.name, newFilename)
  }

  const deleteFile = async file => {
    await lua.extensions.ui_liveryEditor_userData.deleteSaveFile(file.name)
  }

  events.on("LiverySaveFilesUpdated", data => {
    // console.log("LiverySaveFilesUpdated", data)
    if (data && Array.isArray(data) && data.length > 0) {
      data.forEach(x => {
        x.modifiedFormatted = formatDateTime(x.modified)
        x.fileSizeFormatted = formatSize(x.fileSize)
      })
      dataFiles.value = data
    } else {
      dataFiles.value = []
    }
  })

  // TODO: Remove and use proper utils or service
  function formatDateTime(unixTime) {
    const datetime = new Date(unixTime * 1000)
    return `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}`
  }

  function formatSize(bytes) {
    const kbs = (bytes / 1024).toFixed(2)
    return `${kbs} KB`
  }

  return {
    files,
    sortKey,
    sortDesc,
    init,
    loadFile,
    renameFile,
    deleteFile,
  }
})
