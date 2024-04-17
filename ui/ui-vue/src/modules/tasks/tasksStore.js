import { ref } from "vue"
import { defineStore } from "pinia"
import { useLibStore } from "@/services"

export const useTasksStore = defineStore("tasks", () => {
  const header = ref(null)
  const tasks = ref([])

  // Start Lua Events
  const { $game } = useLibStore()

  //Generic Setters
  $game.events.on("SetTasklistHeader", setTasklistHeader)
  $game.events.on("SetTasklistTask", setTasklistTask)

  //Updating
  $game.events.on("UpdateTasklistItem", updateTasklistItem)
  $game.events.on("SortTasklistItems", sortTasklistItems)

  //Shortcuts/Helpers
  $game.events.on("CompleteTasklistGoal", id => updateTasklistItem(id, {complete:true, success:true}))
  $game.events.on("FailTasklistGoal", id => updateTasklistItem(id, {complete:true, success:false}))
  $game.events.on("DiscardTasklistItem", discardTasklistItem) // has a optional delay parameter
  $game.events.on("HighlightTasklistItem", highlightTasklistItem) // has a optional duration parameter

  //Cleanup
  $game.events.on("HideCareerTasklist", hideCareerTasklist)
  $game.events.on("ClearTasklist", clearTasklist)

  function setTasklistHeader(data) {
    if(data === undefined || data === null || data == "") {
      header.value = null
    } else {
      header.value = {
        title: data.label,
        description: data.subtext,
      }
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
    const description = data.subtext !== 0 ? data.subtext : ""

    if (index === -1) {
      tasks.value.push({
        id: data.id,
        label: data.label,
        description: description,
        type: data.type,
        attention: data.attention,
        complete: isComplete,
        success: isSuccess,
      })
    } else {
      tasks.value[index].attention = data.attention
      tasks.value[index].complete = isComplete
      tasks.value[index].success = isSuccess

      if(data.subtext !== undefined)
        tasks.value[index].description = description

      if(data.label !== undefined)
        tasks.value[index].label = data.label

      if(data.type !== undefined)
        tasks.value[index].type = data.type

    }
  }

  function updateTasklistItem(id, data) {
    const index = tasks.value.findIndex((task) => task.id === id);

    if (index !== -1) {
      Object.keys(data).forEach((key) => {
        if (tasks.value[index][key] !== undefined) {
          tasks.value[index][key] = data[key];
        }
      });
    }
  }

  function sortTasklistItems(order) {
    // Separate tasks into two lists: inOrderTasks and notInOrderTasks
    const inOrderTasks = []
    const notInOrderTasks = []

    tasks.value.forEach((task) => {
      if (order.includes(task.id)) {
        inOrderTasks.push(task)
      } else {
        notInOrderTasks.push(task)
      }
    })

    // Sort inOrderTasks based on the provided order
    inOrderTasks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))

    // Set tasks.value to the concatenation of inOrderTasks and notInOrderTasks
    tasks.value = [...inOrderTasks, ...notInOrderTasks]
  }

  function discardTasklistItem(id, delay) {
    if(delay !== undefined && delay > 0) {
      // Use setTimeout to delay the removal of the task
      setTimeout(() => {
        setTasklistTask({id:id, clear:true})
      }, delay*1000);
    } else {
      setTasklistTask({id:id, clear:true})
    }
  }

  //Animation seems to start on the non-highlighted part. So it takes around 1s for the highlight to be visible
  function highlightTasklistItem(id, duration) {
    setTasklistTask({id:id, attention:true})
    if(duration !== undefined && duration > 0) {
      // Use setTimeout to delay the removal of the task
      setTimeout(() => {
        setTasklistTask({id:id, attention:false})
      }, duration*1000);
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
