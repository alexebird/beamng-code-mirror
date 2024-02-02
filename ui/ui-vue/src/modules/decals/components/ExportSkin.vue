<template>
  <BngCard class="export-skin">
    <BngCardHeading type="ribbon">Export Skin</BngCardHeading>
    <div class="content">
      <BngInput v-model="skinName" floatingLabel="Skin Name" />
    </div>
    <template #buttons>
      <BngButton accent="attention" @click="$emit('cancel')">Cancel</BngButton>
      <BngButton :disabled="!skinName" @click="$emit('export', skinName)">Export</BngButton>
    </template>
  </BngCard>
</template>

<script setup>
import { ref } from "vue"
import { BngButton, BngCard, BngCardHeading, BngInput } from "@/common/components/base"

defineEmits(["cancel", "export"])

const skinName = ref(null)
</script>

<style scoped lang="scss">
.export-skin {
  width: 25rem;
}
</style>
