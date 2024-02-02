<template>
  <LayoutSingle class="layout-content-full layout-align-center">
    <div class="mission-details">
      <BngScreenHeading class="screen-header" mute divider :preheadings="mission.preheadings">
        Mission: POI name in several words or maybe a tiny little itsy-bitsy longer
      </BngScreenHeading>
      <div class="cards-row">
        <!-- Basic Info Card -->
        <InfoCard class="basic-info button-center">
          <template #content>
            <bng-carousel :items="mission.images" class="images"></bng-carousel>
            <div class="description">{{ mission.description }}</div>
          </template>
          <template #button>
            <bng-button tabindex="1" accent="text">Start the mission</bng-button>
          </template>
        </InfoCard>
        <div class="cards-column">
          <!-- Task Info Card -->
          <InfoCard class="task-info" header="Task" header-type="ribbon">
            <template #content>
              <div class="vehicle">{{ mission.taskInfo.vehicle }}</div>
              <div class="tasks">
                <div v-for="task in mission.taskInfo.tasks" :key="task" class="task-item">{{ task }}</div>
              </div>
            </template>
          </InfoCard>

          <!-- Mission Settings Card -->
          <InfoCard class="mission-settings" header="Mission settings">
            <template #content>
              <bng-select
                loop
                :value="mission.missionSettings.difficulty.value"
                :options="mission.missionSettings.difficulty.options"
                :config="{ label: x => x.label, value: x => x.value }"
              />
              <bng-prop-val
                v-for="attr in mission.missionSettings.attributes"
                :key="attr.value"
                :key-label="attr.label"
                :value-label="attr.value"
              ></bng-prop-val>
            </template>
            <template #button>
              <bng-button tabindex="1" accent="text">Edit mission settings</bng-button>
            </template>
          </InfoCard>
        </div>

        <!-- Vehicle Settings Card -->
        <InfoCard class="vehicle-settings" header="Vehicle selected">
          <template #content>
            <div class="vehicle-img"></div>
            <div class="settings">
              <bng-prop-val
                v-for="attr in mission.vehicleSettings.attributes"
                :key="attr.value"
                :key-label="attr.label"
                :value-label="attr.value"
              ></bng-prop-val>
            </div>
          </template>
          <template #button>
            <bng-button tabindex="1" accent="text">Choose another vehicle</bng-button>
          </template>
        </InfoCard>

        <!-- Ratings Info Card -->
        <InfoCard class="ratings-info" header="Ratings">
          <template #content>
            <bng-prop-val
                v-for="attr in mission.ratings.ranking"
                :key="attr.value"
                :key-label="attr.label"
                :value-label="attr.value"
              ></bng-prop-val>
          </template>
          <template #button>
            <bng-button tabindex="1" accent="text">Leaderboards</bng-button>
          </template>
        </InfoCard>
      </div>
    </div>
  </LayoutSingle>
</template>

<script setup>
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { BngCarousel, BngButton, BngScreenHeading, BngSelect, BngPropVal } from "@/common/components/base"
import { LayoutSingle } from "@/common/layouts"
import { getAssetURL } from "@/utils"
import { useMissionDetailsStore } from "../stores/missionDetailsStore"
import InfoCard from "../components/InfoCard.vue"

const store = useMissionDetailsStore()
const { mission } = storeToRefs(store)

const vehicleImage = computed(() => `url(${getAssetURL(mission.value.vehicleSettings.image)}`)
</script>

<style scoped lang="scss">
.mission-details {
  display: flex;
  flex-direction: column;
  padding: 10rem;

  > .screen-header {
    top: 0;
    max-width: 40rem;
  }
}

.cards-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 5rem;
  overflow-x: auto;

  > .cards-column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  :deep(.basic-info) {
    border-radius: 0.125rem;
    .card {
      width: 20rem;
      height: 30rem;
    }

    .images {
      height: 50%;
    }

    .description {
      height: 50%;
      overflow-y: auto;
      padding: 0.75em;
    }
  }

  :deep(.task-info) {
    > .card .info-content {
      padding: 0 0.75rem;
      // border-bottom: 1rem solid transparent;
    }

    .vehicle {
      padding-bottom: 0.25em;
      line-height: 1.5rem; /* 150% */
      letter-spacing: 0.01rem;
    }

    .tasks > .task-item {
      font-weight: 700;
      line-height: 1.5rem; /* 150% */
      letter-spacing: 0.01rem;

      &:not(:last-child) {
        padding-bottom: 0.25em;
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

  :deep(.task-info),
  :deep(.mission-settings) {
    .card {
      width: 18rem;
      height: 14rem;
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
