<template>
  <table class="innerCargoTable">
    <thead>
      <tr class="headings">
        <th class="numberColumn" v-if="cargoAttributes.quantity">Qty</th>
        <th name-pad v-if="cargoAttributes.name">Name</th>
        <th v-if="cargoAttributes.origin">Origin</th>
        <th v-if="cargoAttributes.destination">Destination</th>
        <th v-if="cargoAttributes.location">Location</th>
        <th class="numberColumn" v-if="cargoAttributes.distance">Distance</th>
        <th class="numberColumn" v-if="cargoAttributes.reward">Reward</th>
        <th v-if="cargoAttributes.offerTime">Availability</th>
        <th v-if="cargoAttributes.weight">Weight</th>
        <th v-if="cargoAttributes.modifiers"></th>
        <th class="numberColumn" v-if="cargoAttributes.slots">Slots</th>
        <th v-if="cargoAttributes.move || cargoAttributes.route || cargoAttributes.routeOrigin" class="tableButtons"></th>
        <!-- <th v-if="cargoAttributes.route"></th>
        <th v-if="cargoAttributes.routeOrigin"></th> -->
      </tr>
    </thead>
    <tbody>
      <tr :class="getCargoRowClass(cargo)" v-for="cargo in sortedCargo" @mouseover="onCargoHovered(cargo)" @mouseleave="onCargoHovered()">
        <td class="numberColumn" v-if="cargoAttributes.quantity">{{ cargo.ids.length }}</td>
        <td name-pad v-if="cargoAttributes.name">{{ cargo.name }}</td>
        <td v-if="cargoAttributes.origin" :class="getCargoLocationClass(cargo)">{{ cargo.originName }}</td>
        <td v-if="cargoAttributes.destination" :class="getCargoLocationClass(cargo)">{{ cargo.destinationName }}</td>
        <td v-if="cargoAttributes.location">{{ cargo.locationName }}</td>
        <td class="numberColumn" v-if="cargoAttributes.distance">{{ units.buildString("length", cargo.distance, 0) }}</td>
        <td class="numberColumn" v-if="cargoAttributes.reward">
          <div v-for="(amount, rewardType) in cargo.rewards">
            <BngUnit class="reward-small" v-if="rewardType === 'money'" :beambucks="amount" />
          </div>
        </td>

        <td v-if="cargoAttributes.offerTime">
          <div v-if="isFacility && cargo.remainingOfferTime > 0">
            <div class="progressbar-wrapper">
              <!-- TODO - please replace with BngProgress or discuss why not -->
              <div class="progressbar-background">
                <!-- The width of this is a percentage of 5em, because that is how wide the progressbar background is -->
                <div
                  class="progressbar-fill"
                  :style="{ width: (cargo.remainingOfferTime > 0 ? (Math.min(cargo.remainingOfferTime, 120) / 120) * 0.95 : 0) * 5 + 'em' }"></div>
              </div>

              <div class="progress-label">{{ getNiceTime(cargo.remainingOfferTime) }}</div>
            </div>
          </div>
          <div v-else>Expired</div>
        </td>

        <td class="numberColumn" v-if="cargoAttributes.weight">{{ units.buildString("weight", cargo.weight, 0) }}</td>
        <td style="" v-if="cargoAttributes.modifiers">
          <div class="cargo-modifiers">
            <div v-for="modifier in cargo.modifiers">
              <!-- timed cargo -->
              <div class="modifier" v-if="modifier.type == 'timed'">
                <BngIcon class="text-icon" :type="icons.stopwatchSectionOutlinedStart" />
                <span v-if="modifier.data.remainingDeliveryTime > 0">
                  {{ getNiceTime(modifier.data.remainingDeliveryTime) }}
                </span>
                <div v-else class="paddedTime">
                  <span v-if="modifier.data.remainingPaddingTime > 0"> {{ getNiceTime(modifier.data.remainingPaddingTime) }} Delayed </span>
                  <span v-else>Late</span>
                </div>
              </div>

              <div class="modifier" v-else-if="modifier.type == 'supplies'">(Supplies)</div>
              <div class="modifier" v-else-if="modifier.type == 'large'">(Large)</div>
              <div class="modifier" v-else-if="modifier.type == 'precious'">(Precious)</div>
              <div class="modifier" v-else-if="modifier.type == 'post'">(Post)</div>
            </div>
          </div>
        </td>

        <td class="numberColumn" v-if="cargoAttributes.slots">{{ cargo.slots }}</td>

        <td v-if="cargoAttributes.move || cargoAttributes.route || cargoAttributes.routeOrigin" class="tableButtons">
          <div class="buttonsWrapper">
            <BngButton
              v-if="cargo.locked "
              class="cargoButton"
              v-bng-sound-class="'bng_click_hover_generic'"
              accent="secondary"
              :disabled="true"
              >
              <BngIcon class="icon" :color="'#ffffff'" :type="icons.lockClosed" />
              <BngIcon class="icon" :type="icons[cargo.lockedReason.icon]" />
              lvl {{cargo.lockedReason.level}}
            </BngButton>
            <BngButton
              v-else-if="cargoOverviewStore.dropDownData[cargo.ids.at(-1)].items.length < 1 || (isFacility && !cargo.enabled)"
              class="cargoButton"
              v-bng-sound-class="'bng_click_hover_generic'"
              accent="secondary"
              :disabled="true">
              {{ isFacility ? (cargo.remainingOfferTime <= 0 ? "Expired" : cargo.disableReason) : "Load" }}
            </BngButton>
            <BngButton
              v-else-if="cargoOverviewStore.dropDownData[cargo.ids.at(-1)].items.length == 1"
              class="cargoButton"
              v-bng-sound-class="'bng_click_hover_generic'"
              @click="requestMoveCargoToLocation(cargo.ids.at(-1), cargoOverviewStore.dropDownData[cargo.ids.at(-1)].items[0].value)"
              accent="secondary"
              :disabled="isCargoDisabled(cargo)">
              <div v-if="isFacility">Load</div>
              <div v-else>
                {{ cargoOverviewStore.dropDownData[cargo.ids.at(-1)].items[0].label }}
              </div>
            </BngButton>
            <BngDropdown
              v-else
              class="targetDropdown"
              bng-nav-item
              v-model="cargoOverviewStore.dropDownData[cargo.ids.at(-1)].dropDownValue"
              :items="cargoOverviewStore.dropDownData[cargo.ids.at(-1)].items"
              :disabled="cargoOverviewStore.dropDownData[cargo.ids.at(-1)].disabled || isCargoDisabled(cargo)" />
            <BngButton
              v-if="cargoAttributes.route"
              accent="secondary"
              class="cargoButton"
              v-bng-sound-class="'bng_click_hover_generic'"
              @click="setCargoRoute(cargo.id, false)">
              Set Route
            </BngButton>
            <BngButton
              v-else-if="cargoAttributes.routeOrigin"
              accent="secondary"
              class="cargoButton"
              v-bng-sound-class="'bng_click_hover_generic'"
              @click="setCargoRoute(cargo.id, true)">
              Set Route
            </BngButton>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { lua, useBridge } from "@/bridge"
