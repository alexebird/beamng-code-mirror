<!-- Logbook -->
<template>
  <LayoutSingle class="layout-content-full flex-column layout-paddings" v-bng-blur>
    <BngScreenHeading>{{ $t("ui.career.logbook.subHeading") }}</BngScreenHeading>
    <div
      bng-ui-scope="logbook"
      class="career-logbook-wrapper"
      v-bng-on-ui-nav:back,menu="exit"
      v-bng-on-ui-nav:tab_l="sectionTabs && sectionTabs.goPrev"
      v-bng-on-ui-nav:tab_r="sectionTabs && sectionTabs.goNext">
      <div class="career-logbook-container">
        <div class="career-logbook-list">
          <Tabs ref="sectionTabs" @change="tabChange" class="bng-tabs" :make-tab-header-classes="tabDetails => ({ flagged: tabDetails.data.hasNew })">
            <Tab v-for="tabDetail in logbookTabs" :heading="$t(tabDetail.name)" :active="tabDetail.isPreselected" :data="tabDetail" bng-nav-scroll-force>
              <div
                bng-nav-item
                class="career-logbook-item"
                :class="{ selected: selectedEntry !== undefined && selectedEntry.entryId == entry.entryId }"
                v-for="entry in tabDetail.entries"
                @click="toggleExpand(entry)">
                <div class="career-logbook-item-content">
                  <div class="career-logbook-meta">
                    <div>{{ $ctx_t(entry.cardTypeLabel) }}</div>
                    <BngDivider class="vertical-divider"></BngDivider>
                    <div v-bng-relative-time="entry.time"></div>
                    <div class="career-logbook-newmark" v-show="entry.isNew"></div>
                  </div>
                  <div class="career-logbook-item-label">{{ $ctx_t(entry.title) }}</div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>

        <div class="career-logbook-details">
          <BngCard class="career-logbook-content-card" v-show="selectedEntry !== undefined">
            <BngCardHeading class="logbook-entry-heading" type="ribbon"
              >{{ selectedEntry && $ctx_t(selectedEntry.title) }}
              <div class="career-logbook-title-newmark" v-show="selectedEntry.isNew"></div>
              <BngButton class="exitButton" @click="exit" accent="attention"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
            </BngCardHeading>
            <div class="career-logbook-meta">
              <div>{{ $ctx_t(selectedEntry.cardTypeLabel) }}</div>
              <BngDivider class="vertical-divider"></BngDivider>
              <div v-bng-relative-time="selectedEntry.time"></div>
            </div>
            <div :class="{ 'card-body': true, 'with-rewards': selectedEntry.type === 'quest' && selectedEntry.rewards.length }">
              <!-- TODO - Future fix, bring these images inside the Vue code area? -->
              <div v-if="selectedEntry.cover" class="logbook-cover-image" :style="{ backgroundImage: `url(${selectedEntry.cover})` }">
                <h1 v-if="selectedEntry.coverText">{{ selectedEntry.coverText }}</h1>
              </div>

              <div class="logbook-description"><DynamicComponent v-if="selectedEntry._ready" :template="$ctx_t(selectedEntry.text)" /></div>

              <!-- only include this part if the element has a table -->
              <div v-if="selectedEntry.tables" class="logbook-description logbook-table">
                <table v-for="(table, keyT) in selectedEntry.tables" :key="keyT">
                  <tr>
                    <th v-for="(header, keyH) in table.headers" :key="keyH">
                      {{ header }}
                    </th>
                  </tr>
                  <tr v-for="(row, keyR) in table.rows" :key="keyR">
                    <td v-for="(data, keyD) in row" :key="keyD">
                      <RewardsPills
                        v-if="typeof data === 'object' && data !== null && data.hasOwnProperty('type') && data.type === 'rewards'"
                        :rewards="data.rewards"
                        :hideNumbers="false" />
                      <DynamicComponent v-else :template="$ctx_t(data)" />
                    </td>
                  </tr>
                </table>
              </div>

              <!-- only include this part of the element is a quest -->
              <hr v-if="selectedEntry.type === 'quest'" />
              <div v-if="selectedEntry.type === 'quest'" class="logbook-description quest-status">
                <h4>Milestone Status</h4>
                <div v-for="prog in selectedEntry.progress">
                  <div class="quest-stats-wrapper">
                    <div class="quest-labels">
                      <BngLottie
                        icon="check"
                        :value="prog.failed ? 'x' : prog.done ? 'v' : ''"
                        :class="{ 'lottie-check': true, fail: prog.failed, success: prog.done }" />
                      <div class="progress-label">{{ $ctx_t(prog.label) }}</div>
                      <!-- <span ng-if="prog.type === 'progressBar'" class="progressbar-value" ng-init="logValue($scope)">
                        {{ // prog.currValue | number:2 }} / {{ // prog.maxValue }}
                      </span> -->
                    </div>
                    <div v-if="prog.type === 'progressBar'" class="progressbar-background">
                      <div
                        class="progressbar-fill"
                        :style="{ width: (prog.currValue > 0 ? (prog.currValue / (prog.maxValue - prog.minValue)) * 100 : 0) + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <template #footer v-if="selectedEntry.type === 'quest' && selectedEntry.rewards.length">
              <div class="rewards-wrapper flex-row">
                <div class="label">{{ $t("ui.career.logbook.rewards") }}:</div>
                <div class="rewards-section flex-row">
                  <div class="flex-row" v-for="reward in selectedEntry.rewards">
                    <BngUnit class="reward-icon" v-bind="{ [rewardUnitTypes[reward.attributeKey]]: reward.rewardAmount }" :options="{ formatter: x => ~~x }" />
                  </div>
                </div>
                <BngButton
                  v-show="!selectedEntry.claimed"
                  v-bng-sound-class="'bng_click_generic'"
                  @click="claimRewards(selectedEntry)"
                  :disabled="!selectedEntry.claimable">
                  {{ $t("ui.career.logbook.claimRewards") }}
                </BngButton>
                <BngButton v-show="selectedEntry.claimed" :disabled="true">
                  {{ $t("ui.career.logbook.rewardsClaimed") }}
                </BngButton>
              </div>
            </template>
          </BngCard>
        </div>
      </div>
    </div>
  </LayoutSingle>
</template>

<script setup>
import { LayoutSingle } from "@/common/layouts"
import { BngButton, BngScreenHeading, BngDivider, BngCard, BngCardHeading, BngLottie, BngUnit, BngBinding } from "@/common/components/base"
import { Tabs, Tab, DynamicComponent } from "@/common/components/utility"
import { vBngRelativeTime, vBngBlur, vBngSoundClass, vBngOnUiNav } from "@/common/directives"
import { $content, $translate } from "@/services"

import { lua } from "@/bridge"
import { ref, computed, onMounted } from "vue"
import RewardsPills from "../components/progress/RewardsPills.vue"
import { useUINavScope } from "@/services/uiNav"
useUINavScope("logbook") // UI Nav events to fire from (or from focused element inside) element with attribute: bng-ui-scope="logbook"

const rewardUnitTypes = {
  money: "beambucks",
  beamXP: "xp",
}

const props = defineProps({
  id: String,
})

const sectionTabs = ref()

const entryId = computed(() => (props.id !== undefined ? ("" + props.id).replace(/\%/g, "/") : undefined))

const logbookTabs = ref([
  {
    name: "Info",
    entries: [],
    filter: i => i.type === "info",
  },
  // {
  //   name: "Milestones",
  //   entries: [],
  //   filter: i => i.type === "quest",
  // },
  {
    name: "History",
    entries: [],
    filter: i => i.type === "progress",
  },
])

const checkForNewLogEntries = () => logbookTabs.value.forEach(tab => (tab.hasNew = !!tab.entries.some(i => i.isNew)))

lua.career_modules_logbook.getLogbook().then(setup)

function setup(data) {
  data.forEach(entry => {
    if (entry.hasOwnProperty("text")) {
      // ** TODO ** - move to Vue translate ASAP
      entry.text = $content.bbcode.parse($translate.contextTranslate(entry.text, true))
      entry._ready = true
    }
  })

  logbookTabs.value.forEach(tab => (tab.entries = data.filter(tab.filter)))
  checkForNewLogEntries()
  if (entryId.value) {
    for (let tab of logbookTabs.value) {
      for (let entry of tab.entries) {
        if ("" + entry.entryId === entryId.value) {
          toggleExpand(entry)
          tab.isPreselected = true
          return
        }
      }
    }
  }
  if (logbookTabs.value[0].entries.length) toggleExpand(logbookTabs.value[0].entries[0])
}

const entry = ref({}),
  selectedEntry = ref({}),
  reward = ref({})

let readTimer

const toggleExpand = entry => {
  readTimer && clearTimeout(readTimer)
  selectedEntry.value = entry
  readTimer = window.setTimeout(() => {
    selectedEntry.value.isNew = false
    checkForNewLogEntries()
    if (entry.type === "quest") {
      lua.career_modules_questManager.setQuestAsNotNew(entry.questId)
    } else {
      lua.career_modules_logbook.setLogbookEntryRead(entry.entryId, true)
    }
  }, 1000)
}

const tabChange = newTab => {
  if (entryId.value) {
    entryId.value = undefined
    return
  }
  let tab = logbookTabs.value[newTab.id]
  if (tab.entries.length) toggleExpand(tab.entries[0])
}
const claimRewards = entry => {
  lua.career_modules_questManager.claimRewardsById(entry.questId)
  entry.claimable = false
  entry.claimed = true
}

const exit = () => window.bngVue.gotoGameState("menu.careerPause")

const start = () => {
  lua.career_career.requestPause(true)
}

onMounted(start)
</script>

<style lang="scss" scoped>
$textcolor: #fff;
$fontsize: 1rem;

.exitButton {
  position: absolute;
  right: 0.5em;
  top: 0;
}

:deep(.logbook-entry-heading) {
  padding-bottom: 0.75em;
  margin-bottom: 0;
}

.flex-row {
  display: flex;
  flex-flow: row wrap;
}

hr {
  margin: 0.5em;
  border: none;
  border-top: 1px solid var(--bng-cool-gray-600);
}

.layout-content {
  color: $textcolor;
  font-size: $fontsize;
}

.career-logbook-list :deep(.tab-item.flagged::after) {
  content: "";
  background: var(--bng-ter-yellow-100);
  width: 0.5em;
  height: 0.5em;
  border-radius: 100%;
  position: absolute;
  top: 0.2em;
  right: 0.2em;
}

.career-logbook-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 auto;
  height: 1px;
}

// .career-logbook-wrapper > * {
//   padding: 1em;
//   font-family: "Overpass", var(--fnt-defs) !important;
//   display: flex;
//   flex-direction: column;
//   position: relative;
//   box-sizing: border-box;
//   justify-self: center;
// }

.career-logbook-wrapper > * {
  max-width: 90em;
  flex: 0 0 auto;
}

.career-logbook-wrapper .tab-list {
  background-color: var(--bng-black-o8);
}

.career-logbook-container {
  display: flex;
  flex: 0 1 auto;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  height: 100%;
}

.career-logbook-list {
  display: flex;
  flex-direction: column;
  flex: 0 0 42ch;
  overflow: hidden auto;
  max-height: 100%;
}

.career-logbook-list .tab-panel {
  overflow: hidden auto;
  height: 100%;
  box-sizing: border-box;
  padding: 1em 0.5em 1em 1em;
}

.career-logbook-list .tab-container {
  height: 100%;
}

.career-logbook-list .tab-content {
  padding: 0.75em 0.5em 0.75em 0.75em;
  overflow: hidden auto;
  height: 100%;
  box-sizing: border-box;
}

.career-logbook-item {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  border-radius: var(--bng-corners-1);
  background-color: var(--bng-black-o6);
  position: relative;
  box-shadow: inset 0px 0 0 transparent;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
  color: white;
}

.career-logbook-item:not(last-child) {
  margin-bottom: 0.75em;
}

.career-logbook-item:hover {
  background-color: var(--bng-orange-900);
}

.career-logbook-item:focus {
  background-color: var(--bng-orange-900);
}

.career-logbook-item.selected:after {
  box-shadow: inset -0.25em 0 0 var(--bng-orange-600);
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 25%;
  background: linear-gradient(270deg, rgba(255, 102, 0, 0.4) 0%, rgba(255, 102, 0, 0) 100%);
  border-radius: 0 var(--bng-corners-1) var(--bng-corners-1) 0;
  z-index: 7;
}

.career-logbook-item-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0.5em 1.5em 0.625em 1em;
  z-index: 9;
  cursor: pointer;
}

