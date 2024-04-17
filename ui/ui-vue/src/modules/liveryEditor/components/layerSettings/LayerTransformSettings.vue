<template>
  <div
    class="transform-settings"
    bng-ui-scope="transform-settings"
    v-bng-on-ui-nav:back,menu="onBack"
    v-bng-on-ui-nav:focus_lr="onTransformX"
    v-bng-on-ui-nav:focus_ud="onTransformY"
    v-bng-on-ui-nav:focus_lr.modified="noop"
    v-bng-on-ui-nav:focus_ud.modified="noop"
    v-bng-on-ui-nav:tab_l="onTabLeft"
    v-bng-on-ui-nav:tab_r="onRotateRight"
    v-bng-on-ui-nav:rotate_h_cam="onScaleX"
    v-bng-on-ui-nav:rotate_v_cam="onScaleY"
    v-bng-on-ui-nav:rotate_h_cam.modified="onSkewX"
    v-bng-on-ui-nav:rotate_v_cam.modified="onSkewY">
    <LayerSettingsBase heading="Transform" @close="onBack">
      <div class="setting-item">
        <span class="item-label">Position</span>
        <div class="item-controls">
          <BngInput v-model="positionX" :step="0.001" prefix="X" :disabled="true" />
          <BngInput v-model="positionY" :step="0.001" prefix="Y" :disabled="true" />
        </div>
      </div>
      <div class="setting-item">
        <span class="item-label">Rotation</span>
        <div class="item-controls">
          <BngInput v-model="rotation" :step="1" :trailingIcon="icons.rotationL" type="number" :disabled="!formSettings.enabled" />
        </div>
      </div>
      <div class="setting-item">
        <span class="item-label">Scale</span>
        <div class="item-controls">
          <BngInput v-model="scaleX" :step="0.1" :prefix="'X'" type="number" :disabled="!formSettings.enabled" />
          <BngInput v-model="scaleY" :step="0.1" :prefix="'Y'" type="number" :disabled="!formSettings.enabled" />
        </div>
      </div>
      <div class="setting-item">
        <span class="item-label">Skew</span>
        <div class="item-controls">
          <BngInput v-model="skewX" :step="0.1" :prefix="'X'" type="number" :disabled="!formSettings.enabled" />
          <BngInput v-model="skewY" :step="0.1" :prefix="'Y'" type="number" :disabled="!formSettings.enabled" />
        </div>
      </div>
      <BngButton class="action-option" accent="text" @click="toggleForm" :disabled="isStampMode">
        {{ formSettings.enabled ? "Done" : "Type values" }}
      </BngButton>
      <BngButton class="action-option" accent="text" @click="store.toggleStamp()" :disabled="formSettings.enabled">
        {{ isStampMode ? "Cancel Stamp" : "Stamp" }}
      </BngButton>
    </LayerSettingsBase>
  </div>
</template>

<script>
const FOCUS_LD_TRIGGER_VALUE = -0.999
const FOCUS_RU_TRIGGER_VALUE = 0.999
const FOCUS_HOLD_INTERVAL_MS = 250

const noop = () => {}
</script>

