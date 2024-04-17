<!-- bngButton - a button control -->
<template>
  <button
    ref="btnDOMElRef"
    :accent="accent"
    :class="{ 'show-hold': showHold, 'bng-button': true, empty: !slots.default && !label, 'l-icon': iconLeft || icon, 'r-icon': iconRight }">
    <BngOldIcon v-if="useOldIcons && (iconLeft || icon)" :type="iconLeft || icon" />
    <BngIcon class="icon" v-else-if="!useOldIcons && (iconLeft || icon)" :type="iconLeft || icon" />
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
    <BngOldIcon span v-if="useOldIcons && iconRight" :type="iconRight" />
    <BngIcon class="icon" v-else-if="!useOldIcons && iconRight" :type="iconRight" />
  </button>
</template>

<script>
const ACCENTS = ["main", "secondary", "outlined", "text", "attention"]
</script>

<script setup>
import { useSlots, watch, ref, useAttrs, computed } from "vue"
import { BngOldIcon, BngIcon } from "@/common/components/base"
import { watchUINavEventChange } from "@/services/uiNav"

const slots = useSlots()

const uiNavEvent = ref()
const btnDOMElRef = ref()

const attrs = useAttrs()
const useOldIcons = computed(() => "oldIcons" in attrs)

const unwatch = watchUINavEventChange(btnDOMElRef, ({ eventName, action }) => {})

const isPlainTextSlot = ref(false)
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
    validator: v => ACCENTS.includes(v) || v === "",
  },
  iconLeft: [Object, String],
  iconRight: [Object, String],
  label: String,
  icon: [Object, String], // string is used if oldIcons attribute is specified
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

$button-text-enabled: var(--bng-black-o4);
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

$hold-preroll: 0.3; // starting value (when changing this, check on different button widths)
$hold-preroll-shift: calc($hold-preroll / 2); // how much should it rotate for a preroll (CCW)
$hold-width: 0.25em;

.show-hold::after {
  content: "";
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  line-height: 0;
  pointer-events: none;
  opacity: 0;
  border-radius: $border-rad-1;
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% 100%,
    0% 100%,
    0% 0%,
    calc(0% + $hold-width) calc(0% + $hold-width),
    calc(0% + $hold-width) calc(100% - $hold-width),
    calc(100% - $hold-width) calc(100% - $hold-width),
    calc(100% - $hold-width) calc(0% + $hold-width),
    calc(0% + $hold-width) calc(0% + $hold-width)
  );
  background-color: #fff0;
  --hold-val: calc(#{$hold-preroll} + var(--hold-completion, 0) * #{1 - $hold-preroll});
  background-image: conic-gradient(
    from calc(-#{$hold-preroll-shift}turn + var(--hold-completion, 0) * #{$hold-preroll-shift}turn),
    #fff0 0turn,
    #fff calc(var(--hold-val) * 1turn),
    transparent calc(var(--hold-val) * 1turn) 1turn
  );
}
.show-hold:focus:not(:active):not(.hold-active)::after {
  transition: opacity 1.5s, background-color 1.5s;
}
.show-hold:active,
.show-hold.hold-active {
  &::after {
    opacity: 1;
    background-color: #fff6;
    transition: background-color 400ms;
  }
}

.bng-button {
  $f-offset: 0.25rem;
  $rad: $border-rad-1;

  color: white;
  background-color: $button-main-enabled;
  box-sizing: border-box;
  font-family: var(--fnt-defs);
  font-size: 1rem; // default value to be overriden with the parent component's styles
  line-height: 1.5rem; // default value to be overriden with the parent component's styles
  // min-height: 2em; Button size should be driven by the line-height. If you need it to be taller - override the line-height
  padding: 0.5em;
  padding-top: 0.3em;
  padding-bottom: 0.45em; // move the text up a little to compensate for lowercase alignment
  border: 0;
  border-radius: $rad; // Focus frame radius uses this variable to adjust, keep it
  overflow: visible;
  // border: 0.125rem solid transparent; // Avoid using borders here as they mess with sizing
  box-shadow: inset 0 0 0 0.125rem transparent;
  display: inline-flex;
  flex-flow: row nowrap;
  // display: grid;
  // grid-template-rows: 1fr;
  align-items: baseline;
  justify-content: center;
  position: relative;
  flex: 0 0 auto;
  .icon {
    align-self: baseline;
    font-size: 1.5em;
    transform: translateY(0.0625em);
    font-style: normal;
    font-weight: 500;
  }
  &.allcaps {
    text-transform: uppercase;
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
    & > .label {
      padding-left: 0.125rem;
      padding-right: 0.125rem;
    }
    .icon {
      transform: none;
    }
  }
  &.large {
    font-family: "Overpass", var(--fnt-defs);
    font-size: 1.5rem;
    line-height: 1.75rem;
    font-weight: 700;
    font-style: italic;
    padding-top: 0.35em;
    padding-bottom: 0.4em;
    .icon {
      font-weight: 500;
    }
  }
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

  &.l-icon:not(.empty) {
    text-align: left;
    .icon {
      padding-right: 0.2em;
    }
    .bngicon {
      margin-right: 0.2em;
    }
  }
  &.r-icon:not(.empty) {
    .icon {
      padding-left: 0.2em;
    }
    .bngicon {
      margin-left: 0.2em;
    }
  }

  @include modify-focus($rad, $f-offset); // Focus frame offset is set here, with this mixin

  &:focus {
    box-shadow: none;
  }

  &:hover {
    background-color: $button-main-hover;
  }

  &:active,
  &.hold-active {
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

    &:active,
    &.hold-active {
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

    &:active,
    &.hold-active {
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

    &:active,
    &.hold-active {
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

    &:active,
    &.hold-active {
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
  padding-right: 5px;
}
/* HACK ALERT: fixes button highlight z order error */
:focus::before {
  z-index: auto !important;
}
</style>
