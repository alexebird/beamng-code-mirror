<template>
  <span class="milestone-badge" :class="[type]">
    <span class="backdrop"></span>
    <span class="badge-container">
      <span class="badge"></span>
    </span>
  </span>
</template>

<script setup>
import { computed } from "vue"
import { getAssetURL } from "@/utils"
import { MilestoneType } from "../milestoneTypes"

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator(value) {
      return [MilestoneType.AiRace, MilestoneType.Delivery, MilestoneType.Chase, MilestoneType.Stunt].includes(value)
    },
  },
})
const iconImageUrl = computed(() => `url(${getAssetURL(getIconByType(props.type))})`)

function getIconByType(type) {
  switch (type) {
    case MilestoneType.AiRace:
      return "test/images/Union.svg"
    case MilestoneType.Delivery:
      return "test/images/delivery.svg"
    case MilestoneType.Chase:
      return "test/images/chase.svg"
    case MilestoneType.Stunt:
      return "test/images/stunt.svg"
  }
}
</script>

<style scoped lang="scss">
$aiRace-backdrop-color: var(--bng-add-red-600);
$chase-backdrop-color: var(--bng-add-blue-600);
$delivery-backdrop-color: var(--bng-add-green-600);
$stunt-backdrop-color: #d515dc;

$backdrop-shape: polygon(26% 8%, 73% 8%, 92% 39%, 64% 100%, 19% 100%, 0 70%);

.milestone-badge {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 85%;

  > .backdrop {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
    clip-path: $backdrop-shape;
    background: rgba(0, 0, 0, 0.4);

    // Inner layer
    &::before {
      position: absolute;
      content: "";
      display: inline-block;
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      top: 4px;
      left: 4px;
      clip-path: $backdrop-shape;
      opacity: 0.4;
    }

    // Middle layer
    &::after {
      position: absolute;
      content: "";
      display: inline-block;
      width: calc(100% - 16px);
      height: calc(100% - 16px);
      top: 8px;
      left: 8px;
      clip-path: $backdrop-shape;
    }
  }

  > .badge-container {
    position: absolute;
    display: inline-block;

    > .badge {
      display: inline-block;
      width: 100%;
      height: 100%;
      background-color: white;
      mask-image: v-bind(iconImageUrl);
      -webkit-mask-image: v-bind(iconImageUrl);
      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;
      mask-size: contain;
      -webkit-mask-size: contain;
    }
  }

  &.aiRace {
    > .backdrop {
      &::before,
      &::after {
        background: $aiRace-backdrop-color;
      }
    }

    > .badge-container {
      left: 28%;
      bottom: -4%;
      width: 80%;
      height: 80%;
    }
  }

  &.chase {
    > .backdrop {
      &::before,
      &::after {
        background: $chase-backdrop-color;
      }
    }

    > .badge-container {
      left: 16%;
      bottom: -15%;
      width: 100%;
      height: 100%;
    }
  }

  &.delivery {
    > .backdrop {
      &::before,
      &::after {
        background: $delivery-backdrop-color;
      }
    }

    > .badge-container {
      left: 5%;
      bottom: -12%;
      width: 90%;
      height: 90%;
    }
  }

  &.stunt {
    > .backdrop {
      &::before,
      &::after {
        background: $stunt-backdrop-color;
      }
    }

    > .badge-container {
      left: 20%;
      bottom: -4%;
      width: 85%;
      height: 85%;
    }
  }
}
</style>
