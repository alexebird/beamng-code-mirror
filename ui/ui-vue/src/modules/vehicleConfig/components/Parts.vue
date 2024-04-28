<template>
  <div
    :class="{
      'parts-browser': true,
      'with-background': withBackground,
    }"
    v-bng-blur="withBackground">
    <div class="parts-browser-search">
      <BngInput
        v-model="search.text"
        :leading-icon="icons.search"
        floating-label="Search"
        @click="search.startSearch()"
        @change="search.onChange()"
        @valueChanged="search.onChange()"
        @keydown="search.onKeyDown($event)" />
      <BngButton :icon="icons.abandon" accent="outlined" v-bng-disabled="!search.active" @click="search.stopSearch()" />
    </div>

    <div class="parts-browser-content" @mouseleave="deselectPart(opts.stickyPartSelection)">
      <!-- Normal mode -->
      <PartsBranch
        v-if="!search.active"
        :parts="partsList"
        :display-names="opts.showNames"
        :show-auxiliary="opts.showAux"
        @select="selectParts"
        @highlight="highlightParts"
        @change="partConfigChanged" />

      <!-- Search mode -->
      <div v-else>
        <!-- <div v-if="search.result.length > 0"
          layout="row" layout-align="space-between center"
          style="border-bottom:1px solid #ddd">
          <div flex>Name</div>
          <div v-if="search.query.slot" flex>Slot</div>
          <div flex style="min-width:50%;padding-right:40px;">Active part</div>
        </div> -->

        <PartsBranch
          :parts="search.result"
          :flat-entry="true"
          :display-names="opts.showNames"
          :show-auxiliary="opts.showAux"
          :highlighter="[search.query.name, search.query.description, search.query.slot]"
          @select="selectParts"
          @highlight="highlightParts"
          @change="partConfigChanged" />

        <div v-show="search.message !== ''">
          <!-- TODO: <md-icon class="material-icons md-default-theme" style="color:#D60;">warning</md-icon> -->
          <span style="padding-left: 0.4em">{{ search.message }}</span>
        </div>

        <div v-show="search.result.length === 0" class="search-help">
          <hr />
          Examples:
          <ul>
            <li>
              <span class="search-example">left</span><br />
              {{ $t("ui.vehicleconfig.searchHelp.example1") }}
            </li>
            <li>
              <span class="search-example">slot:_fr</span><br />
              {{ $t("ui.vehicleconfig.searchHelp.example2") }}
            </li>
            <li>
              <span class="search-example">name:frame</span><br />
              {{ $t("ui.vehicleconfig.searchHelp.example3") }}
            </li>
            <li>
              <span class="search-example">slot:_fr name:signal</span><br />
              {{ $t("ui.vehicleconfig.searchHelp.example4") }}
            </li>
            <li>
              <span class="search-example">partname:pickup_fr</span><br />
              {{ $t("ui.vehicleconfig.searchHelp.example5") }}
            </li>
            <li>
              <span class="search-example">author:bob</span><br />
              {{ $t("ui.vehicleconfig.searchHelp.example6") }}
            </li>
            <li>
              <span class="search-example">mod:super</span><br />
              {{ $t("ui.vehicleconfig.searchHelp.example7") }}
            </li>
          </ul>
          <hr />
          {{ $t("ui.vehicleconfig.searchHelp.notes") }}:
          <ul>
            <li>{{ $t("ui.vehicleconfig.searchHelp.notes1") }}</li>
            <li>{{ $t("ui.vehicleconfig.searchHelp.notes2") }}</li>
            <li>{{ $t("ui.vehicleconfig.searchHelp.notes3") }}</li>
          </ul>
        </div>

        <div v-if="search.history.length > 0 && search.historyBrowsing">
          <hr />
          {{ $t("ui.vehicleconfig.searchHelp.history") }}:
          <br />
          <br />
          <span
            v-for="(historyEntry, idx) in search.history"
            :class="{
              'history-entry': true,
              'history-indicator': idx === search.historyPosition,
            }"
            >{{ historyEntry }}</span
          >
          <br />
          {{ $t("ui.vehicleconfig.searchHelp.historyClear") }}
        </div>
      </div>
    </div>

    <div :class="{
      'parts-options': true,
      'parts-options-shown': showOptions,
    }">
      <div class="flex-column">
        <BngSwitch v-model="opts.showAux">
          <!-- <md-icon class="material-icons">report</md-icon> -->
          {{ $t("ui.showAuxiliary") }}
        </BngSwitch>
        <BngSwitch v-model="opts.showNames" @valueChanged="recalcTree()">
          {{ $t("ui.vehicleconfig.displayNames") }}
        </BngSwitch>
        <!--
        <BngSwitch v-model="opts.simple" @valueChanged="recalcTree()">
          {{ $t("ui.vehicleconfig.simpleTree") }}
        </BngSwitch>
        -->
        <BngSwitch v-model="opts.selectSubParts">
          {{ $t("ui.vehicleconfig.subparts") }}
        </BngSwitch>
      </div>
      <div class="license-plate" v-bng-disabled="skipLicGen">
        <BngButton :icon="icons.sync" accent="outlined" @click="applyRandomLicensePlate()" v-bng-tooltip:top="$t('ui.vehicleconfig.licensePlateGen')" />
        <BngInput
          v-model="licensePlate"
          :external-label="$t('ui.vehicleconfig.licensePlate')"
          @change="applyLicensePlateDebounced()"
          @keyup.enter="applyLicensePlate()" />
        <BngButton
          :icon="icons.checkmark"
          v-if="!opts.applyPartChangesAutomatically"
          @click="applyLicensePlate()"
          v-bng-tooltip:top="$t('ui.vehicleconfig.applyLicensePlate')" />
      </div>
    </div>

    <div class="parts-controls">
      <div>
        <BngSwitch v-model="showOptions">
          {{ $t("ui.garage.optionsSwitch") }}
        </BngSwitch>
        <BngSwitch :disabled="partsChanged" v-model="opts.applyPartChangesAutomatically" @valueChanged="applySettingChanged">
          {{ $t("ui.garage.liveUpdates") }}
        </BngSwitch>
      </div>
      <div class="buttons">
        <BngButton :icon="icons.undo" @click="reset()" :disabled="partsList.length === 0" v-bng-tooltip="$t('ui.common.reset')" />
        <BngButton :icon="icons.checkmark" @click="write()" :disabled="opts.applyPartChangesAutomatically || !partsChanged">
          {{ $t("ui.common.apply") }}
        </BngButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted, nextTick } from "vue"