.career-logbook-meta {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: baseline;
  color: var(--bng-cool-gray-200);
  flex: 0 0 auto;
  font-family: var(--fnt-defs) !important;
  line-height: 1.5em;
}

.career-logbook-meta .vertical-divider {
  background: var(--bng-cool-gray-200);
}

.career-logbook-meta > :nth-child(3) {
  color: var(--bng-cool-gray-500);
}

.career-logbook-item-label {
  padding: 0.125em 0 0 0;
  font-size: 1.25em;
  font-weight: 500;
  line-height: 125%;
  flex: 1 0 auto;
  font-family: "Overpass", var(--fnt-defs);
}

@keyframes new-pulse {
  0% {
    box-shadow: 0 0 0.75em rgba(218, 196, 52, 0.75);
  }
  100% {
    box-shadow: 0 0 1em rgba(218, 196, 52, 1);
  }
}

.career-logbook-newmark {
  content: " ";
  background: var(--bng-ter-yellow-100);
  box-shadow: 0 0 1em var(--bng-ter-yellow-300);
  animation: new-pulse 2s cubic-bezier(0.2, 0.01, 0.12, 1) 1s infinite alternate-reverse;
  width: 1em;
  height: 1em;
  border-radius: 999px;
  position: absolute;
  top: 0.75em;
  right: 0.75em;
}

