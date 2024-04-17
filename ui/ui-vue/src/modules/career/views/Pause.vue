<!-- Career Pause -->
<template>
  <div class="career-pause-wrapper" v-bng-blur>
    <CareerSimpleStats />
    <div class="layout-center-wrapper">
      <div class="pause-body-wrapper">
        <CareerStatus class="pause-profile-status" />
        <div class="left-content">
          <BngImageTile :label="'Exit Career'" :icon="icons.abandon" @click="onExitCareerButtonClicked" :ratio="ICON_RATIO" />
          <BngCard class="system-buttons">
            <BngButton tabindex="1" accent="text" @click="onSaveButtonClicked">Save</BngButton>
            <BngButton tabindex="1" accent="text" @click="onLoadButtonClicked">Load</BngButton>
            <BngButton tabindex="1" accent="text" @click="onSettingsButtonClicked">Settings</BngButton>
          </BngCard>
        </div>
        <BngCard class="main-content grid">
          <!-- Replace the div's children components with one "tabs selector", it may require some CSS change tho -->
          <div class="tabs-group">
            <BngButton class="button prev-button" @click="onMiddlePillsSelectPrevious" tabindex="0" accent="text">Previous</BngButton>
            <BngPillFiltersContainer
              class="tabs-track"
              ref="middlePillsContainerRef"
              :html-id="'middle-pills-container-ref'"
              :options="MIDDLE_PILL_OPTIONS"
              :select-on-navigation="false"
              @valueChanged="middlePillsValueChanged"
              :required="true"
              :has-checked-icon="false" />
            <BngButton class="button next-button" @click="onMiddlePillsSelectNext" tabindex="0" accent="text">Next</BngButton>
          </div>
          <!-- End -->
          <div class="tab-content">
            <PauseMapPreview v-if="currentPillTypeSelected == 'Map'" />
            <PauseMilestonesPreview v-if="currentPillTypeSelected == 'Milestones'" />
            <AspectRatio v-if="currentPillTypeSelected === undefined" style="background: red" v-bng-sound-class="'bng_click_generic'" :ratio="'4:3'">
              <div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0, 0, 0, 0.5)">
                <BngCardHeading style="color: white" type="ribbon">Undefined Pill Type!</BngCardHeading>
              </div>
            </AspectRatio>
          </div>
        </BngCard>
        <div class="right-content">
          <BngImageTile v-for="btn in contextButtons" :label="btn.label" :icon="icons[btn.icon]" @click="onContextButtonClicked(btn)" :ratio="ICON_RATIO" />
        </div>
        <div class="bottom-content">
          <BngImageTile class="photo-mode" :label="'Photo Mode'" :icon="icons.photo" :ratio="ICON_RATIO" />
          <BngCard class="tod">
            <div class="icon-box">I'm an icon box!</div>
            <BngSlider ref="iptChanged" :min="0" :max="1" :step="0.1" v-model="todSliderValue" @valueChanged="onTODChanged" />
            <BngInput class="tod-value" />
          </BngCard>
        </div>
      </div>
    </div>
    <div style="background: green; height: 5em">FOOTER</div>
  </div>
</template>

<script setup>
import { BngButton, BngCard, BngCardHeading, BngSlider, BngPillFiltersContainer, BngInput, icons } from "@/common/components/base"
import { AspectRatio } from "@/common/components/utility"
import { vBngBlur, vBngSoundClass } from "@/common/directives"

import { lua } from "@/bridge"
import { ref } from "vue"

import { useUINavScope } from "@/services/uiNav"

import { BngImageTile } from "@/common/components/base"
import { CareerStatus, CareerSimpleStats } from "@/modules/career/components"

import PauseMapPreview from "../components/pause/PauseMapPreview.vue"
import PauseMilestonesPreview from "../components/pause/PauseMilestonesPreview.vue"

useUINavScope("pause") // UI Nav events to fire from (or from focused element inside) element with attribute: bng-ui-scope="pause"

//BngImageTile default ratio for the icon
const ICON_RATIO = "2.25:1"

//middle section pills
const MIDDLE_PILL_OPTIONS = [
  { value: 0, label: "Map", type: "Map" },
  { value: 1, label: "Milestones", type: "Milestones" },
  { value: 2, label: "Engine" },
  { value: 3, label: "Transmission" },
  { value: 4, label: "Suspension" },
  { value: 5, label: "Electrics" },
  { value: 6, label: "Electrics1" },
  { value: 7, label: "Electrics2" },
  { value: 8, label: "Electrics3" },
]

const currentPillTypeSelected = ref(MIDDLE_PILL_OPTIONS[0].type)
const middlePillsContainerRef = ref(null)

function onSelectCurrent() {
  middlePillsContainerRef.value.selectCurrent()
}

function onMiddlePillsSelectPrevious() {
  middlePillsContainerRef.value.selectPrevious()
}

