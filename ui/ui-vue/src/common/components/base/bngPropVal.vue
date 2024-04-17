<!-- bngPropVal - for displaying a key/value pair, optionally with a leading icon -->
<template>
  <div :class="itemClass">
    <BngIcon v-if="iconType" class="icon" :type="iconType" :color="iconColor" />
    <span v-if="keyLabel" class="key-label">{{ keyLabel }}</span>
    <span class="value-label">{{ value }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { BngIcon } from "@/common/components/base"
import { shrinkNum } from "@/utils/format"

const props = defineProps({
  iconType: [String, Object],
  keyLabel: String,
  valueLabel: {
    required: true,
  },
  shrinkNum: Boolean,
  iconColor: {
    type: String,
    default: "#fff",
  },
})

const itemClass = computed(() => ({
  "info-item": true,
  "with-icon": props.iconType,
  "no-key": !props.keyLabel,
}))

const value = computed(() => {
  const i = props.valueLabel
  return props.shrinkNum ? shrinkNum(i, 0) : i
})
</script>

<style lang="scss" scoped>
.info-item {
  display: inline-grid;
  grid-template-columns: auto auto;
  gap: 0.25rem;
  justify-content: flex-start;
  align-items: baseline;
  position: relative;
  padding: 0.25em 0.25em;
  line-height: 1.25em;
  font-family: var(--fnt-defs);
  & > .icon {
    font-size: 1.5em;
    align-self: baseline;
    transform: translateY(0.0625em);
    font-style: normal;
    font-weight: 400 !important;
  }
  &.with-icon {
    grid-template-columns: auto auto auto;
    &.no-key {
      grid-template-columns: auto auto;
    }
  }
  & > :not(:last-child) {
    // margin-right: 0.5em;
  }

  & > * {
    // margin-bottom: 0.125em;
  }

  & > .key-label {
    font-weight: 400;
    color: var(--bng-cool-gray-100);
    padding-right: 0.25rem;
  }

  & > .value-label {
    font-weight: 600;
  }
}
</style>
