<template>
  <h2>BngMainStars Demo</h2>

  <span>Empty (default 0/1):</span>
  <BngMainStars class="mainStarsItem" />

  <span>Total Only (0/2):</span>
  <BngMainStars class="mainStarsItem" 
          :total-stars="2" />

  <span>Unlocked Only (1/1):</span>
  <BngMainStars class="mainStarsItem" 
          :unlocked-stars="1" />

  <span>Both (1/2):</span>
  <BngMainStars class="mainStarsItem" 
          :unlocked-stars="1"
          :total-stars="2" />
</template>

<script setup>
import { BngMainStars } from "@/common/components/base"
</script>

<style scoped>
.mainStarsItem { }
</style>