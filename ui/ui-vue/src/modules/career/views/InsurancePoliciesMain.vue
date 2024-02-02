<template>
  <div bng-ui-scope="insurancePolicies">
    <BngCard class="insurancePoliciesListCard">
      <div class="innerList" bng-nav-scroll bng-nav-scroll-force>
        <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="close"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
        <BngCardHeading style="text-align: left"> Insurance policies </BngCardHeading>
        <InsurancePoliciesList />
      </div>
      <CareerStatus class="status" ref="careerStatusRef" />
    </BngCard>
  </div>
</template>

<script setup>
import { useBridge, lua } from "@/bridge"
import { onBeforeMount, onUnmounted, ref } from "vue"
import { useInsurancePoliciesStore } from "../stores/insurancePoliciesStore"
import { vBngOnUiNav } from "@/common/directives"
import { BngButton, BngCard, BngCardHeading, BngBinding } from "@/common/components/base"
import { CareerStatus } from "@/modules/career/components"
import InsurancePoliciesList from "../components/insurancePolicies/insurancePoliciesList.vue"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("insurancePolicies")

const careerStatusRef = ref()

const { units } = useBridge()

const insurancePoliciesStore = useInsurancePoliciesStore()

const start = () => {
  insurancePoliciesStore.requestInitialData()
}

const kill = () => {
  lua.extensions.hook("onExitInsurancePoliciesList")
  //insuranceStore.partInventoryClosed()
  insurancePoliciesStore.$dispose()
}

onBeforeMount(start)
onUnmounted(kill)

const close = () => {
  insurancePoliciesStore.closeMenu()
}
</script>

<style scoped lang="scss">
.insurancePoliciesListCard {
  overflow-y: hidden;
  height: 100vh;
  padding: 10px;
  color: white;
  background-color: rgba(0, 0, 0, 0.9);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.innerList {
  height: 95vh;
  overflow-y: scroll;
  padding: 20px;
}

.status {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.modalPopup {
  position: fixed;
  background: #ffffffea;
  width: 30%;
  height: 30%;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  text-align: center;
}
</style>
