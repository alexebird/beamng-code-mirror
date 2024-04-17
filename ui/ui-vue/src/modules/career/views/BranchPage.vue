<template>
  <LayoutSingle
    bng-nav-scroll
    class="layout-content-full layout-paddings layout-align-center"
    bng-ui-scope="branch"
    v-bng-blur
    v-bng-on-ui-nav:back,menu="exit"
    v-bng-on-ui-nav:tab_l="() => selectOneFilters && selectOneFilters.focusPrevious()"
    v-bng-on-ui-nav:tab_r="() => selectOneFilters && selectOneFilters.focusNext()">
    <div class="career-branch-wrapper">
      <BngScreenHeading>{{ $t("ui.career.landingPage.name") }}</BngScreenHeading>
      <div class="career-branch-page">
        <div class="actions">
          <BngButton class="exitButton" @click="close" accent="attention"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
          <div class="career-branch-filters">
            <BngIcon class="career-filter-icon" :type="icons.filter" />
            <BngPillFilters ref="selectOneFilters" v-model="selectedFilters" selectOnFocus :options="filterOptions" @valueChanged="filterChanged" />
          </div>
        </div>
        <div v-if="page.details" class="career-page-details" bng-nav-scroll-force>
          <BngProgressBar
            class="main-stat-progress-bar"
            :headerLeft="$ctx_t(page.skillInfo.name)"
            :headerRight="$ctx_t(page.skillInfo.levelLabel)"
            :value="page.skillInfo.max === -1 ? 1 :page.skillInfo.value - page.skillInfo.min"
            :max="page.skillInfo.max === -1 ? 1 :page.skillInfo.max - page.skillInfo.min"
            :showValueLabel="true"
            :valueLabelFormat="page.skillInfo.max == -1 ? page.skillInfo.value.toString()+'&nbspXP' : '#value#&nbspXP'"/>
          <h3 class="page-description">{{ $t(skillDescription) }}</h3>
          <div class="page-progress">
            <div class="skills-progress-bars">
              <template v-for="skill in skills">
                <BngProgressBar
                  v-if="branchKey != 'labourer' || skills.length > 1"
                  class="stat-progress-bar"
                  :headerLeft="$ctx_t(skill.name)"
                  :headerRight="$ctx_t(skill.levelLabel)"
                  :value="skill.max == -1 ? 1 : skill.value - skill.min"
                  :max="skill.max == -1 ? 1 : skill.max - skill.min"
                  :showValueLabel="true"
                  :valueLabelFormat="skill.max === -1 ? skill.value.toString()+'&nbspXP' : skill.isInDevelopment ? 'Coming Soon!' : '#value#&nbspXP'"/>
              </template>
            </div>
            <template v-for="skill in skills">
              <DeliveryProgressBar v-if="skills.length === 1 && skill.unlockInfo.length > 0"
                class="stat-progress-bar bng-progress-bar progress-bar"
                :headerLeft="$ctx_t(skill.name)"
                :headerRight="$ctx_t(skill.levelLabel)"
                :value="skill.value"
                :max="skill.max"
                :min="skill.min"
                :maxRequiredValue="skill.maxRequiredValue"
                :tiers="skill.unlockInfo"
                :currentTier="skill.level" />
            </template>
          </div>
          <div class="cards-container">
            <MissionCard class="clickable-card" v-for="mission in missions" :isFacility="false" :mission="mission" @goToBigMap="goToBigMap" />
            <MissionCard class="clickable-card" v-for="fac in facilities" :isFacility="true" :mission="fac" @goToBigMap="goToBigMap" />
          </div>
        </div>
        <!-- show skeleton while loading -->
        <div v-else class="career-page-details">
          <BngProgressBar
            class="main-stat-progress-bar"
            :headerLeft="'&nbsp;'"
            :headerRight="'&nbsp;'"
            :value="0"
            :max="100"/>
          <h3 class="page-description">&nbsp;</h3>
          <div class="page-progress">
            <div class="skills-progress-bars">
              <BngProgressBar v-for="skill in ['', '', '', '']"
                class="stat-progress-bar"
                :headerLeft="'&nbsp;'"
                :headerRight="'&nbsp;'"
                :value="0"
                :max="100"/>
            </div>
          </div>
          <div class="cards-container">
            <MissionCard class="clickable-card" v-for="mission in ['', '', '']" :isSkeleton="true" />
          </div>
        </div>
      </div>
    </div>
  </LayoutSingle>
</template>

