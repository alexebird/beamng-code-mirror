<template>
  <div bng-ui-scope="partShopping" class="md-content" v-bng-on-ui-nav:back,menu="goBack">
    <Categories />
    <ShoppingCart :partShoppingData="partShoppingStore.partShoppingData" />

    <BngCard class="profileStatus">
      <CareerStatus />
    </BngCard>
  </div>
</template>

<script setup>
import { default as UINavEvents, UI_EVENT_GROUPS } from "@/bridge/libs/UINavEvents"
import { onBeforeMount, onUnmounted } from "vue"
import { BngCard } from "@/common/components/base"
import { vBngOnUiNav } from "@/common/directives"
import { usePartShoppingStore } from "../stores/partShoppingStore"
import ShoppingCart from "../components/partShopping/ShoppingCart.vue"
import Categories from "../components/partShopping/Categories.vue"
import CareerStatus from "../components/careerStatus.vue"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("partShopping")

const partShoppingStore = usePartShoppingStore()

const start = () => {
  partShoppingStore.setSlot("")
  partShoppingStore.requestInitialData()
  UINavEvents.setFilteredEvents(UI_EVENT_GROUPS.focusMoveScalar)
}

const kill = () => {
  partShoppingStore.cancelShopping()
  UINavEvents.clearFilteredEvents()
  partShoppingStore.$dispose()
}

const goBack = () => {
  partShoppingStore.backAction()
}

onBeforeMount(start)
onUnmounted(kill)
</script>

<style scoped lang="scss">
.md-content {
  display: block;
  flex-flow: column;
  position: relative;
  width: 100%;
  text-align: center;
  height: 100%;
  overflow-y: hidden;
}

.profileStatus {
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
