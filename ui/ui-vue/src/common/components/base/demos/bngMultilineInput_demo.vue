<template>
  <div class="input-entry">
    <bng-multiline-input
      external-label="Multiline"
      :lines="3"
      :leading-icon="icons.general.offbtn"
      :initial-value="'hello world blah blah blah some text here'"
      :trailing-icon="icons.general.offbtn"
      floating-label="Floating Label"
    ></bng-multiline-input>
  </div>
  <div class="input-entry">
    <bng-multiline-input
      external-label="Scalable Demo"
      :scalable="true"
      :lines="3"
      :leading-icon="icons.general.offbtn"
      :initial-value="'hello world blah blah blah some text here'"
      :trailing-icon="icons.general.offbtn"
      floating-label="Floating Label"
    ></bng-multiline-input>
  </div>
</template>

<script setup>
import { BngMultilineInput } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"
</script>

<style scoped lang="scss">
.input-entry {
  margin-bottom: 1em;
}
</style>
