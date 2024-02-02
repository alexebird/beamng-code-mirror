<template>
  <div class="layer-settings">
    <div class="settings-header">
      <BngCardHeading>{{ heading }}</BngCardHeading>
      <bng-button v-if="(showCancelButton && model.type === LayerType.decal) || model.uid" accent="attention" @click="$emit('cancel')">Back</bng-button>
    </div>
    <div class="content">
      <template v-if="type === LayerType.decal">
        <DecalLayerSettings :model="model" @valueChanged="onValueChanged" @settingClicked="value => $emit('settingClicked', value)" />
      </template>
      <template v-else-if="type === LayerType.fill">
        <FillLayerSettings :model="model" @valueChanged="onValueChanged" @settingClicked="value => $emit('settingClicked', value)" />
      </template>
      <template v-else-if="type === LayerType.group">
        <GroupLayerSettings :model="model" @valueChanged="onValueChanged" />
      </template>
    </div>
    <div class="action-buttons" v-if="showActionButtons && !model.uid">
      <bng-button v-if="showCancelButton && model.type !== LayerType.decal" accent="attention" @click="$emit('cancel')">{{ cancelButtonText }}</bng-button>
      <bng-button v-if="showSaveButton" @click="onSaveClicked">{{ saveButtonText }}</bng-button>
    </div>
  </div>
</template>

<script setup>
import { computed, provide, ref } from "vue"
import { BngCardHeading, BngButton } from "@/common/components/base"
import { DecalLayerSettings, FillLayerSettings, GroupLayerSettings } from "."
import { LayerType } from "../../enums/layerType"
import useControls from "@/services/controls"

const controls = useControls()

const props = defineProps({
  model: {
    type: Object,
  },
  type: {
    type: [Number, String],
  },
  heading: {
    type: String,
    default: "Settings",
  },
  showActionButtons: {
    type: Boolean,
    default: true,
  },
  showCancelButton: {
    type: Boolean,
    default: true,
  },
  showSaveButton: {
    type: Boolean,
    default: true,
  },
  saveButtonText: {
    type: String,
    default: "Create",
  },
  cancelButtonText: {
    type: String,
    default: "Cancel",
  },
})

const emits = defineEmits(["valueChanged", "settingClicked", "cancel", "save"])

const data = ref(props.model)

const isControllerConnected = computed(() => controls.deviceNames().find(x => x.startsWith("xinput")))
const deviceBindingMask = computed(() => isControllerConnected.value ? "xinput" : undefined)

const onValueChanged = newValue => {
  data.value = newValue
  emits("valueChanged", data.value)
}

const onSaveClicked = () => {
  emits("save", data.value)
}

provide("isControllerConnected", isControllerConnected)
provide("deviceBindingMask", deviceBindingMask)
</script>

<style scoped lang="scss">
.layer-settings {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;

  > .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  > .content {
    width: 100%;
    padding: 0.5rem 1rem;

    :deep(.settings-group) {
      display: flex;
      flex-direction: column;

      &:not(:last-child) {
        margin-bottom: 1rem;
      }

      > .label {
        font-weight: 600;
        user-select: none;
      }

      > .settings-group-items {
        display: flex;
        align-items: center;

        :deep(.prefixed-input) .prefix-suffix-container {
          padding: 0 0.75rem !important;
        }
      }
    }
  }

  > .action-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.5rem 1rem;

    .bng-button {
      margin: 0;
    }
  }
}
</style>
