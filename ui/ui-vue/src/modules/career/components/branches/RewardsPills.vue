<template>
  <div class="rewards-pills-container">
    <div class="pill" v-for="reward in rewards">
      <BngUnit v-if="!hideNumbers && reward.attributeKey == 'money'" :beambucks="reward.rewardAmount" />
      <BngPropVal v-if="!hideNumbers && reward.attributeKey !== 'money'" :iconType="rewardIcon(reward)" :shrinkNum="false" :valueLabel="reward.rewardAmount" />
      <BngIcon v-if="hideNumbers" class="reward-icon" :type="rewardIcon(reward)" />
    </div>
  </div>
</template>

<script setup>
import { BngUnit, BngIcon, BngPropVal, icons } from "@/common/components/base"

const props = defineProps({
  rewards: Object,
  hideNumbers: Boolean,
})

const logProps = reward => {
  console.log({
    iconType: icons[REWARD_UNIT_TYPES[reward.attributeKey]],
    valueLabel: reward.rewardAmount,
    rewardAttrKey: reward.attributeKey,
  })
  // Return nothing or something that doesn't affect your template
  return null
}

const rewardIcon = reward => (icons[REWARD_UNIT_TYPES[reward.attributeKey]] ? icons[REWARD_UNIT_TYPES[reward.attributeKey]] : icons.noIcon)
</script>

<script>
const REWARD_UNIT_TYPES = {
  money: "beamCurrency",
  beamXP: "beamXPLo",
  bonusStars: "starSecondary",
  motorsport: "raceFlag",
  adventurer: "jump",
  destruction: "barrelKnocker01",
  control: "barrelKnocker02",
  specialized: "carChase01",
  criminal: "evade",
  police: "wigwags",
  drift: "drift01",
  racing: "AIRace",
  timeTrial: "stopwatchSectionOutlinedEnd",
  crawl: "rockCrawling01",
  jumping: "targetJump",
  delivery: "boxPickUp03",
  parcelDelivery: "boxPickUp03",
  trailerDelivery: "smallTrailer",
  vehicleDelivery: "keys1",
  materialDelivery: "stack3",
  labourer: "deliveryTruckArrows",
  miniGames: "cup",
  apexRacing: "circuit",
}
</script>

<style scoped lang="scss">
.rewards-pills-container {
  display: flex;
  align-items: baseline;
  flex-flow: row wrap;
  margin: -0.125rem;
  .pill {
    display: flex;
    border-radius: 0.5rem;
    margin: 0.125rem;
    padding: 0.1rem 0.3rem 0.1rem 0.3rem;
    background: rgba(var(--bng-cool-gray-900-rgb), 0.5);
    .reward-icon {
      padding-top: 0.15rem;
      padding-right: 0.2rem;
      font-weight: 400;
    }
  }
}
</style>
