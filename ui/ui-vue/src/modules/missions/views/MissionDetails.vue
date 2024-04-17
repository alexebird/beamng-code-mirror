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
      <BngScreenHeading class="screen-header" mute divider :preheadings="preheadings">
        {{ $ctx_t(selectedMission.name) }}
      </BngScreenHeading>
      <div class="mission-selector">
        <BngSelect
          class="selector-control"
          mute
          loop
          value
          :options="availableMissions"
          :config="{ label: x => x.id, value: x => x.id }"
          @valueChanged="store.selectMission">
          <template #display>
            <div class="selector-display">
              <span>{{ selectedMission.order + 1 }}</span>
              <BngDivider />
              <span>{{ availableMissions.length }}</span>
            </div>
          </template>
        </BngSelect>
      </div>
      <div class="cards-row">
        <div class="cards-column">
          <!-- Basic Info Card -->
          <InfoCard
            v-if="missionStartableDetails"
            class="basic-info button-center"
            bng-ui-scope="basic-info"
            bng-nav-item
            v-bng-on-ui-nav:ok="missionStartableDetails.startable ? store.startMission : noop"
            tabindex="1"
            @focusin="() => (uiState.currentScope = 'basic-info')"
            @focusout="deactivateCard">
            <template #content>
              <AspectRatio>
                <BngImageCarousel :images="missionBasicInfo.images" transition transitionType="smooth" class="images"> </BngImageCarousel>
              </AspectRatio>
              <div class="description">{{ $t(missionBasicInfo.description) }}</div>
            </template>
            <template #button>
              <BngButton accent="text" :disabled="!missionStartableDetails.startable" @click="store.startMission">
                <template v-if="missionStartableDetails.needsRepair">
                  {{ missionStartableDetails.selectedRepairTypeLabel }}
                </template>
                <template v-else> Start the mission </template>
              </BngButton>
            </template>
          </InfoCard>

          <InfoCard v-if="missionStartableDetails && missionStartableDetails.needsRepair" class="repair-info" header="Repair" header-type="ribbon" tabindex="1">
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
        </div>

        <div class="cards-column">
          <!-- Task Info Card -->
          <InfoCard v-if="missionProgress" class="task-info" header="Mission Progress" header-type="ribbon">
            <template #content>
              <template v-if="missionProgress.stars">
                <div class="tasks">
                  <div v-for="progress in missionProgress.stars" :key="progress.key" :class="{ inactive: !progress.active }" class="task-item">
                    <BngIcon
                      class="task-icon"
                      :type="progress.isDefaultStar ? icons.star : icons.starSecondary"
                      :color="progress.unlocked ? (progress.isDefaultStar ? defaultStarUnlockedColor : bonusStarUnlockedColor) : lockedStarColor" />
                    <span class="task-description">{{ $mctx_t(progress.label) }}</span>
                  </div>
                </div>
              </template>
              <div v-if="missionProgress.showMessage" class="progress-message">{{ missionProgress.message }}</div>
            </template>
          </InfoCard>

          <!-- Mission Settings Card -->
          <InfoCard :key="selectedMission.id" v-if="missionSettings" class="mission-settings" header="Mission Settings" tabindex="1">
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
                        :config="{ label: x => $t(x.label), value: x => x.value }"
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
                      <div class="setting-item-label">{{ $t(setting.label) }}</div>
                      <template v-if="setting.max">
                        <BngSlider
                          :value="setting.value"
                          :min="setting.min"
                          :max="setting.max"
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
        </div>

        <!-- Vehicle Settings Card -->
        <!-- <InfoCard class="vehicle-settings" header="Vehicle selected">
          <template #content>
            <div class="vehicle-img"></div>
            <div class="settings">
              <BngPropVal
                v-for="attr in selectedMission.vehicleSettings.attributes"
                :key="attr.value"
                :key-label="attr.label"
                :value-label="attr.value"
              ></BngPropVal>
            </div>
          </template>
          <template #button>
            <BngButton tabindex="1" accent="text">Choose another vehicle</BngButton>
          </template>
        </InfoCard> -->

        <!-- Ratings Info Card -->
        <div class="cards-column">
          <InfoCard v-if="selectedMission.ratings" class="ratings-info" header="Ratings">
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
      </div>
    </div>
  </LayoutSingle>
</template>

<script>
const lockedStarColor = "rgba(255, 255, 255, 0.2)"
const defaultStarUnlockedColor = "var(--bng-ter-yellow-50)"
const bonusStarUnlockedColor = "var(--bng-add-blue-400)"
const noop = () => {}
</script>

<script setup>
import { computed, onBeforeMount, onUnmounted, reactive, watch } from "vue"
import { storeToRefs } from "pinia"
import { $translate } from "@/services"
import { useUINavScope } from "@/services/uiNav"
import {
  BngImageCarousel,
  BngButton,
  BngScreenHeading,
  BngSelect,
  BngDivider,
  BngSwitch,
  BngSlider,
  BngInput,
  BngPropVal,
  BngIcon,
  icons,
} from "@/common/components/base"
import { SlotSwitcher } from "@/common/components/utility"
import { LayoutSingle } from "@/common/layouts"
import { vBngBlur } from "@/common/directives"
import { vBngOnUiNav } from "@/common/directives"
import { useMissionDetailsStore } from "@/modules/missions/stores/missionDetailsStore"
import InfoCard from "@/modules/missions/components/InfoCard.vue"
import AspectRatio from "@/common/components/utility/aspectRatio.vue"

