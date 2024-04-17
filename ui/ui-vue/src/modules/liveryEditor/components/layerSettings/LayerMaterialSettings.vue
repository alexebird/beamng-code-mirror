<template>
  <div class="material-settings" bng-ui-scope="material-settings">
    <LayerSettingsBase heading="Material" @close="store.closeCurrentTool">
      <Accordion singular>
        <AccordionItem>
          <template #caption>Color</template>
          <BngColorPicker v-model="color"></BngColorPicker>
        </AccordionItem>
        <AccordionItem>
          <template #caption>Metalness</template>
          <div class="item-controls">
            <BngInput v-model="metallicIntensity" type="number" :min="INPUT_CONTROL_MIN" :max="INPUT_CONTROL_MAX" :step="INPUT_CONTROL_STEPS" />
            <BngSlider v-model="metallicIntensity" :min="INPUT_CONTROL_MIN" :max="INPUT_CONTROL_MAX" :step="INPUT_CONTROL_STEPS" />
          </div>
        </AccordionItem>
        <AccordionItem>
          <template #caption>Roughness</template>
          <div class="item-controls">
            <BngInput v-model="roughnessIntensity" type="number" :min="INPUT_CONTROL_MIN" :max="INPUT_CONTROL_MAX" :step="INPUT_CONTROL_STEPS" />
            <BngSlider v-model="roughnessIntensity" :min="INPUT_CONTROL_MIN" :max="INPUT_CONTROL_MAX" :step="INPUT_CONTROL_STEPS" />
          </div>
        </AccordionItem>
        <AccordionItem>
          <template #caption>Normal</template>
          <div class="item-controls">
            <BngInput v-model="normalIntensity" type="number" :min="INPUT_CONTROL_MIN" :max="INPUT_CONTROL_MAX" :step="INPUT_CONTROL_STEPS" />
            <BngSlider v-model="normalIntensity" :min="INPUT_CONTROL_MIN" :max="INPUT_CONTROL_MAX" :step="INPUT_CONTROL_STEPS" />
          </div>
        </AccordionItem>
      </Accordion>
    </LayerSettingsBase>
  </div>
</template>

<script>
const INPUT_CONTROL_STEPS = 0.1
const INPUT_CONTROL_MIN = 0
const INPUT_CONTROL_MAX = 1
</script>

<script setup>
import { reactive, computed, watch } from "vue"
import { storeToRefs } from "pinia"
import { BngColorPicker, BngSlider, BngInput } from "@/common/components/base"
import { Accordion, AccordionItem } from "@/common/components/utility"
import { useLayerSettingsStore } from "@/modules/liveryEditor/stores"
import Paint from "@/utils/paint"
import LayerSettingsBase from "./LayerSettingsBase.vue"

const store = useLayerSettingsStore()
const { targetLayer } = storeToRefs(store)

const materialModel = reactive({
  metallicIntensity: 0,
  normalIntensity: 0,
  roughnessIntensity: 0,
  color: new Paint(),
})

// Target layer properties
// const layerColor = computed(() => (targetLayer.value && targetLayer.value.color ? targetLayer.value.color : undefined))
const layerMetallicIntensity = computed(() => (targetLayer.value && targetLayer.value.metallicIntensity ? targetLayer.value.metallicIntensity : undefined))
const layerNormalIntensity = computed(() => (targetLayer.value && targetLayer.value.normalIntensity ? targetLayer.value.normalIntensity : undefined))
const layerRoughnessIntensity = computed(() => (targetLayer.value && targetLayer.value.roughnessIntensity ? targetLayer.value.roughnessIntensity : undefined))

// Settings Models
const color = computed({
  get() {
    return materialModel.color
  },
  async set(newValue) {
    materialModel.color = newValue
    // if (!areColorsEquivalent(materialModel.color.rgba, layerColor.value)) {
      await store.setColor(materialModel.color.rgba)
    // }
  },
})

const metallicIntensity = computed({
  get() {
    return materialModel.metallicIntensity
  },
  async set(newValue) {
    materialModel.metallicIntensity = parseFloat(newValue)
    if (materialModel.metallicIntensity !== layerMetallicIntensity.value) await store.setMetallicIntensity(materialModel.metallicIntensity)
  },
})

const normalIntensity = computed({
  get() {
    return materialModel.normalIntensity
  },
  async set(newValue) {
    materialModel.normalIntensity = parseFloat(newValue)
    if (materialModel.normalIntensity !== layerNormalIntensity.value) await store.setNormalIntensity(materialModel.normalIntensity)
  },
})

const roughnessIntensity = computed({
  get() {
    return materialModel.roughnessIntensity
  },
  async set(newValue) {
    materialModel.roughnessIntensity = parseFloat(newValue)
    if (materialModel.roughnessIntensity !== layerRoughnessIntensity) await store.setRoughnessIntensity(materialModel.roughnessIntensity)
  },
})

// watch(
//   layerColor,
//   () => {
//     if (layerColor.value !== null && layerColor.value !== undefined && (color.value === null || !areColorsEquivalent(color.value.rgba, layerColor.value))) {
//       // color.value = layerColor.value
//       color.value.rgba = layerColor.value
//     }
//   },
//   { immediate: true }
// )

watch(
  layerMetallicIntensity,
  () => {
    if (
      layerMetallicIntensity.value !== null &&
      layerMetallicIntensity.value !== undefined &&
      (metallicIntensity.value === null || layerMetallicIntensity.value !== metallicIntensity.value)
    ) {
      metallicIntensity.value = layerMetallicIntensity.value
    }
  },
  { immediate: true }
)

watch(
  layerNormalIntensity,
  () => {
    if (
      layerNormalIntensity.value !== null &&
      layerNormalIntensity.value !== undefined &&
      (normalIntensity.value === null || layerNormalIntensity.value !== normalIntensity.value)
    ) {
      normalIntensity.value = layerNormalIntensity.value
    }
  },
  { immediate: true }
)

watch(
  layerRoughnessIntensity,
  () => {
    if (
      layerRoughnessIntensity.value !== null &&
      layerRoughnessIntensity.value !== undefined &&
      (roughnessIntensity.value === null || layerRoughnessIntensity.value !== roughnessIntensity.value)
    ) {
      roughnessIntensity.value = layerRoughnessIntensity.value
    }
  },
  { immediate: true }
)

function areColorsEquivalent(rgbaArray1, rgbaArray2) {
  console.log("areColorsEquivalentModel", rgbaArray1, rgbaArray2)
  return rgbaArray1[0] === rgbaArray2[0] && rgbaArray1[1] === rgbaArray2[1] && rgbaArray1[2] === rgbaArray2[2]
}
</script>

<style lang="scss" scoped>
.material-settings {
  display: flex;
  flex-direction: column;
  width: 20rem;

  .item-controls {
    display: flex;

    :deep(.bng-input) {
      width: 4rem;
    }
  }
}
</style>
