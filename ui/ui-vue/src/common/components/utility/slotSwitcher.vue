<!-- SlotSwitcher - for grouping multiple controls as one -->
<template>
    <slot :name="slotId" v-bind="$attrs"></slot>
</template>

<script setup>
    
  defineProps({
    slotId: {
      type: String,
      default: 'default'
    }
  })

</script>
