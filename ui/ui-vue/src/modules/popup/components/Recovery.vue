<template>
  <div class="recovery-wrapper">
    <BngCard>
      <BngCardHeading type="ribbon"> Recover your vehicle </BngCardHeading>
      <div class="content">
        <!-- Plz iterate with v-for -->
        <BngImageTile class="recovery-option" glyph="&#xBEB9E;" tabindex="1" @click="clickHandler">
          <span class="label">Flip upright</span>
          <BngDivider />
          <div v-if="true" class="units">
            <BngIcon class="units-icon" glyph="&#xBEA17;" />
            <span class="label">1234.95</span>
          </div>
        </BngImageTile>
        <BngImageTile class="recovery-option" glyph="&#xBEBA0;" tabindex="1" @click="clickHandler">
          <span class="label">Tow to road</span>
          <BngDivider />
          <div v-if="true" class="units">
            <BngIcon class="units-icon" glyph="&#xBEA17;" />
            <span class="label">1234.95</span>
          </div>
        </BngImageTile>
        <BngImageTile class="recovery-option" glyph="&#xBEB21;" tabindex="1" @click="clickHandler">
          <span class="label">Tow to garage</span>
          <BngDivider />
          <div v-if="true" class="units">
            <BngIcon class="units-icon" glyph="&#xBEA17;" />
            <span class="label">1234.95</span>
          </div>
        </BngImageTile>
        <div class="notification">
          Please note that towing to garage will terminate the current deliveries and you'll have to pay <BngUnit :beambucks="12345.99" /> for this
        </div>
      </div>
      <template #buttons>
        <BngButton label="Cancel" accent="attention" @click="$emit('return', true)" />
      </template>
    </BngCard>
  </div>
</template>

<script setup>
import { BngButton, BngCard, BngCardHeading, BngIcon, BngImageTile, BngDivider, BngUnit } from "@/common/components/base"
defineEmits(["return"])

// function derp(val) {
//   // lua goes here
//   $emit("return", true)
// }
</script>

<script>
import { popupPosition, popupContainer } from "@/services/popup"
export default {
  wrapper: {
    fade: true, // everything but popup will fade away (become semi-transparent and desaturated)
    blur: true, // fullscreen in-game blur
    style: popupContainer.transparent, // can be multiple in array
  },
  position: [popupPosition.center, popupPosition.center], // can be single w/o array
}
</script>

<style scoped lang="scss">
@import "@/styles/modules/mixins";
.recovery-wrapper {
  color: white;
  max-width: 32em;
  .content {
    display: flex;
    flex-flow: row wrap;
    align-items: stretch;
    align-content: baseline;
    padding: 0.5em 0.5em;
    .notification {
      flex: 1 1 auto;
      // border: 0.125rem solid var(--bng-add-red-700);
      border-radius: $border-rad-2;
      margin: 0.5rem 0.25rem;
      padding: 0.75em;
      background-color: rgba(var(--bng-add-red-700-rgb), 0.4);
    }
    .recovery-option {
      align-items: baseline;
      font-size: 1em;

      &.tile {
        align-items: center;
        flex: 0.5 0 8em;
        margin: 0.25rem;
        padding: 0.5rem 0.5rem 1rem;
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
      .units-icon,
      .recovery-icon {
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
  }
}
</style>
