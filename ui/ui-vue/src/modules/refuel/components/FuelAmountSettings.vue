<template>
  <div class="amount">
    <BngButton :icon="icons.device.xbox.btn_dpad_up" class="top-up" accent="text">Top-up</BngButton>
    <div class="slider-labels">
      <span>{{ `${minSlider}${unitLabel}` }}</span>
      <span>{{ `${maxSlider}${unitLabel}` }}</span>
    </div>
    <bng-slider :min="minSlider" :max="maxSlider" @valueChanged="() => {}" />
    <div class="amount-value">
      <BngButton :icon="icons.device.xbox.btn_dpad_left" accent="text" />
      <BngInput class="value" suffix="L" initial-value="1234567"></BngInput>
      <BngButton :iconRight="icons.device.xbox.btn_dpad_right" accent="text" />
    </div>
  </div>
</template>

<script setup>
import { BngButton, BngInput, BngSlider } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const props = defineProps({
  minSlider: {
    type: Number,
    default: 23,
  },
  maxSlider: {
    type: Number,
    default: 80,
  },
  unitLabel: String,
})
</script>

<style scoped lang="scss">
.amount {
  display: flex;
  flex-direction: column;
  align-items: center;

  & .slider-labels {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 0.5em;
  }

  & .amount-value {
    flex-direction: row;
    display: flex;
    margin: 0.5em 0;
    justify-content: center;

    & > :not(:last-child) {
      margin-right: 0.5em;
    }

    & .value {
      width: 32%;
    }
  }
}
</style>
