<template>
  <BngCard class="tuningCard" bng-ui-scope="tuning" ref="elCard" v-bng-on-ui-nav:back,menu="close">
    <Tuning ref="elTuning" :button-target="elCard && elCard.buttonsContainer" :close-button="true" />
    <template #buttons></template>
  </BngCard>
</template>

<script setup>
import { ref } from "vue"
import { BngCard } from "@/common/components/base"
// import Tuning from "../components/tuning/Tuning.vue"
import Tuning from "../../vehicleConfig/components/Tuning.vue"
import { vBngOnUiNav } from "@/common/directives"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("tuning")

const elCard = ref()
const elTuning = ref()

const close = () => elTuning.value.close()
</script>

<style scoped lang="scss">
.tuningCard {
  overflow: hidden;
  width: 30%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
