import { ref } from "vue"
import { defineStore } from "pinia"
import { useLibStore } from "@/services"

export const useTasksStore = defineStore("tasks", () => {
  const header = ref(null)
  const tasks = ref([])

  // Start Lua Events
  const { $game } = useLibStore()

  $game.events.on("SetTasklistHeader", setTasklistHeader)
  $game.events.on("SetTasklistTask", setTasklistTask)
  $game.events.on("HideCareerTasklist", hideCareerTasklist)
  $game.events.on("ClearTasklist", clearTasklist)

  function setTasklistHeader(data) {
    header.value = {
      title: data.label,
      description: data.subtext,
    }
  }

  function setTasklistTask(data) {
    const id = data.id === null || data.id === undefined ? "default" : data.id
    const index = tasks.value.findIndex(x => x.id === id)

    if (index === -1 && data.clear) return

    if (data.clear) {
      tasks.value.splice(index, 1)
      return
    }

    const isComplete = (data.done !== undefined && data.done) || (data.fail !== undefined && data.fail)
    const isSuccess = (data.done !== undefined && data.done) || (data.fail !== undefined && !data.fail)

    if (index === -1) {
      tasks.value.push({
        id: data.id,
        title: data.label,
        label: data.label,
        description: data.subtext !== 0 ? data.subtext : "",
        type: data.type,
        attention: data.attention,
        complete: isComplete,
        success: isSuccess,
      })
    } else {
      tasks.value[index].attention = data.attention
      tasks.value[index].complete = isComplete
      tasks.value[index].success = isSuccess
    }
  }

  function hideCareerTasklist() {}

  function clearTasklist() {
    header.value = null
    tasks.value = []
  }

  return {
    header,
    tasks,
  }
})