function onMiddlePillsSelectNext() {
  middlePillsContainerRef.value.selectNext()
}

function middlePillsValueChanged(selectedValues) {
  let pillId = selectedValues[0]
  let selectedPill = MIDDLE_PILL_OPTIONS.find(pill => pill.value === pillId)
  console.log(selectedPill)
  currentPillTypeSelected.value = selectedPill.type
}

//TOD Slider
const todSliderValue = ref(0.5)
// on load: get correct todSlider value from env
const onTODChanged = v => {
  //call lua...
  console.log(v)
}

const contextButtons = ref({})

function setupContextButtons(data) {
  console.log(data)
  contextButtons.value = data.buttons
}
lua.career_modules_uiUtils.getCareerPauseContextButtons().then(setupContextButtons)
function onContextButtonClicked(btn) {
  console.log(btn)
  lua.career_modules_uiUtils.callCareerPauseContextButtons(btn.functionId)
}

function onExitCareerButtonClicked() {
  console.log("onExitCareerButtonClicked")
  //TODO
}
function onSaveButtonClicked() {
  career_saveSystem.saveCurrent()
}
function onLoadButtonClicked() {
  console.log("onLoadButtonClicked")
  //TODO
}
function onSettingsButtonClicked() {
  console.log("onSettingsButtonClicked")
  //TODO
}

const exit = () => window.bngVue.gotoGameState("play")
</script>

<style lang="scss" scoped>
$textcolor: #fff;
$fontsize: 1rem;

hr {
  margin: 0.5em;
  border: none;
  border-top: 1px solid var(--bng-cool-gray-600);
}

.layout-content {
  color: $textcolor;
  font-size: $fontsize;
}

.career-pause-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 auto;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.25);

  .layout-center-wrapper {
    display: flex;
    flex: 1 1 auto;
    align-self: stretch;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    .pause-body-wrapper {
      display: grid;
      gap: 1rem 1.5rem;
      grid-template:
        ". top ." auto
        "left main right" 1fr
        ". bottom ." auto / 12rem minmax(18rem, 40rem) 12rem;

      :deep(.tile) {
        width: auto;
        margin: 0;
        .label {
          // Optional label overrides
          font-size: 1.25rem;
          text-align: center;
          font-weight: 600;
          line-height: 1.5rem;
        }
      }
      .pause-profile-status {
        color: white;
        border-radius: var(--bng-corners-2);
        grid-area: top;
        justify-self: center;
        align-self: end;
        background-color: rgba(0, 0, 0, 0.7);
      }
      .left-content {
        grid-area: left;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
        align-content: flex-start;
        gap: 0.5rem;
        .system-buttons {
          :deep(.card-cnt) {
            padding: 0.25rem;
          }
        }
      }
      .main-content {
        grid-area: main;
        &.grid > :deep(.card-cnt) {
          display: grid;
          grid-template:
            "tabs" auto
            "content" 1fr / 1fr;
          // align-items: center;
          // justify-items: center;
          .tabs-group {
            display: grid;
            grid-template: "prev tabs next" auto / auto 1fr auto;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            .button {
              align-self: center;
              margin: 0;
              .prev-button {
                grid-area: prev;
              }
              .next-button {
                grid-area: next;
              }
            }
            .tabs-track {
              grid-area: tabs;
              max-width: none;
              align-self: center;
              & > .scroll-container {
                padding: 0;
              }
            }
          }
          .tab-content {
            grid-area: content;
            background: var(--bng-black-o6);
            padding-bottom: 1rem;
          }
        }
      }
      .right-content {
        grid-area: right;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
        align-content: flex-start;
        gap: 0.5rem;
      }
      .bottom-content {
        grid-area: bottom;
        justify-self: center;
        align-self: baseline;
        display: grid;
        grid-template: 1fr / repeat(3, minmax(8rem, 1fr));
        gap: 0.5rem;
        padding: 0 2rem;
        .photo-mode {
          grid-area: 1 / 1 / 1 / 1;
        }
        .tod {
          grid-column-end: span 2;
          align-self: stretch;
          height: auto;
          min-width: 12rem;
          & > :deep(.card-cnt) {
            padding: 1rem;
            justify-self: stretch;
            height: 100%;
          }
          .icon-box {
            color: white;
            display: flex;
            justify-content: space-between;
          }
          .tod-value {
            align-self: center;
            width: 6rem;
          }
        }
      }
    }
  }
}

.career-pause-container {
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
  //justify-content: flex-start;
  //align-items: stretch;
  height: 100%;
}

.career-pause-details {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex: 1 0 auto;
  overflow: auto;

  padding: 0 0 0 1em;
  background-color: var(--bng-ter-blue-gray-900);
  max-width: 60em;
  border-radius: var(--bng-corners-1);
}
</style>
