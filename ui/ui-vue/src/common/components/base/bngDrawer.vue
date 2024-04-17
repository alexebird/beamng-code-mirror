<!-- bngDrawer - a generic drawer component -->
<template>
  <div class="bng-drawer">
    <div v-bng-blur="blur" class="header-wrapper">
      <BngCardHeading class="header" type="ribbon">
        <template v-if="header">{{ header }}</template>
        <slot v-else name="header"></slot>
      </BngCardHeading>
      <slot name="headerOptions"></slot>
    </div>
    <BngCard v-bng-blur="blur">
      <div class="content">
        <slot name="content"></slot>
      </div>
    </BngCard>
  </div>
</template>

<script setup>
import { BngCard, BngCardHeading } from "@/common/components/base"
import { vBngBlur } from "@/common/directives"

defineProps({
  header: {
    type: String,
  },
  blur: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped lang="scss">
.bng-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  font-family: Overpass, var(--fnt-defs);

  > .header-wrapper {
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-radius: 8px 8px 0 0;
    background-color: rgba(0, 0, 0, 0.6);

    :deep(.header) {
      font-weight: 800;
      font-size: 1.5rem;
      margin-block: 0;
      margin: 0.5em 1em 0.25em 0;
      margin-block-start: 0.5em 1em 0.25em 0;
    }
  }

  :deep(.bng-card-wrapper) {
    border-radius: 0 8px 0 0;
    background: rgba(0, 0, 0, 0.6);
    max-width: 100%;
    height: 100%;

    > .card-cnt {
      height: 100%;
      background: transparent;

      > .content {
        height: 100%;
      }
    }
  }
}
</style>