import { BngButton, BngIcon, BngDropdown, BngUnit, icons } from "@/common/components/base"
import { useCargoOverviewStore } from "../../stores/cargoOverviewStore"
import { vBngSoundClass } from "@/common/directives"

const emit = defineEmits(["cargoHovered"])

const props = defineProps({
  cargoAttributes: Object,
  isFacility: Boolean,
  sortedCargo: Array,
})

const cargoOverviewStore = useCargoOverviewStore()

const { units } = useBridge()

const getCargoRowClass = cargo => ({
  [isCargoDisabled(cargo) ? "cargoRowDisabled" : "cargoRow"]: true,
  slidingText: cargo.showNewTimer,
  ...(cargoOverviewStore.cargoHighlighted && {
    "highlight-hidden-row": !isCargoDisabled(cargo) && !cargo.highlight,
    "highlight-shown-row": cargo.highlight,
  }),
})

const getCargoLocationClass = cargo => ({
  ...(cargoOverviewStore.cargoHighlighted && {
    ["highlight-hidden-location"]: !isCargoDisabled(cargo) && !cargo.highlight,
    ["highlight-shown-location"]: cargo.highlight,
  }),
})

const isCargoDisabled = cargo => {
  if (!props.isFacility) return false
  if (cargoOverviewStore.cargoData.facility && cargoOverviewStore.cargoData.facility.disabled) return true
  return cargo.remainingOfferTime <= 0 || !cargo.enabled
}

const setCargoRoute = (cargoId, origin) => {
  lua.career_modules_delivery_cargoScreen.setCargoRoute(cargoId, origin)
}

