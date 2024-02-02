import { defineStore } from "pinia"
import { ref } from "vue"
import { lua, useBridge } from "@/bridge"

const API = lua.extensions.ui_dynamicDecals
const FILENAME_REGEX = /^\w+$/

export const useDecalsSaveStore = defineStore("decalsSave", () => {
  const bridge = useBridge()

  const initialized = ref(false)
  const saveFiles = ref([])
  const currentSaveFile = ref(null)
  const saveFilename = ref(null)
  const isEditing = ref(false)
  const showWarning = ref(true)

  const refreshSaveFiles = async () => {}

  const init = () => {
    if (initialized.value) return

    API.initialize()
    initialized.value = true
  }

  const canCreateFile = filename => {
    const isValid = FILENAME_REGEX.test(filename)

    if (!isValid) return { valid: false, description: "invalid filename" }

    const isExisting = saveFiles.value && saveFiles.value.length > 0 && saveFiles.value.find(x => x.name === filename)

    if (isExisting) return { valid: false, description: "file already exists" }

    return { valid: true }
  }

  const proceedWarning = () => {
    showWarning.value = false
    init()
  }

  let saveLoadTimer

  const loadSaveFile = path => {
    API.setupEditor()
    // hacky stuff to wait for update setup to finish
    saveLoadTimer = setTimeout(() => {
      API.loadSaveFile(path)
    }, 1000)
    isEditing.value = true
  }

  const createSaveFile = () => {
    API.setupEditor()
    // hacky stuff to wait for update setup to finish
    saveLoadTimer = setTimeout(() => {
      API.createSaveFile()
    }, 500)
    saveFilename.value = createFilename()
    isEditing.value = true
  }

  const cancelChanges = () => {
    API.cancelChanges()
    isEditing.value = false
  }

  const saveChanges = () => {
    API.saveChanges(saveFilename.value)
    isEditing.value = false
  }

  bridge.events.on("DynamicDecalSaveFilesUpdated", data => {
    // console.log("DynamicDecalSaveFilesUpdated savestore", data)
    saveFiles.value = data && data.length > 0 ? data : []
  })

  bridge.events.on("DynamicDecalsSaveFileLoaded", data => {
    // console.log("DynamicDecalsSaveFileLoaded", data)

    if (!data) {
      currentSaveFile.value = null
      return
    }

    if (data && data.success) {
      currentSaveFile.value = data.file
      saveFilename.value = data.filename
    } else {
      console.error("error loading file")
    }
  })

  function reset() {
    initialized.value = false
    saveFiles.value = []
    currentSaveFile.value = null
    if (saveLoadTimer) {
      clearTimeout(saveLoadTimer)
      saveLoadTimer = null
    }
  }

  function createFilename() {
    const currentDate = new Date()

    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0") // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, "0")
    const hours = String(currentDate.getHours()).padStart(2, "0")
    const minutes = String(currentDate.getMinutes()).padStart(2, "0")
    const seconds = String(currentDate.getSeconds()).padStart(2, "0")

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
  }

  function dispose() {
    bridge.events.off("DynamicDecalSaveFilesUpdated")
    bridge.events.off("DynamicDecalsSaveFileLoaded")
    reset()
    API.exit()
  }

  return {
    saveFiles,
    currentSaveFile,
    saveFilename,
    isEditing,
    showWarning,
    init,
    proceedWarning,
    loadSaveFile,
    createSaveFile,
    cancelChanges,
    saveChanges,
    refreshSaveFiles,
    canCreateFile,
    dispose,
  }
})
