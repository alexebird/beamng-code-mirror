<!-- Slot switcher Demo -->
<template>
  Slot:<span v-for="slotID in slots" :key="slotID" class="slot-select" @click="() => (mySlot = slotID = slotID)">{{ slotID }}</span> <br /><br />
  <p>Intial slot is not set (nothing displayed). Click a slot id above to switch to it.</p>
  <p>Default props passed from slot switcher to active slot in this demo are: <code>accent="secondary" @click="showMsg"</code></p>
  <br />
  <SlotSwitcher :slotId="mySlot" accent="secondary" @click="showMsg">
    <template #default="props"><BngButton v-bind="props">Button (no overrides)</BngButton></template>
    <template #alt="props"><BngButton v-bind="props" @click="showAltMsg">Alt Button (adds its own extra&nbsp;<code>@click</code>)</BngButton></template>
    <template #third="props"
      ><BngButton v-bind="props" accent="attention">Third Button (overrides&nbsp;<code>accent</code>&nbsp;with 'attention')</BngButton></template
    >
  </SlotSwitcher>
</template>

<script setup>
import { BngButton } from "@/common/components/base"
import { SlotSwitcher } from "@/common/components/utility"
import { ref } from "vue"

const slots = ["default", "alt", "third"]

const mySlot = ref("")

function showMsg() {
  alert("Message!")
}

function showAltMsg() {
  alert("Alternate Message!")
}
</script>

<style scoped>
.slot-select {
  background-color: var(--bng-cool-gray-700);
  padding: 0.5em;
  border-radius: 0.5em;
  margin-left: 0.5em;
}

.slot-select:hover {
  color: white;
  cursor: pointer;
}
</style>
