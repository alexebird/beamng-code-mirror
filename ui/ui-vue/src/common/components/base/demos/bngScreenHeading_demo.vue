<template>
  <div class="demo-entry">
    <label>Demo with divider</label>
    <BngScreenHeading :preheadings="locations" :divider="true"> BNG Screen Heading Content </BngScreenHeading>
  </div>
  <div class="demo-entry">
    <label>Demo without divider</label>
    <BngScreenHeading :preheadings="locations"> BNG Screen Heading Content </BngScreenHeading>
  </div>
  <div class="demo-entry">
    <label>Demo Ribbon</label>
    <BngScreenHeading :preheadings="locations" type="ribbon"> BNG Screen Heading Content </BngScreenHeading>
  </div>
  <div class="demo-entry">
    <label>Demo Multiline</label>
    <BngScreenHeading :preheadings="locations" :divider="true" type="line" style="max-width: 40em">
      If I’m multi-line, then background should behave like a block
    </BngScreenHeading>
  </div>
</template>

<script setup>
import { BngScreenHeading } from "@/common/components/base"

const locations = ["Freeroam", "Freeroam"]
</script>

<style scoped lang="scss">
.demo-entry {
  margin-bottom: 1em;
}
</style>
