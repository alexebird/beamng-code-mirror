<template>
    <div class="bng-app log-vehicle-stats">
        <div class="update-period">
            <span class="label">Update Period:</span>
            <BngInput type="number" :min="1" :max="360" :step="1" v-model="config.updateTime" :suffix="'seconds'"></BngInput>
        </div>
        <div>
            <BngPillCheckbox v-model="config.moduleGeneral" @valueChanged="(val) => configChanged('moduleGeneral', val)">
                General</BngPillCheckbox>
            <BngPillCheckbox v-model="config.moduleWheels" @valueChanged="(val) => configChanged('moduleWheels', val)">
                Wheels</BngPillCheckbox>
            <BngPillCheckbox v-model="config.moduleEngine" @valueChanged="(val) => configChanged('moduleEngine', val)">
                Engine</BngPillCheckbox>
            <BngPillCheckbox v-model="config.moduleInputs" @valueChanged="(val) => configChanged('moduleInputs', val)">
                Inputs</BngPillCheckbox>
            <BngPillCheckbox v-model="config.modulePowertrain"
                @valueChanged="(val) => configChanged('modulePowertrain', val)">Powertrain</BngPillCheckbox>
        </div>
        <div class="settings-row">
            <label>Apply Settings:</label>
            <BngButton class="settings-btn" @click="applySettings()">Apply</BngButton>
        </div>
        <div class="settings-row" v-bng-tooltip="'Subdirectory of the BeamNG.drive/BeamNG.research directory.'">
            <label>Set Custom Output Directory:</label>
            <BngInput v-model="config.outputDir"></BngInput>
            <BngButton class="settings-btn" @click="useAsOutputDir()">Use</BngButton>
        </div>
        <div class="settings-row"
            v-bng-tooltip="'Settings files are written to the BeamNG.drive/BeamNG.research directory.'">
            <label>Settings Output Filename:</label>
            <BngInput v-model="config.outputFileName"></BngInput>
            <BngButton class="settings-btn" @click="saveSettingsToJson()">Write</BngButton>
        </div>
        <div class="settings-row"
            v-bng-tooltip="'Settings files are assumed to be in the BeamNG.drive/BeamNG.research directory.'">
            <label>Settings Input Filename:</label>
            <BngInput v-model="config.inputFileName"></BngInput>
            <BngButton class="settings-btn" @click="importSettingsFromFile()">Load</BngButton>
        </div>
        <div class="log-btns">
            <BngButton class="start-btn" @click="startLogging()">Start Log</BngButton>
            <BngButton class="stop-btn" @click="stopLogging()">Stop Log</BngButton>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useLibStore } from '@/services'
import { BngPillCheckbox, BngButton, BngInput } from '@/common/components/base'
import { vBngTooltip } from '@/common/directives'

const { $game } = useLibStore()

const config = reactive({
    updateTime: 5,
    moduleGeneral: true,
    moduleWheels: true,
    moduleEngine: true,
    moduleInputs: true,
    modulePowertrain: true,
    outputFileName: 'settings.json',
    inputFileName: 'settings.json',
    outputDir: 'VSL'
})

const configChanged = (configName, value) => {
    switch (configName) {
        case 'moduleGeneral':
            config.moduleGeneral = value
            break
        case 'moduleWheels':
            config.moduleWheels = value
            break
        case 'moduleEngine':
            config.moduleEngine = value
            break
        case 'moduleInputs':
            config.moduleInputs = value
            break
        case 'modulePowertrain':
            config.modulePowertrain = value
            break
    }
}

const applySettings = () => {
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.updateTime = ${config.updateTime}`)
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["General"] = ${config.moduleGeneral}`)
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["Wheels"] = ${config.moduleWheels}`)
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["Inputs"] = ${config.moduleInputs}`)
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["Engine"] = ${config.moduleEngine}`)
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["Powertrain"] = ${config.modulePowertrain}`)
}

const useAsOutputDir = () => {
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.settings.outputDir = "${config.outputDir}"`)
}

const getNewOutputFilename = () => {
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.suggestOutputFilename()`, function (data) {
        config.outputFileName = data
    })
}

const saveSettingsToJson = () => {
    if (config.outputFileName === '') return
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.writeSettingsToJSON("${config.outputFileName}")`)
}

const importSettingsFromFile = () => {
    if (scope.inputFileName === '') return

    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.applySettingsFromJSON("${config.inputFileName}")`)
    config.moduleGeneral = eval(`${extensions.vehicleStatsLogger.settings.useModule["General"]}`)
    config.moduleWheels = eval(`${extensions.vehicleStatsLogger.settings.useModule["Wheels"]}`)
    config.moduleInputs = eval(`${extensions.vehicleStatsLogger.settings.useModule["Inputs"]}`)
    config.moduleEngine = eval(`${extensions.vehicleStatsLogger.settings.useModule["Engine"]}`)
    config.modulePowertrain = eval(`${extensions.vehicleStatsLogger.settings.useModule["Powertrain"]}`)
}

const startLogging = () => {
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.startLogging()`)
}

const stopLogging = () => {
    $game.api.activeObjectLua(`extensions.vehicleStatsLogger.stopLogging()`)
}
</script>

<style scoped lang="scss">
.log-vehicle-stats {
    max-height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.43);
    color: white;

    >.update-period {
        display: flex;
        align-items: center;
        padding: 0.25em;

        >.label {
            padding: 3px 6px 3px 6px;
        }
    }

    >.settings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.25em 0;

        label {
            padding: 0 0.5em;
        }

        .settings-btn {
            margin-left: 0.25em;
        }
    }

    .log-btns {
        padding: 0.25em 0;

        .start-btn,
        .stop-btn {
            margin-left: 0.5em;
        }
    }
}
</style>