.career-logbook-title-newmark {
  content: " ";
  background: var(--bng-ter-yellow-100);
  box-shadow: 0 0 0.75em var(--bng-ter-yellow-300);
  animation: new-pulse 2s cubic-bezier(0.2, 0.01, 0.12, 1) 1s infinite alternate-reverse;
  width: 0.65em;
  height: 0.65em;
  border-radius: 999px;
  display: inline-block;
  margin-left: 0.25em;
}

.career-logbook-details {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow: hidden;
  padding: 0 0 0 1em;
}

.career-logbook-details .bng-title-wrapper {
  padding-bottom: 0;
}

.career-logbook-content-card {
  flex: 1 0 auto;
  overflow: hidden auto;
  background-color: var(--bng-ter-blue-gray-900) !important;
  height: 100%;
  & :deep(.card-cnt) {
    background-color: var(--bng-ter-blue-gray-900) !important;
  }
}

.career-logbook-content-card .career-logbook-heading {
  margin-bottom: 0;
}

.career-logbook-content-card .career-logbook-meta {
  padding-left: 2em;
}

.career-logbook-content-card .card-cnt {
  padding: 0;
}

.career-logbook-content-card .card-cnt .card-cnt .card-body {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.card-body {
  overflow-y: auto;
  // position: absolute;
  // top: 87px;
  // bottom: 0;
  // left:0;
  // right:0;
  flex: 0 1 auto;
  min-height: 0;
  &.with-rewards {
    bottom: 67px;
  }
}

.career-logbook-content-card .card-cnt > .card-body > * {
  padding: 0 1.75em 2em 2em;
}

.career-logbook-content-card .career-logbook-meta {
  padding-bottom: 0.75em;
}

.career-logbook-content-card .logbook-cover-image {
  box-sizing: border-box;
  min-width: 16em;
  min-height: 16em;
  width: 100%;
  align-self: stretch;
  max-height: 50vh;
  background-position: 50% 50%;
  background-size: cover;
  margin-bottom: 1em;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bng-ter-blue-gray-700);
}

