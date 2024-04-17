<template>
  <LayoutSingle
    v-if="selectedMission"
    v-bng-blur
    class="layout-content-full layout-align-hcenter layout-align-vcenter"
    bng-ui-scope="mission-details"
    v-bng-on-ui-nav:tab_l="store.selectPreviousMission"
    v-bng-on-ui-nav:tab_r="store.selectNextMission"
    v-bng-on-ui-nav:menu,back="exit">
    <div v-if="selectedMission" class="mission-details">
      <ActivitySelector
        class="mission-selector"
        ref="activitySelector"
        v-if="activities && activities.length > 1"
        :activities="activities"
        @valueChanged="store.selectMission" />
      <InfoCard
        class="basic-info"
        v-if="missionStartableDetails"
        bng-ui-scope="basic-info"
        bng-nav-item
        v-bng-on-ui-nav:ok="missionStartableDetails.startable ? store.startMission : noop"
        tabindex="1"
        @focusin="() => (uiState.currentScope = 'basic-info')"
        @focusout="deactivateCard">
        <template #header>
          <BngAdvCardHeading mute divider :preheadings="preheadings">
            {{ $ctx_t(selectedMission.name) }}
          </BngAdvCardHeading>
        </template>
        <template #content>
          <AspectRatio>
            <BngImageCarousel :images="missionBasicInfo.images" transition transitionType="smooth" class="images"> </BngImageCarousel>
          </AspectRatio>
          <div class="description">{{ $ctx_t(missionBasicInfo.description) }}</div>
        </template>
        <template #button>
          <template v-if="missionStartableDetails.needsRepair">
            <BngButton
              class="large"
              :icon-left="icons.wrench"
              :disabled="!missionStartableDetails.startable"
              tabindex="1"
              @click="store.startMission"
              :label="missionStartableDetails.selectedRepairTypeLabel" />
          </template>
          <template v-else>
            <BngButton
              class="large start"
              :icon-right="icons.fastTravel"
              :disabled="!missionStartableDetails.startable"
              tabindex="1"
              @click="store.startMission"
              label="Start the mission" />
          </template>
        </template>
      </InfoCard>
      <!-- Saved as a backup, to be removed -->
      <!-- <div class="mission-selector">
            <BngSelect
              class="selector-control"
              mute
              loop
              value
              :options="availableMissions"
              :config="{ label: x => x.id, value: x => x.id }"
              @valueChanged="store.selectMission"
            >
              <template #display>
                <div class="selector-display">
                  <span>{{ selectedMission.order + 1 }}</span>
                  <BngDivider />
                  <span>{{ availableMissions.length }}</span>
                </div>
              </template>
            </BngSelect>
          </div> -->
      <!-- <div class="cards-row">
            <div class="cards-column"> -->
      <!-- Basic Info Card -->
      <div class="left-contents">
        <!-- Task Info Card -->
        <InfoCard class="mission-progress" v-if="missionProgress" header="Mission Progress" header-type="ribbon">
          <template #content>
            <template v-if="missionProgress.stars">
              <div class="tasks">
                <!-- Convert this to component for us to use it inside other screens -->
                <div v-for="progress in missionProgress.stars" :key="progress.key" :class="{ inactive: !progress.active }" class="task-item">
                  <BngIcon
                    class="task-icon"
                    :type="progress.isDefaultStar ? icons.star : icons.starSecondary"
                    :color="progress.unlocked ? (progress.isDefaultStar ? DEFAULT_STAR_UNLOCKED_COLOR : BONUS_STAR_UNLOCKED_COLOR) : LOCKED_STAR_COLOR" />
                  <span class="task-description">{{ $mctx_t(progress.label) }}</span>
                </div>
              </div>
            </template>
            <div v-if="missionProgress.showMessage" class="progress-message">{{ missionProgress.message }}</div>
          </template>
        </InfoCard>
      </div>
      <div class="right-contents">
        <InfoCard class="repair-info" v-if="missionStartableDetails && missionStartableDetails.needsRepair" header="Repair" header-type="ribbon" tabindex="1">
          <template #content>
            <div class="repair-item">
              Repair with:
              <BngSelect
                class="repair-item-control"
                :options="missionStartableDetails.repairOptions"
                :value="missionStartableDetails.selectedRepairType"
                :config="{
                  label: x => x.optionsLabel,
                  value: x => x.type,
                }"
                @valueChanged="store.changeRepairType" />
            </div>
          </template>
        </InfoCard>
        <!-- Ratings Info Card -->
        <InfoCard v-if="selectedMission.ratings" class="mission-ratings" header="Ratings">
          <template #content>
            <div class="ratings">
              <BngPropVal v-for="(attr, index) in selectedMission.ratings" :key="index" :key-label="$t(attr.label)" :value-label="$t(attr.value.text)">
              </BngPropVal>
            </div>
          </template>
          <!-- <template #button>
            <BngButton tabindex="1" accent="text">Leaderboards</BngButton>
          </template> -->
        </InfoCard>
      </div>

      <!-- Mission Settings Card -->
      <div class="mission-settings">
        <InfoCard
          :key="selectedMission.id"
          v-if="missionSettings && missionSettings.length > 0"
          class="mission-settings"
          header="Mission Settings"
          tabindex="1">
          <template #content>
            <div class="settings-wrapper">
              <SlotSwitcher v-for="setting in missionSettings" :slotId="setting.type" :key="setting.key">
                <template #select>
                  <div class="setting-item setting-select">
                    <div class="setting-item-label">{{ $t(setting.label) }}</div>
                    <BngSelect
                      class="setting-control"
                      :options="setting.values"
                      :value="setting.value"
                      :config="{ label: x => $t(x.l), value: x => x.v }"
                      @valueChanged="value => store.changeSettings(setting.key, value)"></BngSelect>
                  </div>
                </template>
                <template #bool>
                  <div class="setting-item setting-switch">
                    <BngSwitch class="setting-control" v-model="setting.value" @valueChanged="value => store.changeSettings(setting.key, value)">{{
                      $t(setting.label)
                    }}</BngSwitch>
                  </div>
                </template>
                <template #int>
                  <div class="setting-item">
                    <div class="setting-item-label">{{ $t(setting.label) }} - {{ setting.value }}</div>
                    <template v-if="setting.max">
                      <BngSlider
                        v-model="setting.value"
                        :min="setting.min"
                        :max="setting.max"
                        :step="1"
                        @valueChanged="value => store.changeSettings(setting.key, value)" />
                    </template>
                    <template v-else>
                      <BngInput :value="setting.value" :min="setting.min" type="number" @valueChanged="value => store.changeSettings(setting.key, value)" />
                    </template>
                  </div>
                </template>
              </SlotSwitcher>
            </div>
          </template>
          <!-- <template #button>
            <BngButton tabindex="1" accent="text">Edit mission settings</BngButton>
          </template> -->
        </InfoCard>
        <InfoCard :key="selectedMission.id" v-if="store.availableVehicles" class="vehicle-selector" header="Select your vehicle">
          <template #content>
            Make a new tile-switch component that will have 1st element preselected
            <div class="tile-switch">
              <div class="cards-wrapper">
                <BngImageTile
                  v-for="vehicle in store.availableVehicles"
                  :key="vehicle.value"
                  :image="vehicle.meta.preview ? vehicle.meta.preview : getAssetURL('images/noimage.png')"
                  :ratio="'16:9'"
                  class="vehicle selected"
                  tabindex="1"
                  @click="store.changeSettings(vehicle.settingsKey, vehicle.value)">
                  <!-- Provided / Default -->
                  {{ vehicle.label }}
                </BngImageTile>
                <!-- <BngImageTile class="vehicle selected" :image="getAssetURL('images/noimage.png')" :ratio="'16:9'" tabindex="1">
                  Provided / Default
                </BngImageTile>
                <BngImageTile class="vehicle" :image="getAssetURL('images/noimage.png')" :ratio="'16:9'" tabindex="1">
                  Current
                </BngImageTile> -->
              </div>
            </div>
          </template>
          <!-- <template #button>
            <BngButton tabindex="1" accent="text">Edit mission settings</BngButton>
          </template> -->
        </InfoCard>
      </div>
    </div>
  </LayoutSingle>
