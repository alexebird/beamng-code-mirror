<template>
  <div class="milestone-score-card">
    <div class="animated-border"></div>
    <div class="content-wrapper">
      <div class="content">
        <BngOldIcon v-if="iconType" span class="input-icon" :type="iconType" />
        <span>{{ score.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { BngOldIcon } from "@/common/components/base"
import { icons } from "@/assets/icons"
import { MilestoneType } from "../milestoneTypes"

const props = defineProps({
  score: {
    type: Object,
    required: true,
    validator(value) {
      return (
        value.hasOwnProperty("type") &&
        typeof value.type === "string" &&
        [MilestoneType.Beambuck, MilestoneType.BeamXp].includes(value.type) &&
        value.hasOwnProperty("description") &&
        typeof value.description == "string"
      )
    },
  },
})

const iconType = computed(() => getIconType(props.score.type))

function getIconType(type) {
  switch (type) {
    case MilestoneType.Beambuck:
      return icons.general.beambuck
    case MilestoneType.BeamXp:
      return icons.general.offbtn
  }
}
</script>

<style scoped lang="scss">
$background: rgba(0, 0, 0, 0.6);
$color: white;

.milestone-score-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;

  > .animated-border {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.22em;
    border-radius: 0.44em;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;

    &::before {
      position: absolute;
      content: "";
      display: block;
      top: -100%;
      left: -100%;
      right: -100%;
      bottom: -100%;
      background: linear-gradient(#e6cf43, #ed3823, #e6cf43, #ff6600, #e6cf43);
      animation: rotate-gradient linear 2s infinite;
    }
  }

  > .content-wrapper {
    position: absolute;
    display: flex;
    top: 0.22em;
    left: 0.22em;
    right: 0.22em;
    bottom: 0.22em;
    background: $background;
    border-radius: 0.22em;

    > .content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      color: $color;
      font-weight: 400;
      font-size: 2em;

      .input-icon {
        width: 2em;
        height: 2em;
        background-color: orange !important;
      }
    }
  }
}

@keyframes rotate-gradient {
  to {
    transform: rotate(360deg);
  }
}
</style>