<script setup>
import { computed, onMounted, reactive, watch } from "vue"
import { vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import { BngButton, BngInput, icons } from "@/common/components/base"
import { storeToRefs } from "pinia"
import { useLiveryEditorStore, useLayerSettingsStore } from "@/modules/liveryEditor/stores"
import LayerSettingsBase from "./LayerSettingsBase.vue"

const uiNavScope = useUINavScope("transform-settings")
const editorStore = useLiveryEditorStore()
const store = useLayerSettingsStore()

const { toolsData, targetLayer, isStampMode } = storeToRefs(store)

const transformModel = reactive({
  positionX: null,
  positionY: null,
  rotation: null,
  scaleX: null,
  scaleY: null,
  skewX: null,
  skewY: null,
})

const inputNavStates = reactive({
  focusXLatestValue: 0,
  focusYLatestValue: 0,
  rotateXLatestValue: 0,
  rotateYLatestValue: 0,
  skewXLatestValue: 0,
  skewYLatestValue: 0,
  holdEventLatest: null,
  holdInterval: null,
  modifierTriggered: false,
})

const formSettings = reactive({
  enabled: false,
})

const layerPositionX = computed(() => (targetLayer.value && targetLayer.value.position ? targetLayer.value.position.x : undefined))
const layerPositionY = computed(() => (targetLayer.value && targetLayer.value.position ? targetLayer.value.position.y : undefined))
const layerRotation = computed(() => (targetLayer.value && targetLayer.value.rotation ? targetLayer.value.rotation : undefined))
const layerScaleX = computed(() => (targetLayer.value && targetLayer.value.scale ? targetLayer.value.scale.x : undefined))
const layerScaleY = computed(() => (targetLayer.value && targetLayer.value.scale ? targetLayer.value.scale.y : undefined))
const layerSkewX = computed(() => (targetLayer.value && targetLayer.value.skew ? targetLayer.value.skew.x : undefined))
const layerSkewY = computed(() => (targetLayer.value && targetLayer.value.skew ? targetLayer.value.skew.y : undefined))

const positionX = computed({
  get: () => transformModel.positionX,
  set: async newValue => {
    transformModel.positionX = newValue
  },
})

const positionY = computed({
  get: () => transformModel.positionY,
  set: async newValue => {
    transformModel.positionY = newValue
  },
})

const rotation = computed({
  get() {
    return transformModel.rotation
  },
  async set(newValue) {
    transformModel.rotation = parseInt(newValue)
    if (transformModel.rotation !== targetLayer.value.rotation) await store.setRotation(transformModel.rotation)
  },
})

const scaleX = computed({
  get: () => transformModel.scaleX,
  set: async newValue => {
    transformModel.scaleX = newValue
    if (transformModel.scaleX !== layerScaleX.value) await store.setScale(transformModel.scaleX, scaleY.value)
  },
})

const scaleY = computed({
  get: () => transformModel.scaleY,
  set: async newValue => {
    transformModel.scaleY = newValue
    if (transformModel.scaleY !== layerScaleY.value) await store.setScale(scaleX.value, transformModel.scaleY)
  },
})

const skewX = computed({
  get: () => transformModel.skewX,
  set: async newValue => {
    transformModel.skewX = newValue
    if (transformModel.skewX !== layerSkewX.value) await store.setSkew(transformModel.skewX, skewY.value)
  },
})

const skewY = computed({
  get: () => transformModel.skewY,
  set: async newValue => {
    transformModel.skewY = newValue
    if (transformModel.skewY !== layerSkewY.value) await store.setSkew(skewX.value, transformModel.skewY)
  },
})

onMounted(async () => {
  uiNavScope.set("transform-settings")
  editorStore.selectTool("transform")
})

watch(
  layerPositionX,
  () => {
    if (layerPositionX.value !== null && layerPositionX.value !== undefined && (positionX.value === null || layerPositionX.value !== positionX.value)) {
      positionX.value = layerPositionX.value
    }
  },
  { immediate: true }
)

watch(
  layerPositionY,
  () => {
    if (layerPositionY.value !== null && layerPositionY.value !== undefined && (positionY.value === null || layerPositionY.value !== positionY.value)) {
      positionY.value = layerPositionY.value
    }
  },
  { immediate: true }
)

watch(
  layerRotation,
  () => {
    if (layerRotation.value !== null && layerRotation.value !== undefined && (rotation.value === null || layerRotation.value !== rotation.value)) {
      rotation.value = targetLayer.value.rotation
    }
  },
  { immediate: true }
)

watch(
  layerScaleX,
  () => {
    if (layerScaleX.value !== null && layerScaleX.value !== undefined && (scaleX.value === null || layerScaleX.value !== scaleX.value)) {
      scaleX.value = layerScaleX.value
    }
  },
  { immediate: true }
)

watch(
  layerScaleY,
  () => {
    if (layerScaleY.value !== null && layerScaleY.value !== undefined && (scaleY.value === null || layerScaleY.value !== scaleY.value)) {
      scaleY.value = layerScaleY.value
    }
  },
  { immediate: true }
)

watch(
  layerSkewX,
  () => {
    if (layerSkewX.value !== null && layerSkewX.value !== undefined && (skewX.value === null || layerSkewX.value !== skewX.value)) {
      skewX.value = layerSkewX.value
    }
  },
  { immediate: true }
)

watch(
  layerSkewY,
  () => {
    if (layerSkewY.value !== null && layerSkewY.value !== undefined && (skewY.value === null || layerSkewY.value !== skewY.value)) {
      skewY.value = layerSkewY.value
    }
  },
  { immediate: true }
)

const doHoldAction = (callbackFn, eventName) => {
  callbackFn()

  if (inputNavStates.holdInterval) clearInterval(inputNavStates.holdInterval)
  inputNavStates.holdInterval = setInterval(callbackFn, FOCUS_HOLD_INTERVAL_MS)
  inputNavStates.holdEventLatest = eventName
}

const onTransformX = element => {
  // console.log("onTransformX", element.detail)
  const eventName = element.detail.name
  const direction = element.detail.value

  if (inputNavStates.holdEventLatest === eventName && inputNavStates.holdInterval) {
    clearInterval(inputNavStates.holdInterval)
  }

  // Check latest event value against direction and ignore if controller stick is going back to normal position
  if (direction > FOCUS_RU_TRIGGER_VALUE && direction > inputNavStates.focusXLatestValue) {
    doHoldAction(() => store.translate(1, 0), eventName)
  } else if (direction < FOCUS_LD_TRIGGER_VALUE && direction < inputNavStates.focusXLatestValue) {
    doHoldAction(() => store.translate(-1, 0), eventName)
  }

  inputNavStates.focusXLatestValue = direction
}

const onTransformY = element => {
  // console.log("onTransformY", element.detail)

  const eventName = element.detail.name
  const direction = element.detail.value

  if (inputNavStates.holdEventLatest === eventName && inputNavStates.holdInterval) {
    clearInterval(inputNavStates.holdInterval)
  }

  // Check latest event value against direction and ignore if controller stick is going back to normal position
  if (direction > FOCUS_RU_TRIGGER_VALUE && direction > inputNavStates.focusYLatestValue) {
    doHoldAction(() => store.translate(0, 1), eventName)
  } else if (direction < FOCUS_LD_TRIGGER_VALUE && direction < inputNavStates.focusYLatestValue) {
    doHoldAction(() => store.translate(0, -1), eventName)
  }

  inputNavStates.focusYLatestValue = direction
}

const onTabLeft = event => {
  // console.log("onTabLeft", event)
  store.rotate(1, false)
}

const onRotateRight = event => {
  // console.log("onRotateRight")
  store.rotate(1, true)
}

const onScaleX = element => {
  console.log("onScaleX")
  const eventName = element.detail.name
  const direction = element.detail.value

  if (inputNavStates.holdEventLatest === eventName && inputNavStates.holdInterval) {
    clearInterval(inputNavStates.holdInterval)
  }

  // Check latest event value against direction and ignore if controller stick is going back to normal position
  if (direction > FOCUS_RU_TRIGGER_VALUE && direction > inputNavStates.rotateXLatestValue) {
    doHoldAction(() => store.scale(1, 1), eventName)
  } else if (direction < FOCUS_LD_TRIGGER_VALUE && direction < inputNavStates.rotateXLatestValue) {
    doHoldAction(() => store.scale(-1, -1), eventName)
  }

  inputNavStates.rotateXLatestValue = direction
}

const onScaleY = element => {
  console.log("onScaleY")

  const eventName = element.detail.name
  const direction = element.detail.value

  if (inputNavStates.holdEventLatest === eventName && inputNavStates.holdInterval) {
    clearInterval(inputNavStates.holdInterval)
  }

  // Check latest event value against direction and ignore if controller stick is going back to normal position
  if (direction > FOCUS_RU_TRIGGER_VALUE && direction > inputNavStates.rotateYLatestValue) {
    doHoldAction(() => store.scale(1, 1), eventName)
  } else if (direction < FOCUS_LD_TRIGGER_VALUE && direction < inputNavStates.rotateYLatestValue) {
    doHoldAction(() => store.scale(-1, -1), eventName)
  }

  inputNavStates.rotateYLatestValue = direction
}

const onSkewX = element => {
  // console.log("onSkewX", element.detail)

  const eventName = element.detail.name
  const direction = element.detail.value

  if (inputNavStates.holdEventLatest === eventName && inputNavStates.holdInterval) {
    clearInterval(inputNavStates.holdInterval)
  }

  // Check latest event value against direction and ignore if controller stick is going back to normal position
  if (direction > FOCUS_RU_TRIGGER_VALUE && direction > inputNavStates.focusXLatestValue) {
    store.skew(1, 0)
  } else if (direction < FOCUS_LD_TRIGGER_VALUE && direction < inputNavStates.focusXLatestValue) {
    store.skew(-1, 0)
  }

  inputNavStates.skewYLatestValue = direction
}

const onSkewY = element => {
  // console.log("onSkewY", element.detail)

  const eventName = element.detail.name
  const direction = element.detail.value

  if (inputNavStates.holdEventLatest === eventName && inputNavStates.holdInterval) {
    clearInterval(inputNavStates.holdInterval)
  }

  // Check latest event value against direction and ignore if controller stick is going back to normal position
  if (direction > FOCUS_RU_TRIGGER_VALUE && direction > inputNavStates.focusXLatestValue) {
    store.skew(0, 1)
  } else if (direction < FOCUS_LD_TRIGGER_VALUE && direction < inputNavStates.focusYLatestValue) {
    store.skew(0, -1)
  }
}

const toggleForm = () => (formSettings.enabled = !formSettings.enabled)

function onBack() {
  if (toolsData.value && toolsData.value.mode === "stamp") {
    store.cancelStamp()
  } else {
    editorStore.closeCurrentTool()
  }
}
</script>

<style scoped lang="scss">
.transform-settings {
  display: flex;
  flex-direction: column;
  width: 20rem;

  .setting-item {
    display: flex;
    flex-direction: column;
    padding-bottom: 0.5rem;

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

  .action-option {
    width: 100%;
    padding: 0.5rem 0;
  }

  .rotation-icon {
    user-select: none;
    cursor: pointer;
  }
}
</style>
