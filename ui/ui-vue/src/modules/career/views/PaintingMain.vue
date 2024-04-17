<template>
  <BngCard class="paintingCard" bng-ui-scope="painting" ref="elCard" v-bng-on-ui-nav:back,menu="close">
    <BngButton @click="close" accent="attention" style="align-self: flex-start"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
    <Painting ref="elPainting" />
  </BngCard>

  <CareerStatus class="profileStatus" />
</template>

<script setup>
import { ref } from "vue"
import { BngCard, BngButton, BngBinding } from "@/common/components/base"
import Painting from "../components/painting/Painting.vue"
import { vBngOnUiNav } from "@/common/directives"
import CareerStatus from "../components/careerStatus.vue"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("painting")

const elCard = ref()
const elPainting = ref()

const close = () => elPainting.value.close()
</script>

<style scoped lang="scss">
.paintingCard {
  overflow: hidden;
  width: 30%;
  height: 100vh;
}

.profileStatus {
  border-radius: var(--bng-corners-2);
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