.career-logbook-content-card .logbook-cover-image > h1 {
  font-family: "Overpass", var(--fnt-defs);
  font-weight: 500;
  line-height: 1.25em;
  font-size: 3rem;
  text-shadow: 0 0 3em var(--bng-black-o8);
}

/* Content text styles */
.logbook-description :deep(p) {
  font-family: var(--fnt-defs);
  margin-bottom: 1rem;
  line-height: 1.375em;
}

.logbook-description :deep(h1),
.logbook-description :deep(h2),
.logbook-description :deep(h3),
.logbook-description :deep(h4),
.logbook-description :deep(h5) {
  margin: 1em 0 1rem;
  font-family: "Overpass", var(--fnt-defs);
  font-weight: 500;
  line-height: 1.25em;
}

.logbook-description :deep(h1) {
  margin-top: 0;
  font-size: 3rem;
}

.logbook-description :deep(h2) {
  font-size: 2.441rem;
  font-weight: 600;
}

.logbook-description :deep(h3) {
  font-size: 1.953rem;
  font-weight: 600;
}

.logbook-description :deep(h4) {
  font-size: 1.5rem;
  font-weight: 700;
}

.logbook-description :deep(h5) {
  font-size: 1.25rem;
  font-weight: 700;
}

.logbook-description :deep(small),
.logbook-description :deep(.text_small) {
  font-size: 0.8rem;
}

