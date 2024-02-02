<!-- bngCard - a generic card -->
<template>
  <div class="bng-card-wrapper">
    <div class="card-cnt">
      <slot>BNG Card</slot>
    </div>
    <div ref="buttonsContainer" class="buttons" v-if="slots.buttons">
      <slot name="buttons"></slot>
    </div>
    <div ref="buttonsContainer" class="buttons" v-if="slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { useSlots, computed, ref } from "vue"

const slots = useSlots()
const hasButtons = computed(() => slots.buttons)
const hasFooter = computed(() => slots.footer)
const buttonsContainer = ref()

defineExpose({
  buttonsContainer
})


</script>

<style lang="scss" scoped>
.bng-card-wrapper {
  --bg-opacity: 0.6;
  font-size: 1rem;
  font-family: Overpass, var(--fnt-defs);
  background-color: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  border-radius: var(--bng-corners-2);
  height: fit-content;

  & > :first-child {
    overflow: hidden;
    height:inherit;
    border-top-left-radius: var(--bng-corners-2);
    border-top-right-radius: var(--bng-corners-2);
  }

  & > :last-child {
    overflow: hidden;
    border-bottom-left-radius: var(--bng-corners-2);
    border-bottom-right-radius: var(--bng-corners-2);
  }

  & > .card-cnt {
    background-color: rgba(black, var(--bg-opacity));
    display: flex;
    flex-flow: column nowrap;
    // background-color: rgba(black, var(--bg-opacity));
    flex: 0 1 auto;
  }
  & > .buttons {
    background-color: rgba(var(--bng-ter-blue-gray-900-rgb), calc(var(--bg-opacity) + 0.2));
    border-top: 0.125em solid rgba(var(--bng-ter-blue-gray-800-rgb), calc(var(--bg-opacity) + 0.2));
    display: flex;
    justify-content: flex-end;
    padding: 0 0.5em 0.25em 0.5em;
    margin-top: auto;
    flex: 0 0 auto;
    & > .bng-button {
      margin: 0.5em;
    }
    // & > :not(:last-child) {
    //   margin-right: 0.5em;
    // }
    & :first-child:last-child {
      flex: 1 1 auto;
      justify-content: center;
    }
  }

  :deep(.content) {
    padding: 0.5em 0.75em;
  }
}
</style>