<script setup>
import { LayoutSingle } from "@/common/layouts"
import { BngButton, BngScreenHeading, BngProgressBar, BngPillFilters, BngBinding, BngIcon, icons } from "@/common/components/base"
import { vBngBlur, vBngOnUiNav } from "@/common/directives"
import MissionCard from "../components/missions/MissionCard.vue"
import { lua } from "@/bridge"
import { ref, computed } from "vue"
import { onMounted } from "vue"
import { useUINavScope } from "@/services/uiNav"
import DeliveryProgressBar from "../components/branches/DeliveryProgressBar.vue"
import { $translate } from "@/services/translation"
useUINavScope("branch") // UI Nav events to fire from (or from focused element inside) element with attribute: bng-ui-scope="branch"

const props = defineProps({
  branchKey: String,
})

const page = ref({})

const BRANCHES_UNIT_TYPES = {
  labourer: "deliveryTruckArrows",
  specialized: "carChase01",
  motorsport: "raceFlag",
  adventurer: "jump",
}

const defaultFilter = "all"

const missions = ref([])
const selectOneFilters = ref(null)
const facilities = ref([])
const skills = ref([])
const deliveryProgressSkills = ref([])
const skillDescription = ref()
const selectedFilters = ref([defaultFilter])
const filterOptionsData = ref([])

const filterOptions = computed(() => {
  const options = [{ value: "all", label: "All" }]
  if (filterOptionsData.value) {
    for (const item of Object.values(filterOptionsData.value)) {
      options.push({ label: $translate.instant(item.label), value: item.value })
    }
  }
  return options
})

async function filterChanged(filterList) {
  const curFilter = filterList ? filterList[0] : defaultFilter
  const selectAll = curFilter === "all"

  if (Array.isArray(page.value.missions)) {
    missions.value = page.value.missions.filter(
      itm => !itm.locked && (selectAll || itm.skill[0] === curFilter)
    )
  }
  if (Array.isArray(page.value.facilities)) {
    facilities.value = page.value.facilities.filter(
      itm => !itm.locked && (selectAll || itm.skill.some(skill => skill == curFilter))
    )
  }

  if (selectAll) {
    skills.value = page.value.details.skills
    skillDescription.value = page.value.details.description
  } else {
    skills.value = page.value.details.skills.filter(e => e.id == curFilter)
    skillDescription.value = page.value.details.skills.find(e => e.id == curFilter).description
  }
}

async function setup(data) {
  page.value = data
  filterOptionsData.value = Object.values(data.filters).sort((a, b) => a.order - b.order)
  await filterChanged()
}

const goToBigMap = mission => {
  if (mission && mission.startable) {
    lua.career_career.requestPause(false)
    lua.career_modules_branches_landing.openBigMapWithMissionSelected(mission.id)
  }
}

const close = () => {
  window.bngVue.gotoGameState("branchLanding")
}

onMounted(async () => {
  //deliveryProgressSkills.value = await lua.career_modules_branches_landing.getCargoProgressForUI()
  setup(await lua.career_modules_branches_landing.getBranchPageData(props.branchKey))
})

const exit = () => window.bngVue.gotoGameState("branchLanding")
</script>

<style lang="scss" scoped>
$textcolor: #fff;
$fontsize: 1rem;

:deep(.clickable-card.click-startable) {
  cursor: pointer;
}

.layout-content {
  color: $textcolor;
  font-size: $fontsize;
}

.career-branch-wrapper {
  display: flex;
  flex-flow: column;
  width: 100%;
  max-width: 92rem;
  height: 100%;
  & > .career-branch-page {
    display: flex;
    flex-flow: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: rgba(3, 1, 1, 0.6);
    border-radius: var(--bng-corners-3);

    .actions {
      flex: 0 0 auto;
      display: flex;
      flex-direction: row;
      width: fit-content;
      padding: 1rem;
      align-items: center;
      > .career-branch-exitButton {
        margin-right: 1rem;
      }
      > .career-branch-filters {
        display: flex;
        > .career-filter-icon {
          font-size: 2em;
          padding-left: 1rem;
          padding-right: 0.5rem;
        }
      }
    }
    .career-page-details {
      display: flex;
      flex-flow: column;
      padding: 0rem 1.5rem;
      overflow: hidden auto;
      > .main-stat-progress-bar {
        flex: 0 0 auto;
        padding: 0rem 1rem;
        font-size: 1.75rem;
      }
      > .page-label {
        padding: 0 1rem 0;
        flex: 0 0 auto;
      }
      > .page-description {
        padding: 0 1rem 1rem;
        flex: 0 0 auto;
      }
      > .page-progress {
        flex: 0 0 auto;
        padding: 0 1rem 1rem;
        > .skills-progress-bars {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));
          gap: 0.5rem;
          .stat-progress-bar {
            font-size: 1.25rem;
            padding-bottom: 0.5rem;
          }
        }
      }
      .mission-label {
        padding: 1rem;
      }
      .cards-container {
        flex: 1 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(25em, 1fr));
        gap: 1rem;
        grid-auto-rows: 1fr;
        align-items: stretch;
        padding: 1rem 0;
      }
    }
  }
}


</style>
