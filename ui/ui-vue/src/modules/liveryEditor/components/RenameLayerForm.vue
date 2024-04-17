<template>
  <div>
    <BngInput v-model="formModel.name" />
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

<style lang="scss" scoped></style>
