<!-- BNGTooltip Directive Demo -->
<template>
  <div class="tooltip-directive-demo">
    <h1>Tooltip Demo</h1>
    <h3>Disabled BngButton don't work because of pointer events set to none. Please use BngTooltip component instead.</h3>
    <div class="tooltip-items">
      <span v-bng-tooltip="'test'" tabindex="0" >span</span>
      <button v-bng-tooltip="'button tooltip'" disabled>disabled</button>

      <button v-bng-tooltip:left="'left tooltip'" tabindex="0" >left</button>
      <button v-bng-tooltip:top="'button tooltip'" tabindex="0" >top</button>
      <button v-bng-tooltip:bottom="'bottom tooltip'" tabindex="0" >bottom</button>
      <button v-bng-tooltip:right="'right tooltip'" tabindex="0" >right</button>
      <button v-bng-tooltip:right="{text: 'width delay tooltip', hideDelay: 500}" tabindex="0" >with delay</button>
    </div>
  </div>
</template>

<script setup>
import { vBngTooltip } from "@/common/directives"
</script>

<style scoped lang="scss">
.tooltip-directive-demo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
