<template>
  <div v-bng-blur class="layer-settings">
    <!-- <LayerSettingsBase :heading="heading" @back="store.closeCurrentTool"> -->
    <component :is="settingType" />
    <!-- </LayerSettingsBase> -->
  </div>
</template>

<script>
const TRANSFORM_HEADING = "Transform"
const MIRROR_HEADING = "Mirror"
const MATERIAL_HEADING = "Material"
</script>

<script setup>
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { LayerSettingsBase, LayerMaterialSettings, LayerMirrorSettings, LayerTransformSettings } from "."
import { useLiveryEditorStore, useLayerSettingsStore } from "@/modules/liveryEditor/stores"
import { vBngBlur } from "@/common/directives"

const store = useLiveryEditorStore()
const { selectedTool } = storeToRefs(store)

const settingType = computed(() => {
  switch (selectedTool.value) {
    case "transform":
      return LayerTransformSettings
    case "mirror":
      return LayerMirrorSettings
    case "material":
      return LayerMaterialSettings
    default:
      return null
  }
})

const heading = computed(() => {
  switch (selectedTool.value) {
    case "transform":
      return TRANSFORM_HEADING
    case "mirror":
      return MIRROR_HEADING
    case "material":
      return MATERIAL_HEADING
    default:
      return null
  }
})
</script>

<style lang="scss" scoped>
.layer-settings {
  height: fit-content;
}
</style>
