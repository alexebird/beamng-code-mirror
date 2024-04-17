<template>
  <div class="milestone-main">
    <div class="status-bar">
      <div class="status-info user-info">
        <BngOldIcon class="user-icon" :type="icons.drive.m_c" />
        <span class="username">Username</span>
      </div>
      <BngProgressBar :value="1234" :max="6789" :header-left="'Specialized'" :header-right="'lvl. 12'" class="status-info" />
      <BngProgressBar :value="1234" :max="6789" :header-left="'Specialized'" :header-right="'lvl. 12'" class="status-info" />
      <BngProgressBar :value="1234" :max="6789" :header-left="'Specialized'" :header-right="'lvl. 12'" class="status-info" />
      <BngProgressBar :value="1234" :max="6789" :header-left="'Specialized'" :header-right="'lvl. 12'" class="status-info" />
    </div>
    <div class="content-container">
      <div class="content" :class="[milestone.currentComponent]">
        <MilestoneHeader
          v-if="milestone.currentComponent === 'info' || milestone.currentComponent === 'score'"
          :icon="icons.general.beambuck"
          class="screen-header"
        >
          <template #header>Milestone reached!</template>
          <template #subheader>10000</template>
        </MilestoneHeader>
        <component :is="milestone.currentComponent" v-bind="milestone.currentProperties"></component>
      </div>
    </div>
  </div>
  <div class="debug-window">
    <BngButton @click="milestone.setCurrentComponent('bigCard')">Big card</BngButton>
    <BngButton @click="milestone.setCurrentComponent('info')">Info</BngButton>
    <BngButton @click="milestone.setCurrentComponent('branches')">Branches</BngButton>
    <BngButton @click="milestone.setCurrentComponent('score')">score</BngButton>
    <BngButton @click="milestone.setCurrentComponent('animatedBackground')">Animated BG(Testing)</BngButton>
  </div>
</template>

<script setup>
import { BngButton, BngOldIcon, BngProgressBar } from "@/common/components/base"
import { icons } from "@/assets/icons"
import MilestoneHeader from "../components/MilestoneHeader.vue"
import { useMilestoneStore } from "../milestoneStore"

const milestone = useMilestoneStore()
</script>

<style scoped lang="scss">
$status-background-color: var(--bng-ter-blue-gray-600);

.milestone-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  color: white;

  > .status-bar {
    display: flex;
    align-items: center;
    height: 4em;
    width: 100%;
    padding-bottom: 0.5em;
    background: $status-background-color;

    > * {
      flex-basis: 0;
      flex-grow: 1;
    }

    > .user-info {
      display: flex;
      align-items: center;

      > .user-icon {
        width: 16px;
        height: 18px;
        margin-right: 12px;
      }

      > .username {
        line-height: 100%;
      }
    }

    > .status-info {
      padding: 0 0.5em;
    }
  }

  > .content-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 4em);
    width: 100%;

    > .content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      height: 24em;
      width: 50em;

      &.bigCard {
        height: 30em;
        width: 50em;
      }

      &.info {
        height: 27.5em;
      }

      > .screen-header {
        padding-bottom: 1em;
      }

      > .content-card {
        flex-basis: 0;
        flex-grow: 1;
      }
    }
  }
}

.debug-window {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  top: calc(50%);
  left: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
}
</style>
