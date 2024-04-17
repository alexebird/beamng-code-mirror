<!-- Tab List -->
<template>
  <ul class="tab-list">
    <li bng-nav-item tabindex="0" v-for="(tab, i) in tabs" :key="i" @click="selectTab(i)" :class="tabHeaderClasses(tab)">{{ tab.heading }}</li>
  </ul>
</template>

<script setup>
import { inject } from "vue"

const props = defineProps({
    makeTabHeaderClasses: Function,
  }),
  tabs = inject("tabs"),
  selectTab = inject("selectTab"),
  tabHeaderClasses = tab => ({
    "tab-item": true,
    "tab-active-tab": tab.active,
    ...(props.makeTabHeaderClasses && props.makeTabHeaderClasses(tab)),
  })
</script>
