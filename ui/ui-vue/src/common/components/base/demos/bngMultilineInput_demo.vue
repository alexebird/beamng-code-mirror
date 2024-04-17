<template>
  <div class="input-entry">
    <BngMultilineInput
      external-label="Multiline"
      :lines="3"
      :leading-icon="icons.bus"
      :initial-value="'hello world blah blah blah some text here'"
      :trailing-icon="icons.bus"
      floating-label="Floating Label" />
  </div>
  <div class="input-entry">
    <BngMultilineInput
      external-label="Scalable Demo"
      :scalable="true"
      :lines="3"
      :leading-icon="icons.bus"
      :initial-value="'hello world blah blah blah some text here'"
      :trailing-icon="icons.bus"
      floating-label="Floating Label" />
  </div>
</template>

<script setup>
import { BngMultilineInput, icons } from "@/common/components/base"
</script>

<style scoped lang="scss">
.input-entry {
  margin-bottom: 1em;
}
</style>