import { useBridge } from "@/bridge"
import { BngSwitch, BngButton, BngInput, icons } from "@/common/components/base"
import { vBngBlur, vBngTooltip, vBngDisabled } from "@/common/directives"
import { debounce } from "@/utils/rateLimit"
import PartsBranch from "./PartsBranch.vue"

import PartsTree from "../parts/tree"
import PartsSearch from "../parts/search"

const { lua, events } = useBridge()

const props = defineProps({
  withBackground: Boolean,
})

const showOptions = ref(false)

const partsList = ref([])
/// the following was originally calculated by calcTreeSync but was left unused
// const varsList = ref([])
// const varsCategories = ref([])

const currentConfig = ref(null)

const opts = reactive({
  stickyPartSelection: false,
  selectSubParts: true,
  applyPartChangesAutomatically: true,
  simple: false,
  showNames: false,
  showAux: !beamng.shipping,
})

const search = reactive(new PartsSearch(currentConfig, partsList, opts))

const partsChanged = ref(false)

// Multi Part Highlighting

// function used to flatten objects
function iterateParts(obj, func) {
  func(obj)
  if (obj.parts) {
    obj.parts.forEach(parts => {
      iterateParts(parts, func)
    })
  }
}

// Highlights the selected part and its subparts
function highlightParts(selectedPart) {
  // Highlight part and subparts
  iterateParts(selectedPart, obj => (obj.highlight = selectedPart.highlight))

  // Get all parts highlights and return them
  let flattenedParts = {}
  for (const key in partsList.value) {
    const part = partsList.value[key]
    iterateParts(part, obj => obj.val !== "" && (flattenedParts[obj.val] = obj.highlight))
  }
  //console.log("highlightparts: ", flattenedParts)
  lua.extensions.core_vehicle_partmgmt.highlightParts(flattenedParts)
}

