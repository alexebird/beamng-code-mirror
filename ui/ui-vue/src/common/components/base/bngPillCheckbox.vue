<!-- bngPillCheckbox - a pill control as a checkbox -->
<template>
  <span class="bng-pill-checkbox" :class="{ 'show-icon': isChecked && props.markedIcon }">
    <BngPill :marked="isChecked" @click="onChecked" @keyup.space="onChecked">
      <span class="pill-content">
        <slot></slot>
      </span>
      <BngIcon class="pill-mark-icon" :type="props.markedIcon === true ? icons.checkmark : props.markedIcon || icons.checkmark" />
    </BngPill>
  </span>
</template>

<script setup>
import { computed, ref } from "vue"
import { BngPill, BngIcon, icons } from "@/common/components/base"

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: null,
  },
  markedIcon: {
    type: [Boolean, Object],
    default: true,
  },
})

const emit = defineEmits(["update:modelValue", "valueChanged"])

const defaultValue = ref(false)

const isChecked = computed({
  get: () => (props.modelValue !== undefined && props.modelValue !== null ? props.modelValue : defaultValue.value),
  set: newValue => {
    if (props.modelValue !== undefined && props.modelValue !== null) {
      emit("update:modelValue", newValue)
      emit("valueChanged", newValue)
    } else {
      defaultValue.value = newValue
      emit("valueChanged", newValue)
    }
  },
})

const onChecked = () => (isChecked.value = !isChecked.value)
</script>

<style scoped lang="scss">
@keyframes growIcon {
  from {
    transform: scale(0) translateY(0.0625em);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0.0625em);
    opacity: 1;
  }
}

.bng-pill-checkbox {
  :deep(.bng-pill) {
    display: inline-flex;
    justify-content: center;
    align-items: baseline;
    transition: all 120ms ease-in;
    padding: 0.4em 0;

    > .pill-content {
      user-select: none;
      flex: 0 0 auto;
      padding: 0;
      padding-left: 1em;
      padding-right: 1em;
      transition: all 120ms ease-in;
    }

    > .pill-mark-icon {
      font-size: 1.25em;
      display: inline-block;
      padding-right: 0.75em;
      user-select: none;
      width: 0;
      overflow: hidden;
      padding: 0;
      transition: all 120ms ease-in;
      flex: 0 0 0.0001%;
    }
  }

  &.show-icon > .bng-pill {
    > .pill-content {
      padding-left: 1em;
      padding-right: 0.125em;
      transition: all 120ms ease-in;
    }

    > .pill-mark-icon {
      display: inline-block;
      width: 1.5em;
      flex: 0 0 1.5em;
      padding-right: 0.75em;
      animation: growIcon 120ms ease forwards;
    }
  }

  &[disabled] {
    pointer-events: none;
  }
}
</style>