</template>

<script>
const LOCKED_STAR_COLOR = "rgba(255, 255, 255, 0.2)"
const DEFAULT_STAR_UNLOCKED_COLOR = "var(--bng-ter-yellow-50)"
const BONUS_STAR_UNLOCKED_COLOR = "var(--bng-add-blue-400)"
const noop = () => {}
</script>

<script setup>
import { computed, onBeforeMount, onUnmounted, reactive, watch, ref } from "vue"
import { storeToRefs } from "pinia"
import { $translate } from "@/services"
import { useUINavScope } from "@/services/uiNav"
import { BngImageCarousel, BngButton, BngSelect, BngSwitch, BngSlider, BngInput, BngPropVal, BngIcon, BngImageTile, icons } from "@/common/components/base"
import { SlotSwitcher, AspectRatio } from "@/common/components/utility"
import { LayoutSingle } from "@/common/layouts"
import { vBngBlur, vBngOnUiNav } from "@/common/directives"
import { useMissionDetailsStore } from "@/modules/missions/stores/missionDetailsStore"
import InfoCard from "../components/InfoCard.vue"
import BngAdvCardHeading from "../components/bngAdvCardHeading.vue"
import ActivitySelector from "@/modules/activitystart/components/ActivitySelector.vue"
import { getAssetURL } from "@/utils"

const uiNavScope = useUINavScope("mission-details")
const store = useMissionDetailsStore()

const exit = () => window.bngVue.gotoGameState("play")

const { missions, selectedMission, missionBasicInfo, missionProgress, missionSettings, missionStartableDetails } = storeToRefs(store)

const uiState = reactive({
  currentScope: "mission-details",
  focusedCard: "",
})

const preheadings = computed(() => missionBasicInfo.value.missionTypeLabels.map(x => $translate.contextTranslate(x)))

onBeforeMount(async () => {
  await store.init()
})

onUnmounted(() => {
  store.$dispose()
})

