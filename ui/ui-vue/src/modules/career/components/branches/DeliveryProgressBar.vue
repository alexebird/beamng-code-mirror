<template>
  <div class="bng-progress-bar">

    <div v-if="headerLeft || headerRight" class="header">
      <span class="header-left">
        {{ headerLeft }} Progress: Level {{currentTier}}
      </span>
    </div>
    <div class="progress-bar">
      <div class="tiers-bar" v-if="tiers" :style="{ '--num-columns': tiers.length }">
        <template class="tier" v-for="tier in tiers">
          <div
            :class="{ 'tier-label': true, 'grayed-out': currentTier < tier.index }"
            :style="{ gridColumn: tier.index }">
            Level {{ tier.index }}
          </div>
          <div
            :class="{ 'tier-info': true, 'grayed-out': currentTier < tier.index }"
            :style="{ gridColumn: tier.index }">
            <UnlockCard class="tier-unlocks-item" :data="formatTier(tier)" />
          </div>
          <div 
            :class="{ 'tier-unlocks': true, 'grayed-out': currentTier < tier.index }"
            :style="{ gridColumn: tier.index }">
            <div class="tier-unlocks-label">
              Unlocks
            </div>
            <UnlockCard v-for="item in tier.list" class="tier-unlocks-item" :data="item" />
          </div>
          <div
            :class="{ 'tier-progress': true, 'unlockable': currentTier < tier.index && !tier.isInDevelopment }"
            :style="{ gridColumn: tier.index }">
            <div v-if="tier.isBase" class="tier-value"></div>
            <div v-else-if="tier.isInDevelopment" class="tier-value"><BngIcon class="tier-header-block-icon" :type="icons.roadblockL" /><span>Coming Soon!</span></div>
            <div v-else-if="currentTier+1 < tier.index" class="tier-value"><BngIcon class="tier-header-block-icon" :type="icons.lockClosed" /><span>Locked</span></div>
            <div v-else-if="tier.isMaxLevel" class="tier-value"><BngIcon class="tier-header-block-icon" :type="icons.powerGauge05" /><span>Level</span></div>
            <div v-else-if="currentTier+1 > tier.index" class="tier-value">{{ tier.requiredValue }} / {{ tier.requiredValue }} XP</div>
            <div v-else class="tier-value"><BngIcon class="tier-header-block-icon" :type="icons.lockClosed" /><span>{{ tier.currentValue }} / {{ tier.requiredValue }} XP</span></div>
            <div v-if="currentTier+1 == tier.index" class="progressbar-fill" ref="progressFillRef" :style="{ 'width': progressFillUnitsWidth + '%' }"></div>
          </div>
          <div
            :class="{ 'main-track': true, 'progress-fill-full-bg': currentTier+1 > tier.index, 'current': currentTier+1 == tier.index, 'indev': tier.isInDevelopment }"
            :style="{ gridColumn: tier.index }"/>
        </template>
      </div>
      <!-- <span class="progress-fill" ref="progressFillRef"></span> -->
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import UnlockCard from "../branches/UnlockCard.vue"
import { BngIcon, icons } from "@/common/components/base"
const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    required: true,
  },
  maxRequiredValue: {
    type: Number,
    required: true,
  },
  headerLeft: String,
  headerRight: String,
  showValueLabel: {
    type: Boolean,
    default: true,
  },
  tiers: Array,
  currentTier: Number,
})

defineExpose({
  decreaseValueBy,
  increaseValueBy,
  setValue: value => updateCurrentValue(value),
})

const currentValue = ref(null)
const progressFillRef = ref(null)
const tiersSizes = computed(() => props.tiers.length)

const progressFillUnits = computed(() => (2 + 96 - ((currentValue.value - props.min) / (props.max - props.min)) * 100) + "%")

const progressFillUnitsWidth = computed(() => {
  const range = props.max - props.min
  const currentProgress = currentValue.value - props.min
  const fillValue = (currentProgress / range) * 100
  return fillValue
})

watch(
  () => props.value,
  newValue => updateCurrentValue(newValue)
)