/* List-items */
.logbook-description :deep(ul, ol) {
  padding: 0 0.5em;
  margin: 0.75em 0;
}

.logbook-description :deep(ul, ol, li) {
  position: relative;
}

.logbook-description :deep(ul > li) {
  list-style: none;
  display: list-item;
  margin-left: 1.5em;
  margin-bottom: 0.4em;
}

.logbook-description :deep(ol > li) {
  margin-left: 1.5em;
  margin-bottom: 0.25em;
}

.logbook-description :deep(ul > li::before) {
  content: "";
  display: inline-block;
  position: absolute;
  left: 0.5em;
  height: 1.2em;
  width: 1em;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 14 14' xmlns='http%3a%2f%2fwww.w3.org%2f2000%2fsvg'%3e%3cpath d='M5 0H14L9 14H0L5 0Z' fill='%23f60'%2f%3e%3c%2fsvg%3e");
  background-size: 0.6em;
  background-position: 50% 50%;
  background-repeat: no-repeat;
}

.logbook-description :deep(ul > li ul > li::before) {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 14 14' xmlns='http%3a%2f%2fwww.w3.org%2f2000%2fsvg'%3e%3cpath d='M10 0H5L0 14H5L10 0ZM14 0H12L7 14H9L14 0Z' fill='%23f60'%2f%3e%3c%2fsvg%3e");
}

/* Text props */
.logbook-description :deep(em) {
  color: var(--bng-orange-100);
}

.logbook-description :deep(code) {
  font-family: "Noto Sans Mono";
  font-size: 0.875em;
  display: inline-flex;
  padding: 0.25em 0.5em;
  background-color: var(--bng-ter-blue-gray-800);
  border-radius: var(--bng-corners-1);
  border: 0.125em solid var(--bng-ter-blue-gray-700);
}

