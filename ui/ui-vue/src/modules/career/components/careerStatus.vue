<template>
  <div>
    <div class="career-status-progress">
      <div class="career-status-value">
        <BngIcon span class="icon" :title="icons.general.beamxp" :type="icons.general.beamXP" :color="'#fff'"></BngIcon>
        <div>{{ careerStatusData.beamXP }}</div>
      </div>
      <div class="vertical-divider"></div>
      <div class="career-status-value">
        <BngIcon span class="icon" :title="icons.general.star_outlined" :type="icons.general.star_outlined" :color="'var(--bng-add-blue-300)'"></BngIcon>
        <div>{{ careerStatusData.bonusStars }}</div>
      </div>
      <div class="vertical-divider"></div>
      <div class="career-status-value">
        <BngIcon span class="icon" :title="icons.general.beambuck" :type="icons.general.beambuck"></BngIcon>
        <div>{{ units.beamBucks(careerStatusData.money) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngIcon } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const { units } = useBridge()

const careerStatusData = ref({})

const handleCareerStatusData = data => (careerStatusData.value = data)

const updateDisplay = () => {
  lua.career_modules_uiUtils.getCareerStatusData().then(handleCareerStatusData)
}

const start = () => {
  updateDisplay()
}

onMounted(start)

defineExpose({ updateDisplay })
</script>

<style lang="scss" scoped>
.career-status-progress {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;

  .icon {
    width: 1em;
    height: 1em;
  }
  .career-status-value {
    display: flex;
    flex-flow: row nowrap;
    align-items: baseline;
    & > :first-child {
      margin-right: 0.125em;
    }
    & > :nth-child(2) {
      // transform: translateY(7%);
    }
  }
}

.vertical-divider {
  margin: 0.4em 0.4em 0.4em 0.5em;
  padding-left: 2px;
  background: #fff;
  transform: skewX(-20deg);
  align-self: stretch;
}

.career-status-value {
  flex-direction: row;
  display: flex;
  justify-content: center;
  padding: 0;
  align-items: flex-start;
  font-style: italic;
  font-weight: 700;
  padding-right: 0.25rem;
  padding-left: 0.25rem;
}
</style>