onMounted(() => {
  updateCurrentValue(props.min > props.value ? props.min : props.value)
})

/* Exposed Functions */
function decreaseValueBy(value) {
  const newValue = currentValue.value - value

  if (newValue < props.min) return

  updateCurrentValue(newValue)
}

function increaseValueBy(value) {
  const newValue = currentValue.value + value

  if (newValue > props.max) return

  updateCurrentValue(newValue)
}

function updateCurrentValue(newValue) {
  currentValue.value = newValue
  //updateProgressFill(progressFillUnits.value)
}

function formatTier(tier) {
  return {
    icon: 'info',
    heading: tier.description.heading,
    description: tier.description.description,
  };
}

/* Private Functions */
// function updateProgressFill(percentage) {
//   window.requestAnimationFrame(() => (progressFillRef.value.style.right = `${percentage}%`))
// }
</script>

<style scoped lang="scss">
$background-color: rgba(black, 0.6);

$font-color: #ffffff;
$font-top-line-space: 1px;

$info-z-index: 2;
$info-divider-height: 0.9em;
$info-divider-color: white;

$progress-fill-color: #ff6600;
$progress-fill-z-index: -110;

.bng-progress-bar {
  font-family: "Overpass", var(--fnt-defs);
  font-style: normal;
  font-weight: 600;
  //font-size: 1em;
  //line-height: 125%;
  // padding: 1rem;

  > .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-style: italic;
    padding-bottom: 1em;

    > .header-right {
      padding-right: 1em;
      font-size: 1.5em;
      font-weight: 900;
    }

    > .header-left {
      display: flex;
      font-size: 1.5em;
      font-weight: 900;
      .info {
        position: relative;
        display: flex;
        align-items: flex-start;
        padding: 0 1em 0;
        z-index: $info-z-index;
        .value-label {
          position: relative;
          padding-right: 1.34em;
          &::after {
            content: "";
            position: absolute;
            top: calc(50% - ($info-divider-height / 2) - $font-top-line-space);
            right: 0.6em;
            width: 0.1em;
            height: $info-divider-height;
            background: $info-divider-color;
            transform: matrix(0.94, 0, -0.37, 1, 0, 0);
          }
        }
      }
    }
  }

  > .progress-bar {
    position: relative;
    border-radius: var(--bng-corners-2);
    overflow: hidden;
    background-color: $background-color;
    height: fit-content;
    padding: 0.25rem;
    > .tiers-wrapper {
      flex: 1 0 auto;
      display: grid;
      grid-template-columns: repeat(v-bind(tiersSizes), 1fr);
      //height: 100%;
      //align-items: stretch;
      > .tier {
        z-index: $info-z-index;
        box-shadow: inset 0.2em 0em 0em 0em rgba($color: white, $alpha: 0.8);
        height: 100%;
        > .tier-data-wrapper {
          position: relative;
          flex: 1 0 auto;
          display: grid;
          grid-template:
            "tier-header-wrapper" min-content
            "tier-info-wrapper" 1fr
            "tier-unlocks-wrapper" min-content /
            1fr;
          > .tier-header-wrapper {
            position: relative;
            display: flex;
            flex-flow: column;
            align-items: center;
            margin: 0.5em 0em 0.5em;

            //box-shadow: inset 0em -0.2em 0em 0em white;
            > .tier-header-label {
              font-weight: 800;
              font-size: 1.25em;
            }
            > .tier-header-unlock {
              > .tier-header-xp {
                font-weight: normal;
              }
              > .tier-header-block-icon {
                font-weight: normal;
              }
            }
          }
          > .tier-info-wrapper {
            margin: 0.5rem;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: var(--bng-corners-2);
            padding: 0.25em;
            > .tier-info-description-wrapper {
              display: grid;
              grid-template: min-content auto / 2.5rem 2fr;

              > .tier-info-icon {
                font-size: 1.75em;
                grid-row: 1 / -1;
              }
              > .tier-info-label {
                padding: 0.25em 0.5em 0;
                > .tier-info-heading {
                  font-weight: 800;
                  font-size: 1.25em;
                  //margin: 0.25em 0em 0;
                }
                > .tier-info-body {
                  font-weight: 400;
                  font-size: 0.8em;
                }
              }
            }
          }
          >.tier-unlocks-header{
            position: relative;
            display: flex;
            flex-flow: column;
            align-items: center;
            >.tier-unlocks-header-label{
              position: relative;
              display: flex;
              flex-flow: column;
              align-items: center;
              font-size: 1.15em;
              padding: 0.5em;
              box-shadow: inset 0em -0.1em 0em 0em rgba($color: white, $alpha: 0.8);
              width: 80%;
            }
            
          }
          > .tier-unlocks-wrapper {
            display: grid;
            gap: 0.25rem;
            padding: 0.25em;
            > .tier-unlocks-item {
              border-radius: var(--bng-corners-2);
              margin: 0.25rem;
            }
          }
        }
      }
    }
  }

  .progress-fill {
    position: absolute;
    display: inline-block;
    top: 0;
    bottom: 0;
    left: 1%;
    right: v-bind(progressFillUnits);
    background-color: $progress-fill-color;
    z-index: $progress-fill-z-index;
  }
  .progress-fill-full-bg {
    background-color: $progress-fill-color;
  }
  .tiers-bar {
    display: grid;
    position: relative;
    grid-template-rows: [level] auto [info] max-content [unlocks] auto [progress] max-content;
    grid-template-columns: repeat(var(--num-columns), 1fr);
    grid-auto-rows: 1fr;
    gap: 0.25rem;
    overflow: hidden;
    border-radius: var(--bng-corners-1);
    &>* {
      padding: 0 0.5rem 0.75rem;
    }
    .grayed-out {
      color: var(--bng-cool-gray-300);
      :deep(.icon) {
        color: var(--bng-cool-gray-300);
      }
    }
    .tier-label {
      grid-row: level;
      z-index: 1;
      font-size: 1.5em;
      font-weight: 700;
      font-style: italic;
      padding: 0.25rem;
      align-self: center;
      justify-self: center;
    }
    .tier-info {
      grid-row: info;
      z-index: 1;
    }
    .tier-unlocks {
      grid-row: unlocks;
      z-index: 1;
      display: grid;
      gap: 0.25rem;
      grid-auto-rows: max-content;
      .tier-unlocks-label {
        justify-self: center;
        font-size: 1.2em;
        font-weight: 700;
      }
    }
    .tier-progress {
      grid-row: progress;
      position: relative;
      z-index: 1;
      line-height: 1.5rem !important;
      font-size: 1em;
      display: grid;
      padding: 0.5rem;
      &.unlockable {
        background: rgba(black, 0.4);
      }
      .tier-value {
        z-index: 2;
        display: flex;
        flex-flow: row nowrap;
        gap: 0.25rem;
        align-items: baseline;
        justify-self: center;
        & > :not(:first-child) {
          margin-left: 0.25rem;
        }
      }
      .progressbar-fill {
        position: absolute;
        top: -8rem;
        bottom: 0;
        left: 0;
        background: linear-gradient(to top, rgba($progress-fill-color, 1), rgba($progress-fill-color, 1) 2.5rem, rgba(black, 0) 2.501rem), border-box 50% 100% / 100% 105% radial-gradient(circle at center bottom, rgba($progress-fill-color, 0.6), rgba($progress-fill-color, 0.4) 25%, rgba($progress-fill-color, 0) 80%);
        z-index: -1;
      }
    }
    .main-track {
      grid-row: 1 / -1;
      z-index: 0;
      &.current {
        background: rgba(white, 0.1) linear-gradient(to right, rgba($progress-fill-color, 0.5), rgba($progress-fill-color, 0) 50%);
      }
      &.indev {
        background: repeating-linear-gradient(
          -45deg,
          rgba(white, 0.1),
          rgba(white, 0.1) 1rem,
          rgba(white, 0.0) 1rem,
          rgba(white, 0.0) 2rem
        );
      }
    }
  }
}
</style>
