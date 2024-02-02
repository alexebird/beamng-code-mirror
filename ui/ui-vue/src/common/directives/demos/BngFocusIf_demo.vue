<template>
  This button won't autofocus:
  <BngButton v-bng-focus-if="false" accent="secondary">Button</BngButton>
  <br/>
  This will:
  <BngButton v-bng-focus-if="true" accent="secondary">Button</BngButton>
</template>

<script setup>
import { vBngFocusIf } from "@/common/directives"
import { BngButton } from "@/common/components/base"
</script>

<style lang="scss" scoped>
</style>
