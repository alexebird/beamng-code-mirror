<template>
  <BngCard class="shoppingCart">
    <BngCardHeading>Shopping Cart</BngCardHeading>
    <div class="innerShoppingCart" v-if="partShoppingData.shoppingCart">
      <table style="width: 100%">
        <tr>
          <th></th>
          <th class="article">Part</th>
          <th class="price">Price</th>
        </tr>
        <tr v-for="part in partShoppingData.shoppingCart.partsInList">
          <td>
            <BngButton v-if="part.sourcePart" :disabled="partShoppingData.tutorialSlots" @click="lua.career_modules_partShopping.removePartBySlot(part.slot)"
              >remove</BngButton
            >
          </td>
          <td class="article">{{ part.description.description }}</td>
          <td class="price">{{ units.beamBucks(part.finalValue) }}</td>
        </tr>
        <tr>
          <th></th>
          <th class="article" style="padding-top: 20px; padding-bottom: 20px">Subtotal</th>
          <th class="price">{{ units.beamBucks(subtotal) }}</th>
        </tr>
        <tr>
          <th></th>
          <th class="article" style="padding-bottom: 10px">Sales Tax (7%)</th>
          <th class="price" style="padding-bottom: 10px">{{ units.beamBucks(salesTax) }}</th>
        </tr>
        <tr>
          <th></th>
          <th class="article" style="padding-top: 5px; font-size: 1.3em">Total</th>
          <th class="price" style="padding-top: 5px; font-size: 1.3em">{{ units.beamBucks(partShoppingData.shoppingCart.total) }}</th>
        </tr>
      </table>
    </div>
    <template #buttons>
      <BngButton
        :disabled="
          !partShoppingData.shoppingCart ||
          !partShoppingData.shoppingCart.partsInList.length ||
          partShoppingData.shoppingCart.total > partShoppingData.playerMoney
        "
        @click="setPopupType('purchase')"
      >
        Purchase Parts
      </BngButton>
      <BngButton :disabled="partShoppingData.tutorialSlots" @click="setPopupType('cancel')" :accent="'secondary'">Cancel</BngButton>
    </template>
  </BngCard>

  <div v-if="popupType != ''">
    <div v-bng-blur class="blurBackground"></div>
    <BngCard class="modalPopup">
      <div v-if="popupType == 'purchase'">
        <h3 style="padding: 10px">Do you sure you want to purchase these parts? The replaced parts will be put into your inventory.</h3>
        <BngButton @click="applyShopping"> Yes </BngButton>
        <BngButton @click="setPopupType('')" accent="attention"> No </BngButton>
      </div>
      <div v-else-if="popupType == 'cancel'">
        <h3 style="padding: 10px">Are you sure you want to cancel? All changes to your vehicle will be reversed.</h3>
        <BngButton @click="cancelShopping"> Yes </BngButton>
        <BngButton @click="setPopupType('')" accent="attention"> No </BngButton>
      </div>
    </BngCard>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngButton, BngCard, BngCardHeading } from "@/common/components/base"

import { vBngBlur } from "@/common/directives"

const { units } = useBridge()

const popupType = ref(false)

const setPopupType = _popupType => {
  popupType.value = _popupType
}

const applyShopping = () => {
  setPopupType("")
  lua.career_modules_partShopping.applyShopping()
}

const cancelShopping = () => {
  setPopupType("")
  lua.career_modules_partShopping.cancelShopping()
}

const props = defineProps({
  partShoppingData: Object,
})

const subtotal = computed(() =>
  props.partShoppingData.shoppingCart.total && props.partShoppingData.shoppingCart.taxes
    ? props.partShoppingData.shoppingCart.total - props.partShoppingData.shoppingCart.taxes
    : 0
)

const salesTax = computed(() => (props.partShoppingData.shoppingCart.taxes ? props.partShoppingData.shoppingCart.taxes : 0))
</script>

<style scoped lang="scss">
.shoppingCart {
  width: 500px;
  height: 400px;
  position: absolute;
  bottom: 0;
  right: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.price {
  text-align: right;
  padding-right: 70px;
}

.article {
  text-align: left;
  padding-left: 70px;
}

.innerShoppingCart {
  overflow-y: auto;
  max-height: 80%;
  height: -webkit-fill-available;
}

.blurBackground {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.781);
}

.modalPopup {
  position: fixed;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