const getNiceTime = timeInSeconds => ~~(timeInSeconds / 60) + (timeInSeconds >= 120 ? " min" : ` : ${pad(~~timeInSeconds % 60)}`)

const niceHealth = hp => ~~hp

const getClassForHealth = hp => {
  if (hp >= 90) return ""
  if (hp > 0) return "healthDamaged"
  return "healthDestroyed"
}

const requestMoveCargoToLocation = (cargoId, moveData) => cargoOverviewStore.requestMoveCargoToLocation(cargoId, moveData)

const onCargoHovered = cargo => emit("cargoHovered", cargo || undefined)

const pad = n => ("" + n).padStart(2, 0)
</script>

<style scoped lang="scss">
.innerCargoTable {
  -webkit-border-horizontal-spacing: 0px;
  -webkit-border-vertical-spacing: 2px;
  text-align: left;
  width: 100%;
  flex: 1 1 auto;
  // overflow: hidden;
  [name-pad] {
    padding-left: 0.5em !important;
  }
  & .headings {
    & th {
      position: sticky;
      top: 0;
      background-color: rgba(var(--bng-cool-gray-800-rgb), 0.9);
      z-index: 1;
      padding: 0.1em 0.2em 0em;
    }
  }
  & th,
  & td {
    // padding-right: 0.75em;
    background-color: rgba(var(--bng-cool-gray-800-rgb), 0.5);
    padding: 0em 0.2em 0em;
    &.cargo-modifiers {
      display: flex;
    }
    &.tableButtons {
      // display: flex;
      // flex-flow: row nowrap;
      //   text-align: end;
      //   & :deep(.targetDropdown) {
      //     text-align: center;
      //     * {
      //       text-align: start;
      //     }
      //   }
      .buttonsWrapper {
        display: flex;
        flex-flow: row wrap;
        min-width: 8em;
        max-width: 18em;
        align-items: baseline;
        justify-content: flex-end;
      }
    }
  }
}

.reward-small {
  font-size: 0.875rem !important;
}

.modifier {
  float: left;
  padding-left: 0.2em;
}

.paddedTime {
  //align-items: baseline;
  margin-top: 0.25em;
  float: right;
  color: rgb(255, 50, 35);
}

.healthDamaged {
  color: rgb(255, 255, 35);
}

.healthDestroyed {
  color: rgb(255, 50, 35);
}

@keyframes pulsing {
  50% {
    color: rgb(255, 251, 0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0%);
  }
}

.slidingText {
  animation: pulsing 1s steps(1) infinite, slideIn 0.7s linear forwards;
}

.slot {
  float: left;
  width: 5px;
  height: 1em;
  margin: 0.2em;
  background-color: rgb(255, 102, 0);
}

.cargoRow {
  td {
    background-color: rgba(var(--bng-cool-gray-700-rgb), 0.25);
  }
}

.cargoRowDisabled {
  td {
    background-color: rgba(var(--bng-cool-gray-700-rgb), 0.6);
    color: rgba(var(--bng-cool-gray-400-rgb), 1);
  }
}

.targetDropdown {
  text-align: center;
}

.numberColumn {
  text-align: center;
}

.cargoButton {
  min-height: 0;
  //height: 1.6em;
  //padding: 0.1em 0.1em;
  white-space: pre-wrap;
}

:deep(.text-icon) {
  min-width: 1em;
  min-height: 1em;
  display: inline-block;
  transform: translateY(0.125em);
  // width: 1.5em;
  // height: 1.5em;
  font-size: 1.5rem !important;
}

.progressbar-background {
  display: flex;
  border-radius: var(--bng-corners-1);
  width: 5em;
  height: 1.5rem;
}

.progressbar-fill {
  background-color: rgba(114, 113, 113, 0.877);
  position: absolute;
  height: 1.25rem;
}

.progressbar-wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
  border-radius: var(--bng-corners-1);
}

.progress-label {
  display: flex;
  flex-direction: row;
  // z-index: 2;
  padding: 0.25rem 0.5rem;
  line-height: 1rem;
  font-size: 1rem;
  text-align: center;
  position: absolute;
}

.highlight-hidden-location {
  color: rgba(var(--bng-cool-gray-400-rgb), 1);
}

.highlight-shown-location {
  color: #ff6600 !important;
  font-weight: bold;
}

.highlight-hidden-row {
  td {
    //background-color: rgba(var(--bng-cool-gray-700-rgb), 0.8);
  }
}

.highlight-shown-row {
  td {
    background-color: #ff882288 !important;
  }
}
</style>
