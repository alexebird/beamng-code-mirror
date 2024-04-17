<template>
  <div bng-ui-scope="layer-deform-settings" v-bng-on-ui-nav:focus_lr="onFocusLR" v-bng-on-ui-nav:focus_ud="onFocusUD">
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import { useUINavScope } from "@/services/uiNav"
import { vBngOnUiNav } from "@/common/directives"
import { useLiveryEditorStore } from "@/modules/liveryEditor/stores/liveryEditorStore"

const uiNavScope = useUINavScope("layer-deform-settings")
const store = useLiveryEditorStore()

const onFocusLR = element => {
  const direction = element.detail.value

  if (direction > 0) {
    store.scale(1, 0)
  } else if (direction < 0) {
    store.scale(-1, 0)
  }
}

const onFocusUD = element => {
  const direction = element.detail.value
  if (direction > 0) {
    store.scale(0, 1)
  } else if (direction < 0) {
    store.scale(0, -1)
  }
}

onMounted(async () => {
  store.selectTool("deform")
})

// onBeforeUnmount(() => {
//   store.closeCurrentTool()
// })
</script>

<style lang="scss" scoped></style>