<template>
  <div class="condensed">
    <div v-if="milestone.claimable" class="animated-border claimable" @click="claimMilestone"></div>
    <div v-if="milestone.completed" class="complete"></div>
    <AspectRatio class="image" :style="{ backgroundColor: milestone.color }">
      <div v-if="milestone.completed" class="complete"></div>
      <div v-if="milestone.completed" class="complete-badge"><BngIcon class="glyph small" :type="icons.checkmark" /></div>
      <BngIcon class="glyph" :type="icons[milestone.icon]" />
      <div v-if="milestone.step !== undefined && milestone.maxStep !== undefined" class="step">{{ milestone.step }}/{{ milestone.maxStep }}</div>
      <div v-if="milestone.step !== undefined && milestone.maxStep === undefined" class="step">{{ milestone.step }}</div>
    </AspectRatio>
    <div class="content">
      <div class="heading">
        {{ $ctx_t(milestone.label) }}
      </div>
      <div v-if="milestone.description" class="middle-content">
        {{ $ctx_t(milestone.description) }}
      </div>
      <div class="middle-content" v-if="milestone.rewards">
        <RewardsPills :rewards="milestone.rewards" />
      </div>

      <!-- TODO - please use bngProgressBar component, or discuss why not -->
      <div v-if="milestone.completed" class="progress">
        <div>
          <div class="progressbar-container">
            <div class="progressbar-label">Complete!</div>
            <div class="progressbar-fill" :style="{ width: 100 + '%' }" style="background-color: gray"></div>
          </div>
        </div>
      </div>

      <!-- TODO - please use bngProgressBar component, or discuss why not -->
      <div v-for="prog in milestone.progress" class="progress">
        <div v-if="prog.type === 'progressBar'">
          <div v-if="prog.type === 'progressBar'" class="progressbar-container">
            <div class="progressbar-label">
              {{ $ctx_t(prog.label) }}
            </div>
            <div class="progressbar-fill" :style="{ width: (prog.currValue > 0 ? (prog.currValue / (prog.maxValue - prog.minValue)) * 100 : 0) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AspectRatio } from "@/common/components/utility"
import { BngIcon, icons } from "@/common/components/base"

import RewardsPills from "../branches/RewardsPills.vue"

const props = defineProps({
  milestone: Object,
  isCondensed: Boolean,
})
const emit = defineEmits(["claim"])
const claimMilestone = () => {
  emit("claim", props.milestone)
  console.log(props.milestone)
}

const rewardUnitTypes = {
  money: "beambucks",
  beamXP: "xp",
}
</script>

<style scoped lang="scss">
.condensed {
  display: flex;
  flex-flow: column;
  position: relative;
  border-radius: var(--bng-corners-2);
  overflow: hidden;

  background-color: rgba(255, 255, 255, 0.1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }

  .complete {
    z-index: 15;
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.22em;
    //background-color: rgba(0,0,0,0.4);
  }

  > .claimable {
    cursor: pointer;
  }

  > .animated-border {
    z-index: 10;
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.22em;
    border-radius: var(--bng-corners-2);
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

  :deep(.image) {
    //background-image: url('/levels/west_coast_usa/spawns_quarry.jpg') !important;
    align-self: stretch;
    .icon {
      width: 2rem;
      height: 2rem;
    }

    .glyph {
      font-size: 6em;
      &.small {
        font-size: 2.5em;
      }
    }

    :deep(*) > .icon {
      width: 2rem;
      height: 2rem;
    }
    overflow-y: hidden;
    height: 6em;

    .step {
      position: absolute;
      top: 0;
      right: 0.5em;
      padding: 0.25em 0.5em;
      background-color: rgba(var(--bng-cool-gray-900-rgb), 0.9);
      border-radius: 0 0 0.5em 0.5em;
    }
  }

  .content {
    flex: 1 0 auto;

    padding: 0.75rem 0.75rem 0.75rem 0.75rem;

    .heading {
      grid-area: 1 / 1 / 1 / -1;
      font-weight: 800;
    }

    .middle-content {
      grid-column-start: 1;
      grid-column-end: -1;
    }

    .progress {
      grid-area: auto / 1 / auto / -1;

      .progressbar-container {
        display: flex;
        position: relative;
        align-self: stretch;
        border-radius: var(--bng-corners-1);
        background: rgba(var(--bng-cool-gray-700-rgb), 0.8);
        padding: 0.25rem 0.5rem 0.1rem 0.5rem;
      }
      .progressbar-label {
        position: relative;
        font-size: 1em;
        flex: 0 0 auto;
        align-self: center;

        z-index: 1;
      }
      .progressbar-fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;

        align-self: stretch;

        border-radius: var(--bng-corners-1);
        box-sizing: content-box;

        background-color: var(--bng-orange-500);

        z-index: 0;
      }
    }

    color: white;
    display: grid;
    gap: 0.2rem;
    grid-template:
      "heading heading heading heading" minmax(3rem, auto)
      "content content content content" 1fr
      "progress progress progress progress" 2rem /
      1fr 1fr 1fr 1fr;
    //align-content: space-between;
  }
}

.complete-badge {
  position: absolute;
  top: 0;
  left: 0em;
  padding: 0.3em 0.5em;
  background-color: rgba(var(--bng-cool-gray-900-rgb), 0.6);
  border-radius: 0 0 0.5em;
}

@keyframes rotate-gradient {
  to {
    transform: rotate(360deg);
  }
}
</style>
