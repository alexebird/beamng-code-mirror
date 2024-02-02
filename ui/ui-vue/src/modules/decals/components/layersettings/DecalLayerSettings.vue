<template>
  <div class="decals-settings">
    <div v-if="data.uid" class="settings-group">
      <div class="settings-group-items">
        <BngInput v-model="data.name" floatingLabel="Name" />
      </div>
    </div>
    <div class="settings-group texture-color-settings">
      <div class="settings-group-items">
        <LayerTile
          bng-nav-item
          :image="data.decalColorTexturePath"
          :rgbaColor="tileColor"
          class="texture-type"
          @click="$emit('settingClicked', 'decalType')"
          tabindex="0"
        />
        <BngColorPicker class="color-picker" v-model="paint" view="simple" @change="onColorChanged" />
      </div>
    </div>
    <div class="settings-group scale-settings">
      <div class="label">Scale</div>
      <div class="settings-group-items" v-bng-on-ui-nav:focus_lr="onChangeScaleX" v-bng-on-ui-nav:focus_ud="onChangeScaleY">
        <BngBinding :action="isControllerConnected ? 'scaleDecalX' : 'decreaseDecalScaleX'" :deviceMask="deviceBindingMask" />
        <BngInput v-model="data.decalScale.x" class="prefixed-input" type="number" :prefix="'x'" :min="0" :max="6" :step="SCALE_STEP"></BngInput>
        <BngBinding v-if="!isControllerConnected" action="increaseDecalScaleX" />

        <BngBinding :action="isControllerConnected ? 'scaleDecalY' : 'increaseDecalScaleY'" :deviceMask="deviceBindingMask" />
        <BngInput v-model="data.decalScale.y" class="prefixed-input" type="number" :prefix="'y'" :min="0" :max="6" :step="0.1"></BngInput>
        <BngBinding v-if="!isControllerConnected" action="decreaseDecalScaleY" />

        <div class="scale-lock" :class="{ locked: data.decalScaleLock }" tabindex="0" @click="toggleScaleLock">
          <BngIcon :type="data.decalScaleLock ? icons.decals.general.lock : icons.decals.general.unlock" />
        </div>
      </div>
    </div>
    <div class="settings-group skew-settings" v-bng-on-ui-nav:focus_lr.modified="onChangeSkewX" v-bng-on-ui-nav:focus_ud.modified="onChangeSkewY">
      <div class="label">
        Skew
        <BngBinding action="decalSkewModifier" />
      </div>
      <div class="settings-group-items">
        <div class="group-item">
          <div>
            <BngBinding :action="isControllerConnected ? 'scaleDecalX' : 'decreaseDecalScaleX'" :deviceMask="deviceBindingMask" />
            <BngInput v-model="data.decalSkew.x" class="prefixed-input" type="number" :prefix="'x'" :min="0" :step="SKEW_STEP"></BngInput>
            <BngBinding v-if="!isControllerConnected" action="increaseDecalScaleX" />
          </div>
          <div>
            <BngBinding :action="isControllerConnected ? 'scaleDecalY' : 'increaseDecalScaleY'" :deviceMask="deviceBindingMask" />
            <BngInput v-model="data.decalSkew.y" class="prefixed-input" type="number" :prefix="'y'" :min="0" :step="SKEW_STEP"></BngInput>
            <BngBinding v-if="!isControllerConnected" action="increaseDecalScaleY" />
          </div>
        </div>
      </div>
    </div>
    <div class="settings-group rotation-settings" v-bng-on-ui-nav:tab_l="onChangeRotationLeft" v-bng-on-ui-nav:tab_r="onChangeRotationRight">
      <div class="label">Rotation</div>
      <div class="settings-group-items">
        <BngBinding
          :action="isControllerConnected ? undefined : 'rotateDecalLeft'"
          :ui-event="isControllerConnected ? 'tab_l' : undefined"
          :deviceMask="deviceBindingMask"
        />
        <BngInput
          v-model="data.decalRotation"
          bng-nav-item
          class="prefixed-input"
          type="number"
          :prefix="'deg'"
          :min="0"
          :max="360"
          :step="ROTATION_STEP"
        ></BngInput>
        <BngBinding
          :action="isControllerConnected ? undefined : 'rotateDecalRight'"
          :ui-event="isControllerConnected ? 'tab_r' : undefined"
          :deviceMask="deviceBindingMask"
        />
      </div>
    </div>
    <div class="apply-multiple" v-if="!data.uid">
      <BngSwitch :checked="data.applyMultiple" v-bng-tooltip="'Check to create another decal after applying'" @valueChanged="onApplyMultipleChanged"
        >Apply multiple</BngSwitch
      >
      <BngSwitch
        v-if="data.applyMultiple"
        :checked="data.resetOnApply"
        v-bng-tooltip="'Reset settings after applying decal'"
        @valueChanged="onResetOnApplyChanged"
        >Reset on apply</BngSwitch
      >
    </div>
  </div>
