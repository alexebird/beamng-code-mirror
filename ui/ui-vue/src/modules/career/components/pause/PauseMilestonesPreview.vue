<template>
  <AspectRatio v-bng-sound-class="'bng_click_generic'" @click="goToMilestones()" :ratio="'4:3'">
    <div class="content-wrapper">
      <BngCardHeading style="color:white;" type="ribbon">Recent Milestones</BngCardHeading>
      <div class="cards-container">
        <MilestoneCard v-for="entry in milestones.slice(0, 5)"
        :milestone="entry"
        :isCondensed="true"
        />
      </div>

      <BngButton style="position:absolute; bottom:1em; right:1em;" tabindex="1" accent="text" @click="goToMilestones()">Go to Milestones</BngButton>
    </div>
  </AspectRatio>
</template>

<script>
import { icons as iconTypes } from "@/assets/icons"
</script>

<script setup>
import { lua } from "@/bridge"
import { BngCard, BngCardHeading, BngButton} from "@/common/components/base"
import { AspectRatio } from "@/common/components/utility"
import { $content, $translate } from "@/services"
import { onMounted, onUnmounted } from "vue"
import MilestoneCard from "../milestones/MilestoneCard.vue"
import { ref, computed } from "vue"

const milestones = ref([])


//const emit = defineEmits(["goToBigMap"])
//const goToBigMap = mission => emit("goToBigMap", mission)

function setup(data) {
  milestones.value = data.list
}

const start = () => {
lua.career_modules_milestones_milestones.getMilestones().then(setup)
}

function goToMilestones() {
  window.bngVue.gotoGameState("milestones")
}



onMounted(start)
</script>

<style scoped lang="scss">

.content-wrapper {
  position:absolute;
  left:0;
  right:0;
  top:0;
  bottom:0;
  background:rgba(0,0,0,0.5);

  .cards-container {
     display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
      padding: 1rem;
  }
}

</style>
