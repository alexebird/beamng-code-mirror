<template>
  <div class="milestone-branches-card">
    <BngCard class="card">
      <BngCardHeading class="header">It’s time to branch ⎇</BngCardHeading>
      <div class="content">
        <div class="branches-container">
          <MilestoneBranchDetails v-for="branch of branches" :key="branch.id" :branch="branch" class="branch"></MilestoneBranchDetails>
        </div>
      </div>
      <template #buttons>
        <BngButton accent="text">Remind me later</BngButton>
        <BngButton>Okay</BngButton>
      </template>
    </BngCard>
  </div>
</template>

<script setup>
import { BngCard, BngCardHeading, BngButton } from "@/common/components/base"
import MilestoneBranchDetails from "./MilestoneBranchDetails"

const props = defineProps({
  branches: {
    type: Array,
    required: true,
    validator(value) {
      return value.length > 0
    },
  },
})
</script>

<style scoped lang="scss">
.milestone-branches-card {
  > .card {
    padding: 0.5em;

    &:deep(.header) {
      color: white;
    }

    .branches-container {
      display: flex;
      justify-content: center;

      > .branch {
        &:not(:last-child) {
          margin-right: 1em;
        }
      }
    }
  }
}
</style>
