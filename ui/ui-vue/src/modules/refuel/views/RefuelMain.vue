<!--*** Refuelling Interface  -->
<template>
  <LayoutSingle class="layout-content-full layout-align-vcenter" v-if="refuelStore.currentFuelData">
    <BngCard class="refuel-card">
      <BngCardHeading type="ribbon">{{ $t(mainSettings.title) }}</BngCardHeading>
      <div class="gauge">
        <FuelGauge
          class="main-gauge"
          :fuelling="refuelStore.isFuelling"
          :type="mainSettings.gaugeType"
          :value="refuelStore.currentFuelLevel"
          :label="refuelStore.isFuelling ? $t(mainSettings.fuellingOngoingLabel) : ''"
          :minLabel="refuelStore.minEnergyLabel"
          :maxLabel="refuelStore.maxEnergyLabel"
        />
      </div>
      <FuelNozzle
        :refuel-type="refuelStore.currentFuelType"
        :nozzle-mode="refuelStore.nozzleMode"
        @triggerDown="refuelStore.changeFlowRate(1)"
        @triggerUp="refuelStore.changeFlowRate(0)"
      />
      <FuelInfo :total-cost="refuelStore.overallPrice" :price-per-unit="refuelStore.currentFuelData.pricePerUnit" :unit-label="mainSettings.unitLabel" />
      <div class="settings content" v-if="refuelStore.showFuelTypeSettings || refuelStore.showAmountSettings">
        <FuelTypeSettings v-if="refuelStore.showFuelTypeSettings" :html-id="'filters-container-1'" :fuel-options="refuelStore.fuelOptions" />
        <FuelAmountSettings
          v-if="refuelStore.showAmountSettings"
          :min-slider="refuelStore.minSlider"
          :max-slider="refuelStore.maxSlider"
          :unit-label="mainSettings.unitLabel"
        />
      </div>
      <template #buttons>
        <!-- <BngButton accent="text" :icon="icons.device.xbox.btn_b" @click="emits('onCancelClicked')">Cancel</BngButton>
        <BngButton :icon="icons.device.xbox.btn_a" @click="emits('onOkClicked')">Apply</BngButton> -->
        <BngButton v-if="refuelStore.canPay" @click="refuelStore.payPrice()">Pay</BngButton>
        <BngButton v-if="refuelStore.canStartFuelling" @click="refuelStore.startFuelling()">Start</BngButton>
        <BngButton v-else-if="refuelStore.canStopFuelling" @click="refuelStore.stopFuelling()">Stop</BngButton>
      </template>
    </BngCard>
  </LayoutSingle>
  <BngCard class="profileStatus">
    <CareerStatus />
  </BngCard>
</template>

<script>
import { icons } from "@/common/components/base/bngIcon.vue"

const fuellingModes = {
  fuel: {
    title: "ui.career.refuelling.modes.fuel.title",
    gaugeType: "refuel",
    nozzleIconType: icons.general.fuel_nozzle,
    fuellingOngoingLabel: "ui.career.refuelling.modes.fuel.ongoing",
    unitLabel: "L",
  },
  charge: {
    title: "ui.career.refuelling.modes.charge.title",
    gaugeType: "recharge",
    nozzleIconType: icons.general.recharge_connector,
    fuellingOngoingLabel: "ui.career.refuelling.modes.charge.ongoing",
    unitLabel: "kWh",
  },
}
</script>

<script setup>
import { onBeforeUnmount, onUnmounted, computed, onBeforeMount } from "vue"
import { useRefuelStore } from "@/modules/refuel/refuelStore"
import { LayoutSingle } from "@/common/layouts"
import { BngCard, BngCardHeading, BngButton } from "@/common/components/base"
import FuelGauge from "@/modules/refuel/components/FuelGauge.vue"
import FuelTypeSettings from "../components/FuelTypeSettings.vue"
import FuelNozzle from "../components/FuelNozzle.vue"
import FuelInfo from "../components/FuelInfo.vue"
import FuelAmountSettings from "../components/FuelAmountSettings.vue"
import { CareerStatus } from "@/modules/career/components"

const refuelStore = useRefuelStore()
// const emits = defineEmits(['okClick', 'cancelClick', 'startRefuel', 'stopRefuel'])

const mainSettings = computed(() => fuellingModes[refuelStore.currentFuelType])
// const mainSettings = computed(() => fuellingModes[props.mode])

onBeforeMount(() => {
  refuelStore.requestFuelingData()
})

onBeforeUnmount(() => {
  refuelStore.cancelTransaction()
})

onUnmounted(() => {
  refuelStore.$dispose()
})
</script>

<style lang="scss" scoped>
$textcolor: #fff;
$fontsize: 16px;

.layout-content {
  color: $textcolor;
  font-size: $fontsize;
  padding: 1em;
}

.gauge {
  display: flex;
  justify-content: center;
  margin-top: -36px;
  padding: 0.5em 1em 0;
}

.refuel-card {
  width: 330px;

  & .buttons button {
    // margin-top: 1em;
  }
}

.main-gauge {
  width: 246px;
  height: 246px;
}

:deep(.nozzle) {
  position: absolute;
  left: 100%;
  top: 0;
  mask-position: 0 45%;
  -webkit-mask-position: 0 45%;
  margin-left: 0.2em;
}

.profileStatus {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
