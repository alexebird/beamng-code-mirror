<template>
  <div>
    <div class="buttons">
      <BngButton :disabled="disabled" tabindex="1" :show-hold="true" @click="clickHandler">Test button</BngButton>
      <BngButton class="allcaps" :disabled="disabled" tabindex="1" accent="secondary" :icon-left="icons.bus" @click="clickHandler">secondary button</BngButton>
      <BngButton class="large allcaps" :disabled="disabled" tabindex="1" accent="attention" :icon-right="icons.bus" @click="clickHandler"
        >attention button</BngButton
      >
      <BngButton :disabled="disabled" tabindex="1" accent="text" @click="clickHandler"><b>Test text button</b></BngButton>
      <BngButton :icon="icons.bus" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler" label="Outlined button" />

      <BngButton tabindex="1" @click="disableButtons">toggle disabled</BngButton>
    </div>
  </div>
  <div>
    <div class="buttons">
      <BngButton :disabled="disabled" tabindex="1" accent="secondary" :icon-left="icons.bus" @click="clickHandler"></BngButton>
      <BngButton :disabled="disabled" tabindex="1" accent="attention" :icon-right="icons.bus" @click="clickHandler"></BngButton>
      <BngButton :icon="icons.bus" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler"></BngButton>
    </div>
    Total clicks: {{ clickCount }}
  </div>
  <div>
    <div class="buttons">
      <BngButton class="recovery-option" :disabled="disabled" tabindex="1" accent="secondary" @click="clickHandler">
        <BngIcon class="recovery-icon" :type="icons.carToWheels" />
        <span class="label">Flip upright</span>
        <BngDivider />
        <BngUnit :beambucks="1234.33" />
      </BngButton>
      <BngButton class="recovery-option" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler">
        <BngIcon class="recovery-icon" :type="icons.road" />
        <span class="label">Tow to nearest road</span>
        <BngDivider />
        <BngUnit :beambucks="1234.33" />
      </BngButton>
      <BngButton class="recovery-option" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler">
        <BngIcon class="recovery-icon" :type="icons.toGarage" />
        <span class="label">Tow to nearest garage</span>
        <BngDivider />
        <BngUnit :beambucks="1234.33" />
      </BngButton>
      <BngButton class="recovery-option" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler">
        <BngIcon class="recovery-icon" :type="icons.toGarage" />
        <span class="label">Cancel</span>
        <BngDivider />
        <BngUnit :beambucks="1234.33" />
      </BngButton>
    </div>
    Total clicks: {{ clickCount }}
  </div>
</template>

<script setup>
import { BngButton, BngDivider, BngIcon, BngUnit, icons } from "@/common/components/base"
import { ref } from "vue"

let disabled = ref(false)
const clickCount = ref(0)

function clickHandler() {
  clickCount.value++
}
function disableButtons() {
  disabled.value = !disabled.value
}
</script>

<style lang="scss" scoped>
.bng-button {
  margin-bottom: 1em;
}
.buttons {
  display: flex;
  align-items: flex-start;
  flex-flow: row wrap;
  & > :not(:last-child) {
    margin-right: 0.5em;
  }
}

.recovery-option {
  align-items: baseline;
  font-size: 1em;
  flex: 0 0 auto;
  &.tile {
    align-items: center;
    & > .label {
      padding: 0 0.25em 0.5em 0.25em;
    }
    & > .units {
      padding: 0.5em 0.25em 0 0.25em;
      display: block;
    }
  }

  .vertical-divider {
    margin-top: 0;
    margin-bottom: 0;
  }

  .units {
    display: inline-flex;
    align-items: baseline;
  }

  & > .label {
    flex: 1 1 auto;
  }

  .recovery-icon {
    font-size: 2em;
  }

  .units-icon {
    transform: translateY(0.05em);
  }

  :deep(.info-item) {
    padding-top: 0;
    padding-bottom: 0;
    padding-right: 0.25em;

    & .with-icon {
      padding-left: 1.5em;
    }
    & > .icon {
      left: 0;
      top: -0.125em;
    }
  }
}
</style>
