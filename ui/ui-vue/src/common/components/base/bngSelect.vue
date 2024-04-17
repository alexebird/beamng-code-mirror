<!-- bngSelect - a select box control -->
<template>
  <div class="bng-select">
    <BngButton
      :disabled="disable || isLeftDisabled"
      tabindex="1"
      accent="text"
      @click="changeIndex(-1)"
      :icon="icons.arrowLargeLeft"
      v-bng-sound-class="'bng_click_hover_generic'"
      :mute="$attrs.mute"
      data-testid="previous-btn"></BngButton>
    <template v-if="slots.display">
      <slot name="display"></slot>
    </template>
    <template v-else>
      <span class="label select">{{ current.label }}</span>
      <label flavour></label>
    </template>
    <BngButton
      :disabled="disable || isRightDisabled"
      tabindex="1"
      accent="text"
      @click="changeIndex(1)"
      :icon="icons.arrowLargeRight"
      v-bng-sound-class="'bng_click_hover_generic'"
      :mute="$attrs.mute"
      data-testid="next-btn"></BngButton>
  </div>
</template>

<script setup>
import { ref, computed, watch, useSlots } from "vue"
import { clamp } from "@/utils/maths"
import { vBngSoundClass } from "@/common/directives"
import { BngButton, icons } from "@/common/components/base"

const findOptionValue = (valueToFind, opts) =>
  Math.max(
    0,
    opts.findIndex(opt => props.config.value(opt) === valueToFind)
  )

// if intial value specified, find index of corresponding option - 0 otherwise
const index = ref("value" in props ? findOptionValue(props.value, props.options) : 0)

const current = computed(() => ({
  option: props.options[index.value],
  value: props.config.value(props.options[index.value]),
  label: props.config.label(props.options[index.value]),
}))

const isLeftDisabled = props.loop ? false : computed(() => index.value == 0)
const isRightDisabled = props.loop ? false : computed(() => index.value == props.options.length - 1)

const emit = defineEmits(["valueChanged"])

defineExpose({
  goNext() {
    changeIndex(1)
  },
  goPrev() {
    changeIndex(-1)
  },
})

const props = defineProps({
  value: undefined,
  options: {
    type: Array,
    required: true,
  },
  disable: Boolean,
  loop: Boolean,
  config: {
    type: Object,
    // default is for super simple options where opt = label = value
    default: () => ({
      value: opt => opt,
      label: opt => opt,
    }),
  },
})

const slots = useSlots()

watch(
  () => props.value,
  () => (index.value = props.value ? findOptionValue(props.value, props.options) : 0)
)

watch(index, () => emit("valueChanged", current.value.value, current.value.label, current.value.option))

function changeIndex(offset) {
  if (props.loop) {
    index.value = (props.options.length + index.value + offset) % props.options.length
  } else {
    index.value = clamp(index.value + offset, 0, props.options.length - 1)
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/modules/density";
.bng-select {
  $b-rad: $border-rad-1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  border-radius: $b-rad + 0.25rem;
  padding: 0.25rem;
  height: auto; // Overrided to avoid beamng.controls.css pollution
  background: rgba(black, 0.6);
  & > .label {
    font-size: 1.25rem;
    padding: 0 0.25rem;
    flex: 1 0 auto;
    text-align: center;
    color: white;
    min-width: 3em;
  }
  & > .bng-button {
    flex: 0 0 auto;
    padding-left: 0.25em;
    padding-right: 0.25em;
  }
  & > .select-text {
    flex: 1 0 auto;
  }
  // &.disabled {
  //   opacity: 0.5;
  //   pointer-events: none;
  // }
}
</style>
