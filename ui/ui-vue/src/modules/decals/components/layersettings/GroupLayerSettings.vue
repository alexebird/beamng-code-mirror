<template>
  <div class="group-layer-settings">
    <div class="settings-group color-settings">
      <div class="settings-group-items">
        <BngInput v-model="data.name" :prefix="'Group Name'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { BngInput } from "@/common/components/base"

const props = defineProps({
  model: {
    type: Object,
  },
})

const data = ref(props.model)

const emit = defineEmits(["valueChanged"])

watch(
  () => data,
  () => {
    emit("valueChanged", data.value)
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.group-layer-settings {
}
</style>
