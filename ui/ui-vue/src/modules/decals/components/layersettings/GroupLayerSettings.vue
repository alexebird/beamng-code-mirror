<template>
  <div class="group-layer-settings">
    <div class="settings-group color-settings">
      <div class="settings-group-items">
        <bng-input v-model="data.name" :prefix="'Group Name'" />
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

const emits = defineEmits(["valueChanged"])

watch(
  () => data,
  () => {
    emits("valueChanged", data.value)
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.group-layer-settings {
}
</style>
