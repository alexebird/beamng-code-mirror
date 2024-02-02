<template>
  <div class="computer-main">
    <div v-if="store.canNavigatePrevious" class="screen-controls">
      <div class="control" @click="store.navigatePrevious">back</div>
    </div>
    <div class="content">
      <component :is="store.currentScreen.component" v-bind="store.currentScreen.params" @menuItemClick="store.navigateToScreen" />
    </div>
  </div>
</template>

<script setup>
import { useComputerStore } from "./stores/computerStore"

const store = useComputerStore()
</script>

<style scoped lang="scss">
.computer-main {
  > .screen-controls {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.25em;
    background: grey;

    > .control {
      padding: 0.25em 0.5em;
      background: lightblue;
      border-radius: 0.25em;
      cursor: pointer;
    }
  }

  > .content {
    padding: 0.5em 1em;
  }
}
</style>
