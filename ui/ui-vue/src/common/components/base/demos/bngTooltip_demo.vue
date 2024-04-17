<template>
  <div class="bng-tooltip-demo">
    <div class="outer-div">
      <div class="inner-div">
        <BngTooltip position="left" text="test">
          <BngButton disabled>BngButton</BngButton>
        </BngTooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BngButton, BngTooltip } from "@/common/components/base"
</script>

<style scoped lang="scss">
.bng-tooltip-demo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  >.outer-div {
    padding: 6em;
    border: 2px solid orange;

    >.inner-div {
      padding: 1em;
      border: 2px solid blue;
    }
  }
}
</style>