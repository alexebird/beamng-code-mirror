<template>
  <div class="edit-form">
    <BngInput v-model="formModel.name" suffix=".dyndecals.json" />
  </div>
</template>

<script setup>
import { computed } from "vue"
import { BngInput } from "@/common/components/base"

const props = defineProps({
  modelValue: {
    type: [Object, String, Number, Boolean],
    required: true
  }
})

const emit = defineEmits(["update:modelValue"])

const formModel = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit("update:modelValue", newValue)
  }
})

</script>

<style lang="scss" scoped>
.edit-form {}
</style>