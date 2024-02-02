<template>
  <div class="cost">
    <BngIcon class="beam-buck" :type="icons.general.beambuck"></BngIcon><span class="value">{{ units.beamBucks(totalCost) }}</span>
  </div>
  <div class="price">
    <span class="per-unit">
      <span class="value">
        {{ displayPrice }}
      </span>
      <span class="divider" />
      <span class="unit">{{ refuelStore.getUnitLabel(refuelStore.currentEnergyType) }}</span>
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { BngIcon } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"
import { useBridge } from "@/bridge"
import { useRefuelStore } from "@/modules/refuel/refuelStore"

const { units } = useBridge()

const refuelStore = useRefuelStore()

const displayPrice = computed(() => Math.round(refuelStore.convertToPricePerLocalUnit(props.pricePerUnit, refuelStore.currentEnergyType) * 100) + 0.9)

const props = defineProps({
  totalCost: {
    type: Number,
    required: true,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  unitLabel: {
    type: String,
    required: true,
  },
})
</script>

<style scoped lang="scss">
.beam-buck {
  width: 1em;
  height: 1em;
  display: inline-block;
  top: 1em;
}
.cost {
  text-align: center;
  font-weight: 800;
  font-style: italic;
  font-size: 2.2em;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price {
  text-align: center;
  font-weight: 800;
  font-style: italic;
  font-size: 1.25em;
  margin-top: -0.25em;
  padding: 0 1rem 1rem 1rem;
  .per-unit {
    display: flex;
    align-items: center;
    justify-content: center;
    .value {
      display: flex;
    }
  }
}

.unit {
  font-weight: 400;
  font-size: 0.66em;
  font-style: normal;
}

.divider {
  display: inline-block;
  width: 0.125rem;
  align-self: stretch;
  min-height: 1em;
  background: #ffffff;
  transform: matrix(0.94, 0, -0.37, 1, 0, 0);
  position: relative;
  margin: 0.4em 0.25em;
}
</style>