const vehChange = () => lua.extensions.core_vehicle_partmgmt.sendDataToUI()

events.on("VehicleFocusChanged", vehChange)
events.on("VehicleJbeamIoChanged", vehChange)

// LICENSE PLATE STUFF
const skipLicGen = ref(false)
const licensePlate = ref("")

const settingsChanged = async () => (skipLicGen.value = await lua.settings.getValue("SkipGenerateLicencePlate"))
settingsChanged()

const getLicensePlate = () => bngApi.engineLua("core_vehicles.getVehicleLicenseText(getPlayerVehicle(0))", str => (licensePlate.value = str))
getLicensePlate()

const applyLicensePlateDebounced = debounce(() => {
  if (opts.applyPartChangesAutomatically) applyLicensePlate()
}, 500)

function applyLicensePlate() {
  lua.core_vehicles.setPlateText(licensePlate.value)
}

function applyRandomLicensePlate() {
  bngApi.engineLua(`core_vehicles.setPlateText(core_vehicles.regenerateVehicleLicenseText(getPlayerVehicle(0)),nil,nil,nil)`)
  getLicensePlate()
}
// --------------

// Selects part (highlight part temporarily, like on hovering part) and its subparts
function selectParts(selectedPart) {
  // Little hacky way to prevent the UI from automatically selecting a slot and thus highlighting a part, after the user selects a part
  // relatedTarget and sourceCapabilities will be null when the UI automatically selects the slot as the FocusEvent wasn't generated by user input
  // In case this stops working, try using "event.currentTarget"
  // if (event instanceof FocusEvent && event.relatedTarget === null && event.sourceCapabilities === null) return

  let flattenedParts = {}

  if (opts.selectSubParts) {
    iterateParts(selectedPart, obj => (flattenedParts[obj.val] = true))
  } else {
    flattenedParts[selectedPart.val] = true
  }

  // console.log('selectParts: ', selectedPart, flattenedParts)
  lua.extensions.core_vehicle_partmgmt.selectParts(flattenedParts)
}

function deselectPart(sticky) {
  if (partsList.value.length > 0) {
    // console.debug(`Reset part selection`)
    lua.extensions.core_vehicle_partmgmt.showHighlightedParts()
  }
}

function partConfigChanged(part) {
  if ("_ref" in part) part._ref.val = part.val // patch for reactive rebuild issue on search
  if (!opts.applyPartChangesAutomatically) {
    // only mark as changed
    part.changed = true
    partsChanged.value = true
    return
  }
  write()
}

function write() {
  let newConfig = PartsTree.generateConfig(partsList.value)
  // console.debug(`Setting configuration`, newConfig)
  lua.extensions.core_vehicle_partmgmt.setPartsConfig(newConfig)
  //console.time('waitingForLua')
}

function reset() {
  lua.extensions.core_vehicle_partmgmt.resetPartsToLoadedConfig()
}

function calcTree(config) {
  currentConfig.value = config
  partsChanged.value = false
  nextTick(() => {
    partsList.value = PartsTree.calcTreeSync(config, opts)
    search.filterTree()
  })
}

function recalcTree() {
  return calcTree(currentConfig.value)
}

events.on("VehicleConfigChange", calcTree)

// Initial data load
lua.extensions.core_vehicle_partmgmt.sendDataToUI()
search.loadSearchHistory()

const applySettingChanged = val => localStorage.setItem("applyPartChangesAutomatically", JSON.stringify(val))
opts.applyPartChangesAutomatically = localStorage.getItem("applyPartChangesAutomatically")
if (opts.applyPartChangesAutomatically) opts.applyPartChangesAutomatically = JSON.parse(opts.applyPartChangesAutomatically) || false

onUnmounted(() => {
  events.off("VehicleFocusChanged", vehChange)
  events.off("VehicleJbeamIoChanged", vehChange)
  events.off("VehicleConfigChange", calcTree)
  deselectPart(false)
})
</script>

<style lang="scss" scoped>
.parts-browser {
  /* root */
  display: flex;
  flex-flow: column;
  justify-content: stretch;
  width: 100%;
  height: 100%;
  > * {
    flex: 0 0 auto;
    padding: 0 1em;
  }
  &.with-background {
    background-color: rgba(0, 0, 0, 0.6);
  }
  &,
  * {
    position: relative;
    font-family: "Overpass", var(--fnt-defs);
  }
}

