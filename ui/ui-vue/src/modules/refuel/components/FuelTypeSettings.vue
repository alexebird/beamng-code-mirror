<template>
  <div class="fuel-type">
    <BngButton class="arrow" accent="text" data-testid="previous-btn" :icon="icons.general.arrow_small_left" @click="emits('previousClick')">
      <BngIcon class="controller" span :type="icons.device.xbox.btn_lb" />
    </BngButton>
    <bng-pill-filters-container :html-id="htmlId" :options="fuelOptions" :select-many="false" :has-checked-icon="true" />
    <BngButton class="arrow" accent="text" data-testid="next-btn" :iconRight="icons.general.arrow_small_right" @click="emits('nextClick')">
      <BngIcon class="controller" span :type="icons.device.xbox.btn_rb" />
    </BngButton>
  </div>
</template>

<script setup>
import { BngButton, BngPillFiltersContainer, BngIcon } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

defineProps({
  htmlId: {
    type: String,
    required: true,
  },
  fuelOptions: {
    type: Array,
    required: true,
  },
})

const emits = defineEmits(["previousClick", "nextClick", "fuelTypeSelect"])
</script>

<style scoped lang="scss">
.fuel-type {
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > :not(:last-child) {
    margin-right: 0.2em;
  }
}

.arrow:deep(.bngicon.controller) {
  min-width: 1.5em;
  min-height: 1.5em;
}

.arrow:deep(.bngicon:not(.controller)) {
  width: 0.65em;
  min-width: 0;
  min-height: 0;
  height: 0.75em;
}
</style>