function activateCard() {
  console.log("activateCard", uiState.focusedCard)
  uiState.currentScope = uiState.focusedCard
}

function deactivateCard() {
  uiState.currentScope = "mission-details"
}

const activities = computed(() => (missions.value || []).map(itm => ({ value: itm.id, icon: itm.icon, label: itm.name })))

watch(
  () => uiState.currentScope,
  () => {
    console.log("scope changed", uiState.currentScope)
    uiNavScope.set(uiState.currentScope)
  }
)
</script>

<style scoped lang="scss">
:deep(.bng-button).large {
  .label {
    text-align: left;
    padding: 0 0.25em;
    flex: 0 0 auto;
  }
}

.mission-details {
  display: grid;
  padding: 2rem;
  width: 100%;
  max-width: 90rem;
  font-size: 1rem;

  grid-template:
    ". top ."
    "left center right"
    "bottom bottom bottom" / 2fr 4fr 2fr;
  gap: 1rem;

  > .mission-selector {
    grid-area: top;
    display: flex;
    padding: 0rem 5rem;

    > :deep(.selector-control) {
      background: transparent;

      > .selector-display {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        flex: 1 0 0;
        padding: 0.125rem 0.25rem;
        border-radius: var(--border-radius-small, 0.25rem);
        background: var(--background-ui-black-60, rgba(0, 0, 0, 0.6));
        color: var(--bng-cool-gray-200);

        span {
          width: 1.5em;
          padding: var(--border-radius-small, 0.25rem);
          color: var(--primary-white, #fff);
          text-align: center;
          font-family: Overpass;
          font-size: 1.25em;
          font-style: normal;
          font-weight: 700;
          line-height: 1.5em;
          /* 120% */
        }

        > .vertical-divider {
          background: var(--bng-cool-gray-200);
          color: var(--primary-white, #fff);
          text-align: center;
          font-family: Overpass;
          font-size: 1.25em;
          font-style: normal;
          font-weight: 700;
          line-height: 1.5em;
          /* 120% */
        }
      }
    }
  }
  > .basic-info {
    grid-area: center;
  }
  > .left-contents {
    grid-area: left;
    padding: 1rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    grid-auto-rows: min-content;
    gap: 0.5rem;
    > .mission-progress {
      .card .info-content {
        padding: 1rem;
        // border-bottom: 1rem solid transparent;
      }

      .tasks {
        display: flex;
        flex-direction: column;

        > .task-item {
          display: flex;
          padding: 0.5rem;
          align-items: baseline;

          &.inactive {
            > .task-description {
              text-decoration: line-through;
            }
          }

          &:not(:last-child) {
            padding-bottom: 1rem;
            border-bottom: 0.125rem solid var(--bng-cool-gray-700);
          }

          > .task-icon {
            display: inline-block;
            align-self: baseline;
            font-size: 1.75em;
            line-height: 1.5rem;
            padding-right: 0.25rem;
            transform: translateY(0.125em);
          }

          > .task-description {
            font-weight: 600;
            letter-spacing: 0.01rem;
          }
        }
      }
    }
  }
  > .right-contents {
    grid-area: right;
    padding: 1rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    grid-auto-rows: min-content;
    gap: 0.5rem;
    > .mission-ratings {
    }
    > .repair-info {
    }
  }
  > .mission-settings {
    grid-area: bottom;
    grid-column: 1 / -1;

    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(12rem, auto);
    gap: 1rem;

    justify-content: center;

    .settings-wrapper {
      .setting-item {
        padding-bottom: 0.5rem;
        .setting-item-label {
          padding-bottom: 0.25rem;
          font-weight: 800;
        }
      }
    }

    .vehicle {
      width: auto;
      margin: 0;
      justify-content: flex-start;
      &.selected {
        background-color: var(--bng-cool-gray-700);
      }
      :deep(.tile) {
        justify-content: flex-start;
      }
      :deep(.contents) {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      :deep(.glyph) {
        font-size: 4rem;
      }
    }

    > .vehicle-selector {
      grid-column-end: span 2;
      .tile-switch {
        .cards-wrapper {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: 12rem;
          gap: 0.5rem;
          padding: 0.5rem;
          box-shadow: inset 0 0 0 0.125rem rgba(255, 255, 255, 0.25);
          border-radius: calc(var(--bng-corners-2) + 0.25rem);
          background: rgba(var(--bng-cool-gray-900-rgb), 0.8);
        }
      }
    }
  }
  :deep(.info-content) {
    > .images {
      padding-bottom: 0.5rem;
    }
    .bng-image-carousel.images {
      width: 100%;
      height: 100%;
    }
    > :not(.images) {
      padding: 0 0.75rem 0.5rem 0.75rem;
      &:last-child {
        padding-bottom: 1.25rem;
      }
      &.description {
        padding-left: 1rem;
        padding-right: 1.5rem;
        padding-top: 0.5rem;
        font-size: 1.25rem;
      }
    }
  }
}

@media screen and (max-width: 1320px) {
  .mission-details {
    font-size: 0.75rem;
    grid-template:
      ". top ."
      "left center right"
      "bottom bottom bottom" / 2fr 3fr 2fr;
  }
}
</style>
