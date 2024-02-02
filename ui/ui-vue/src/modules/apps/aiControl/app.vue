<template>
    <div class="bng-app aicontrol" style="width: 100%; height: 100%">
        <table>
            <tr>
                <td class="category pad-bottom">{{$t("ui.apps.aicontrol.AiMode")}}</td>
                <td class="pad-bottom" layout="row" layout-align="start center">
                    <div flex>
                        <BngDropdown :items="aiModeOptions" v-model="ai.mode.value" 
                            @valueChanged="ai.changeMode()">
                        </BngDropdown>
                    </div>  
                    <div flex></div>
                </td>
            </tr>

            <tr>
                <td class="category">{{$t("ui.apps.aicontrol.Parameters")}}</td>
                <td layout="row" layout-align="start center">
                    <span flex layout="row" layout-align="start center">
                        <span class="parameter">{{$t("ui.apps.aicontrol.InLane")}}</span>
                        <BngDropdown :items="driveInLaneFlagOptions" v-model="ai.driveInLaneFlag.value"
                            @valueChanged="ai.changeLaneDriving()"></BngDropdown>
                    </span>
                    <span flex layout="row" layout-align="start center">
                        <span class="parameter">{{$t("ui.apps.aicontrol.Awareness")}}</span>
                        <BngDropdown :items="extAvoidCarsOptions" v-model="ai.extAvoidCars.value"
                            @valueChanged="ai.changeTrafficAwareness()"></BngDropdown>
                    </span>
                </td>
            </tr>

            <tr>
                <td class="category"></td>
                <td layout="row" layout-align="start center">
                    <span flex layout="row" layout-align="start center">
                        <span class="parameter">{{$t("ui.apps.aicontrol.Risk")}}</span>
                        <input class="input-light" type="number" min="0.2" max="2" step="0.01" value="1"
                            ng-model="ai.aggression.value" ng-change="ai.changeAggression()">
                    </span>
                    <span flex layout="row" layout-align="start center">
                        <span class="parameter">{{$t("ui.apps.aicontrol.Drivability")}}</span>
                        <input class="input-light" type="number" min="0" max="0.9" step="0.1" value="0"
                            ng-model="ai.drivability.value" ng-change="ai.changeCutOffDrivability()">
                    </span>
                </td>
            </tr>

            <tr>
                <td class="category">{{$t("ui.apps.aicontrol.RouteSpeed")}}</td>
                <td layout="row" layout-align="start center">
                    <span flex layout="row" layout-align="start center">
                        <span class="parameter">{{$t("ui.apps.aicontrol.RouteSpeedValue")}}</span>
                        <input class="input-light" type="number" min="0" max="1000" ng-model="ai.routeSpeed.value"
                            ng-change="ai.changeSpeed()">
                        <span style="padding-left: 6px">{{ ai.distanceUnits.label }}</span>
                    </span>
                    <span flex layout="row" layout-align="start center">
                        <span class="parameter">{{$t("ui.apps.aicontrol.RouteSpeedMode")}}</span>
                        <div flex>
                            <BngDropdown :items="speedModeOptions" v-model="ai.speedMode.value" 
                                @valueChanged="ai.changeSpeedMode()">
                            </BngDropdown>
                        </div>
                    </span>
                </td>
            </tr>

            <tr>
                <td class="category">{{$t("ui.apps.aicontrol.Target")}}</td>
                <td layout="row" layout-align="start center">
                    <span
                        ng-class="{ 'disabled-option': ['flee', 'manual'].indexOf(ai.mode.value) < 0,
                          'action-needed': (ai.mode.value == 'manual') && ai.mapNodes.options.indexOf(ai.mapNodes.value) < 0 }"
                        style="padding: 2px 12px 0px 0px">{{$t("ui.apps.aicontrol.TargetMap")}}</span>
                    <div flex>
                        <BngDropdown :items="ai.speedMode.options" v-model="ai.speedMode.value" 
                            :disabled="isMapNodesEnabled" @valueChanged="ai.changeSpeedMode()">
                        </BngDropdown>
                    </div>
                    <span ng-class="{ 'disabled-option': ['flee', 'chase', 'follow'].indexOf(ai.mode.value) < 0  || ai.targetObjects.options.length < 2,
                          'action-needed':   (ai.targetObjects.options.length >= 2) && (ai.targetObjects.value < 0) }"
                        style="padding: 2px 8px 0px 15px">{{$t("ui.apps.aicontrol.TargetVehicle")}}</span>
                    <div flex>
                        <BngDropdown :items="ai.targetObjects.options" v-model="ai.targetObjects.value" 
                            :disabled="isTargetObjectsEnabled" @valueChanged="ai.changeTargetObject()">
                        </BngDropdown>
                    </div>
                </td>
            </tr>

            <tr>
                <td class="category">{{$t("ui.apps.aicontrol.AiDebug")}}</td>
                <td layout="row" layout-align="start center">
                    <div flex>
                        <BngDropdown :items="vehicleDebugModeOptions" v-model="ai.vehicleDebugMode.value" 
                            @valueChanged="ai.changeVehicleDebugMode()">
                        </BngDropdown>
                    </div>
                    <div flex></div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useLibStore } from "@/services"
