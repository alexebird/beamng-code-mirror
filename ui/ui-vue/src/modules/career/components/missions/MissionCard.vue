<template>
  <BngCard bng-nav-item @click="goToBigMap" class="card-wrapper" v-bng-disabled="isSkeleton">
    <div class="condensed">
      <!-- <AspectRatio class="image" :style="{backgroundImage: 'url(' + mission.thumbnailFile + ')'}">
      <BngIcon class="glyph" :type="icons[MISSION_UNIT_TYPES[mission.icon]] || icons[mission.icon]" />
    </AspectRatio> -->
      <div class="card-background" :style="{
        backgroundColor: isSkeleton ? undefined : mission.startable ? mission.color : mission.blockedColor,
      }">
        <BngIcon
          class="glyph"
          :type="isSkeleton ? icons[Object.values(MISSION_UNIT_TYPES)[0]] : icons[MISSION_UNIT_TYPES[mission.icon]] || icons[mission.icon]"
          :color="isSkeleton || !mission.startable ? 'var(--bng-cool-gray-200)' : '#fff'" />
      </div>

      <div class="content">
        <div v-if="!isSkeleton && !mission.startable" class="locked-background">
          <BngIcon class="glyph-locked" :type="icons.lockClosed" :color="'#fff'" />
        </div>
        <div v-if="!isSkeleton" class="heading">
          {{ $t(mission.label) }}
        </div>
        <div v-if="!isSkeleton && mission.description" class="middle-content">
          {{ $t(mission.description) }}
        </div>

        <!-- mission -->
        <div v-if="!isSkeleton && !isFacility" class="rewards">
          <div class="mission-stars">
            <BngMainStars
              v-if="mission.formattedProgress.unlockedStars"
              :unlocked-stars="mission.formattedProgress.unlockedStars.defaultUnlockedStarCount"
              :total-stars="mission.formattedProgress.unlockedStars.totalDefaultStarCount"
              class="main-stars" />
            <BngMainStars
              v-if="mission.formattedProgress.unlockedStars"
              :unlocked-stars="mission.formattedProgress.unlockedStars.bonusStarsUnlockedCount"
              :total-stars="mission.formattedProgress.unlockedStars.stars.bonusStarCount"
              class="bonus-stars" />
          </div>
          <div class="mission-rewards-label">Rewards:</div>
          <RewardsPills class="mission-rewards" :rewards="mission.rewards" :hideNumbers="true" />
        </div>
        <!-- facility -->
        <div v-else-if="!isSkeleton" class="rewards">
          <!-- <div v-if="mission.rewards.deliveredFromHere.countByType.length > 0"> -->
          <div v-if="mission.rewards.deliveredFromHere.countByType.length" class="mission-delivery-label">Delivered from Here:</div>
          <RewardsPills
            v-if="mission.rewards.deliveredFromHere.countByType.length"
            class="mission-rewards"
            :rewards="mission.rewards.deliveredFromHere.countByType"
            :hideNumbers="true" />
          <RewardsPills
            v-if="mission.rewards.deliveredFromHere.countByType.length"
            class="mission-rewards money"
            :rewards="mission.rewards.deliveredFromHere.moneySum"
            :hideNumbers="true" />
          <!-- </div> -->
          <!-- <div v-if="mission.rewards.deliveredToHere.countByType.length"> -->
          <div v-if="mission.rewards.deliveredToHere.countByType.length" class="mission-delivery-label">Delivered to Here:</div>
          <RewardsPills
            v-if="mission.rewards.deliveredToHere.countByType.length"
            class="mission-rewards"
            :rewards="mission.rewards.deliveredToHere.countByType"
            :hideNumbers="true" />
          <RewardsPills
            v-if="mission.rewards.deliveredToHere.countByType.length"
            class="mission-rewards money"
            :rewards="mission.rewards.deliveredToHere.moneySum"
            :hideNumbers="false" />
          <!-- </div> -->
        </div>

        <!-- TODO - should this whole message only be displayed if game controller is plugged in? -->
        <div v-if="!isSkeleton" class="go-to-bigmap-label">Press <BngBinding ui-event="ok" deviceMask="xinput" /> to view in Map</div>
      </div>

    </div>
  </BngCard>
