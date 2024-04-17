<template>
  <AccordionItem :static="static" :expanded="expanded" @expanded="itemExpanded" navigable>
    <template #caption>{{ slotNiceName }}</template>
    <template #controls>
      <BngButton
        class="buy-button"
        accent="outlined"
        @click="partShoppingStore.setSlot(slotName)"
        v-bng-tooltip:top="partNiceName"
        v-bng-on-ui-nav:ok.asMouse.focusRequired>
        <span class="buy-button-label">{{ partNiceName ? partNiceName : "Empty" }}</span>
      </BngButton>
    </template>
    <slot></slot>
  </AccordionItem>
</template>

<script setup>
import { AccordionItem } from "@/common/components/utility"
import { vBngTooltip, vBngOnUiNav } from "@/common/directives"
import { BngButton } from "@/common/components/base"
import { usePartShoppingStore } from "../../stores/partShoppingStore"

const props = defineProps({
  static: Boolean,
  expanded: Boolean,
  slotName: String,
  slotNiceName: String,
  partNiceName: String,
})

const partShoppingStore = usePartShoppingStore()

const itemExpanded = val => {
  partShoppingStore.setSlotExpanded(props.slotName, val)
}
</script>

<style lang="scss" scoped>
.buy-button {
  max-width: 10em !important;
  min-height: unset;
  padding-top: 0.3em;
  padding-bottom: 0.2em;
  .buy-button-label {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
