<template>
  <div
    :class="{
      saveload: true,
      'with-background': withBackground,
    }"
    v-bng-blur="withBackground">
    <div v-if="configList" class="saveload-static">
      <div class="saveload-row saveload-filename">
        <BngInput v-model.trim="saveName" :leading-icon="icons.saveAs1" :floating-label="$t('ui.vehicleconfig.filename')" />
        <BngButton :accent="configExists ? 'attention' : 'main'" v-bng-disabled="saveDisabled" @click="save(saveName)">{{
          configExists ? $t("ui.common.overwrite") : $t("ui.common.save")
        }}</BngButton>
      </div>
    </div>

    <div class="saveload-list">
      <div v-for="config in configFiltered" class="saveload-list-item" @click="saveName = config.name" tabindex="1">
        <BngIcon v-if="config.official" :type="icons.beamNG" v-bng-tooltip:top="$t('ui.vehicleconfig.sourceOfficial')" />
        <!-- person normal: icons.person filled: icons.personFilled -->
        <BngIcon v-else-if="config.player" :type="icons.person" v-bng-tooltip:top="$t('ui.vehicleconfig.sourceUser')" />
        <BngIcon v-else :type="icons.puzzleModule" v-bng-tooltip:top="$t('ui.vehicleconfig.sourceMod')" />

        <div class="saveload-list-item-label">{{ config.name }}</div>

        <BngButton accent="outlined" @click.stop="load(config.name)" v-bng-tooltip:top="$t('ui.vehicleconfig.loadTooltip')">
          <BngIcon :type="icons.BNGFolder" />
          {{ $t("ui.vehicleconfig.load") }}
        </BngButton>

        <BngButton
          v-if="config.player"
          class="saveload-list-item-delete"
          accent="outlined"
          @click.stop="remove(config.name)"
          v-bng-tooltip:top="'Remove configuration'">
          <BngIcon :type="icons.trashBin2" color="#f00" />
        </BngButton>
      </div>
    </div>

    <div class="saveload-static saveload-row saveload-controls" v-if="!buttonTarget">
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
import { ref, computed, onUnmounted } from "vue"
import { lua, useBridge } from "@/bridge"
import { $translate } from "@/services/translation"
import { openConfirmation } from "@/services/popup"
import { vBngBlur, vBngDisabled, vBngTooltip } from "@/common/directives"
import { BngButton, BngIcon, BngInput, BngSwitch, icons } from "@/common/components/base"

const { api, events } = useBridge()

defineProps({
  withBackground: Boolean,
  buttonTarget: Object,
})

const saveThumbnail = ref(true)

const configList = ref([])
const configFiltered = computed(() => saveName.value ? configList.value.filter(itm => itm.name.toLowerCase().indexOf(saveName.value.toLowerCase()) > -1) : configList.value)

const saveDisabled = computed(() => !saveName.value || /^\.|[<>:"/\\|?*]/.test(saveName.value))
const saveName = ref("")
const configExists = computed(() => !!configList.value.some(itm => itm.name.toLowerCase() === saveName.value.toLowerCase()))

async function openConfigFolderInExplorer() {
  await lua.extensions.core_vehicle_partmgmt.openConfigFolderInExplorer()
}

async function save(configName) {
  if (configExists.value) {
    const res = await openConfirmation("Are you sure?", $translate.instant("ui.garage.save.overwrite"), [
      { label: "Overwrite", value: true },
      { label: "Cancel", value: false },
    ])
    if (!res) return
  }
  await lua.extensions.core_vehicle_partmgmt.saveLocal(configName + ".pc")
  saveThumbnail.value && api.engineLua(`extensions.load('util_createThumbnails'); util_createThumbnails.startWork("${configName}")`)
}

async function load(configName) {
  // loadedConfig = configName
  await lua.extensions.core_vehicle_partmgmt.loadLocal(configName + ".pc")
}

async function remove(configName) {
  const res = await openConfirmation("Are you sure?", "This will permanently remove the configuration. You will not be able to recover it.", [
    { label: "Delete permanently", value: true },
    { label: "Cancel", value: false },
  ])

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

events.on("VehicleChange", getConfigList)
events.on("VehicleFocusChanged", getConfigList)
events.on("VehicleconfigSaved", getConfigList)
onUnmounted(() => {
  events.off("VehicleChange", getConfigList)
  events.off("VehicleFocusChanged", getConfigList)
  events.off("VehicleconfigSaved", getConfigList)
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
    padding: 0 0.5em;
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
  flex-flow: row nowrap;
  align-items: center;
  > * {
    flex: 0 0 auto;
  }
  > .bng-input-wrapper {
    flex: 1 1 auto;
  }
}

.saveload-filename {
  border-bottom: 1px solid var(--bng-orange);
}
.saveload-controls {
  justify-content: space-between;
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
    &:hover,
    &:focus,
    &:focus-within {
      background-color: rgba(#777, 0.6);
    }
    .saveload-list-item-delete {
      min-width: unset;
      width: 3em;
    }
  }
}
</style>