import { BngDropdown } from '@/common/components/base'

const { $game } = useLibStore()

const aiOptions = {
    aiMode: [
        { txt: 'Disabled', val: 'disabled' },
        { txt: 'Traffic', val: 'traffic' },
        { txt: 'Random', val: 'random' },
        { txt: 'Span', val: 'span' },
        { txt: 'Manual', val: 'manual' },
        { txt: 'Chase', val: 'chase' },
        { txt: 'Follow', val: 'follow' },
        { txt: 'Flee', val: 'flee' },
        { txt: 'Stopping', val: 'stop' }
    ],

    vehicleDebugMode: [
        { txt: 'Disabled', val: 'off' },
        { txt: 'Target', val: 'target' },
        { txt: 'Speeds', val: 'speeds' },
        { txt: 'Trajectory', val: 'trajectory' },
        { txt: 'Route', val: 'route' }
    ],

    speedMode: [
        { txt: 'Off', val: 'off' },
        { txt: 'Set', val: 'set' },
        { txt: 'Legal', val: 'legal' },
        { txt: 'Limit', val: 'limit' }
    ],

    driveInLaneFlag: [
        { txt: 'Off', val: 'off' },
        { txt: 'On', val: 'on' }
    ],

    extAvoidCars: [
        { txt: 'Auto', val: 'auto' },
        { txt: 'Off', val: 'off' },
        { txt: 'On', val: 'on' }
    ]
}

const units = {
    'metric': { label: 'km/h', mult: 3.6 },
    'imperial': { label: 'mph', mult: 2.23694 }
}

const ai = {
    distanceUnits: {},
    mode: { value: null, options: aiOptions.aiMode },
    aggression: { value: 1 },
    driveInLaneFlag: { value: null, options: aiOptions.driveInLaneFlag },
    extAvoidCars: { value: null, options: aiOptions.extAvoidCars },
    routeSpeed: { value: null },
    speedMode: { value: null, options: aiOptions.speedMode },
    vehicleDebugMode: { value: null, options: aiOptions.vehicleDebugMode },
    mapNodes: { value: null, options: [] },
    targetObjects: { value: null, options: [] },
    drivability: { value: 0 },
    changeMode: function () {
        const cmd = `ai.setState( ${$game.api.serializeToLua({ mode: this.mode.value })} )`
        $game.api.activeObjectLua(cmd)
    },
    changeAggression: function () {
        const cmd = `ai.setAggression(${this.aggression.value})`
        $game.api.activeObjectLua(cmd)
    },
    changeCutOffDrivabilitya: function () {
        const cmd = `ai.setCutOffDrivability(${this.drivability.value})`
        $game.api.activeObjectLua(cmd)
    },
    changeLaneDriving: function () {
        const cmd = `ai.driveInLane("${this.driveInLaneFlag.value}")`
        $game.api.activeObjectLua(cmd)
    },
    changeTrafficAwareness: function () {
        const cmd = `ai.setAvoidCars("${this.extAvoidCars.value}")`
        $game.api.activeObjectLua(cmd)
    },
    changeSpeed: function () {
        const siSpeed = this.routeSpeed.value / this.distanceUnits.mult
        const cmd = `ai.setSpeed(${siSpeed})`
        $game.api.activeObjectLua(cmd)
    },
    changeSpeedMode: function () {
        const cmd = `ai.setSpeedMode("${this.speedMode.value}")`
        $game.api.activeObjectLua(cmd)
    },
    changeVehicleDebugMode: function () {
        const cmd = `ai.setVehicleDebugMode(${$game.api.serializeToLua({ debugMode: this.vehicleDebugMode.value })})`
        $game.api.activeObjectLua(cmd)
    },
    changeMapNode: function () {
        // Although this is can only be called when in "manual" mode, we still have to re-apply
        // the state to the Lua side (is this a bug?)
        //vm.mode.value = 'manual'
        //var aiModeCmd = `ai.setState( ${bngApi.serializeToLua({mode: 'manual'})} )`
        //bngApi.activeObjectLua(aiModeCmd)

        const cmd = `ai.setTarget("${this.mapNodes.value}")`
        $game.api.activeObjectLua(cmd)
    },
    changeTargetObject: function () {
        const cmd = `ai.setTargetObjectID(${this.targetObjects.value})`
        $game.api.activeObjectLua(cmd)
    },
    _updateAiState: function () {
        $game.api.activeObjectLua('ai.getState()', (response) => {
            this.mode.value = response.mode

            if (this.mode.value != 'manual') this.mapNodes.value = null

            this.aggression.value = response.extAggression
            this.driveInLaneFlag.value = response.driveInLaneFlag
            this.extAvoidCars.value = response.extAvoidCars
            this.vehicleDebugMode.value = response.debugMode
            this.targetObjects.value = response.targetObjectID
            this.mapNodes.value = response.manualTargetName
            this.routeSpeed.value = response.routeSpeed * this.distanceUnits.mult
            this.speedMode.value = response.speedMode
            this.drivability.value = response.cutOffDrivability
        })
    },
    updateMapState: function () {
        $game.api.engineLua('map.getState()', (response) => {
            // console.log('map.getState(): ', response) 
            this.targetObjects.options = Object.keys(response.objects)
                .filter(x => !response.objects[x].active)
                .map(x => ({
                    id: response.objects[x].id,
                    txt: `${response.objects[x].name}  (${response.objects[x].licensePlate}, ${x})`
                }))
            //vm.engineDebugMode.value = response.debugMode
        })
    },
    _updateNodes: function () {
        $game.api.engineLua('map.getMap()', (response) => {
            this.mapNodes.options = Object.keys(response.nodes).sort()
        })
    },
    populate: function () {
        this._updateAiState()
        this.updateMapState()
        this._updateNodes()
    }
}

