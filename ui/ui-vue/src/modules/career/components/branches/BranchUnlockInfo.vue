<template>
  <div class="unlock-grid">
    <div v-for="tier in unlockInfo">
      <div class="index"> Tier {{tier.index}} </div>
      <div class="list">
        <div v-for="elem in tier.list">
          <div v-if="elem.type === 'text'"> {{elem.label}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { icons as iconTypes } from "@/assets/icons"
</script>

<script setup>
import { lua } from "@/bridge"
import { BngButton, BngBinding, BngOldIcon, BngMainStars } from "@/common/components/base"
import { AspectRatio } from "@/common/components/utility"
import { $content, $translate } from "@/services"
import { vBngRelativeTime, vBngBlur, vBngSoundClass, vBngOnUiNav } from "@/common/directives"
import { onMounted, onUnmounted } from "vue"

const props = defineProps({
  unlockInfo: Object,
  level: Object,
})


onMounted(() => {
})

onUnmounted(() => {

})
</script>

<style scoped lang="scss">

.unlock-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-rows: repeat(auto-fill);

  }


</style>
