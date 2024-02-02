<template>
  <div class="scores-card">
    <MilestoneScoreCard v-for="score in scoreCards" :score="score" class="score-card"> </MilestoneScoreCard>
    <div v-if="hiddenCards && hiddenCards.length > 0" class="score-card more-card">+ {{ hiddenCards.length }} more</div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import MilestoneScoreCard from "./MilestoneScoreCard.vue"

const props = defineProps({
  scores: {
    type: Array,
    required: true,
    validator(value) {
      return value.length > 0
    },
  },
  visibleCards: Number,
})

const hasHiddenCards = computed(() => props.visibleCards && props.visibleCards < props.scores.length)
const scoreCards = computed(() => (hasHiddenCards.value ? props.scores.slice(0, props.visibleCards) : props.scores))
const hiddenCards = computed(() => (hasHiddenCards.value ? props.scores.slice(props.visibleCards, props.scores.length) : null))
</script>

<style scoped lang="scss">
.scores-card {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 0.89em;
  border-radius: 0.89em;
  color: white;
  background: rgba(0, 0, 0, 0.4);

  > .score-card {
    flex-basis: 0;
    flex-grow: 1;

    &:not(:last-child) {
      margin-right: 1em;
    }
  }

  > .more-card {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 0.45em;
    user-select: none;
    -webkit-user-select: none;
  }
}
</style>