</template>

<script>
const MISSION_UNIT_TYPES = {
  mission_timeTrials_triangle: "stopwatchSectionOutlinedEnd",
  mission_rockcrawling01_triangle: "rockCrawling01",
  mission_drift_triangle: "drift01",
  mission_airace01_triangle: "AIRace",
  mission_cannon_triangle: "cannon",
  mission_barrelknocker01_triangle: "barrelKnocker01",
  mission_precisionParking_triangle: "parking",
  mission_longjump_triangle: "jump",
  mission_copChase_triangle: "carsChase02",
  mission_evade_triangle: "evade",
}
</script>

<script setup>
import { BngMainStars, BngIcon, icons, BngCard, BngBinding } from "@/common/components/base"
import { vBngDisabled } from "@/common/directives"
import RewardsPills from "../branches/RewardsPills.vue"

const props = defineProps({
  mission: Object,
  isFacility: Boolean,
  isSkeleton: Boolean,
})

const emit = defineEmits(["goToBigMap"])

const goToBigMap = () => emit("goToBigMap", props.mission)
</script>

<style scoped lang="scss">
.card-wrapper {
  height: 100%;
  &[disabled] {
    pointer-events: none;
  }
  &:focus, &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
  .condensed {
    display: grid;
    grid-template-columns: 1fr 2fr;
    border-radius: var(--bng-corners-2);
    background-color: rgba(255, 255, 255, 0.1);
    height: 100%;
    position: relative;
    .card-background {
      display: flex;
      justify-content: center;
      align-items: center;
      //background-color: rgb(48, 107, 195);
      .glyph {
        font-size: 10rem;
      }
    }
    :deep(.image) {
      align-self: stretch;
      overflow-y: hidden;
      .glyph {
        font-size: 10rem;
      }

      :deep(*) > .icon {
        width: 2rem;
        height: 2rem;
      }

      .step {
        position: absolute;
        top: 0;
        right: 0.5rem;
        padding: 0.25rem 0.5rem;
        background-color: rgba(var(--bng-cool-gray-900-rgb), 0.9);
        border-radius: 0 0 0.5rem 0.5rem;
      }
    }

    .content {
      position: relative;
      flex: 1 0 auto;
      padding: 0.75rem;

      color: white;
      display: flex;
      flex-flow: column;

      > .go-to-bigmap-label {
        display: hidden;
        padding-top: 0.5rem;
        text-align: right;
      }
      > .locked-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba($color: #000000, $alpha: 0.7);
        .glyph-locked {
          font-size: 10em;
        }
      }

      > .heading {
        font-weight: 800;
        font-size: 1.25rem;
      }

      > * {
        flex: 0 0 auto;
      }
      > .middle-content {
        flex: 1 0 auto;
      }

      > .rewards {
        // display: flex;
        // flex-flow: column;
        display: grid;
        gap: 0.25rem;
        grid-template-columns: 1fr auto;

        .mission-rewards-label {
          font-weight: 600;
          padding: 0.25rem 0 0;
          grid-column: 1 / -1;
        }

        .mission-delivery-label {
          font-weight: 600;
          padding: 0.25rem 0 0;
          grid-column: 1 / -1;
        }

        .mission-rewards {
          display: flex;
          flex-flow: row wrap;
          flex: 1 0 auto;
          grid-column: 1;
          &.money {
            flex: 0 0 auto;
            grid-column: -1;
            justify-content: flex-end;
          }
        }

        > .mission-stars {
          display: flex;
          flex-flow: row;
          & > * {
            margin-right: 0.25rem;
            margin-bottom: 0.25rem;
            min-height: fit-content;
            max-width: fit-content;
          }
          > .main-stars {
            --star-color: var(--bng-ter-yellow-50);
            padding: 0.25rem 0.5rem;
          }
          > .bonus-stars {
            --star-color: var(--bng-add-blue-400);
            padding: 0.25rem 0.5rem;
          }
        }
      }
    }
  }
}
</style>
