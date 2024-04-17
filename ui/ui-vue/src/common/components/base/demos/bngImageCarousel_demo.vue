<template>
  <div>
    <p>
      The same props as <code>carousel</code> utility but instead of adding <code>&lt;carousel-item&gt;</code> in the slot, pass the images array in the
      <code>images</code> property instead
    </p>
    <BngImageCarousel :images="images" transition transitionType="smooth" loop></BngImageCarousel>
  </div>
</template>

<script setup>
import { BngImageCarousel } from "@/common/components/base"

const images = ["test/images/milestone-1.png", "test/images/milestone-2.png", "test/images/milestone-3.png"]
</script>

<style lang="scss" scoped>
.demo-carousel {
  height: 100px;
}
</style>