.parts-browser-search {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-bottom: 1px solid var(--bng-orange);
  > * {
    flex: 0 0 auto;
  }
  > .bng-input-wrapper {
    flex: 1 1 auto;
  }
  > .bng-button {
    min-width: unset !important;
    min-height: unset !important;
  }
}

.parts-browser-content {
  flex: 1 1 auto;
  overflow-y: scroll;
  > * {
    margin: 0 -0.65rem;
  }
}

.parts-options {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  border-top: solid 2px var(--bng-orange);
  padding-top: 0rem;
  padding-bottom: 0.5rem;
  > * {
    flex: 1 1 auto;
    width: auto;
  }
  > .flex-column {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
  }

  .license-plate {
    flex: 0 0 auto;
    position: relative;
    display: flex;
    align-items: flex-end;
    .bng-input-wrapper {
      max-width: 7em;
    }
    .bng-button {
      min-width: unset !important;
      > * {
        font-size: 1.5em;
      }
    }
  }

  &.parts-options-shown {
    padding-top: 0.5rem;
  }
  &:not(.parts-options-shown) > * {
    display: none;
  }
}

.parts-controls {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  padding-top: 0.25rem;
  padding-bottom: 0.5rem;
  > * {
    flex: 1 0 auto;
    // display: flex;
    // align-items: baseline;
    > * {
      margin-top: 0.1rem;
      margin-bottom: 0.1rem;
      height: calc(100% - 0.5rem);
    }
  }
  > .buttons {
    text-align: right;
  }
}

/// prev version leftovers below

.parts-path {
  display: flex;
  flex-flow: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  width: 100%;
  overflow: hidden;
  > div {
    flex: 0 1 auto;
    max-width: 10em;
    padding: 0.1em 0.5em;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-style: italic;
    white-space: nowrap;
    text-overflow: ellipsis;
    // cursor: pointer;
    &:hover {
      color: var(--bng-orange);
    }
  }
}

.parts-list {
  /* list container */
  flex: 0 1 auto;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: rgba(0, 0, 0, 0.5);
  &,
  > div {
    /* list items container */
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    width: 100%;
  }
}
.parts-item {
  /* item */
  flex: 1 0 calc(25% - 0.5em);
  width: calc(25% - 0.5em);
  max-width: calc(25% - 0.5em);
  height: 6em;
  margin: 0.25em;
  background-color: rgba(0, 0, 0, 0.5);
}
.parts-item-slot {
  /* slot item */
  font-weight: bold;
  font-style: italic;
}
.parts-item-part {
  /* part variant item */
}
.parts-item-icon {
  min-width: 3em;
  min-height: 3em;
  background-color: #fff;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: 50% 50%;
  margin-bottom: 0.25em;
}
.parts-item-label {
  display: block;
  width: 100%;
  font-size: 0.8em;
  text-align: center;
  color: #fff;
}
.parts-item-installed {
  .parts-item-icon {
    /* installed part */
    background-color: var(--bng-orange);
  }
  .parts-item-label {
    /* installed part */
    color: var(--bng-orange);
  }
}

.parts-info {
  position: absolute;
  bottom: 0;
  right: -1px;
  width: 1px;
  height: 1px;
  > div {
    /* TODO: */
    width: 30em;
    height: 20em;
  }
}

.history-entry {
  display: block;
  &::before {
    content: " ";
    display: inline-block;
    width: 1.5em;
    text-align: center;
  }
  &.history-indicator::before {
    content: ">";
  }
}

.search-help {
  li {
    margin-bottom: 0.5em;
  }
  .search-example {
    font-family: monospace;
    font-size: 1.1em;
    font-weight: bold;
    color: rgb(255, 102, 0);
  }
}

:deep(.bng-labeled-switch) {
  margin: 0.1rem;
  // padding: 0.15rem 0.9rem 0.15rem 0.4rem;
  &.switch-on {
    background-color: rgba(var(--bng-cool-gray-600-rgb), 0.8);
  }
}
</style>
