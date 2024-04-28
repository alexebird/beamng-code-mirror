<template>
  <LayoutSingle
    v-if="data"
    class="layout-content-full flex-column layout-paddings layout-align-center"
    bng-ui-scope="deliveryReward"
    v-bng-blur
    v-bng-on-ui-nav:back,menu,ok="exit">
    <div class="reward-wrapper">
      <BngCard>
        <CareerStatus class="career-status" />
        <BngCardHeading type="ribbon"> Delivery Complete! </BngCardHeading>
        <div class="card-content">
          <div class="rewards-breakdown-container padding-bottom">
            <span class="span2-heading"> Reward Breakdown </span>
            <div class="grid-wrapper">
              <div class="grid-row grid">
                <div class="label primary">Item</div>
                <div class="rewards primary">Rewards</div>
              </div>
              <div v-for="result in data.sortedResults" class="grid-row grid">
                <div class="label primary">{{ result.label }}</div>
                <div class="rewards primary"><RewardsPills :rewards="result.rewards" /></div>
                <div class="grid-wrapper wide">
                  <div v-for="breakdown in result.breakdown" class="grid">
                    <div class="label secondary">{{ breakdown.label }}</div>
                    <div class="rewards secondary"><RewardsPills :rewards="breakdown.rewards" /></div>
                  </div>
                </div>
              </div>
              <BngDivider />
              <div class="grid-row grid">
                <div class="label primary">Summary</div>
                <div class="rewards primary"><RewardsPills :rewards="data.summary.rewards" /></div>
              </div>
            </div>
          </div>
          <div class="padding-bottom">
            <div v-for="reward in data.summary.rewards">
              <BngProgressBar
                v-if="reward.branchInfo"
                :class="{ 'stat-progress-bar': true, 'animate-progress': showBarAnimations }"
                :headerLeft="$ctx_t(reward.branchInfo.name)"
                :headerRight="$ctx_t(reward.branchInfo.level)"
                :min="reward.branchInfo.max == -1 ? 0 : reward.branchInfo.min"
                :value="reward.branchInfo.max == -1 ? 1 : reward.branchInfo.animValue"
                :max="reward.branchInfo.max == -1 ? 1 : reward.branchInfo.max"
                :value-label-format="reward.branchInfo.max == -1 ? 'Max Level Reached' : undefined" />
            </div>
          </div>

          <div v-if="data.summary.unlocks.length" class="unlocks-wrapper">
            <span class="span2-heading"> Unlocks</span>
            <UnlockCard v-for="unlock in data.summary.unlocks" class="unlock-item" :data="unlock" />
          </div>
        </div>

        <template #buttons>
          <BngButton @click="exit"><BngBinding ui-event="ok" deviceMask="xinput" /><span>Continue</span></BngButton>
        </template>
      </BngCard>
    </div>
  </LayoutSingle>
</template>

<script setup>
import { LayoutSingle } from "@/common/layouts"
import { BngButton, BngCard, BngCardHeading, BngDivider, BngProgressBar, BngBinding } from "@/common/components/base"
import RewardsPills from "../components/progress/RewardsPills.vue"
import UnlockCard from "../components/progress/UnlockCard.vue"
import { CareerStatus } from "@/modules/career/components"
import { onMounted, ref, onUnmounted } from "vue"
import { lua } from "@/bridge"
import { vBngBlur, vBngOnUiNav } from "@/common/directives"
import { useGameContextStore } from "@/services"
import UINavEvents from "@/bridge/libs/UINavEvents"
import { useUINavScope } from "@/services/uiNav"

import { storeToRefs } from "pinia"

useUINavScope("deliveryReward")

const emit = defineEmits(["return"])

const ANIMATION_START_DELAY = 1000
const ANIMATION_DURATION = 2000
const ANIM_DURATION_CSS = ANIMATION_DURATION + "ms"

const showBarAnimations = ref(false)

let data = storeToRefs(useGameContextStore()).deliveryRewardData

const exit = () => {
  window.bngVue.gotoGameState("play")
}

function stopAnimations() {
  showBarAnimations.value = false
}

function startProgressBarAnimation() {
  if (!data.value) return
  showBarAnimations.value = true
  for (const [key, value] of Object.entries(data.value.summary.rewards)) {
    if (value.branchInfo) {
      value.branchInfo.animValue = value.branchInfo.value
    }
  }
  setTimeout(stopAnimations, ANIMATION_DURATION)
}

const start = () => {
  UINavEvents.activate()
  UINavEvents.clearFilteredEvents()
  showBarAnimations.value = false
  setTimeout(startProgressBarAnimation, ANIMATION_START_DELAY)
  lua.career_career.requestPause(true)
}

const kill = () => {
  lua.career_modules_delivery_cargoScreen.unloadCargoPopupClosed()
  lua.career_career.requestPause(false)
}

onMounted(start)
onUnmounted(kill)
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
@import "@/styles/modules/animations";

.animate-progress :deep(.progress-fill) {
  @include pulsing-simple;
  transition: cubic-bezier(0.22, 1, 0.36, 1) v-bind(ANIM_DURATION_CSS);
}

.padding-bottom {
  padding-bottom: 1.5rem !important;
}

.stat-progress-bar {
  font-size: 1.25rem;
  padding-bottom: 1rem;
}

.career-status {
  padding: 0;
  position: absolute;
  margin: 0.5em 0;
  right: 0;
  top: 0;
  zoom: 0.85;
}

.card-content {
  padding: 1rem;
}

.reward-wrapper {
  position: relative;
  color: white;
  max-width: 50em;
  min-width: 42em;
  .rewards-breakdown-container {
    display: flex;
    flex-flow: row wrap;
    align-items: stretch;
    align-content: baseline;

    .grid-wrapper {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      grid-gap: 0.5rem; // Adjust the gap as needed

      .wide {
        grid-column: 1 / span 2;
      }
    }

    // Main Grid
    .grid {
      display: grid;
      grid-template-columns: 1fr minmax(5em, 2fr);
      grid-gap: 0.5rem; // Adjust the gap as needed
    }

    .label {
      grid-column: 1 / span 1; // Label takes the first column
    }

    .rewards {
      grid-column: 2 / span 1; // Rewards takes the second column
    }

    // Row Classes
    .primary {
      font-weight: bold;
    }

    .secondary {
      font-weight: normal;
    }
  }
}

.span2-heading {
  font-weight: 800;
  font-size: 1.3em;
  grid-column: 1 / -1;
}

.unlocks-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem; // Adjust the gap as needed
  padding: 0.5rem;

  background-color: rgba(255, 255, 255, 0.15);
}
</style>
