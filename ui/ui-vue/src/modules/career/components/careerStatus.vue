<template>
  <div>
    <div class="career-status-progress">
      <BngUnit class="career-status-value" :xp="careerStatusData.beamXP" />
      <BngDivider />
      <BngUnit class="career-status-value" :bonusstars="careerStatusData.bonusStars" />
      <BngDivider />
      <BngUnit class="career-status-value" :beambucks="careerStatusData.money" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { lua } from "@/bridge"
import { BngUnit, BngDivider } from "@/common/components/base"

const careerStatusData = ref({})

const handleCareerStatusData = data => (careerStatusData.value = data)

const updateDisplay = () => lua.career_modules_uiUtils.getCareerStatusData().then(handleCareerStatusData)

onMounted(updateDisplay)

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

// FIXME - this is relying on a conflict with AngularJS CSS in main.css - this class is worryingly used a lot around the place
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
  color: white;
}
</style>
