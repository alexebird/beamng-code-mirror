<template>
  Highlight: <input v-model.trim="highlight" />
  <br/>
  Text: <input v-model.trim="text" />
  <h3>Result</h3>
  <b>Case insensitive: </b>
  <span v-bng-highlighter="highlight">{{ text }}</span>
  <br/>
  <b>Case sensitive: </b>
  <span v-bng-highlighter.case="highlight">{{ text }}</span>
  <h3>RegExp</h3>
  In this example we're using <span style="font-family: monospace;">/(thing|else)/i</span> as a highlight.
  <br/>
  <b>Result: </b>
  <span v-bng-highlighter="/(thing|else)/gi">{{ text }}</span>
</template>

<script setup>
import { ref } from "vue"
import { vBngHighlighter } from "@/common/directives"

const text = ref("Something something or else!")
const highlight = ref("some")
</script>

<style lang="scss" scoped>
</style>
