<template>
  <div :class="{
    'saveload': true,
    'with-background': withBackground,
  }">
    <div v-if="configList" class="saveload-static">
      <div class="saveload-row">
        <span>{{ $t('ui.vehicleconfig.filename') }}</span>
        <BngInput v-model="saveName" />
        <!-- <md-button style="margin: auto 0px;" class="md-icon-button md-warn" @click="saveName = ''" ng-disabled="!saveName">
          <md-icon class="material-icons">close</md-icon>
        </md-button> -->
        <BngButton
          :accent="configExists ? 'attention' : 'main'"
          v-bng-disabled="!saveName"
          @click="save(saveName)"
        >{{ configExists ? $t("ui.common.overwrite") : $t("ui.common.save") }}</BngButton>
      </div>
      <div v-if="saveName" class="saveload-tip">
        <p>{{ $t("ui.vehicleconfig.mouseOverUi") }}</p>
      </div>
    </div>

    <div class="saveload-list">
      <div
        v-for="config in configList"
        class="saveload-list-item"
        @click="saveName = config.name"
        tabindex="1"
      >
        <BngIcon v-if="config.official" glyph="&#xBEA01;"
          v-bng-tooltip:top="$t('ui.vehicleconfig.sourceOfficial')" />
        <!-- person normal: &#xBEAC4; filled: &#xBEAC3; -->
        <BngIcon v-else-if="config.player" glyph="&#xBEAC4;"
          v-bng-tooltip:top="$t('ui.vehicleconfig.sourceUser')" />
        <BngIcon v-else glyph="&#xBEAD7;"
          v-bng-tooltip:top="$t('ui.vehicleconfig.sourceMod')" />

        <div class="saveload-list-item-label">{{ config.name }}</div>

        <!-- FIXME: update icons -->
        <BngButton
          accent="outlined"
          Xicon="folder_open"
          @click="load(config.name)"
          v-bng-tooltip:top="$t('ui.vehicleconfig.loadTooltip')"
        >
          <BngIcon glyph="&#xBEA1A;" />
          {{ $t("ui.vehicleconfig.load") }}
        </BngButton>

        <BngButton
          v-if="config.player"
          class="saveload-list-item-delete"
          accent="outlined"
          Xicon="delete_forever"
          @click="remove(config.name)"
          v-bng-tooltip:top="$t('ui.vehicleconfig.deleteTooltip')"
        >
          <BngIcon glyph="&#xBEB29;" color="#f00" />
        </BngButton>
      </div>
    </div>

    <div class="saveload-static saveload-row" v-if="!buttonTarget">
      <!-- <Teleport :disabled="!buttonTarget" :to="buttonTarget"> -->
        <BngSwitch :checked="saveThumbnail" @click="saveThumbnail = !saveThumbnail">
          {{ $t("ui.vehicleconfig.saveThumbnail") }}
        </BngSwitch>
        <BngButton accent="main" @click="openConfigFolderInExplorer()">
          {{ $t("ui.vehicleconfig.openConfigFolder") }}
        </BngButton>
      <!-- </Teleport> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onUnmounted } from "vue"
import { lua } from "@/bridge"
import { openConfirmation } from "@/services/popup"
import { vBngDisabled, vBngTooltip } from "@/common/directives"
import { BngButton, BngIcon, BngInput, BngSwitch } from "@/common/components/base"

const $game = inject("$game")

defineProps({
  withBackground: Boolean,
  buttonTarget: Object,
})

const saveThumbnail = true

const configList = ref([])

const saveName = ref("")
const configExists = computed(() => !!configList.value.find(itm => itm.name === saveName.value))

async function openConfigFolderInExplorer() {
  await lua.extensions.core_vehicle_partmgmt.openConfigFolderInExplorer()
}

async function save(configName) {
  if (configExists.value) {
    const res = await openConfirmation(
      "Are you sure?",
      "ui.garage.save.overwrite",
      [
        { label: "Overwrite", value: true },
        { label: "Cancel", value: false },
      ]
    )
    if (!res)
      return
  }
  await lua.extensions.core_vehicle_partmgmt.saveLocal(configName + ".pc")
  saveThumbnail && $game.api.engineLua(`extensions.load('util_createThumbnails'); util_createThumbnails.startWork("${configName}")`)
}

async function load(configName) {
  // loadedConfig = configName
  await lua.extensions.core_vehicle_partmgmt.loadLocal(configName + ".pc")
}

async function remove(configName) {
  const res = await openConfirmation(
    "Are you sure?",
    "This will permanently remove the configuration. You will not be able to recover it.",
    [
      { label: "Delete permanently", value: true },
      { label: "Cancel", value: false },
    ]
  )

  if (res) {
    // loadedConfig = ""
    await lua.extensions.core_vehicle_partmgmt.removeLocal(configName)
    await getConfigList()
  }
}

async function getConfigList() {
  const configs = await lua.extensions.core_vehicle_partmgmt.getConfigList()
  configList.value = Array.isArray(configs) ? configs : []
}

$game.events.on("VehicleChange", getConfigList)
$game.events.on("VehicleFocusChanged", getConfigList)
$game.events.on("VehicleconfigSaved", getConfigList)
onUnmounted(() => {
  $game.events.off("VehicleChange", getConfigList)
  $game.events.off("VehicleFocusChanged", getConfigList)
  $game.events.off("VehicleconfigSaved", getConfigList)
})
getConfigList()

</script>

<style lang="scss" scoped>
.saveload {
  display: flex;
  width: 100%;
  height: 100%;
  flex-flow: column;
  > * {
    flex: 1 1 auto;
    width: 100%;
  }
  > .saveload-static {
    flex: 0 0 auto;
  }

  &.with-background {
    background-color: rgba(0, 0, 0, 0.6);
  }
}

.saveload-row {
  display: flex;
  flex-flow: row;
  flex-wrap: nowrap;
}

.saveload-tip {
  margin: 0 1em;
  text-align: center;
}

.saveload-list {
  display: flex;
  flex-flow: column;
  overflow: hidden auto;
  .saveload-list-item {
    flex: 0 0 2.8em;
    height: 2.8em;
    padding-left: 0.5em;
    display: flex;
    flex-flow: row nowrap;
    justify-content: stretch;
    align-items: center;
    cursor: pointer;
    > * {
      flex: 0 0 auto;
    }
    .saveload-list-item-label {
      flex: 1 1 auto;
      max-height: 100%;
      padding-left: 0.5em;
      overflow: hidden;
    }
    &:hover, &:focus, &:focus-within {
      background-color: rgba(#777, 0.6);
    }
    .saveload-list-item-delete {
      min-width: unset;
      width: 3em;
    }
  }
}
</style>
