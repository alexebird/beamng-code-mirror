<template>
  <BngIcon span :class="nozzleClass" :type="typeSettings.nozzleIconType" :color="modeSettings.color">
    <BngButton :disabled="!modeSettings.buttonEnabled" :icon="buttonIcon" @mousedown="emits('triggerDown')" @mouseup="emits('triggerUp')" accent="text" />
  </BngIcon>
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
    nozzleIconType: icons.general.fuel_nozzle,
  },
  charge: {
    nozzleIconType: icons.general.recharge_connector,
  },
}
</script>

<script setup>
import { computed } from "vue"
import { BngButton, BngIcon } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const props = defineProps({
  refuelType: {
    type: String,
    required: true,
  },
  nozzleMode: {
    type: String,
    default: "off",
  },
  buttonIcon: {
    type: String,
    default: icons.device.xbox.btn_rt,
  },
})

const emits = defineEmits(["triggerDown", "triggerUp"])

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
    }
  }
  height: 25em !important;
}
</style>
