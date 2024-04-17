<template>
  <div class="layer-settings-base">
    <div class="settings-heading">
      <BngCardHeading type="ribbon">
        {{ heading }}
      </BngCardHeading>
      <BngButton :icon="icons.arrowLargeLeft" accent="text" class="back-button" @click="$emit('close')">
        <BngBinding ui-event="back" deviceMask="xinput" />
        Back
      </BngButton>
    </div>
    <div class="settings-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { BngButton, BngCardHeading, BngBinding, icons } from "@/common/components/base"

defineProps({
  heading: {
    type: String,
  },
})

defineEmits(["close"])
</script>

<style lang="scss" scoped>
.layer-settings-base {
  padding: 1rem 0 1rem 0;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.25rem;
  border-bottom: 0.125rem solid var(--bng-orange-b400);

  :deep(.card-heading) {
    margin: 0;
    margin-block: 0;
  }

  > .settings-heading {
    position: relative;
    display: flex;
    align-items: center;

    :deep(.card-heading) {
      padding-left: 8rem;
    }

    .back-button {
      position: absolute;
      left: 1rem;
      font-size: 1rem;
      padding: 0.25rem 0.5rem;
      min-width: unset;
      min-height: 2.1rem;
      margin-bottom: 0;
    }
  }

  > .settings-content {
    padding: 0 0.5rem;
  }
}
</style>
