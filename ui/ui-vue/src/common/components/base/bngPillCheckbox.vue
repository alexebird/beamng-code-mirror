<!-- bngPillCheckbox - a pill control as a checkbox -->
<template>
  <span class="bng-pill-checkbox" :class="{'show-icon': isChecked && props.markedIcon}">
    <bng-pill :marked="isChecked" @click="onChecked" @keyup.space="onChecked">
      <span class="pill-content">
        <slot></slot>
      </span>
      <bng-icon class="pill-mark-icon" :type="(props.markedIcon===true) ? icons.general.check : (props.markedIcon||icons.general.check) " />
    </bng-pill>
  </span>
</template>

<script setup>
import { ref, watch } from "vue";
import { BngPill, BngIcon } from "@/common/components/base";
import { icons } from "@/common/components/base/bngIcon.vue"

const props = defineProps({
  marked: {
    type: Boolean,
    default: false
  },
  markedIcon: {
    default: true
  }
})

const emits = defineEmits(['valueChanged'])

defineExpose({setValue})

const isChecked = ref(props.marked)

watch(() => props.marked, (newValue) => setValue(newValue))

/* Public Functions */
function setValue(newValue) {
  isChecked.value = newValue
}

/* Private Functitons */
function onChecked() {
  setValue(!isChecked.value)
  emits('valueChanged', isChecked.value)
}
</script>

<style scoped lang="scss">
.bng-pill-checkbox {
  :deep(.bng-pill) {
    display: inline-flex;
    justify-content: center;
    align-items: center;

    > .pill-content {
      padding: 0 9px;
      user-select: none;
    }

    > .pill-mark-icon {
      width: 16px;
      height: 16px;
      display: none;
      margin-left: 2px;
    }
  }

  &.show-icon > .bng-pill {
    > .pill-content {
      padding: 0;
    }

    > .pill-mark-icon {
      display: inline-block;
    }
  }
}
</style>