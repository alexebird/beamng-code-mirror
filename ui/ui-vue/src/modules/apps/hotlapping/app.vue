<template>
    <div style="max-height:100%; width:100%; background:rgba(0, 0, 0, 0.43);color:white;">
        <div layout="row" style="width:100%" layout-align="center center" layout-wrap v-show="controlsEnabled">
            <bngButton @click="startHotlapping()" v-show="!started && !closed">
                {{ $t('ui.apps.hotlapping.StartHotlapping') }}
            </bngButton>
            <bngButton @click="addCheckPoint()" v-show="started && !closed">
                {{ $t('ui.apps.hotlapping.AddCheckpoint') }}
            </bngButton>
            <bngButton @click="stopTimer()" v-show="started && closed">
                {{ $t('ui.apps.hotlapping.StopTimer') }}
            </bngButton>
            <bngButton @click="clearAllCP()" v-show="!started && closed">
                {{ $t('ui.apps.hotlapping.EndHotlapping') }}
            </bngButton>
            <bngButton @click="toggleSettings()" v-show="!showSettings">
                {{ $t('ui.apps.hotlapping.Advanced') }}...
            </bngButton>
            <bngButton @click="toggleSettings()" v-show="showSettings">
                {{ $t('ui.apps.hotlapping.HideAdvanced') }}
            </bngButton>
            <bngButton @click="skip()" :disabled="!(closed && started)">
                {{ $t('ui.apps.hotlapping.SkipLap') }}
            </bngButton>
        </div>
        <div layout="row" style="width:100%" layout-align="center center" layout-wrap
            v-show="showSettings || controlsEnabled">
            <bngButton @click="clearAllCP()">{{ $t('ui.apps.hotlapping.EndHotlapping') }}</bngButton>
            <bngButton @click="toggleDetail()">{{ $t('ui.apps.hotlapping.ToggleDetail') }}</bngButton>

            <!-- size changer -->
            <div layout="row" style="width:100%" layout-align="center center" layout-wrap v-show="controlsEnabled">
                <bngButton @click="sizeDown()">-</bngButton>
                <bngButton @click="resetSize()">{{ $t('ui.apps.hotlapping.ResetSize') }}</bngButton>
                <bngButton @click="sizeUp()">+</bngButton>
            </div>
            <!-- other settings -->
            <div layout="row" style="width:100%" layout-align="center center" layout-wrap v-show="controlsEnabled">
                <bngButton @click="toggleAi()" v-show="activeAi">{{ $t('ui.apps.hotlapping.StopAi') }}</bngButton>
                <bngButton @click="toggleAi()" v-show="!activeAi">{{ $t('ui.apps.hotlapping.StartAi') }}</bngButton>
                <bngButton @click="toggleVisibility()" v-show="showMarkers">{{ $t('ui.apps.hotlapping.HideMarkers') }}
                </bngButton>
                <bngButton @click="toggleVisibility()" v-show="!showMarkers">{{ $t('ui.apps.hotlapping.ShowMarkers') }}
                </bngButton>
            </div>
            <!-- file selector -->
            <div layout="row" style="width:100%" layout-align="center center" layout-wrap v-show="controlsEnabled">
                <!-- menu to load the files.-->
                <md-menu v-show="!renaming" style="padding: 0; padding-left: 8px;">
                    <bngButton class="md-icon-button bng-no-focus" @click="refreshTracklist(); $mdOpenMenu()">
                        <!-- <md-icon class="material-icons"
                            style="cursor: pointer; color: rgba(255, 255, 255, 0.901961);">folder</md-icon> -->
                    </bngButton>
                    <md-menu-content>
                        <md-list-item v-for="file in tracklist" @click="load(file)">
                            {{ file }}
                        </md-list-item>
                    </md-menu-content>
                </md-menu>

                <!-- button to cancel renaming.-->
                <bngButton v-show="renaming" @click="cancelRename()">
                    <md-icon class="material-icons" style="cursor: pointer; color: #FD9393;">close</md-icon>
                    <div v-bng-tooltip>{{ $t('ui.apps.hotlapping.Cancelrenaming') }}</div>
                </bngButton>

                <!-- actual input field.-->
                <label style="padding-left: 8px; padding-right: 8px" flex>
                    <bngInput style="width:100%" :disabled="!loadedFile && !renaming" v-model="loadedFile"
                        @focus="startRenaming()" @mouseenter="hoverRenaming()"></bngInput>
                    <div v-bng-tooltip>{{ $t('ui.apps.hotlapping.ClicktoRename') }}</div>
                </label>

                <!-- button to accept renaming -->
                <bngButton v-show="renaming" :disabled="!loadedFile"
                    class="md-primary md-icon-button md-primary bng-no-focus" md-no-ink
                    style="margin: 0; width: auto; padding-right: 8px;" @click="acceptRename(loadedFile)">
                    <md-icon class="material-icons" ng-disabled="!loadedFile"
                        style="cursor: pointer; color: #A8DD73;">done</md-icon>
                    <div v-bng-tooltip>{{ $t('ui.apps.hotlapping.Rename') }}</div>
                </bngButton>

                <!-- button to save -->
                <bngButton v-show="!renaming" ng-disabled="!closed || saved" @click="save()">
                    <md-icon class="material-icons" ng-disabled="!closed || saved"
                        style="cursor: pointer; color: rgba(255, 255, 255, 0.901961);">save</md-icon>
                    <div v-bng-tooltip>{{ $t('ui.apps.hotlapping.Savetrack') }}</div>
                </bngButton>

            </div>
        </div>

        <div layout="row" style="width:100%" layout-align="center center" layout-wrap v-show="!controlsEnabled">
            <table style="width:100%;">
                <thead>
                    <tr>
                        <th>
                            <i @click="toggleDetail()" class="material-icons"
                                style="cursor: pointer; cursor: hand;">query_builder</i>
                        </th>
                        <th width="50%"><b>{{ scenarioInfo.lap }}</b></th>
                        <th width="50%"><b>{{ scenarioInfo.wp }}</b></th>
                    </tr>
                </thead>
            </table>
        </div>

        <div style="width:100%; min-height: 200px; max-height:300px; overflow-y:auto">
            <table style="width:100%; height:100%;border-bottom:1px solid white;">
                <thead>
                    <tr>
                        <th width="20%"><b>{{ $t(times.best.lap) }}</b></th>
                        <th width="40%"><b>{{ times.best.duration }}</b></th>
                        <th width="40%" style="color:{{times.best.diffColor}}"><b>{{ times.best.diff }}</b></th>
                    </tr>
                </thead>
            </table>
            <!-- simple table -->
            <table style="width:100%; height:100%" v-show="!detailed">
                <thead>
                    <tr>
                        <th width="20%"><b>{{ $t('ui.apps.hotlapping.Lap') }}</b></th>
                        <th width="40%"><b>{{ $t('ui.apps.hotlapping.Duration') }}</b></th>
                        <th width="40%"><b>{{ $t('ui.apps.hotlapping.Vsprevbest') }}</b></th>
                    </tr>
                </thead>
                <tbody style="text-align:center">
                    <tr v-for="row in times.snapshot" v-show="$index == 0">
                        <td style="{{row.durationStyle}}"> {{ row.lap }} </td>
                        <td style="{{row.durationStyle}}"> {{ row.duration }} </td>
                        <td style="color:{{row.diffColor}}"> {{ row.diff }} </td>
                    </tr>
                    <tr v-for="row in times.normal" v-show="$index > 0">
                        <td>{{ row.lap }}</td>
                        <td style="{{row.durationStyle}}">{{ row.duration }}</td>
                        <td style="color:{{::row.diffColor}}">{{ row.diff }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- detailed table -->
            <table style="width:100%; height:100%" v-show="detailed">
                <thead>
                    <tr>
                        <th><b>{{ $t('ui.apps.hotlapping.Lap') }}</b></th>
                        <th><b>{{ $t('ui.apps.hotlapping.Duration') }}</b></th>
                        <th><b>{{ $t('ui.apps.hotlapping.Vsprevbest') }}</b></th>
                        <th><b>{{ $t('ui.apps.hotlapping.Total') }}</b></th>
                    </tr>
                </thead>
                <tbody style="text-align:center">
                    <tr v-for="row in times.detail">
                        <td>{{ row.lap }} </td>
                        <td v-if="$first" style="{{row.durationStyle}}">{{ times.snapshot[0]['duration'] }}</td>
                        <td v-if="!$first" style="{{row.durationStyle}}">{{ row.duration }}</td>
                        <td style="color:{{row.diffColor}}">{{ row.diff }} </td>
                        <td>{{ row.total }} </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useLibStore } from '@/services/libStore'