const uiNavScope = useUINavScope("mission-details")
const store = useMissionDetailsStore()

const { availableMissions, selectedMission, missionBasicInfo, missionProgress, missionSettings, missionStartableDetails } = storeToRefs(store)

const uiState = reactive({
  currentScope: "mission-details",
  focusedCard: "",
})

const preheadings = computed(() => missionBasicInfo.value.missionTypeLabels.map(x => $translate.contextTranslate(x)))

const exit = () => window.bngVue.gotoGameState("play")

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

watch(
  () => uiState.currentScope,
  () => {
    console.log("scope changed", uiState.currentScope)
    uiNavScope.set(uiState.currentScope)
  }
)
</script>

<style scoped lang="scss">
.mission-details {
  display: flex;
  flex-direction: column;

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

  > .screen-header {
    max-width: 40rem;
    margin-top: 0;
    margin-bottom: 0;
  }

  > .mission-selector {
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
          width: 1.5rem;
          padding: var(--border-radius-small, 0.25rem);
          color: var(--primary-white, #fff);
          text-align: center;
          font-family: Overpass;
          font-size: 1.25rem;
          font-style: normal;
          font-weight: 700;
          line-height: 1.5rem;
          /* 120% */
        }

        > .vertical-divider {
          background: var(--bng-cool-gray-200);
          color: var(--primary-white, #fff);
          text-align: center;
          font-family: Overpass;
          font-size: 1.25rem;
          font-style: normal;
          font-weight: 700;
          line-height: 1.5rem;
          /* 120% */
        }
      }
    }
  }
}

.cards-row {
  display: flex;
  align-items: flex-start;
  padding: 0.5rem 5rem;
  overflow-x: auto;

  //gap: 0.75rem;
  > *:not(:last-child) {
    margin-right: 1rem;
  }

  > .cards-column {
    display: flex;
    flex-direction: column;
    flex: 0.25 0 16rem;

    // gap: 0.75rem;
    > *:not(:last-child) {
      margin-bottom: 1rem;
    }

    > :deep(.info-content) {
      flex-grow: 1;
    }
  }

  :deep(.basic-info) {
    border-radius: 0.125rem;
    flex-grow: 1;
    min-width: 24rem;
    max-width: 32rem;

    .info-content {
      display: flex;
      flex-direction: column;
    }

    .card {
      width: 25rem;
      max-height: 35rem;
    }

    .images {
      width: 100%;
      // min-height: 15rem;
    }

    .description {
      overflow-y: auto;
      padding: 0.75em;
    }
  }

  :deep(.repair-info) {
    .repair-item {
      display: flex;
      align-items: center;
      padding: 1rem;

      > .repair-item-label {
        font-size: 1.2rem;
      }

      > .repair-item-control {
        flex-grow: 1;
      }
    }
  }

  :deep(.task-info) {
    > .card .info-content {
      padding: 1rem;
      // border-bottom: 1rem solid transparent;
    }

    .vehicle {
      padding-bottom: 0.25em;
      line-height: 1.5rem;
      /* 150% */
      letter-spacing: 0.01rem;
    }

    .tasks {
      display: flex;
      flex-direction: column;

      > .task-item {
        display: flex;

        &.inactive {
          > .task-description {
            text-decoration: line-through;
          }
        }

        &:not(:last-child) {
          padding-bottom: 1rem;
        }

        > .task-icon {
          display: inline-block;
          align-self: baseline;
          font-size: 2rem;
          line-height: 1.5rem;
          padding-right: 0.25rem;
        }

        > .task-description {
          font-weight: 600;
          letter-spacing: 0.01rem;
        }
      }
    }

    .progress-message {
      padding: 0.75rem;
      padding-bottom: 0;
    }
  }

  :deep(.mission-settings) {
    .setting-item {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;

      &:not(:last-child) {
        padding-bottom: 0.5rem;
      }

      > .setting-item-label {
        padding-bottom: 0.25rem;
      }
    }
  }

  :deep(.vehicle-settings) {
    .card .info-content {
      overflow-y: initial;
    }

    .vehicle-img {
      width: 100%;
      height: 10rem;
      background-image: v-bind(vehicleImage);
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
    }

    .settings {
      height: 10rem;
      overflow-y: auto;

      > *:last-child {
        border-bottom: 1rem solid transparent;
      }
    }
  }

  :deep(.ratings-info) {
    .ratings {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;

      > *:not(:last-child) {
        margin-bottom: 0.5rem;
      }
    }
  }

  :deep(.task-info),
  :deep(.mission-settings) {
    .settings-wrapper {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
    }

    .card {
      min-width: 20rem;
      max-width: 24rem;
    }
  }

  :deep(.vehicle-settings),
  :deep(.ratings-info) {
    .card {
      width: 18rem;
      height: 25rem;
    }
  }
}
</style>
