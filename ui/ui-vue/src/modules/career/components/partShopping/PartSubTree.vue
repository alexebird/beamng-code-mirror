<template>
  <Accordion>
    <SlotItem v-for="slot in slots"
      :ref="el => slotItemRefs.push(el)"
      :static="!slot.part || slot.part.slots.length === 0"
      :expanded="partShoppingStore.expandedSlots[slot.slotName]"
      :slotName="slot.slotName"
      :slotNiceName="slot.slotNiceName"
      :partNiceName="slot.part ? slot.part.niceName : null"
    >
      <PartSubTree
        v-if="slot.part && slot.part.slots"
        :slots="slot.part.slots"
      />
    </SlotItem>
  </Accordion>
</template>

<script setup>
import { Accordion } from "@/common/components/utility"
import SlotItem from "./SlotItem.vue"
import PartSubTree from "./PartSubTree.vue"
import { usePartShoppingStore } from "../../stores/partShoppingStore"
import { ref, onMounted } from "vue"

const slotItemRefs = ref([])

const props = defineProps({
  slots: Object
})

const partShoppingStore = usePartShoppingStore()

const start = () => {
  if (partShoppingStore.slotToScrollTo) {
    for (const [index, slot] of Object.entries(props.slots)) {
      if (slot.slotName == partShoppingStore.slotToScrollTo) {
        slotItemRefs.value[index].$el.scrollIntoView()
        partShoppingStore.slotToScrollTo = undefined
        return
      }
    }
  }
}

onMounted(start)
</script>

<style lang="scss" scoped>
</style>
