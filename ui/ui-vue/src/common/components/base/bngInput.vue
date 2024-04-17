<!-- bngInput - an input control -->
<template>
  <div class="bng-input-wrapper" :class="{ disabled: disabled }">
    <span v-if="externalLabel" :style="[leadingIcon ? { 'margin-left': '3em' } : {}]" class="external-label" data-testid="external-label">
      {{ externalLabel }}
    </span>
    <div class="icons-input-wrapper">
      <BngIcon v-if="leadingIcon" class="outside-icon" :type="leadingIcon" data-testid="leading-icon" />
      <!-- bng-highlight-container is required for focus highlight because bng-input-container
           has overflow hidden for the prefix, suffix or trailing icon to respect the border radius -->
      <div tabindex="disabled ? -1 : 0" class="bng-highlight-container" :class="{ 'bng-input-focused': isInputFieldFocused, 'has-error': hasError }">
        <div class="bng-input-container">
          <span v-if="prefix" class="prefix-suffix-container">
            <span data-testid="prefix">{{ prefix }}</span>
          </span>
          <div class="bng-input-group">
            <input
              ref="input"
              class="bng-input"
              :class="{ 'bng-input-empty': !hasValue, 'bng-input-error': hasError }"
              data-testid="input"
              :value="value"
              :type="type"
              :min="numMin"
              :max="numMax"
              :step="numStep"
              @input="onValueChanged"
              @focusin="onInputFieldFocusIn"
              @focusout="onInputFieldFocusOut"
              :disabled="disabled"
              :readonly="readonly"
              v-bng-text-input />
            <div v-if="type === 'number'" class="number-actions">
              <BngIcon
                :type="iconsByTag.arrow.arrowLargeLeft"
                :class="{ 'number-action-disabled': readonly }"
                class="number-action up-action"
                v-bng-click="{ clickCallback: onArrowUpClicked, holdCallback: onArrowUpClicked }" />
              <BngIcon
                :type="iconsByTag.arrow.arrowLargeRight"
                class="number-action down-action"
                :class="{ 'number-action-disabled': readonly }"
                v-bng-click="{ clickCallback: onArrowDownClicked, holdCallback: onArrowDownClicked }" />
            </div>
            <span v-if="floatingLabel" class="floating-label" data-testid="floating-label">
              {{ floatingLabel }}
            </span>
            <span class="input-border"></span>
          </div>
          <span v-if="suffix" class="prefix-suffix-container">
            <span data-testid="suffix">{{ suffix }}</span>
          </span>
          <span v-if="trailingIcon && !trailingIconOutside" class="trailing-icon">
            <BngIcon :type="trailingIcon" class="input-icon" data-testid="trailing-icon" />
          </span>
        </div>
      </div>
      <BngIcon v-if="trailingIcon && trailingIconOutside" :type="trailingIcon" class="outside-icon" data-testid="external-trailing-icon" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { BngIcon } from "@/common/components/base"
import { iconsByTag } from "@/common/components/base/bngIcon.vue"
import { vBngClick, vBngTextInput } from "@/common/directives"
import { roundDec } from "@/utils/maths"
import { useDirty } from "@/services/dirty"

const props = defineProps({
  modelValue: [String, Number],
  type: {
    type: String,
    default: "text",
    validator(value) {
      return ["text", "number"].includes(value)
    },
  },

  // only applicable if type is number
  min: Number,
  max: Number,
  step: {
    type: Number,
    default: 1,
  },

  readonly: Boolean,

  floatingLabel: String,
  externalLabel: String,
  placeholder: String,
  initialValue: String,
  leadingIcon: Object,
  prefix: String,
  suffix: String,
  trailingIcon: Object,
  trailingIconOutside: Boolean,
  disabled: Boolean,
  validate: Function,
  errorMessage: {
    type: String,
    default: "Error",
  },
})

const emitter = defineEmits(["valueChanged", "update:modelValue"])
const input = ref()
const value = ref(props.initialValue || props.modelValue)
const isInputFieldFocused = ref(false)

const numMin = computed(() => (props.type === "number" ? props.min : null))
const numMax = computed(() => (props.type === "number" ? props.max : null))
const numStep = computed(() => (props.type === "number" ? props.step : null))

const hasValue = computed(() => value.value !== "" && value.value !== undefined && value.value !== null)
const hasError = computed(() => (typeof props.validate === "function" ? !props.validate(value.value) : false))

if (props.type === "number") {
  const type = typeof value.value
  if (type === "string" && /^\d+(?:\.?\d+)?$/.test(value.value)) value.value = +value.value
  else if (type !== "number") value.value = 0
  if (numMin.value > numMax.value) console.error("BngInput: min cannot be greater than max")
}

defineExpose(useDirty(value))

watch(
  () => props.modelValue,
  () => (value.value = props.modelValue)
)

let lastNotify = props.modelValue
function notify(val) {
  if (props.readonly || lastNotify === val) return
  lastNotify = val
  emitter("update:modelValue", val)
  emitter("valueChanged", val)
}

function numClamp(val) {
  // floating point error fix
  val = roundDec(val, 15)
  // validate
  if (typeof numMin.value === "number" && val < numMin.value) val = numMin.value
  if (typeof numMax.value === "number" && val > numMax.value) val = numMax.value
  return val
}

function onArrowUpClicked() {
  let val = numClamp(+value.value + numStep.value)
  value.value = val
  input.value = val
  notify(val)
}

