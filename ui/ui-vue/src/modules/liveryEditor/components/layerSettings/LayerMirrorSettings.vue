<template>
  <div class="mirror-settings" bng-ui-scope="mirror-settings">
    <LayerSettingsBase heading="Mirror" @close="store.closeCurrentTool">
      <div class="setting-item">
        <span class="item-label">Mirror</span>
        <div class="item-controls">
          <BngBinding ui-event="context" deviceMask="xinput"></BngBinding>
          <BngPillCheckbox v-model="mirrored">{{ mirrored ? "Yes" : "No" }}</BngPillCheckbox>
        </div>
      </div>
      <div class="setting-item">
        <span class="item-label">Flip</span>
        <div class="item-controls">
          <BngBinding ui-event="menu" deviceMask="xinput"></BngBinding>
          <BngPillCheckbox v-model="mirrorFlipped" v-bng-disabled="!mirrored">{{ mirrorFlipped ? "Yes" : "No" }} </BngPillCheckbox>
        </div>
      </div>
    </LayerSettingsBase>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, watch } from "vue"
import { storeToRefs } from "pinia"
import { useLayerSettingsStore } from "../../stores/layerSettingsStore"
import { useUINavScope } from "@/services/uiNav"
import { vBngOnUiNav, vBngDisabled } from "@/common/directives"
import { BngPillCheckbox, BngBinding } from "@/common/components/base"
import LayerSettingsBase from "./LayerSettingsBase.vue"

const uiNavScope = useUINavScope("mirror-settings")

const store = useLayerSettingsStore()

const { targetLayer } = storeToRefs(store)

const mirrorModel = reactive({
  mirrored: false,
  mirrorFlipped: false,
})

const targetLayerMirrored = computed(() =>
  targetLayer.value && targetLayer.value.mirrored !== null && targetLayer.value.mirrored !== undefined ? targetLayer.value.mirrored : null
)
const targetLayerMirrorFlipped = computed(() =>
  targetLayer.value && targetLayer.value.mirrorFlipped !== null && targetLayer.value.mirrorFlipped !== undefined ? targetLayer.value.mirrorFlipped : null
)

const mirrored = computed({
  get() {
    return mirrorModel.mirrored
  },
  async set(newValue) {
    mirrorModel.mirrored = newValue
    if (mirrorModel.mirrored !== targetLayer.value.mirrored) await store.setMirrored(mirrorModel.mirrored, mirrorFlipped)
  },
})

const mirrorFlipped = computed({
  get() {
    return mirrorModel.mirrorFlipped
  },
  async set(newValue) {
    mirrorModel.mirrorFlipped = newValue
    if (mirrorModel.mirroredFlipped !== targetLayer.value.mirrorFlipped) await store.setMirrored(mirrored.value, mirrorModel.mirrorFlipped)
  },
})

onMounted(() => {
  uiNavScope.set("mirror-settings")
})

watch(targetLayerMirrored, () => {
  if (targetLayerMirrored.value !== null || targetLayerMirrored.value !== mirrored.value) {
    mirrored.value = targetLayerMirrored.value
  }
})

watch(targetLayerMirrorFlipped, () => {
  if (targetLayerMirrorFlipped.value !== null || targetLayerMirrorFlipped.value !== mirrorFlipped.value) {
    mirrorFlipped.value = targetLayerMirrorFlipped.value
  }
})
</script>

<style lang="scss" scoped>
.setting-item {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;

  > .item-label {
    padding: 0.5rem 0;
  }

  > .item-controls {
    display: flex;
    align-items: center;

    *:not(:last-child) {
      margin-right: 0.5rem;
    }
  }
}
</style>