const aiModeOptions = computed(() => ai.mode.options.map(x => ({label: x.txt, value: x.val})))
const driveInLaneFlagOptions = computed(() => ai.driveInLaneFlag.options.map(x => ({label: x.txt, value: x.val})))
const extAvoidCarsOptions = computed(() => ai.extAvoidCars.options.map(x => ({label: x.txt, value: x.val})))
const speedModeOptions = computed(() => ai.speedMode.options.map(x => ({label: x.txt, value: x.val})))
const vehicleDebugModeOptions = computed(() => ai.vehicleDebugMode.options.map(x => ({label: x.txt, value: x.val})))
const isMapNodesEnabled = computed(() => ['flee', 'manual'].indexOf(ai.mode.value) < 0)
const isTargetObjectsEnabled = computed(() => ['flee', 'chase', 'follow'].indexOf(ai.mode.value) < 0 ||
    ai.targetObjects.options.length < 2)

onMounted(() => {
    ai.populate()
    $game.api.engineLua('settings.notifyUI()')
})

onUnmounted(() => {
    $game.events.off('AIStateChange')
    $game.events.off('SettingsChanged')
    $game.events.off('VehicleReset')
    $game.events.off('VehicleFocusChanged')
})

$game.events.on('AIStateChange', (data) => {
    // console.log('AISTATECHANGE EVENT:', data)
    // Same thing as in ai.getState() callback in ctrl._updateAiState() function
    $game.api.engineLua('extensions.hook("trackAISingleVeh", ("' + data.mode + '"))')

    ai.mode.value = data.mode

    if (data.mode.value != 'manual') ai.mapNodes.value = null

    ai.aggression.value = data.extAggression
    ai.driveInLaneFlag.value = data.driveInLaneFlag
    ai.extAvoidCars.value = data.extAvoidCars
    ai.vehicleDebugMode.value = data.debugMode
    ai.targetObjects.value = data.targetObjectID
    ai.mapNodes.value = data.manualTargetName
    ai.routeSpeed.value = Math.round(data.routeSpeed * ai.distanceUnits.mult)
    ai.speedMode.value = data.speedMode
    ai.drivability.value = data.cutOffDrivability
})

$game.events.on('SettingsChanged', (data) => {
    ai.distanceUnits = units[data.values.uiUnitLength]
})

$game.events.on('VehicleReset', (data) => {
    ai.updateMapState()
})

$game.events.on('VehicleFocusChanged', (data) => {
    ai.updateMapState()
})
</script>

<style scoped lang="scss">
.aicontrol table {
    width: 100%;
}

.aicontrol md-select {
    width: 100%;
    margin: 0;
}

.aicontrol input[type=number] {
    width: 60px;
    padding: 2px;
}

.aicontrol .category {
    width: 20%;
}

.aicontrol .parameter {
    padding: 3px 6px 3px 0px;
    white-space: nowrap;
}

.aicontrol .pad-bottom {
    padding-bottom: 12px;
}

.aicontrol .action-needed {
    background-color: #c30000;
}

.aicontrol .disabled-option {
    opacity: 0.8;
    pointer-events: none;
    background-color: inherit;
}</style>