<!-- bngMultilineInput - a multiline input control -->
<template>
  <div class="input-icon-wrapper" :class="{ scalable: scalable }">
    <span v-if="leadingIcon" ref="leadingIconContainer" class="input-icon">
      <bng-icon :type="leadingIcon" />
    </span>
    <div
      ref="inputContainer"
      class="bng-multiline-input"
      tabindex="0"
      :class="{
        'input-focused': isInputFieldFocused,
        'has-error': hasError,
      }"
    >
      <textarea
        v-model="value"
        ref="bngMultilineInput"
        class="input-field"
        :class="{
          empty: !hasValue,
          'has-value': hasValue,
          'has-error': hasError,
          disabled: disabled,
        }"
        :rows="lines"
        :placeholder="floatingLabel"
        :disabled="disabled"
        @focusin="onInputFieldFocusIn"
        @focusout="onInputFieldFocusOut"
      ></textarea>
      <span v-if="floatingLabel" class="floating-label">{{ floatingLabel }}</span>
      <span ref="focusHighlight" class="focus-highlight"></span>
    </div>
    <span v-if="trailingIcon" ref="trailingIconContainer" class="input-icon">
      <bng-icon :type="trailingIcon" />
    </span>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onDeactivated, onMounted, ref } from "vue"
import { BngIcon } from "@/common/components/base/index"

const props = defineProps({
  floatingLabel: String,
  externalLabel: String,
  placeholder: String,
  initialValue: String,
  leadingIcon: String,
  trailingIcon: String,
  scalable: Boolean,
  hasError: Boolean,
  errorMessage: String,
  lines: {
    type: Number,
    default: 1,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const inputContainer = ref(null)
const bngMultilineInput = ref(null)
const focusHighlight = ref(null)
const leadingIconContainer = ref(null)
const trailingIconContainer = ref(null)
const value = ref("")
const isInputFieldFocused = ref(false)

const hasValue = computed(() => value.value !== "" && value.value !== undefined)
const bngScalableInputMaxWidth = computed(() => {
  const leadingIconWidth = leadingIconContainer.value.offsetWidth
  const trailingIconWidth = trailingIconContainer.value.offsetWidth
  return `${leadingIconWidth + trailingIconWidth}px`
})

let resizeObserver

onBeforeMount(() => {
  value.value = props.initialValue
  resizeObserver = new ResizeObserver(onInputResize)
})

onMounted(() => {
  resizeObserver.observe(bngMultilineInput.value)
})

onDeactivated(() => {
  resizeObserver.disconnect()
})

function onInputFieldFocusIn() {
  isInputFieldFocused.value = true
}

function onInputFieldFocusOut() {
  isInputFieldFocused.value = false
}

function onInputResize() {
  if (inputContainer.value === null) return

  window.requestAnimationFrame(() => {
    const focusRight = inputContainer.value.offsetWidth - inputContainer.value.offsetWidth

    focusHighlight.value.style.right = `${focusRight - 2}px`
  })
}
</script>

<style scoped lang="scss">
// START RESET
input {
  color: initial;
  background-color: initial;
  border-width: initial;
  border-radius: initial;
  padding: initial;
  -webkit-tap-highlight-color: initial;
}

.bng-multiline-input:focus::before {
  content: none;
  display: initial;
  outline: initial;
  position: initial;
  top: initial;
  bottom: initial;
  left: initial;
  right: initial;
  border-radius: initial;
  border: initial;
  pointer-events: initial;
  z-index: initial;
}
// END RESET

$default-text-color: white;
$default-background-color: rgba(0, 0, 0, 0.2);
$default-label-color: #ccc;
$default-input-border-color: white;
$default-bottom-border-width: 1px;

$disabled-text-color: white;
$disabled-background-color: rgba(116, 116, 116, 0.5);
$disabled-label-color: #cdcdcd;
$disabled-input-border-color: #808080;

$has-error-background-color: rgba(153, 0, 0, 0.2);
$has-error-label-color: red;
$has-error-input-border-color: red;
$tooltip-background-color: rgba(red, 0.7);

$focused-outline-color: #ff6600;
$focused-background-color: rgba(0, 0, 0, 0.2);
$focused-label-color: #b8937a;
$focused-input-border-color: #ff6600;
$focused-bottom-border-width: 2px;

$has-value-input-border-color: grey;

$min-input-width: 7em;
$input-height: 2.5em;

* {
  box-sizing: border-box;
}

.input-icon-wrapper {
  display: flex;
  align-items: center;
  width: 100%;

  &.scalable {
    width: calc(100% - v-bind(bngScalableInputMaxWidth));

    > .bng-multiline-input {
      width: initial;
      max-width: calc(100% - v-bind(bngScalableInputMaxWidth));

      > .input-field {
        resize: both;
        max-width: 100%;
        min-height: $input-height;
        min-width: $min-input-width;
      }
    }
  }

  > .input-icon > img {
    display: inline-block;
    padding: 0 0.5em;
    height: 1.5em;
  }
}

.bng-multiline-input {
  position: relative;
  width: 100%;
  max-width: 100%;

  &.input-focused {
    background: $focused-background-color;
  }

  &.input-focused,
  &:focus {
    > .focus-highlight {
      content: "";
      display: inline-block;
      position: absolute;
      left: -3px;
      top: -3px;
      bottom: -4px;
      border: 1px solid $focused-outline-color;
      border-radius: $focused-bottom-border-width;
      pointer-events: none;
    }

    > .floating-label {
      color: $focused-label-color;
    }
  }

  > .input-field {
    width: 100%;
    background: $default-background-color;
    border: none;
    border-top: 0.75em solid transparent;
    border-bottom: $default-bottom-border-width solid $default-input-border-color;
    border-radius: 0.25em 0.25em 0 0;
    padding: 0.25em;
    padding-top: 0;
    color: $default-text-color;
    font-size: 1em;
    resize: none;

    &:focus {
      border-bottom: $focused-bottom-border-width solid $focused-input-border-color !important;
    }

    &.empty {
      ~ .floating-label {
        visibility: hidden;
      }
    }

    &.has-value {
      border-bottom-color: $has-value-input-border-color;
    }

    // Only set floating label when at the top to red
    &.has-error:not(.empty) {
      ~ .floating-label {
        color: red;
      }
    }

    &.has-error {
      background-color: $has-error-background-color;
      border-bottom-color: $has-error-input-border-color;
    }

    &.disabled {
      background-color: $disabled-background-color;
      color: $disabled-text-color;
      border-bottom-color: $disabled-input-border-color;
      border-bottom-width: $default-bottom-border-width;
      resize: none;

      &::placeholder {
        color: $disabled-label-color;
      }

      ~ .floating-label {
        color: $disabled-label-color !important;
      }

      ~ .focus-highlight {
        display: none;
      }
    }

    &::-webkit-scrollbar {
      display: none;
    }

    &::placeholder {
      color: $default-label-color;
      font-size: 18px;
      font-weight: 400;
    }
  }

  > .floating-label {
    position: absolute;
    pointer-events: none;
    top: 0;
    left: 0.5em;
    font-size: 0.5em;
    color: $default-label-color;
  }
}
</style>