import { BngButton, BngInput, BngIcon } from '@/common/components/base'
import { vBngTooltip } from '@/common/directives'

const { $game } = useLibStore()

const controlsState = reactive({
    controlsEnabled: false,
    started: false,
    saved: false,
    showSettings: false,
    showMarkers: false,
    activeAi: false,
    closed: false,
    manualStopped: false,
    noSaveAllowed: false,
    noTracks: true,
    renaming: false,
    detailed: true
})

const originalFilename = ref('')
const loadedFile = ref('')

const timer = ref(0)
const times = ref([])
const normalTimes = ref([])
const snapshotTimes = ref([])
const detailTimes = ref([])
const bestTimes = reactive({
    lap: 'ui.apps.hotlapping.bestLap',
    duration: '',
    diff: '',
    diffColor: ''
})

const scenarioInfo = reactive({ lap: '', wp: '' })

const tracklist = ref([])

const currentLapTimerPromise = ref(null)
const lastHotlappingTimerTime = ref(-1)

const trackSelectPlaceholder = computed(() => {
    if (tracklist.value === null)
        return "..."
    return tracklist.value.isEmpty() ? "No tracks found." : "Select track..."
})

const sizeDown = () => $game.api.engineLua('core_hotlapping.changeSize(-1,true)')
const sizeUp = () => $game.api.engineLua('core_hotlapping.changeSize(1,true)')
const resetSize = () => $game.api.engineLua('core_hotlapping.changeSize(0,true)')
const clearAllCP = () => {
    $game.api.engineLua('core_hotlapping.stopHotlapping()')

    hotlapState.current = null
    hotlapState.started = false
    hotlapState.closed = false
    hotlapState.saved = false
    hotlapState.renaming = false
    hotlapState.activeAi = false
    hotlapState.loadedFile = null

    if (currentLapTimerPromise.value !== null) {
        $interval.cancel(currentLapTimerPromise.value)
        currentLapTimerPromise.value = null
    }
}
const addCheckPoint = () => {
    $game.api.engineLua('core_hotlapping.addCheckPoint()')
    $game.api.engineLua('setCEFFocus(false)')
}

