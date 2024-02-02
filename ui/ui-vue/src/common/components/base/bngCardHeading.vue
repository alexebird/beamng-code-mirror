<!-- bngCardHeading - a heading for a bngCard component -->
<template>
  <h2 :class="{ 'card-heading': true, [`heading-style-${type}`]: true }">
    <slot>BNG Card Heading</slot>
  </h2>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: "line",
    validator: v => ["line", "ribbon"].includes(v) || v === "",
  },
})
</script>

<style lang="scss" scoped>
.card-heading {
  font-size: 1.5rem;
  font-weight: 800;
  font-style: italic;
  
  position: relative;
  margin: 0.65em 0 0.5em 0;
  padding-left: 1.6em;
  padding-right: 0.75em;
  overflow: hidden;

  flex: 0 0 auto;
  &::before {
    content: " ";
    background: var(--bng-orange-b400);
    transform: matrix(0.94, 0, -0.38, 1, 0, 0);
    width: 0.5em;
    position: absolute;
    height: 1em;
    left: 0.65em;
    top: 0.1em;
  }
  &.heading-style-ribbon::before {
    width: 1.5em;
    left: -0.35em;
  }
}
</style>
