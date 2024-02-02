<!-- Tab -->
<template>
  <div v-if="!loadOnDemand || tab.active" v-show="tab.active" class="tab-content">
    <slot></slot>
  </div>
</template>

<script setup>

import { inject, useAttrs } from "vue"

const
  props = defineProps({ heading: String, loadOnDemand: Boolean }),
  tab = (inject("addTab")({heading:props.heading, ...useAttrs()}))

</script>
