<template>
  <BngCard class="categoryList">
    <div class="innerList">
      <div v-if="partShoppingStore.category === ''">
        <div style="width: 100%; display: flex">
          <span style="padding: 0.5em"
            ><BngButton @click="lua.career_modules_partShopping.cancelShopping()" accent="attention"
              ><BngBinding ui-event="back" deviceMask="xinput" />Cancel</BngButton
            ></span
          >
          <h1 style="width: 100%; text-align: center">Categories</h1>
        </div>

        <BngButton :disabled="partShoppingStore.partShoppingData.tutorialPartNames !== undefined" @click="partShoppingStore.setCategory('everything')"
          >All Parts</BngButton
        >
        <BngButton @click="partShoppingStore.setCategory('cargo')">Cargo Parts</BngButton>
      </div>
      <div v-else>
        <SlotList />
      </div>
    </div>
  </BngCard>
</template>

<script setup>
import { lua } from "@/bridge"
import { BngButton, BngCard, BngBinding } from "@/common/components/base"
import SlotList from "./SlotList.vue"
import { usePartShoppingStore } from "../../stores/partShoppingStore"
import { onMounted } from "vue"

const partShoppingStore = usePartShoppingStore()

onMounted(() => {
  partShoppingStore.backAction = () => lua.career_modules_partShopping.cancelShopping()
})
</script>

<style scoped lang="scss">
.categoryList {
  position: relative;
  display: block;
  //padding-right: 10px;
  width: 400px;
  overflow-y: hidden;
  //height: 100vh;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.innerList {
  height: 100vh;
  overflow-y: auto;
}
</style>
