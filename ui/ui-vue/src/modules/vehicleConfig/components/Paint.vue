<template>
  <Tabs v-if="tabbed" :class="{
    'bng-tabs': true,
    'paint-container-tabs': true,
    'without-background': !withBackground,
  }">
    <Tab
      v-for="(c, idx) in color"
      :heading="$t('ui.trackBuilder.matEditor.paint') + ' ' + (idx + 1)"
      :load-on-demand="true"
    >
      <PaintPicker
        v-model="color[idx]"
        @change="updateColor(idx)"
        :show-preview="false"
        :presets-editable="true"
        :presets="factoryPresets"
        :legacy="legacy"
      />
    </Tab>
  </Tabs>
  <div v-else :class="{
    'paint-container': true,
    'with-background': withBackground,
  }">
    <PaintPicker
      v-for="(c, idx) in color"
      v-model="color[idx]"
      @change="updateColor(idx)"
      :show-preview="false"
      :presets-editable="true"
      :presets="factoryPresets"
      :legacy="legacy"
    >{{ $t("ui.trackBuilder.matEditor.paint") }} {{ idx + 1 }}</PaintPicker>
    <div v-if="color.length % 2 === 1"></div>
  </div>
</template>

<script setup>
import { ref, inject, onUnmounted, nextTick } from "vue"
import { lua } from "@/bridge"
import { Tabs, Tab } from "@/common/components/utility"
import PaintPicker from "./PaintPicker.vue"

const $game = inject("$game")

defineProps({
  withBackground: {
    type: Boolean,
  },
  tabbed: {
    type: Boolean,
    default: true,
  },
  legacy: {
    type: Boolean,
    default: true,
  },
})

const colorDefault = "1 1 1 1 0 1 1 0"
// 0.09 0.21 0.47 1.2 0 1 1 0.06 - default d-series paint

const color = ref([colorDefault, colorDefault, colorDefault])
const factoryPresets = ref({})

function updateColor(index) {
  nextTick(
    () => lua.core_vehicle_colors.setVehicleColor(index, color.value[index])
  )
}

async function fetchDefinedColors() {
  for (let i = 0; i < color.value.length; i++) {
    const promise = i === 0 ? lua.getVehicleColor() : lua.getVehicleColorPalette(i - 1)
    color.value[i] = await promise || colorDefault
  }
  // console.log("fetchDefinedColors", color.value)
}

async function getVehicleColors() {
  const data = await lua.core_vehicles.getCurrentVehicleDetails()
  factoryPresets.value = data.model && data.model.paints ? data.model.paints : {}
  await fetchDefinedColors()
}

$game.events.on("VehicleChange", getVehicleColors)
$game.events.on("VehicleFocusChanged", getVehicleColors)
$game.events.on("VehicleChangeColor", fetchDefinedColors)
onUnmounted(() => {
  $game.events.off("VehicleChange", getVehicleColors)
  $game.events.off("VehicleFocusChanged", getVehicleColors)
  $game.events.off("VehicleChangeColor", fetchDefinedColors)
})
getVehicleColors()
</script>

<style lang="scss" scoped>
.paint-container,
.paint-container-tabs {
  height: 100%;
  overflow: overlay;
}
.paint-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: flex-start;
  padding: 1rem;
  > * {
    width: 48%;
  }

  &.with-background {
    background-color: rgba(0, 0, 0, 0.6);
  }
}

.paint-container-tabs {
  > * {
    width: 100%;
  }
  .tab-content {
    padding: 1rem;
    overflow: auto;
  }

  &.without-background .tab-content {
    background-color: transparent;
  }
}
</style>
