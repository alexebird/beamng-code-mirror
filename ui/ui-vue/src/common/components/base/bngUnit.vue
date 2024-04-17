<!-- bngUnit - for displaying game units in a standard way -->
<template>
  <SlotSwitcher v-bind="attrs" :slotId="unit.type">
    <template #xp="props">
      <BngPropVal v-bind="props" :iconType="icons.beamXPLo" :valueLabel="formattedValue" />
    </template>

    <template #beambucks="props">
      <BngPropVal v-bind="props" :iconType="icons.beamCurrency" :valueLabel="formattedValue" />
    </template>

    <template #stars="props">
      <BngPropVal v-bind="props" :iconType="icons.star" :valueLabel="formattedValue" :icon-color="defaultColors.stars" />
    </template>

    <template #bonusstars="props">
      <BngPropVal v-bind="props" :iconType="icons.starSecondary" :valueLabel="formattedValue" :icon-color="defaultColors.bonusstars" />
    </template>

    <template #unknown="props">
      <span v-bind="props">BngUnit: Unknown unit type or no type specified</span>
    </template>
  </SlotSwitcher>
</template>

<script>
import { icons } from "@/common/components/base"
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
  bonusstars: { formatter: toInt },
}

const defaultColors = {
  stars: "var(--bng-ter-yellow-200)", //"#dac434",
  bonusstars: "var(--bng-add-blue-400)", //"#5f9df9"
}

const attrs = useAttrs(),
  unit = computed(() => {
    for (const key of Object.keys(attrs)) if (key in knownUnits) return { type: key, value: attrs[key], ...knownUnits[key], ...props.options }
    return { type: "unknown" }
  }),
  formattedValue = computed(() => (typeof unit.value.formatter === "function" ? unit.value.formatter(unit.value.value) : unit.value.value)),
  props = defineProps({ options: Object })
</script>
