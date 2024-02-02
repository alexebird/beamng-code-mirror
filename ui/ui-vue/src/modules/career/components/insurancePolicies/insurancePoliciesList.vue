<!--
  I really don't know how this all works anymore
 -->

<template>
  <div style="display: flex; height: 84%">
    <div>
      <h2>Insurance history</h2>
      <div style="height: 100%; overflow-y: auto">
        <table class="historyTable">
          <tr>
            <th>Policy</th>
            <th>Event</th>
            <th>Effect</th>
            <th>Time</th>
          </tr>
          <tr v-for="(event, key) in insurancePoliciesStore.policyHistory" :key="key">
            <td>{{ event.policyName }}</td>
            <td>{{ event.event }}</td>
            <td>
              <div v-for="(effectData, t) in event.effect" :key="t">
                <span
                  ><b>{{ effectData.label }} : {{ effectData.value }}</b></span
                >
              </div>
            </td>
            <td>
              {{ event.time }}
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div style="margin-left: 50px">
      <h2>Insurance plans</h2>
      <div class="policiesDiv">
        <div class="insuranceCard" v-for="(policy, key) in insurancePoliciesStore.policiesData" :key="key">
          <div style="display: flex; justify-content: space-between">
            <h2>{{ policy.name }}</h2>
            <h2 v-if="policy.plData.owned">Insurance score : {{ policy.plData.bonus }}</h2>
            <h2 v-if="policy.plData.owned">Next payment in : {{ policy.nextPaymentDist.toFixed(1) }} km</h2>
          </div>
          <p>{{ policy.description }}</p>
          <div v-if="policy.plData.owned">
            <div style="display: flex">
              <div v-if="currEditedPolicyId === undefined || currEditedPolicyId !== policy.id">
                <div v-if="currDetailedPolicyId == policy.id">
                  <h3>Perks :</h3>
                  <template v-for="(perk, perkName) in policy.perks" :key="perkName">
                    <p v-if="typeof getPerkDataByName(perkName, policy.id, true).value == 'boolean'">
                      {{ perk.niceName }} : {{ (getPerkDataByName(perkName, policy.id, true).value && "Activated") || "Deactivated" }}
                    </p>
                    <p v-else>{{ perk.niceName }} : {{ getPerkDataByName(perkName, policy.id, true).value }}</p>
                  </template>
                </div>
                <div class="career-status-value justifyContentLeft bottomMargin">
                  Premium :
                  <BngIcon span class="icon" :title="icons.general.beambuck" :type="icons.general.beambuck"></BngIcon>
                  {{
                    (currEditedPolicyId == policy.id && tempPolicyPremiumDetails !== undefined && units.beamBucks(tempPolicyPremiumDetails.price.toFixed(2))) ||
                    units.beamBucks(policy.premium)
                  }}
                </div>
              </div>
              <div class="details" v-else>
                <h3>Detailed pricing :</h3>
                <table style="width: 100%; text-align: center">
                  <tr>
                    <th class="detailsFirstTr">Perk</th>
                    <th class="detailsFirstTr">Current</th>
                    <th class="detailsFirstTr">Price breakdown</th>
                  </tr>
                  <tr v-for="(perk, perkName) in policy.perks" :key="perkName">
                    <td class="detailsLeftColumnTd">{{ perk.niceName }}</td>
                    <td style="padding-left: 30px">
                      <div style="display: flex">
                        <div
                          v-if="perk.changeability.changeable && currEditedPolicyId !== undefined && currEditedPolicyId === policy.id"
                          v-for="(choice, e) in perk.changeability.changeParams.choices"
                          :key="e"
                        >
                          <BngButton :accent="getPerkDataByName(perkName, policy.id, false).value !== choice ? 'secondary' : ''" @click="changeTempPolicyPerk(perkName, choice)">{{
                            choice
                          }}</BngButton>
                        </div>
                        <div v-else>
                          <BngButton disabled>{{ getPerkDataByName(perkName, policy.id, true).value }} Not editable</BngButton>
                        </div>
                      </div>
                    </td>
                    <td style="text-align: center; padding: 0px 20px">
                      <div class="career-status-value" v-if="perk.changeability.changeParams.influenceType === 'add'">
                        <BngIcon span class="icon" :title="icons.general.beambuck" :type="icons.general.beambuck"></BngIcon>
                        {{
                          currEditedPolicyId == policy.id &&
                          tempPolicyPremiumDetails !== undefined &&
                          units.beamBucks(getPerkDataByName(perkName, policy.id, false).premiumInfluence)
                        }}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td style="align-self: center; padding: 0px 20px">
                      <div class="career-status-value">
                        <p>New Premium : {{ policy.plData.bonus }} x {{(currEditedPolicyId == policy.id && tempPolicyPremiumDetails !== undefined && units.beamBucks((tempPolicyPremiumDetails.price).toFixed(2))) ||
                          units.beamBucks(policy.premium)}} = </p>
                        <BngIcon span class="icon" :title="icons.general.beambuck" :type="icons.general.beambuck"></BngIcon>
                        {{
                          (currEditedPolicyId == policy.id && tempPolicyPremiumDetails !== undefined && units.beamBucks((tempPolicyPremiumDetails.price * policy.plData.bonus).toFixed(2))) ||
                          units.beamBucks(policy.premium)
                        }}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          <div style="display: flex; margin-top: 15px">
            <div v-if="currDetailedPolicyId === policy.id && policy.plData.owned && !currEditedPolicyId">
              <BngButton @click="setCurrDetailedPolicyId(0)">Hide details</BngButton>
            </div>
            <div v-if="currDetailedPolicyId !== policy.id && policy.plData.owned">
              <BngButton @click="setCurrDetailedPolicyId(policy.id)">See details</BngButton>
            </div>
            <div v-else-if="policy.plData.nextPolicyEditTimer <= 0">
              <BngButton
                v-if="policy.plData.owned && (currEditedPolicyId === undefined || (currEditedPolicyId !== undefined && currEditedPolicyId !== policy.id))"
                @click="setCurrEditedPolicyId(policy.id)"
                >Customize coverage</BngButton
              >
              <div v-if="policy.plData.owned && currEditedPolicyId !== undefined && currEditedPolicyId === policy.id">
                <BngButton accent="attention" @click="cancelPerksChanges()">Cancel</BngButton>
                <BngButton accent="secondary" :disabled="insurancePoliciesStore.careerMoney < policy.paperworkFees" @click="confirmPerksChanges()"
                  >{{ insurancePoliciesStore.careerMoney < policy.paperworkFees && "Insufficient funds" || "Confirm changes for " + policy.paperworkFees}}</BngButton
                >
              </div>
            </div>
            <div v-else>
              <BngButton disabled>Edit perks in {{ policy.plData.nextPolicyEditTimer.toFixed(0) }} s</BngButton>
            </div>

            <BngButton
              style="margin-left: 20px"
              :disabled="insurancePoliciesStore.careerBonusStars < policy.resetBonus.price.bonusStars.amount"
              @click="payBonusReset(policy.id)"
              accent="secondary"
              v-if="policy.resetBonus && policy.plData.bonus > policy.resetBonus.conditions.minBonus">
              Pay {{ policy.resetBonus.price.bonusStars && policy.resetBonus.price.bonusStars.amount + " bonus stars" }} for a favor ..
              </BngButton
            >
          </div>
          <div>
            <BngButton v-if="!policy.plData.owned" :disabled="insurancePoliciesStore.careerMoney < policy.initialBuyPrice" @click="purchasePolicy(policy.id)"
              >Purchase for {{ policy.initialBuyPrice }}</BngButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngButton, BngIcon } from "@/common/components/base"