const stopTimer = () => {
    $game.api.engineLua('core_hotlapping.stopTimer()')

    hotlapState.started = false
    hotlapState.renaming = false
    hotlapState.activeAi = false

    if (currentLapTimerPromise.value !== null) {
        $interval.cancel(currentLapTimerPromise.value)
        currentLapTimerPromise.value = null
    }
}

const resetTimes = function () {
    hotlapState.timesNormal = []
    hotlapState.timesDetail = []
    hotlapState.timesNormalSnapshot = []
    hotlapState.stop = false
    hotlapState.current = null
    hotlapState.timer = 0

    $game.api.engineLua('core_hotlapping.stopTimer()')

    scope.renaming = false
}

onMounted(() => {
    $game.events.on('RaceLapChange', onRaceLapChange)
    $game.events.on('WayPoint', onWayPoint)
    reevaluateControls()
})

onUnmounted(() => {
    $game.events.off('RaceLapChange', onRaceLapChange)
    $game.events.off('WayPoint', onWayPoint)
})

function onRaceLapChange(data) {
    if (data === null) return
    scenarioInfo.lap = "Lap " + data.current + " / " + data.count
}

function onWayPoint(data) {
    if (data === null) return
    scenarioInfo.wp = data
}

/////////////// Problem code begins here /////////////////
// Gets the tracklist.
const refreshTracklist = () => $game.api.engineLua('core_hotlapping.refreshTracklist()', (data) =>
    tracklist.value = !data.hasOwnProperty("length") ? [null] : data)

