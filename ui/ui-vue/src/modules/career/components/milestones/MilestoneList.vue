<template>
  <div class="list-container" v-if="milestones.length > 0">
    <div class="horizontal-container">
      <MilestoneCard v-for="milestone in milestones" :milestone="milestone" :isCondensed="true" />
    </div>
  </div>
</template>

<script>
import { icons as iconTypes } from "@/assets/icons"
</script>

<script setup>
import { lua } from "@/bridge"
import MilestoneCard from "../milestones/MilestoneCard.vue"

import { onMounted, ref } from "vue"

const milestones = ref([])

const props = defineProps({
  milestones: Array,
  filter: String,
})

function setup(m) {
  console.log(m)
  milestones.value = m
}

const start = () => {
  console.log(props)
  if (props.filter) {
    lua.career_modules_milestones_milestones.getMilestones([props.filter]).then(setup)
  } else {
    setup(props.milestones)
  }
}
onMounted(start)
</script>

<style scoped lang="scss">
.list-container {
  background-color: var(--bng-ter-blue-gray-800);
  border-radius: var(--bng-corners-1);
}

.horizontal-container {
  height: 12em;
  width: 100%;
  overflow-x: scroll;
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
}
</style>
