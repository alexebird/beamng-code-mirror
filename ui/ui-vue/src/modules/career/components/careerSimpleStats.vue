<template>
  <div class="flex-row">
    <div class="player-content">
      {{ careerStatsData.saveSlotName }}
    </div>
    <div class="stats-row">
      <div class="stat-content" v-for="branch in careerStatsData.branches">
        <BngProgressBar
          class="stat-progress-bar"
          :headerLeft="branch.name"
          :headerRight="branch.levelLabel"
          :min="branch.min"
          :value="branch.value"
          :max="branch.max"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { lua } from "@/bridge"
import { BngProgressBar } from "@/common/components/base"
import { $translate } from "@/services"

const careerStatsData = ref({})

const handleCareerSimpleStats = data => {
  data.branches.forEach(entry => {
    if (entry.hasOwnProperty("levelLabel")) {
      entry.name = $translate.contextTranslate(entry.name, true)
      entry.levelLabel = $translate.contextTranslate(entry.levelLabel, true)
    }
  })

  careerStatsData.value = data
}

const updateDisplay = () => {
  lua.career_modules_uiUtils.getCareerSimpleStats().then(handleCareerSimpleStats)
}

const start = () => {
  updateDisplay()
}

onMounted(start)

defineExpose({ updateDisplay })
</script>

<style lang="scss" scoped>
.flex-row {
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  background: rgba(var(--bng-cool-gray-900-rgb), 0.8);
  color: white;
}

.stats-row {
  display: flex;
  flex-direction: row;
  flex: 1 0 auto;
}

.player-content {
  display: flex;
  width: 20em;
}

.stat-content {
  display: flex;
  justify-content: center;
  flex: 1 0 20em;
  align-items: center;
  padding: 0.5em;
  .stat-progress-bar {
    flex: 1 0 auto;
  }
}
</style>