function onArrowDownClicked() {
  let val = numClamp(+value.value - numStep.value)
  value.value = val
  input.value = val
  notify(val)
}

function onValueChanged($event) {
  let val = $event.target.value
  if (props.type === "number") {
    val = +val
    let prev = val
    val = numClamp(val)
    if (val !== prev) input.value = val
  }
  value.value = val
  notify(val)
}

function onInputFieldFocusIn() {
  isInputFieldFocused.value = true
}

function onInputFieldFocusOut() {
  isInputFieldFocused.value = false
  notify(value.value)
}
</script>

<style scoped lang="scss">
// START RESET

.bng-input {
  color: initial;
  background-color: initial;
  border-width: initial;
  border-radius: initial;
  padding: initial;
  transition: initial;
  -webkit-tap-highlight-color: initial;
  &[type="number"] {
    appearance: textfield;
  }
}

*:focus::before {
  content: none;
  display: initial;
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
$default-bottom-border-color: grey;
$default-bottom-border-width: 1px;

$disabled-text-color: white;
$disabled-background-color: rgba(116, 116, 116, 0.5);
$disabled-label-color: #cdcdcd;
$disabled-input-border-color: #808080;

$has-error-text-color: white;
$has-error-background-color: rgba(153, 0, 0, 0.2);
$has-error-label-color: red;
$has-error-input-border-color: red;

$focused-outline-color: #ff6600;
$focused-background-color: rgba(0, 0, 0, 0.2);
$focused-label-color: #b8937a;
$focused-input-border-color: #ff6600;
$focused-bottom-border-width: 2px;

$has-value-label-color: #808080;
$has-value-input-border-color: grey;

$input-container-background-color: rgba(0, 0, 0, 0.2);
$prefix-suffix-background-color: rgba(0, 0, 0, 0.4);
$min-input-width: 7em;
$input-border-z-index: 1;
$input-height: 2.5em;

$icon-border-z-index: 1;
$icon-max-height: 1.5em;

* {
  box-sizing: border-box;
}

%input-focus-highlight {
  content: "";
  position: absolute;
  display: block;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -4px;
  border: 1px solid $focused-outline-color;
  border-radius: $focused-bottom-border-width;
}

.bng-input-wrapper {
  display: flex;
  flex-direction: column;

  &.disabled {
    pointer-events: none;
  }

  > .external-label {
    display: inline-block;
    padding: 4px 0;
  }

  > .icons-input-wrapper {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    align-items: center;
    height: $input-height;

    > .outside-icon {
      padding: 0 0.5em;
      //height: 1.5em;
      font-size: 1.25em;
    }

    .input-icon {
      display: inline-block;
      max-height: $icon-max-height;
      // height: 1.5em;
      width: 1.5em;
      text-align: center;
      font-size: 1.25em;
    }
  }
}

// set input container highlight on focus
.bng-highlight-container {
  position: relative;
  flex-grow: 1;
  height: 100%;

  &.bng-input-focused {
    > .bng-input-container {
      // bng-input-group container border at the bottom
      &::after,
      // trailing icon border at the bottom
      > .trailing-icon::before,
      > .bng-input-group > .input-border {
        height: $focused-bottom-border-width;
        background: $focused-input-border-color;
      }
    }
  }
}

.bng-input-container {
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  background-color: $input-container-background-color;
  border-radius: 0.25em 0.25em 0 0;
  overflow: hidden;

  // border at the bottom
  &::after {
    content: "";
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: $default-bottom-border-width;
    background-color: $default-bottom-border-color;
  }

  > .bng-input-group {
    position: relative;
    flex-grow: 1;
    height: 100%;

    .bng-input {
      display: inline-block;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0.5em 0.25em;
      background-color: transparent;
      border: none;
      color: $default-text-color;
      font-size: 1em;

      ~ .number-actions {
        position: absolute;
        right: 0.25em;
        top: 0.25em;
        display: flex;
        flex-direction: column;
        height: 100%;

        .number-action {
          display: inline-block;
          font-size: 1em;
          cursor: pointer;
          line-height: 100%;

          &:active {
            background-color: $focused-outline-color !important;
          }

          &.number-action-disabled {
            pointer-events: none;
            opacity: 0.5;
          }
        }

        > .up-action,
        > .down-action {
          transform: rotate(90deg);
        }
      }

      // States
      &.bng-input-empty {
        ~ .floating-label {
          top: calc(50% - 0.625em);
          left: 0.25em;
          font-size: 1em;
        }
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      // Only set floating label when at the top to red
      &.bng-input-error:not(.bng-input-empty) {
        ~ .floating-label {
          color: red;
        }
      }

      &.bng-input-error {
        background-color: $has-error-background-color;

        ~ .input-border {
          background-color: $has-error-input-border-color;
        }
      }
    }

    > .floating-label {
      position: absolute;
      pointer-events: none;
      top: 0;
      left: 0.5em;
      font-size: 0.7em;
    }

    > .input-border {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: $default-bottom-border-width;
      background-color: $default-input-border-color;
      z-index: $input-border-z-index;
    }
  }

  > .prefix-suffix-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: $prefix-suffix-background-color;
    padding: 0 0.25em;
  }

  > .trailing-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 0.25em;

    // trailing icon border at the bottom
    &::before {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: $default-bottom-border-width;
      background-color: $default-input-border-color;
      z-index: $icon-border-z-index;
    }
  }
}
</style>
