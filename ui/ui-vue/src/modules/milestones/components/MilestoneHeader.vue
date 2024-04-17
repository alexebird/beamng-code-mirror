<template>
  <div class="milestone-header">
    <span class="header">
      <BngCardHeading class="card-heading">
        <slot name="header"></slot>
      </BngCardHeading>
    </span>
    <span class="subheader">
      <BngOldIcon v-if="icon" class="subheader-icon input-icon" :type="icon" />
      <span class="subheader-text">
        <slot name="subheader"></slot>
      </span>
    </span>
  </div>
</template>

<script setup>
import { BngCardHeading, BngOldIcon } from "@/common/components/base"

defineProps({ icon: String })
</script>

<style scoped lang="scss">
$background-color: rgba(0, 0, 0, 0.4);

.milestone-header {
  display: flex;
  flex-direction: column;
  align-items: start;
  font-family: Overpass, var(--fnt-defs);
  font-style: italic;

  > .header {
    display: inline-block;
    background: $background-color;
    border-radius: 0.44em 0.44em 0 0;

    > .card-heading {
      padding-right: 0.89em;
      margin-block-start: 0.44em;
      margin-block-end: 0.22em;
    }
  }

  > .subheader {
    display: inline-flex;
    align-items: flex-start;
    background: $background-color;
    border-radius: 0 0 0.44em 0.44em;

    padding: 0.44em 0.89em 0.22em 0.89em;

    > .subheader-text {
      font-size: 2em;
      font-weight: 800;
      line-height: 40px;
    }

    > .subheader-icon {
      padding-left: 0.67em;
      padding-right: 0.67em;
      padding-top: 0.11em;
    }
  }
}
</style>
