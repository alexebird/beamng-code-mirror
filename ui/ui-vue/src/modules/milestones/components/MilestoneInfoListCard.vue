<template>
  <div class="milestone-list-card">
    <MilestoneInfoCard v-for="milestone in milestones" :key="milestone.id" :milestone="milestone" class="milestone-item"></MilestoneInfoCard>
  </div>
</template>

<script setup>
import { computed } from "vue"
import MilestoneInfoCard from "./MilestoneInfoCard"

const props = defineProps({
  milestones: {
    type: Array,
    required: true,
    validator(value) {
      return value.length > 0
    },
  },
})

const totalMilestones = computed(() => props.milestones.length)
</script>

<style scoped lang="scss">
$background-color: rgba(0, 0, 0, 0.4);
$milestone-item-margin: 1em;

.milestone-list-card {
  display: flex;
  width: 100%;
  padding: 1em;
  border-radius: 1em;
  background: $background-color;

  > .milestone-item {
    width: calc((100% - (v-bind(totalMilestones) - 1) * $milestone-item-margin) / v-bind(totalMilestones));

    &:not(:last-child) {
      margin-right: $milestone-item-margin;
    }
  }
}
</style>
