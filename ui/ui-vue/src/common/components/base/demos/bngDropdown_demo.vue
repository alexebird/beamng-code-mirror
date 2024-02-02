<template>
  <div>
    <h3>Default</h3>
    <BngDropdown v-model="value" :items="items" @valueChanged="onValueChanged" />
  </div>
  <div>
    <h3>Disabled</h3>
    <BngDropdown v-model="value" :items="items" disabled />
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { BngDropdown } from '@/common/components/base';

const items = [
  { label: 'item 1', value: 1 },
  { label: 'item 2', value: 2 },
  { label: 'item 3', value: 3 }
]

const value = ref(null)

const onValueChanged = (value) => {
  console.log("event listener: value changed", value)
}

const stopWatcher = watch(
  () => value.value,
  (current, prev) => {
    console.log('watcher: dropdown value changed', current)
  }
)

onUnmounted(() => stopWatcher())
</script>

<style scoped lang="scss"></style>