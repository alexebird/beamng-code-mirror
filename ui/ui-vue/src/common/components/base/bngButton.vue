<!-- bngButton - a button control -->
<template>
  <button
    ref="btnDOMElRef"
    :accent="accent"
    :class="{ 'show-hold': showHold, 'bng-button': true, empty: !slots.default, 'l-icon': iconLeft || icon, 'r-icon': iconRight }"
  >
    <bng-icon v-if="iconLeft || icon" :type="iconLeft || icon" />
    <template v-if="isPlainTextSlot">
      <span class="label"> 
        <slot />
      </span>
    </template>
    <template v-else-if="!isPlainTextSlot">
      <slot />
    </template>
    <span v-if="label && !isPlainTextSlot" class="label">{{ label }}</span>
    <span v-if="uiNavEvent">{{ uiNavEvent }}</span>
    <bng-icon span v-if="iconRight" :type="iconRight" />
  </button>
</template>

<script>
const accents = ["main", "secondary", "outlined", "text", "attention"]
</script>

<script setup>
import { useSlots, watch, ref, useAttrs, computed } from "vue"
import { BngIcon } from "@/common/components/base"
import { watchUINavEventChange } from "@/services/uiNav"
import useControls from "@/services/controls"
import { UIUnits } from "@/bridge/libs"

const Controls = useControls()
const slots = useSlots()
const value = computed(() => UIUnits.test(props.text))

const uiNavEvent = ref()
const btnDOMElRef = ref()

const attrs = useAttrs()

const unwatch = watchUINavEventChange(btnDOMElRef, ({ eventName, action }) => {})

const isPlainTextSlot = ref(false);
// This function will check if the slot is a single text node
function checkIfPlainText() {
  const slotContent = slots.default ? slots.default() : []
  const isText = slotContent.length === 1 && typeof slotContent[0].type === "symbol" && String(slotContent[0].type).indexOf("v-txt") > -1
  isPlainTextSlot.value = isText && slotContent[0].children.trim().length > 0
}

watch(() => slots.default, checkIfPlainText)
checkIfPlainText()

const props = defineProps({
  accent: {
    type: String,
    default: "main",
    validator: v => accents.includes(v) || v === "",
  },
  iconLeft: String,
  iconRight: String,
  label: String,
  icon: String,
  showHold: Boolean,
})

</script>

<style lang="scss" scoped>
$button-main-enabled: var(--bng-orange-500);
$button-main-active: var(--bng-orange-600);
$button-main-hover: var(--bng-orange-b400);
$button-main-disabled: var(--bng-cool-gray-400);

$button-secondary-enabled: var(--bng-ter-blue-gray-700);
$button-secondary-active: var(--bng-ter-blue-gray-800);
$button-secondary-hover: var(--bng-ter-blue-gray-600);
$button-secondary-disabled: var(--bng-cool-gray-800);

$button-attention-enabled: var(--bng-add-red-600);
$button-attention-active: var(--bng-add-red-800);
$button-attention-hover: var(--bng-add-red-500);
$button-attention-disabled: var(--bng-add-red-800);

$button-text-enabled: var(--bng-black-o2);
$button-text-active: var(--bng-black-o6);
$button-text-hover: var(--bng-orange-700);
$button-text-disabled: var(--bng-black-o2);

$button-outlined-enabled: var(--bng-black-o4);
$button-outlined-active: var(--bng-orange-800);
$button-outlined-hover: var(--bng-orange-600);
$button-outlined-disabled: var(--bng-black-o6);
$button-outlined-border-enabled: var(--bng-cool-gray-600);
$button-outlined-border-active: var(--bng-orange-700);
$button-outlined-border-hover: var(--bng-orange-b400);
$button-outlined-border-disabled: rgba(var(--bng-cool-gray-800-rgb), 0.8);

@import "@/styles/modules/mixins";

/* TODO - make show-hold much better, and take into account button type */
.show-hold {
  background: linear-gradient(
    to right,
    rgba(var(--bng-orange-300-rgb), 0.6) 0%,
    rgba(var(--bng-orange-300-rgb), 1) var(--hold-completion),
    rgba(0, 0, 0, 0) var(--hold-completion),
    rgba(0, 0, 0, 0)
  );
}

.bng-button {
  $f-offset: 0.25rem;
  $rad: $border-rad-1;

  color: white;
  background-color: $button-main-enabled;
  box-sizing: border-box;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.25em;
  min-height: 2em;
  padding: 0.25em 0.5em;
  border: 0;
  border-radius: $rad;
  overflow: visible;
  // border: 0.125rem solid transparent;
  box-shadow: inset 0 0 0 0.125rem transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 0 0 auto;
  // text-align: center;
  & > .label {
    display: inline-block;
    flex: 1 1 auto;
    word-wrap: normal;
    overflow: hidden;
  }

  &:not(.empty) {
    min-width: 6em;
    max-width: 20em;
  }

  & > * {
    flex: 0 0 auto;
  }

  & .bngicon {
    min-width: 1.5em;
    min-height: 1.5em;
  }

  &.l-icon:not(.empty) .bngicon {
    margin-right: 0.2em;
  }
  &.r-icon:not(.empty) .bngicon {
    margin-left: 0.2em;
  }

  @include modify-focus($rad, $f-offset);

  &:focus {
    box-shadow: none;
  }

  &:hover {
    background-color: $button-main-hover;
  }

  &:active {
    background-color: $button-main-active;
  }

  &:disabled {
    background-color: $button-main-disabled;
    opacity: 0.5;
    pointer-events: none;
  }

  &[accent="secondary"] {
    background-color: $button-secondary-enabled;

    &:hover {
      background-color: $button-secondary-hover;
    }

    &:active {
      background-color: $button-secondary-active;
    }

    &:disabled {
      background-color: $button-secondary-disabled;
      opacity: 0.5;
      pointer-events: none;
    }
  }

  &[accent="attention"] {
    background-color: $button-attention-enabled;

    &:hover {
      background-color: $button-attention-hover;
    }

    &:active {
      background-color: $button-attention-active;
    }

    &:disabled {
      background-color: $button-attention-disabled;
      opacity: 0.5;
      pointer-events: none;
    }
  }
  &[accent="outlined"] {
    background-color: $button-outlined-enabled;
    box-shadow: inset 0 0 0 0.125rem $button-outlined-border-enabled;
    // border: 2px solid white;

    &:hover {
      background-color: $button-outlined-hover;
      box-shadow: inset 0 0 0 0.125rem $button-outlined-border-hover;
    }

    &:active {
      background-color: $button-outlined-active;
      box-shadow: inset 0 0 0 0.125rem $button-outlined-border-active;
    }

    &:disabled {
      background-color: $button-outlined-disabled;
      box-shadow: inset 0 0 0 0.125rem $button-outlined-border-disabled;
      opacity: 0.5;
      pointer-events: none;
    }
  }
  &[accent="text"] {
    background-color: $button-text-enabled;

    &:hover {
      background-color: $button-text-hover;
    }

    &:active {
      background-color: $button-text-active;
    }

    &:disabled {
      background-color: $button-text-disabled;
      opacity: 0.5;
      pointer-events: none;
    }
  }
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}
:deep(span[ui-event]) {
  padding-right:5px;
}
</style>
