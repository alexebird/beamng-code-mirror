<template>
  <div class="bindings-infobar">
    <div v-for="item in items" class="action-group" :class="[`input-${item.inputType}`]">
      <div v-if="item.modifiers" class="action-modifiers">
        <BngBinding v-for="binding in item.modifiers" :key="binding" class="modifier" :action="binding" />
        <span>+</span>
      </div>
      <div v-if="item.actions && item.actions">
        <BngBinding v-for="binding in item.actions" :key="binding" :action="binding" />
      </div>
      <span class="action-name">
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { BngBinding } from "@/common/components/base"

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
$textColor: white;
$backgroundColor: rgba(0, 0, 0, 0.5);

.bindings-infobar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $textColor;

  > .action-group {
    display: flex;
    align-items: baseline;
    padding: 0.25rem;
    border-radius: 0.25rem;
    background: $backgroundColor;

    &:not(:last-child) {
      margin-right: 0.5rem;
    }

    > .action-name {
      padding: 0 0.25rem 0 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.5rem;
    }

    > .action-modifiers {
      display: flex;
      align-items: center;
    }

    &.input-xinput :deep(.bng-binding-icon) {
      font-size: 1.5rem;
      min-width: 0;
      min-height: 0;
    }
  }
}
</style>
