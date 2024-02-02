<template>
  <div class="info-card" tabindex="1">
    <BngCard class="card">
      <template v-if="slots.header">
        <slot name="header"></slot>
      </template>
      <template v-else-if="header">
        <BngCardHeading :type="headerType">{{ header }}</BngCardHeading>
      </template>
      <div class="info-content">
        <slot name="content"></slot>
      </div>
      <template v-if="slots.button" #buttons>
        <div class="button-wrapper">
          <slot name="button"></slot>
          <bng-icon class="button-icon" :title="icons.general.arrow_small_right" span :type="icons.general.arrow_small_right" />
        </div>
      </template>
    </BngCard>
  </div>
</template>

<script setup>
import { useSlots } from "vue"
import { BngCard, BngCardHeading, BngIcon } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const slots = useSlots()
const props = defineProps({
  header: {
    type: String,
    required: false,
  },
  headerType: {
    type: String,
    required: false,
  },
})
</script>

<style scoped lang="scss">
// $backgroundColor: rgba(0, 0, 0, 0.6);
$backgroundColor: black;
$textColor: white;

.info-card {
  position: relative;
  border-radius: 0.125em;
  background: $backgroundColor;
  color: $textColor;
  border-bottom: 0.25rem solid transparent;
  border-radius: 0.25rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 125% */
  letter-spacing: 0.02rem;
  user-select: none;

  &.button-center {
    :deep(.card) {
      > .buttons > .button-wrapper {
        justify-content: center;

        > .bng-button {
          font-size: 1.5rem;
          font-style: normal;
          font-weight: 400;
          line-height: 2rem;
          letter-spacing: 0.015rem;
        }

        > .button-icon {
          display: none;
        }
      }
    }
  }

  &:focus {
    border-bottom-color: rgba(255, 102, 0, 1);

    &::before {
      top: -0.5rem;
      bottom: -0.75rem;
      left: -0.5rem;
      right: -0.5rem;
      border-radius: 0.5rem;
    }
  }

  > :deep(.card) {
    .card-cnt {
      background: transparent;
      border-radius: 0;

      > .info-content {
        border-bottom: 0.5rem solid transparent;
        overflow-y: auto;
      }
    }

    > .buttons {
      background: transparent;
      border: none;

      > .button-wrapper {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        > .button-icon {
          width: 1rem;
          height: 1rem;
          padding: 0.25rem;
        }

        .bng-button {
          flex: initial;
          cursor: pointer;
          background: transparent;

          &:hover {
            background: transparent;
          }
        }
      }
    }
  }

  > :deep(.card) > * {
    ::-webkit-scrollbar {
      width: 0.25rem;
      height: 0.25rem;
    }

    ::-webkit-scrollbar-corner {
      background: transparent;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      background: #222;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #f60;
    }
  }
}
</style>
