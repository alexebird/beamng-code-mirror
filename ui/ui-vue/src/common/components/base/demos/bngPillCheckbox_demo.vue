<template>
  <div class="entry-example">
    Checked
    <BngPillCheckbox v-model="data.checkedDefault" @value-changed="valChanged">Electronics</BngPillCheckbox>
  </div>
  <div class="entry-example">
    Checked different icon
    <BngPillCheckbox v-model="data.checkedDiffIcon" :marked-icon="icons.bus">Electronics</BngPillCheckbox>
  </div>
  <div class="entry-example">
    Checked no icon
    <BngPillCheckbox v-model="data.checkedNoIcon" :marked-icon="false">Electronics</BngPillCheckbox>
  </div>
  <div class="entry-example">
    Unchecked (default icon)
    <BngPillCheckbox v-model="data.uncheckedDefault">Electronics</BngPillCheckbox>
  </div>
</template>

<script setup>
import { BngPillCheckbox, icons } from "@/common/components/base"
import { reactive } from "vue"

const data = reactive({
  checkedDefault: true,
  checkedDiffIcon: true,
  checkedNoIcon: true,
  uncheckedDefault: false,
})
const valChanged = v => console.log(v)
</script>

<style scoped lang="scss">
.entry-example {
  margin-top: 8px;
}
</style>