// to debug, tries to fill the textbox with "stop".
const stop = () => {
    loadedFile.value = "stop"
    if (currentLapTimerPromise.value === null)
        return

    $interval.cancel(scope.currentLapTimerPromise)
    currentLapTimerPromise.value = null
}

// when hovering the textfield, so that you can type
const hoverRenaming = () => {
    if (!controlsState.renaming) return
    $game.api.engineLua('setCEFFocus(true)')
}

//when clicking the textbox
const startRenaming = () => {
    controlsState.renaming = true
    originalFilename.value = loadedFile.value
    $game.api.engineLua('setCEFFocus(true)')
}

const cancelRename = () => {
    controlsState.renaming = false
    $log.debug('Cancelled rename')
    loadedFile.value = originalFilename.value
}

const acceptRename = (newName) => {
    controlsState.renaming = false

    if (newName === originalFilename.value)
        return

    $game.api.engineLua('core_hotlapping.rename("' + originalFilename.value + '","' + newName + '")')
    loadedFile.value = newName
}

const load = (selectedFile) => {
    $game.api.engineLua('core_hotlapping.load("' + selectedFile + '")')
    loadedFile.value = selectedFile
    controlsState.saved = true
}
/////////////// Problem code ends here /////////////////

$game.events.on('HotlappingSuccessfullyLoaded', (data) => {
    controlsState.started = true
    controlsState.closed = true
    controlsState.saved = true
    controlsState.noSaveAllowed = true

    bestTimes.lap = 'ui.apps.hotlapping.bestLap'
    bestTimes.duration = ''
    bestTimes.diff = ''
    bestTimes.diffColor = ''

    loadedFile.value = data
})

$game.events.on('HotlappingSuccessfullySaved', (data) => {
    controlsState.saved = true
    loadedFile.value = data
    startRenaming()
})

$game.events.on('HotlappingTimerPause', (data) => {
    if (currentLapTimerPromise.value === null)
        return

    $interval.cancel(currentLapTimerPromise.value)
    currentLapTimerPromise.value = null
})

$game.events.on('HotlappingTimerUnpause', (data) => {
    if (currentLapTimerPromise.value !== null)
        return

    currentLapTimerPromise.value = $interval(function () {
        currentLapTimerPromise.value = $interval(currentLapTimer, 50, 0)
    }, 4950, 1)
})

$game.events.on('HotlappingTimer', (data) => {
    $log.debug(data)
    const normal = data['normal'].reverse()
    const detail = data['detail'].reverse()

    times.snapshot = normal

    lastHotlappingTimerTime.value = (new Date).getTime()

    if (currentLapTimerPromise.value != null) {
        $interval.cancel(currentLapTimerPromise.value)
    }

    if (data['running']) {
        if (data['justStarted'] || data['justLapped']) {
            currentLapTimerPromise.value = $interval(currentLapTimer.value, 50, 0)
        }
        else {
            currentLapTimerPromise.value = $interval(function () {
                currentLapTimerPromise.value = $interval(currentLapTimer.value, 50, 0)
            }, 4950, 1)
        }
    }

    normalTimes.value = normal
    detailTimes.value = detail
    timer.value -= data['delta']
    controlsState.closed = data['closed']
    controlsState.started = true
    if (data['justLapped']) {
        snapshotTimes.value = normal
        //scope.stop = false
        //scope.timer = 0
        let hasBest = false
        for (t in normal) {
            if (normal[t].best) {
                bestTimes.lap = normal[t].lap
                bestTimes.duration = normal[t].duration
                bestTimes.diff = normal[t].diff
                bestTimes.diffColor = normal[t].diff
                hasBest = true
                break
            }
        }
        if (!hasBest) {
            bestTimes.lap = 'ui.apps.hotlapping.bestLap'
            bestTimes.duration = ''
            bestTimes.diff = ''
            bestTimes.diffColor = ''
        }
    }
})

