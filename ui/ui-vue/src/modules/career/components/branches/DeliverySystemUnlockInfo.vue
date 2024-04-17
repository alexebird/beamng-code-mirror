<template>
  <div v-if="unlockInfo && skillInfo">
    <!-- <DeliveryProgressBar
      class="stat-progress-bar bng-progress-bar progress-bar"
      :headerLeft="$ctx_t(skillInfo.name)"
      :headerRight="$ctx_t(skillInfo.levelLabel)"
      :value="skillInfo.value"
      :max="skillInfo.max"
      :maxRequiredValue="skillInfo.maxRequiredValue"
      :tiers="skillInfo.unlockInfo"
      :currentTier="skillInfo.level" /> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import DeliveryProgressBar from "../branches/DeliveryProgressBar.vue"

const skillInfo = ref(null),
  unlockInfo = ref(null),
  props = defineProps({
    skillKey: String,
  })

onMounted(() => {
  skillInfo.value = props.info.skills.find(skill => skill.id === props.skillKey)
  unlockInfo.value = props.info.unlockedSystems[props.skillKey]
})
</script>

<style scoped lang="scss">
.lockedFacility {
  flex: 0 0 auto;
  display: flex;
  flex-flow: column;
  .unlock-progress {
    flex: 0 0 auto;
    padding: 0 0.5em 1em 0.5em;
    min-height: 2em;
  }

  .subHeader {
    margin-block-end: 0.5em;
  }

  .progressbar-background {
    display: flex;
    border-radius: var(--bng-corners-1);
    width: 100%;
  }

  .progressbar-fill {
    background-color: rgba(114, 113, 113, 0.877);
    position: absolute;
    height: 100%;
  }

  .progressbar-wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    border-radius: var(--bng-corners-1);
  }

  .progress-label {
    display: flex;
    flex-direction: row;
    z-index: 2;
    position: relative;
    padding-left: 0.5em;
    padding-top: 0.2em;

    text-align: center;
    height: 100%;
  }
}
</style>