.logbook-description :deep(strong) {
  font-weight: 700;
  color: var(--bng-orange-200);
}

.logbook-description:not(:last-child) {
  padding-bottom: 1.5em !important;
}

.logbook-description :deep(.quest-labels) {
  font-size: 1em;
  display: flex;
  flex-direction: row;
  padding: 0.5em 0.5em;
  z-index: 2;
  position: relative;
  align-items: flex-start;
  justify-content: flex-start;
  padding-left: 2.25em;
  overflow: visible;
  flex: 1 1 auto;
}

.logbook-description :deep(.quest-labels .progress-label) {
  flex: 1 0 auto;
  font-size: 1.2em;
  font-weight: 400;
  /* justify-self: stretch; */
}

.logbook-description :deep(.progressbar-value) {
  font-size: 1em;
  padding: 0 0.25em;
  flex: 0 0 auto;
}

.logbook-description :deep(.progressbar-background) {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  box-sizing: content-box;
  top: 0;
  z-index: 1;
  /* padding: 0.5em; */
  display: flex;
  border-radius: var(--bng-corners-1);
}

.quest-stats-wrapper {
  position: relative;
  padding: 0.25em;
  display: flex;
  flex-direction: row;
  border-radius: var(--bng-corners-1);
  margin-bottom: 0.5em;
  border: 0.125em solid var(--bng-cool-gray-800);
}

.logbook-description :deep(.progressbar-background .progressbar-fill) {
  align-self: stretch;
  background-color: rgba(255, 255, 255, 0.25);
}

:deep(.bng-lottie-animation) {
  position: absolute;
  left: 0;
  top: 0.125em;
}

:deep(.bng-lottie-animation .icon-fill path),
:deep(.bng-lottie-animation .checkbox-frame path) {
  fill: white;
  transition: all 0.25s ease-in-out;
}

:deep(.bng-lottie-animation .icon-ripple-fill path) {
  fill: rgba(255, 255, 255, 0.4);
  transition: all 0.25s ease-in-out;
}

:deep(.bng-lottie-animation.success .icon-fill path),
:deep(.bng-lottie-animation.success .checkbox-frame path) {
  fill: var(--bng-add-green-400);
}

:deep(.bng-lottie-animation.fail .icon-fill path),
:deep(.bng-lottie-animation.fail .checkbox-frame path) {
  fill: var(--bng-add-red-400);
}

:deep(.lottie-check) {
  position: absolute;
  width: 3em;
  height: 3em;
  top: 0.2em;
  left: 0.1em;
}

.rewards-wrapper,
.rewards-wrapper * {
  justify-content: flex-end !important;
  align-items: center;
}

.rewards-wrapper .label {
  font-size: 1.12em;
  line-height: 1.2em;
  font-weight: 500;
  letter-spacing: 0.01em;
  margin-bottom: -0.2em;
}

.rewards-wrapper .branch-icon-assembly {
  margin: 0;
  margin-right: 0.25em;
}

.rewards-section > div {
  padding: 0 1em 0.25em 0;
}

.rewards-section {
  padding: 0 1em;
  font-family: "Overpass", var(--fnt-defs);
  font-weight: 800;
  font-style: italic;
}

.rewards-section span {
  vertical-align: baseline;
  transform: translateY(0.25em);
  font-size: 1.25em;
}

.reward-icon {
  min-width: 1.25em;
  min-height: 1.25em;
  margin: 0 0.2em;
  display: inline-block;
}

.career-logbook-details card-footer {
  padding: 0.5em 2em;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.logbook-table {
  text-align: left;
  width: 100%;
  margin-top: 1.5em;
}
.logbook-table table {
  width: 100%;
}
.logbook-table tr:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.5);
}
.logbook-table tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.2);
}
.logbook-table th {
  background-color: rgba(0, 0, 0, 0.5);
  position: sticky;
}
</style>
