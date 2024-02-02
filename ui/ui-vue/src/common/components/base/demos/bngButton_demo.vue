<template>
  <div>
    <div class="buttons">
      <bng-button :disabled="disabled" tabindex="1" :show-hold="true" @click="clickHandler">Test button</bng-button>
      <bng-button :disabled="disabled" tabindex="1" accent="secondary" :icon-left="icons.drive.busroutes" @click="clickHandler">secondary button</bng-button>
      <bng-button :disabled="disabled" tabindex="1" accent="attention" :icon-right="icons.drive.busroutes" @click="clickHandler">attention button</bng-button>
      <bng-button :disabled="disabled" tabindex="1" accent="text" @click="clickHandler"><b>Test text button</b></bng-button>
      <bng-button :icon="icons.drive.busroutes" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler" label="Outlined button" />

      <bng-button tabindex="1" @click="disableButtons">toggle disabled</bng-button>
    </div>
  </div>
  <div>
    <div class="buttons">
      <bng-button :disabled="disabled" tabindex="1" accent="secondary" :icon-left="icons.drive.busroutes" @click="clickHandler"></bng-button>
      <bng-button :disabled="disabled" tabindex="1" accent="attention" :icon-right="icons.drive.busroutes" @click="clickHandler"></bng-button>
      <bng-button :icon="icons.drive.busroutes" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler"></bng-button>
    </div>
    Total clicks: {{ clickCount }}
  </div>
  <div>
    <div class="buttons">
      <bng-button class="recovery-option" :disabled="disabled" tabindex="1" accent="secondary" @click="clickHandler">
        <BngIcon class="recovery-icon" glyph="&#xBEB9E;" />
        <span class="label">Flip upright</span>
        <BngDivider class="vertical-divider" />
        <div class="units">
          <BngIcon class="units-icon" glyph="&#xBEA17;" />
          <span class="label">1234.95</span>
        </div>
      </bng-button>
      <bng-button class="recovery-option" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler">
        <BngIcon class="recovery-icon" glyph="&#xBEBA0;" />
        <span class="label">Tow to nearest road</span>
        <BngDivider class="vertical-divider" />
        <BngUnit :beambucks="1234.33" />
      </bng-button>
      <bng-button class="recovery-option" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler">
        <BngIcon class="recovery-icon" glyph="&#xBEB21;" />
        <span class="label">Tow to nearest garage</span>
        <BngDivider class="vertical-divider" />
        <BngUnit :beambucks="1234.33" />
      </bng-button>
      <bng-button class="recovery-option" :disabled="disabled" tabindex="1" accent="outlined" @click="clickHandler">
        <BngIcon class="recovery-icon" glyph="&#xBEB21;" />
        <span class="label">Cancel</span>
        <BngDivider class="vertical-divider" />
        <BngUnit :beambucks="1234.33" />
      </bng-button>
    </div>
    Total clicks: {{ clickCount }}
  </div>
</template>

<script setup>
import { icons } from "@/common/components/base/bngIcon.vue"
import { BngButton, BngDivider, BngIcon, BngImageTile, BngUnit } from "@/common/components/base"
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
  .units-icon, .recovery-icon {
    margin-right: 0.125em;
    font-size: 1.5em;
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
