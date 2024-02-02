<template>
  <div
    class="item"
    v-bng-disabled="data.disabled"
  >
    <BngIcon class="item-icon" v-if="icon" :type="data.icon || iconDefs.general.unknown" />
    <span class="item-label">
      {{ typeof data === "string" ? data : data.label }}
    </span>
  </div>
</template>

<script>
export default {
  width: 5.25, // em
  margin: 0.25, // em, on each side
}
</script>

<script setup>
import { vBngDisabled } from "@/common/directives"
import { BngIcon } from "@/common/components/base"
import { icons as iconDefs } from "@/common/components/base/bngIcon.vue"

defineProps({
  icon: {
    type: Boolean,
    default: true,
  },
  data: {
    type: [Object, String],
    required: true,
  },
})
</script>

<style lang="scss" scoped>
.item { /* item */
  // flex: 1 0 calc(25% - 0.5em);
  // width: calc(25% - 0.5em);
  // max-width: calc(25% - 0.5em);
  height: 5.25em;
  margin: 0.25em;

  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;

  background-color: rgba(0, 0, 0, 0.5);
}
.item-icon {
  min-width: 3em;
  min-height: 3em;
  margin-bottom: 0.25em;
}
.item-label {
  display: block;
  width: 100%;
  font-size: 0.8em;
  text-align: center;
  color: #fff;
}
.item-installed .item-icon { /* installed part */
  background-color: var(--bng-orange);
}
.item-installed .item-label { /* installed part */
  color: var(--bng-orange);
}
</style>