$game.events.on('HotlappingClosedTrigger', (data) => controlsState.closed = true)

$game.events.on('HotlappingResetApp', (data) => {
    $log.debug('ResetApp')
    resetVariables()
})

$game.events.on('ChangeState', (data) => {
    if (data === 'scenario-start') {
        // vue rewrite - what are these and where are these used?
        // scope.timesNormal = []
        // scope.timesDetail = []
        // scope.timesNormalSnapshot = []

        controlsState.stop = false
        controlsState.current = null
        timer.value = 0
        $game.api.engineLua('if core_hotlapping then core_hotlapping.stopTimer() end')
    }
    reevaluateControls()
})

$game.events.on('setQuickRaceMode', (data) => {
    $log.debug('SetQuickRace')
    controlsState.controlsEnabled = false
})

$game.events.on('hotlappingReevaluateControlsEnabled', (data) => reevaluateControls())

$game.events.on('ChangeState', (data) => {
    controlsState.controlsEnabled = data === 'menu'

    if (data === 'loading')
        $game.api.engineLua('scenario_quickRaceLoader.uiHotlappingAppDestroyed()')
})

$game.events.on('newBestRound', (data) => {
    if (data.place === 1)
        resetBestTimes()

    loadedFile.value = data
})

const save = () => $game.api.engineLua('core_hotlapping.save()')

const toggleDetail = () => controlsState.detailed = !controlsState.detailed

const skip = () => {
    $game.api.engineLua("core_hotlapping.skipLap()")
    if (currentLapTimerPromise.value != null) {
        $interval.cancel(currentLapTimerPromise.value)
        currentLapTimerPromise.value = null
    }
}

function currentLapTimer() {
    if (typeof times.value.snapshot[0] === 'undefined')
        times.value.snapshot[0] = { 'durationMillis': 0 }; //FIXME this line just tries to avoid log flooding with errors, needs a proper fix

    const timer = scope.times.snapshot[0]['durationMillis'] + ((new Date).getTime() - lastHotlappingTimerTime.value)
    const sec_num = parseInt(timer, 10); // don't forget the second param

    const minutes = Math.floor(sec_num / 60000)
    const seconds = Math.floor(sec_num / 1000) - (minutes * 60)
    const millis = sec_num % 1000

    if (minutes < 10) { minutes = "0" + minutes }
    if (seconds < 10) { seconds = "0" + seconds }
    if (millis < 10) { millis = "0" + millis }
    if (millis < 100) { millis = "0" + millis }

    times.value.snapshot[0]['duration'] = minutes + ":" + seconds + "." + millis
}

function reevaluateControls() {
    $game.api.engineLua('core_gamestate.state and core_gamestate.state.state', (ret) => {
        //console.log("Reevaluating on my own.. State = " + ret)
        controlsState.controlsEnabled = ret === 'freeroam'
    })
}

function resetVariables() {
    controlsState.started = false
    controlsState.saved = false
    controlsState.showSettings = false
    controlsState.detailed = false
    controlsState.closed = false
    controlsState.stop = false
    controlsState.manualStopped = false
    controlsState.noSaveAllowed = false
    controlsState.noTracks = true

    times.value = []
    timer.value = 0
    normalTimes.value = []
    snapshotTimes.value = []
    detailTimes = []
    tracklist.value = []

    resetBestTimes()

    $game.api.engineLua('if core_hotlapping then core_hotlapping.refreshTracklist() end')

    cancelRename()

    if (currentLapTimerPromise.value != null) {
        $interval.cancel(currentLapTimerPromise.value)
        currentLapTimerPromise.value = null
    }
}

function resetBestTimes() {
    bestTimes.lap = 'ui.apps.hotlapping.bestLap'
    bestTimes.duration = ''
    bestTimes.diff = ''
    bestTimes.diffColor = ''
}
</script>

<style scoped lang="scss"></style>