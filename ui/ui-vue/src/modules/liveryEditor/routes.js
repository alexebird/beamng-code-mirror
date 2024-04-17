import LiveryEditorVue from "@/modules/liveryEditor/views/LiveryEditor.vue"
import LiveryFileManager from "@/modules/liveryEditor/views/LiveryFileManager"
import LiveryMain from "@/modules/liveryEditor/views/LiveryMain"

export default [
  {
    path: "/livery-editor",
    name: "LiveryEditor",
    component: LiveryEditorVue,
  },
  {
    path: "/livery-main",
    name: "LiveryMain",
    component: LiveryMain
  },
  {
    path: "/livery-manager",
    name: "LiveryManager",
    component: LiveryFileManager,
  }
]