import { useInsurancePoliciesStore } from "../../stores/insurancePoliciesStore"
import { icons } from "@/common/components/base/bngIcon.vue"

const { units } = useBridge()

const insurancePoliciesStore = useInsurancePoliciesStore()
const currEditedPolicyId = ref()
const tempChangedPolicyPerks = ref({})
const tempPolicyPremiumDetails = ref()
const currDetailedPolicyId = ref(0)

const setCurrDetailedPolicyId = policyId => {
  currDetailedPolicyId.value = policyId
}

const setCurrEditedPolicyId = policyId => {
  currEditedPolicyId.value = policyId

  for (const [key, value] of Object.entries(insurancePoliciesStore.policiesData[policyId - 1].perks)) {
    tempChangedPolicyPerks.value[key] = value.plValue
  }
  calculateTempPremium()
}

const cancelPerksChanges = () => {
  currEditedPolicyId.value = undefined
  tempChangedPolicyPerks.value = {}
  tempPolicyPremiumDetails.value = undefined
}

const confirmPerksChanges = () => {
  lua.career_modules_insurance.changePolicyPerks(currEditedPolicyId.value, tempChangedPolicyPerks.value)
  cancelPerksChanges()
}

const changeTempPolicyPerk = (perkName, newValue) => {
  tempChangedPolicyPerks.value[perkName] = newValue
  calculateTempPremium()
}

const calculateTempPremium = () => {
  lua.career_modules_insurance.calculatePremiumDetails(currEditedPolicyId.value, tempChangedPolicyPerks.value).then(value => (tempPolicyPremiumDetails.value = value))
}

const purchasePolicy = policyId => {
  lua.career_modules_insurance.purchasePolicy(policyId)
}

const payBonusReset = policyId => {
  lua.career_modules_insurance.payBonusReset(policyId)
}

// helper, is here to help with my bad code, deal with the temporary perks
const getPerkDataByName = (perkName, policyId, current) => {
  var perkData = insurancePoliciesStore.policiesData[policyId - 1].perks[perkName]
  var perk = {
    value: 0,
    premiumInfluence: 0,
  }
  if (currEditedPolicyId.value !== undefined && currEditedPolicyId.value == policyId && !current) {
    perk.value = tempChangedPolicyPerks.value[perkName]
    perk.premiumInfluence = tempPolicyPremiumDetails.value.perksPriceDetails[perkData.name].price
  } else {
    perk.value = perkData.plValue
  }

  return perk
}
</script>

<style scoped lang="scss">
.policiesDiv {
  height: 100%;
  scroll-behavior: auto;
  overflow-y: auto;
}

.justifyContentLeft {
  justify-content: left;
}

.bottomMargin {
  margin-bottom: 10px;
}

tr:nth-child(even) {
  background-color: #383838;
}

.historyTable td {
  padding: 3px 20px 3px 20px;
}

.detailsLeftColumnTd {
  text-align: left;
  padding: 0px 20px;
}

.detailsFirstTr {
  padding: 0 10px 10px 10px;
}

.icon {
  width: 1em;
  height: 1em;
}
.insuranceCard {
  margin-bottom: 50px;
  padding: 20px;
  background-color: rgba(83, 83, 83, 0.465);
  border-radius: 10px;
}
.details {
  margin-left: 20px;
}

.career-status-value {
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
  & > :first-child {
    margin-right: 0.125em;
  }
}
</style>
