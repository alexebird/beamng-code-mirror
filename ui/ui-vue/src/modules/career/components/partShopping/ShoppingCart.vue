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
            <BngButton
              v-if="part.sourcePart"
              :disabled="partShoppingData.tutorialPartNames"
              @click="lua.career_modules_partShopping.removePartBySlot(part.slot)"
              >remove</BngButton>
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
          <th class="price" style="padding-top: 5px; font-size: 1.3em"><BngUnit :beambucks="partShoppingData.shoppingCart.total" /></th>
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
        @click="confirmPurchase">
        Purchase Parts
      </BngButton>
      <BngButton :disabled="partShoppingData.tutorialPartNames" @click="confirmCancel" accent="secondary">Cancel</BngButton>
    </template>
  </BngCard>
</template>

<script setup>
import { computed, ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngButton, BngCard, BngCardHeading, BngUnit } from "@/common/components/base"
import { openConfirmation } from "@/services/popup"
import { $translate } from "@/services/translation"

const { units } = useBridge()

const CONFIRM_BUTTONS = [
  { label: $translate.instant("ui.common.yes"), value: true },
  { label: $translate.instant("ui.common.no"), value: false, extras: { accent: "attention" } },
]

const confirmPurchase = async () => {
  ;(await confirm("Are you sure you want to purchase these parts?")) && applyShopping()
}

const confirmCancel = async () => {
  if (props.partShoppingData.shoppingCart.partsInList.length) {
    ;(await confirm("Are you sure you want to cancel?<br />All changes to your vehicle will be reversed")) && cancelShopping()
  } else {
    cancelShopping()
  }
}

const confirm = async message => await openConfirmation("", message, CONFIRM_BUTTONS)

const applyShopping = () => lua.career_modules_partShopping.applyShopping()

const cancelShopping = () => lua.career_modules_partShopping.cancelShopping()

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
</style>
