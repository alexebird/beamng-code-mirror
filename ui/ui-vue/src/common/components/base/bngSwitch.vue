<!-- bngSwitch - a switch (checkbox-like) control -->
<template>
  <div
    v-if="slots.default"
    class="bng-labeled-switch"
    :class="{ 'switch-on': toggleValue }"
    v-bng-disabled="disabled"
    @click="onValueChanged"
    @keyup.space="onValueChanged"
  >
    <div class="bng-switch-wrapper">
      <div class="bng-switch"></div>
    </div>
    <div class="bng-switch-label">
      <slot></slot>
    </div>
  </div>
  <div
    v-else
    class="bng-switch-wrapper"
    :class="{ 'switch-on': toggleValue }"
    v-bng-disabled="disabled"
    @click="onValueChanged"
    @keyup.space="onValueChanged"
  >
    <div class="bng-switch"></div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount, useSlots } from "vue"
import { vBngDisabled } from "@/common/directives"

const toggleValue = ref(false)
const props = defineProps({
  modelValue: Boolean,
  checked: Boolean,
  disabled: Boolean,
})
const emit = defineEmits(["valueChanged", "update:modelValue"])
const slots = useSlots()

onBeforeMount(init)
watch(() => props.modelValue, init)
watch(() => props.checked, init)
watch(() => props.disabled, init)
function init() {
  toggleValue.value = props.disabled ? false : (props.checked || props.modelValue)
}

function onValueChanged() {
  if (props.disabled) return

  toggleValue.value = !toggleValue.value
  emit("valueChanged", toggleValue.value)
  emit("update:modelValue", toggleValue.value)
}
</script>

<style scoped lang="scss">
// START RESET
// .bng-switch:focus::before, .bng-labeled-switch:focus::before, .bng-switch-wrapper:focus::before {
//   content: none;
// }
// END RESET

$highlight-color: var(--bng-orange-b400);
$highlight-width: 0.125em;
$knob-background-color: var(--bng-cool-gray-600);
$knob-enabled-background-color: var(--bng-orange-600);
$knob-disabled-background-color: var(--bng-cool-gray-700);
$knob-color: white;
$knob-disabled-color: var(--bng-cool-gray-800);
$label-color: white;
$label-disabled-color: var(--bng-cool-gray-700);
$enabled-background-color: (var(--bng-cool-gray-700));
$default-background-color: transparent;

%switch-on {
  background: $knob-enabled-background-color;
  border-color: transparent;
  background-clip: padding-box;

  &::after {
    left: 0.5em;
  }
}

%switch-disabled {
  background: $knob-disabled-background-color;
  border-color: transparent;
  background-clip: padding-box;

  &::after {
    background: $knob-disabled-color;
  }
}

.bng-switch-wrapper {
  display: flex;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.375rem 0.125rem;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.bng-labeled-switch {
  position: relative;
  display: inline-flex;
  padding: 0.25rem 1rem 0.25rem 0.5rem;
  align-items: center;
  border-radius: 0.45em;
  cursor: pointer;
  border: 0.125em solid transparent;
  background-clip: padding-box;

  > .bng-switch-wrapper {
    margin-right: 0.5rem;
  }

  > .bng-switch-label {
    color: $label-color;
    user-select: none;
    -webkit-user-select: none;
  }

  &.switch-on {
    background: $enabled-background-color;

    & > .bng-switch-wrapper > .bng-switch {
      @extend %switch-on;
    }

    &:focus {
      background: $enabled-background-color;
    }
  }

  &[disabled] {
    > .bng-switch-wrapper > .bng-switch {
      @extend %switch-disabled;
    }

    > .bng-switch-label {
      color: $label-disabled-color;
    }

    &:focus::before {
      content: none;
    }
  }

  &:focus::before {
    border-radius: 0.625rem;
  }
}

.bng-switch-wrapper {
  cursor: pointer;
  &:focus::before {
    content: none;
  }
  &:not([disabled]):focus {
    & > .bng-switch::before {
      content: "";
      display: block;
      position: absolute;
      top: -0.25rem;
      bottom: -0.25rem;
      left: -0.25rem;
      right: -0.25rem;
      border-radius: 1rem;
      border: 0.125rem solid var(--bng-orange-b400);
      pointer-events: none;
      z-index: var(--zorder_main_menu_navigation_focus);
    }
  }

  &.switch-on {
    & > .bng-switch {
      @extend %switch-on;
    }
  }

  &[disabled] {
    & > .bng-switch {
      @extend %switch-disabled;
    }
  }
}

.bng-switch {
  // display: flex;
  position: relative;
  height: 0.75rem;
  width: 1.25rem;
  padding: 0.0625rem 0.0625rem 0.0625rem 0.0625rem;
  justify-content: flex-start;
  align-items: center;
  background: $knob-background-color;
  border-radius: 2rem;

  &::after {
    position: absolute;
    display: block;
    top: 0.0625rem;
    left: 0.0625rem;
    content: "";
    border-radius: 50%;
    background: white;
    width: 0.625rem;
    height: 0.625rem;
    transition: all 0.15s ease-in-out;
  }
}
</style>
