<!-- bngPropVal - for displaying a key/value pair, optionally with a leading icon -->
<template>
  <div :class="itemClass">
    <BngIcon v-if="iconType" span class="icon" :title="iconType" :type="iconType" :color="iconColor" />
    <span v-if="keyLabel" class="key-label">{{ keyLabel }}</span>
    <span class="value-label">{{ value }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { BngIcon } from "@/common/components/base"

const props = defineProps({
  iconType: {
    type: String,
    default: null,
  },
  keyLabel: {
    type: String,
    required: false,
  },
  valueLabel: {
    required: true,
  },
  shrinkNum: {
    type: Boolean,
    required: false,
    default: false,
  },
  iconColor: {
    type: String,
    required: false,
    default: "#fff",
  },
})

const itemClass = computed(() => ({
  "info-item": true,
  "with-icon": props.iconType,
}))

function shrinkNum(num, decimals = 0) {
  const units = ["", "K", "M", "B", "T", "Q"]
  if (!num) return "0"
  if (isNaN(parseFloat(num)) || !isFinite(+num)) return "n/a"
  let power = Math.floor(Math.abs(Math.log(+num) / Math.log(1000)))
  if (power >= units.length) power = units.length - 1
  // return (num / Math.pow(1000, power)).toFixed(decimals).replace(/\.?0+$/, "") + units[power]
  return (num / Math.pow(1000, power)).toFixed(decimals).replace(/\.0+$/, "") + units[power]
}

const value = computed(() => {
  const i = props.valueLabel
  if (props.shrinkNum && /^\d+$/.test(i)) return shrinkNum(i, 0)
  return i
})

// const value = ref(props.valueLabel)
// if (props.shrinkNum && /^\d+$/.test(value.value)) {
//   value.value = shrinkNum(value.value, 0)
// }
</script>

<style lang="scss" scoped>
@import "@/styles/modules/mixins";
.info-item {
  display: inline-flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: baseline;
  position: relative;
  padding: 0.25em 0.25em;
  min-width: 4.5em;
  font-family: var(--fnt-defs);
  // max-width: 14em;
  & > .icon {
    width: 1.5em;
    height: 1.5em;
    position: absolute;
    left: 0.25em;
    top: calc(50% - 0.75em);
  }
  &.with-icon {
    padding-left: 1.75em;
  }
  & > :not(:last-child) {
    margin-right: 0.5em;
  }

  & > * {
    margin-bottom: 0.125em;
  }

  & > .key-label {
    font-weight: 400;
    color: var(--bng-cool-gray-100);
  }

  & > .value-label {
    font-weight: 600;
  }
}
</style>
