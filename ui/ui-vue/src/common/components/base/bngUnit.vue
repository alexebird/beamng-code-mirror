<!-- bngUnit - for displaying game units in a standard way -->
<template>
  <SlotSwitcher v-bind="attrs" :slotId="unit.type">
    <template #xp="props">
      <BngPropVal v-bind="props" :iconType="icons.general.beamXP" :valueLabel="formattedValue" />
    </template>

    <template #beambucks="props">
      <BngPropVal v-bind="props" :iconType="icons.general.beambuck" :valueLabel="formattedValue" />
    </template>

    <template #stars="props">
      <BngPropVal v-bind="props" :iconType="icons.general.star" :valueLabel="formattedValue" :icon-color="defaultColors.stars" />
    </template>

    <template #bonusstars="props">
      <BngPropVal v-bind="props" :iconType="icons.general.star_outlined" :valueLabel="formattedValue" :icon-color="defaultColors.bonusstars" />
    </template>

    <template #unknown="props">
      <span v-bind="props">BngUnit: Unknown unit type or no type specified</span>
    </template>
  </SlotSwitcher>
</template>

<script>
import { icons } from "@/common/components/base/bngIcon.vue"
const toInt = v => ~~+v
</script>

<script setup>
import { computed, useAttrs } from "vue"
import { BngPropVal } from "@/common/components/base"
import { SlotSwitcher } from "@/common/components/utility"
import { useBridge } from "@/bridge"

const { units } = useBridge()

const knownUnits = {
  xp: { formatter: toInt },
  beambucks: { formatter: units.beamBucks },
  stars: { formatter: toInt },
  bonusstars: { formatter: toInt }
}

//TODO: Find a better way to pass these to BngPropVal since these values duplicate the css colors yellow-200 and blue-400
const defaultColors = {
  stars: "#dac434",
  bonusstars: "#5f9df9"
}

const attrs = useAttrs(),
  unit = computed(() => {
    for (const key of Object.keys(attrs)) if (key in knownUnits) return { type: key, value: attrs[key], ...knownUnits[key], ...props.options }
    return { type: "unknown" }
  }),
  formattedValue = computed(() => (typeof unit.value.formatter === "function" ? unit.value.formatter(unit.value.value) : unit.value.value)),
  props = defineProps({ options: Object })
</script>
