<template>
  <BngCard v-if="repairStore.vehicle.niceName" class="repairMain" style="overflow-y: hidden" bng-ui-scope="repairs">
    <BngButton v-bng-on-ui-nav:back,menu.asMouse @click="closeMenu" accent="attention" style="align-self: flex-start"
      ><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton
    >
    <BngCardHeading>Repair {{ repairStore.vehicle.niceName }}</BngCardHeading>
    <div style="margin: 0px 0px 20px 0px; display: flex">
      <div>
        <h2>Insurance information for your {{ repairStore.vehicle.niceName }} :</h2>
        <p>Policy : {{ repairStore.policyInfo.name }}</p>
        <p>Deductible : {{ repairStore.policyInfo.perks.deductible }}</p>
        <p>Current policy score : {{ repairStore.policyInfo.bonus }}</p>
        <p>Actual repair price : deductible x policy score = {{ repairStore.actualRepairPrice }}</p>
      </div>
      <div>
        <h2>Repair options :</h2>
        <div class="repairOptions">
          <div v-for="(repairOptions, key) in repairStore.repairOptions" :key="key" class="repairOption">
            <h3>{{ repairOptions.repairName }}</h3>
            <div v-if="repairOptions.repairTime == 0">
              <p>Repair time : Instant</p>
            </div>

            <div v-else>
              <p>
                Repair time : {{ (repairOptions.repairTime.toFixed(0) < 60 && repairOptions.repairTime.toFixed(0) + " second(s)") || (repairOptions.repairTime / 60).toFixed(0) + " minute(s)" }}
              </p>
            </div>

            <div v-if="repairOptions.isPolicyRepair">
              <p v-if="repairStore.policyInfo.hasFreeRepair">
                Repairing won't raise your policy score. You have an accident forgiveness
              </p>
              <p v-else>Repairing will raise your policy score by {{ repairStore.policyScoreInfluence }} %</p>
            </div>
            <div v-else>Repairing on your own won't raise your policy score and will not be counted as a claim</div>

            <h4>Payment options :</h4>
            <div v-for="(option, t) in repairOptions.priceOptions" :key="t">
              <div class="priceOption">
                <div>
                  <div v-for="(price, l) in option.prices" :key="l">
                    <div v-if="price.price.money">
                      <div class="career-status-value">
                        <BngIcon span class="icon" :title="icons.general.beambuck" :type="icons.general.beambuck"></BngIcon>
                        <div>
                          {{ units.beamBucks(price.price.money.amount) }}
                          {{ (price.type == "extra" && "as extra  fee") || "" }}
                        </div>
                      </div>
                    </div>
                    <div v-else-if="price.price.bonusStars">
                      <div class="career-status-value">
                        <BngIcon
                          span
                          class="icon"
                          :title="icons.general.star_outlined"
                          :type="icons.general.star_outlined"
                          :color="'var(--bng-add-blue-300)'"
                        ></BngIcon>
                        <div>{{ price.price.bonusStars.amount }} as extra fee</div>
                      </div>
                    </div>
                  </div>
                </div>
                <BngButton :disabled="!option.canPay" @click="startRepair(key, t)">{{ (option.canPay && "Pay") || "Can't pay" }}</BngButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <CareerStatus class="status" ref="careerStatusRef" />
  </BngCard>
</template>

<script setup>
import { lua, useBridge } from "@/bridge"
import { BngButton, BngCard, BngCardHeading, BngBinding } from "@/common/components/base"
import { vBngOnUiNav } from "@/common/directives"
import { useRepairStore } from "../stores/repairStore"
import { onMounted, onUnmounted, ref } from "vue"
import { CareerStatus } from "@/modules/career/components"
import { BngIcon } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

import { useUINavScope } from "@/services/uiNav"
useUINavScope("repairs")

const { units } = useBridge()
const repairStore = useRepairStore()

const careerStatusRef = ref()

const closeMenu = () => {
  lua.career_modules_insurance.closeMenu()
}

const startRepair = (repairOptionName, repairPriceOption) => {
  lua.career_modules_insurance.startRepairInGarage(repairStore.vehicle, { name: repairOptionName, priceOption: repairPriceOption + 1 })
  closeMenu()
}

const start = () => {
  repairStore.getRepairData()
}
const kill = () => {
  repairStore.$dispose()
}
onMounted(start)
onUnmounted(kill)
</script>

<style scoped lang="scss">
.icon {
  width: 1em;
  height: 1em;
}

.repairOptions {
  height: 95%;
  overflow-y: auto;
}

.priceOption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0px;
}

.career-status-value {
  display: flex;
  justify-content: left;
  flex-flow: row nowrap;
  align-items: baseline;
  & > :first-child {
    margin-right: 0.125em;
  }
}

.repairMain {
  width: 40%;
  padding: 10px;
  color: white;
  overflow-y: scroll;
  background-color: rgba(0, 0, 0, 0.8);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0);
  }
}

.status {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.repairOption {
  padding: 1px 20px 0px 20px;
  background-color: rgba(83, 83, 83, 0.465);
  border-radius: 10px;
  margin: 25px 10px 25px 0px;
}
</style>
