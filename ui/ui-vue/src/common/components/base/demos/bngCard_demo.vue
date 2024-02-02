<template>
  <LayoutSingle class="layout-content-full layout-align-center">
    <div class="demo-cards">
      <BngCard class="demo-card" style="width: 375px; height: 540px;">
        <BngCardHeading type="ribbon">Ribbon Heading</BngCardHeading>
        <div class="content">Card content</div> 
        <template #buttons>
          <BngButton accent="text">Cancel</BngButton>
          <BngButton label="Apply" />
        </template>
      </BngCard>
      <BngCard class="demo-card">
        <BngCardHeading>Line Heading (Default)</BngCardHeading>
        <div class="content">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a tincidunt quam. Mauris vitae mattis augue. Donec ut urna a massa eleifend imperdiet.</div>
        <template #buttons>
          <BngButton label="OK" />
        </template>
      </BngCard>
    </div>
  </LayoutSingle>
</template>

<script setup>
import { LayoutSingle } from "@/common/layouts"
import { BngCard, BngButton, BngCardHeading } from "@/common/components/base"
</script>

<style scoped lang="scss">
.demo-cards {
  display: flex;
}

.demo-card {
  margin: 1em;
}
</style>
