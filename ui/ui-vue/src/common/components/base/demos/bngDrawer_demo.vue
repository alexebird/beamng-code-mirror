<template>
  <BngDrawer class="drawer-demo">
    <template #header> List of items </template>
    <template #content>
      <div class="actions-demo">
        <div v-for="index in 5" :key="index" class="action-button-demo">Action {{ index }}</div>
      </div>
    </template>
  </BngDrawer>

  <BngDrawer>
    <template #header> Random text </template>
    <template #content>
      <div class="actions-demo-2">
        <div v-for="index in 12" :key="index" class="action-button-demo">Action {{ index }}</div>
      </div>
    </template>
  </BngDrawer>
</template>

<script setup>
import { BngDrawer } from "@/common/components/base"
</script>

<style scoped lang="scss">
.drawer-demo {
  margin-bottom: 0.5em;
}

.actions-demo {
  display: flex;
}

.actions-demo-2 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.action-button-demo {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100px;
  min-height: 100px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;

  &:not(:last-child) {
    margin-right: 0.5em;
  }
}
</style>