</template>

<script>
const SCALE_STEP = 0.1,
  ROTATION_STEP = 1,
  SKEW_STEP = 0.1
</script>

<script setup>
import { ref, reactive, watch, onBeforeMount, computed, inject } from "vue"
import { BngInput, BngColorPicker, BngSwitch, BngIcon, BngBinding } from "@/common/components/base"
import { vBngTooltip, vBngOnUiNav } from "@/common/directives"
import { icons } from "@/assets/icons"
import Paint from "@/utils/paint"
import LayerTile from "../LayerTile.vue"

const props = defineProps({
  model: {
    type: Object,
  },
})

const emits = defineEmits(["valueChanged", "settingClicked"])

const isControllerConnected = inject("isControllerConnected", false)
const deviceBindingMask = inject("deviceBindingMask", undefined)

const data = ref(props.model)
const paint = reactive(new Paint())
const tileColor = computed(() => [...paint.rgb255, paint.alpha])

const onApplyMultipleChanged = value => (data.value.applyMultiple = value)
const onResetOnApplyChanged = value => (data.value.resetOnApply = value)

const onColorChanged = value => {
  data.value.color = value.rgba
}
const toggleScaleLock = () => (data.value.decalScaleLock = !data.value.decalScaleLock)
const onChangeScaleX = element => {
  const direction = element.detail.value

  if (direction !== -1 && direction !== 1) return

  data.value.decalScale.x = Number((data.value.decalScale.x + direction * SCALE_STEP).toFixed(1))
}
const onChangeScaleY = element => {
  const direction = element.detail.value

  if (direction !== -1 && direction !== 1) return

  data.value.decalScale.y = Number((data.value.decalScale.y + direction * SCALE_STEP).toFixed(1))
}

const onChangeRotationLeft = element => {
  const direction = element.detail.value

  if (direction === 1) data.value.decalRotation -= direction
}

const onChangeRotationRight = element => {
  const direction = element.detail.value

  if (direction === 1) data.value.decalRotation += direction
}

const onChangeSkewX = element => {
  const direction = element.detail.value

  if (direction !== -1 && direction !== 1) return

  data.value.decalSkew.x = Number((data.value.decalSkew.x + direction * SCALE_STEP).toFixed(1))
}

const onChangeSkewY = element => {
  const direction = element.detail.value

  if (direction !== -1 && direction !== 1) return

  data.value.decalSkew.y = Number((data.value.decalSkew.y + direction * SCALE_STEP).toFixed(1))
}

watch(
  data,
  () => {
    emits("valueChanged", data.value)
  },
  { deep: true }
)

onBeforeMount(() => {
  paint.rgba = props.model.color
})
</script>

<style scoped lang="scss">
@import "@/styles/modules/mixins";

.decals-settings {
  width: 23rem;

  > .texture-settings > .texture-type {
    height: 4rem;
    width: 4rem;
    padding: 0;
    min-width: 2rem;
    min-height: 2rem;
    cursor: pointer;
  }

  .texture-color-settings {
    :deep(.color-picker) span {
      font-size: 0.8rem;
      padding: 0.5rem 0;
    }

    .texture-type {
      width: 6rem;
      margin-right: 1rem;
      margin-top: 2rem;
      cursor: pointer;
    }
  }

  .scale-settings {
    > .settings-group-items > :deep(.bng-input-wrapper) {
      flex-grow: 1;
    }

    .scale-lock {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      @include modify-focus(0.25rem, 0.125rem);

      &.locked :deep(.bngicon) {
        background-color: var(--bng-orange-b400) !important;
        margin: 0.25rem;
      }

      :deep(.bngicon) {
        height: 1.25rem;
        width: 1.25rem;
        margin: 0.25rem;
      }
    }
  }

  .skew-settings {
    > .settings-group-items {
      .group-item {
        display: flex;
        align-items: center;

        > div {
          display: flex;
          align-items: center;
        }
      }

      :deep(.bng-input-wrapper) {
        flex-grow: 1;

        &:not(:last-child) {
          margin-right: 0.5rem;
        }
      }
    }
  }

  .rotation-settings :deep(.bng-input-wrapper) {
    width: 50%;
    margin-right: 0.25rem;
  }

  .apply-multiple {
    display: flex;
    align-items: center;
    justify-content: space-between;

    > :deep(.bng-pill-checkbox) > .bng-pill {
      background: rgba(0, 0, 0, 0.3);

      &.pill-marked {
        background: var(--bng-cool-gray-700);
      }
    }

    > .hint {
      font-style: italic;
      font-weight: 400;
    }
  }
}
</style>
