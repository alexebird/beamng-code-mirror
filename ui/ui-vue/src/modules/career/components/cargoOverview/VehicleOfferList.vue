<template>
  <BngCardHeading type="ribbon" class="cardHeading">
    {{ displayedHeader }}
    <BngButton
      class="headingButton"
      v-if="facilityId"
      :disabled="!cargoOverviewStore.newCargoAvailable"
      v-bng-sound-class="'bng_click_hover_generic'"
      @click="updateCargoDataAll"
      >Refresh</BngButton
    >
  </BngCardHeading>

  <div class="tableWrapper">
    <table class="innerCargoTable">
      <thead>
        <tr class="headings">
          <th>Thumb</th>

          <!-- TODO - remove inline styling -->
          <th style="padding-left: 0.5em">Name</th>

          <th>Task</th>
          <th class="numberColumn">Distance</th>
          <th class="numberColumn">Reward</th>
          <th v-if="offerType != OFFER_TYPE.accepted">Availability</th>
          <th class="tableButtons"></th>
        </tr>
      </thead>
      <tbody>
        <tr :class="getOfferRowClass(offer)" v-for="offer in sortedOffers" @mouseover="hoverOffer(offer)" @mouseleave="hoverOffer()">
          <td><AspectRatio class="thumbnail" :image="offer.thumbnail"> </AspectRatio></td>
          <td style="padding-left: 0.5em">
            {{ offer.vehBrand }} {{ offer.vehName }}
            <div v-if="offer.vehMileage > 0">Mileage: {{units.buildString('length', offer.vehMileage, 0)}}</div>
          </td>
          <td>{{ offer.task }}</td>
          <td class="numberColumn">{{ units.buildString("length", offer.distance, 0) }}</td>
          <td class="numberColumn">
            <div v-for="(amount, rewardType) in offer.rewards">
              <BngUnit class="reward-small" v-if="rewardType === 'money'" :beambucks="amount" />
            </div>
          </td>

          <td v-if="offerType != OFFER_TYPE.accepted">
            <div v-if="offer.remainingOfferTime > 0">

              <!-- TODO - use BngProgressBar here -->
              <div class="progressbar-wrapper">
                <div class="progressbar-background">
                  <!-- The width of this is a percentage of 5em, because that is how wide the progressbar background is -->
                  <div
                    class="progressbar-fill"
                    :style="{ width: (offer.remainingOfferTime > 0 ? (Math.min(offer.remainingOfferTime, 120) / 120) * 0.95 : 0) * 5 + 'em' }"
                  ></div>
                </div>
                <div class="progress-label">{{ getNiceTime(offer.remainingOfferTime) }}</div>
              </div>

            </div>
            <div v-else>Expired</div>
          </td>
          <td>
            <BngButton
              v-if="!offer.enabled && offerType != OFFER_TYPE.accepted"
              class="cargoButton"
              v-bng-sound-class="'bng_click_hover_generic'"
              accent="secondary"
              :disabled="true"
              @click="spawnOffer(offer.id)"
            >
              {{ offer.disableReason }}
            </BngButton>
            <BngButton
              v-if="offer.enabled && offerType != OFFER_TYPE.accepted"
              class="cargoButton"
              v-bng-sound-class="'bng_click_hover_generic'"
              accent="secondary"
              :disabled="offer.remainingOfferTime <= 0"
              @click="spawnOffer(offer.id)"
            >
              Accept
            </BngButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
const OFFER_TYPE = {
    accepted: "Accepted",
  },
  OFFER_TYPE_HEADERS = {
    Vehicle: "Vehicle Offers",
    Trailer: "Trailer Offers",
  },
  DEFAULT_OFFER_TYPE_HEADER = "Offers"
</script>

<script setup>
import { computed } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngButton, BngUnit, BngCardHeading } from "@/common/components/base"
import { useCargoOverviewStore } from "../../stores/cargoOverviewStore"
import { vBngSoundClass } from "@/common/directives"
import { AspectRatio } from "@/common/components/utility"

const { units } = useBridge()

const props = defineProps({
  sortedOffers: Array,
  header: String,
  offerType: String,
  facilityId: String,
  parkingSpotPath: String,
})

const cargoOverviewStore = useCargoOverviewStore()

const displayedHeader = computed(() => props.header || OFFER_TYPE_HEADERS[props.offerType] || DEFAULT_OFFER_TYPE_HEADER)

const updateCargoDataAll = () => cargoOverviewStore.requestCargoData(props.facilityId, props.parkingSpotPath)

const getOfferRowClass = offer => ({
  [isCargoDisabled(offer) ? "cargoRowDisabled" : "cargoRow"]: true,
  slidingText: offer.showNewTimer,
  ...(cargoOverviewStore.cargoHighlighted && {
    "highlight-hidden-row": !isCargoDisabled(offer) && !offer.highlight,
    "highlight-shown-row": offer.highlight,
  }),
})

const isCargoDisabled = offer => offer.remainingOfferTime <= 0 || !offer.enabled

const getNiceTime = timeInSeconds => ~~(timeInSeconds / 60) + (timeInSeconds >= 120 ? " min" : ` : ${pad(~~timeInSeconds % 60)}`)

const spawnOffer = offerId => {
  lua.career_modules_delivery_cargoScreen.commitDeliveryConfiguration()
  lua.career_modules_delivery_cargoScreen.exitCargoOverviewScreen()
  lua.career_modules_delivery_cargoScreen.spawnOffer(offerId)
}

const hoverOffer = offer => {
  if (offer && offer.remainingOfferTime) {
    lua.career_modules_delivery_cargoScreen.showVehicleOfferRoutePreview(offer.id)
  } else {
    lua.career_modules_delivery_cargoScreen.showVehicleOfferRoutePreview(undefined)
  }
}

const pad = n => (''+n).padStart(2,0)
</script>

<style scoped lang="scss">
.tableWrapper {
  max-height: 25vh;
  overflow-y: auto;
}

.innerCargoTable {
  -webkit-border-horizontal-spacing: 0px;
  -webkit-border-vertical-spacing: 2px;
  text-align: left;
  width: 100%;
  flex: 1 1 auto;
  // overflow: hidden;
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

.headingButton {
  font-size: 0.875rem;
  float: right;
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

.thumbnail {
  border-radius: var(--bng-corners-2);
}
</style>
