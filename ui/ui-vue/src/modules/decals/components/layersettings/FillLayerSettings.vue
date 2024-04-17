<template>
  <div class="fill-layer-settings">
    <div class="settings-group name-settings">
      <div class="settings-group-items">
        <BngInput v-model="data.name" :prefix="'Layer Name'" />
      </div>
    </div>
    <div class="settings-group color-preset">
      <div class="label">Vehicle Palette</div>
      <div class="settings-group-items">
        <BngDropdown v-model="data.colorPaletteMapId" :items="colorPaletteSelectOptions" />
        <LayerTile :rgbaColor="[...paint.rgb255, paint.alpha]" class="texture-type" />
      </div>
    </div>
    <div class="settings-group color-settings">
      <div class="settings-group-items">
        <BngColorPicker v-if="colorPalette.canEdit" class="color-picker" v-model="paint" view="simple" @change="onValueChanged" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onBeforeMount } from "vue"
import { BngInput, BngColorPicker, BngDropdown } from "@/common/components/base"
import LayerTile from "../LayerTile.vue"
import Paint from "@/utils/paint"

const props = defineProps({
  model: {
    type: Object,
  },
})

const emit = defineEmits(["valueChanged"])

const paint = reactive(new Paint())
const colorPalette = computed(() => (props.model.colorPaletteMapId >= 0 ? props.model.colorPalettes[props.model.colorPaletteMapId] : {}))
const colorPaletteSelectOptions = computed(() => props.model.colorPalettes.map(x => ({ label: x.label, value: x.value })))

function onValueChanged(value) {
  data.value.color = value.rgba
}

const data = ref(props.model)

watch(
  () => data,
  () => {
    emit("valueChanged", data.value)
  },
  { deep: true }
)

watch(() => colorPalette.value.value, updateTileColor)

onBeforeMount(updateTileColor)

function updateTileColor() {
  if (colorPalette.value.value === 0 && props.model.color) {
    paint.rgba = props.model.color
  } else {
    paint.rgba = colorPalette.value.color
  }
}
</script>

<style scoped lang="scss">
.fill-layer-settings {
  width: 23rem;

  .name-settings :deep(.bng-input-wrapper) {
    flex-grow: 1;
  }

  .color-preset {
    margin-bottom: 0 !important;

    > .settings-group-items {
      align-items: flex-start !important;

      > :deep(.bng-dropdown) {
        flex-grow: 1;
      }
    }
  }

  .color-settings {
    > .settings-group-items {
      align-items: flex-end;
    }

    :deep(.color-picker) {
      span {
        font-size: 0.8rem;
        padding: 0.5rem 0;
      }
    }

    .color-tile {
      width: 5rem;
    }
  }
}
</style>
