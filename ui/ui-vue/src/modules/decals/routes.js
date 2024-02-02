// Decals routes --------------------------------------
import DecalsEditor from "@/modules/decals/views/DecalsEditor.vue"
import DecalsSaveLoaderView from "@/modules/decals/views/DecalsSaveLoaderView.vue"
import DecalsTestView from "@/modules/decals/views/DecalsTestView.vue"

export default [
  {
    path: "/decals-editor",
    name: "decals-editor",
    component: DecalsEditor,
  },
  {
    path: "/decals-loader",
    name: "decals-loader",
    component: DecalsSaveLoaderView,
  },
  {
    path: "/decals-test-view",
    name: "decals-test-view",
    component: DecalsTestView,
  },
]
