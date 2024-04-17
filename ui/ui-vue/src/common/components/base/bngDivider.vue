<!-- bngDivider - a simple vertical divider for text (breadcrumbs etc) -->
<template>
  <div class="divider vertical-divider"></div>
</template>

<style lang="scss" scoped>
div {
  border-top-color: rgba(255, 255, 255, 0.12);
  display: block;
  border-top-width: 1px;
  border-top-style: solid;
  margin: 0;

  &.divider {
    align-self: stretch;
  }
  &.vertical-divider {
    margin: 0.4em 0.4em 0.4em 0.5em;
    padding-left: 2px;
    background: #fff;
    transform: skewX(-20deg);
    align-self: stretch;
  }
}
</style>
