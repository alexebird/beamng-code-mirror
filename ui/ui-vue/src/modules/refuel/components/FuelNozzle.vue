<template>
  <BngImageAsset mask :class="nozzleClass" :src="nozzleImageURL" :bg-color="modeSettings.color">
    <BngButton class="empty" :disabled="!modeSettings.buttonEnabled" @mousedown="emit('triggerDown')" @mouseup="emit('triggerUp')" accent="text">
      <BngBinding action="fuelVehicle" deviceMask="xinput" :disabled="!modeSettings.buttonEnabled" accent="text" />
      <BngIcon v-if="!gotGamepad" :type="icons.plus" title="Activate" />
    </BngButton>
  </BngImageAsset>
</template>

<script>
const nozzleModes = {
  on: {
    color: "var(--bng-orange-b400)",
    buttonEnabled: true,
  },
  off: {
    color: "var(--bng-black-o6)",
    buttonEnabled: true,
  },
  disabled: {
    color: "var(--bng-black-o2)",
    buttonEnabled: false,
  },
}

const fuellingModes = {
  fuel: {
    nozzleIconType: oldIcons.general.fuel_nozzle,
  },
  charge: {
    nozzleIconType: oldIcons.general.recharge_connector,
  },
}
</script>

<script setup>
import { computed } from "vue"
import { BngButton, BngImageAsset, BngBinding, BngIcon, icons } from "@/common/components/base"
import { icons as oldIcons } from "@/assets/icons"
import useControls from "@/services/controls"

const Controls = useControls()

const gotGamepad = computed(() => {
  const helper = Controls.makeViewerObj({ action: "fuelVehicle", deviceMask: "xinput" })
  return !!helper
})

const props = defineProps({
  refuelType: {
    type: String,
    required: true,
  },
  nozzleMode: {
    type: String,
    default: "off",
  },
})

const emit = defineEmits(["triggerDown", "triggerUp"])

const nozzleImageURL = computed(() => `icons/${typeSettings.value.nozzleIconType}.svg`)
const typeSettings = computed(() => fuellingModes[props.refuelType])
const modeSettings = computed(() => nozzleModes[props.nozzleMode])
const nozzleClass = computed(() => ({ nozzle: true, [props.refuelType]: true }))
</script>

<style scoped lang="scss">
.nozzle {
  &.charge {
    width: 5em !important;
    & .bng-button {
      display: none;
      top: 34.5%;
      left: 10%;
    }
  }
  &.fuel {
    width: 6.25em !important;
    & .bng-button {
      top: 38.5%;
      left: 34%;
      width: 2.75em;
    }
  }
  height: 25em !important;
}
</style>
