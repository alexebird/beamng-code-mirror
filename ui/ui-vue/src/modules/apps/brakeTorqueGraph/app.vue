<template>
    <div class="btg-app" ref="app">
        <div class="legends-container">
            <small v-for="graph in graphList" class="legend" :style="{ 'color': graph.color }">
                {{ $t(graph.title) }}
            </small>
        </div>
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue'
import { useLibStore } from '@/services'
import Logger from '@/services/logger'
import { rainbow } from '@/utils/color'

const { $game } = useLibStore()

const app = ref(null)
const canvas = ref(null)
const graphList = ref([])

const TAG = '[beamng.apps:brakeTorqueGraph]'
const streams = ['wheelInfo', 'electrics']
const colors = []
const chart = new SmoothieChart({
    minValue: 0.0,
    millisPerPixel: 20,
    interpolation: 'linear',
    grid: {
        fillStyle: 'rgba(250, 250, 250, 0.8)',
        strokeStyle: 'rgba(0,0,0,0.3)',
        verticalSections: 6,
        millisPerLine: 1000,
        sharpLines: true
    },
    labels: { fillStyle: 'black' }
})
const speedGraph = new TimeSeries()
const appResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]

    // update canvas height and width to match app container
    canvas.value.width = entry.target.offsetWidth
    canvas.value.height = entry.target.offsetHeight
})

let graphs = {}
let globalMax = 2000

onMounted(() => {
    initColors()
    initChart()

    appResizeObserver.observe(app.value)

    graphList.value = [{ title: 'ui.apps.brake_torque_graph.speed', color: colors[0] }]

    $game.streams.add(streams)
    $game.events.on('onStreamsUpdate', onStreamsUpdate)
    $game.events.on('VehicleReset', onVehicleReset)
    $game.events.on('VehicleChange', onVehicleChange)
})

onBeforeUnmount(() => {
    appResizeObserver.unobserve(app.value)
})

onUnmounted(() => {
    $game.events.off('onStreamsUpdate', onStreamsUpdate)
    $game.events.off('VehicleReset', onVehicleReset)
    $game.events.off('VehicleChange', onVehicleChange)
    $game.streams.remove(streams)
})

function onStreamsUpdate(streams) {
    if (!streams.electrics || !streams.wheelInfo)
        return

    globalMax = Math.max(globalMax, streams.electrics.airspeed * 15)

    const xPoint = new Date()
    speedGraph.append(xPoint, streams.electrics.airspeed * 15)

    for (let w in streams.wheelInfo) {
        let wheelName = streams.wheelInfo[w][0]

        if (!graphs.hasOwnProperty(wheelName)) {
            graphs[wheelName] = new TimeSeries()
            Logger.debug(`${TAG} adding graph for ${wheelName}`)
            let wheelColor = colors[graphList.value.length % colors.length]
            graphList.value.push({ title: wheelName, color: wheelColor })
            chart.addTimeSeries(graphs[wheelName], { strokeStyle: wheelColor, lineWidth: 2 })
            return
        }

        graphs[wheelName].append(xPoint, streams.wheelInfo[w][8])
        globalMax = Math.max(globalMax, streams.wheelInfo[w][8])
    }

    chart.options.maxValue = globalMax
}

function onVehicleReset(data) {
    graphs = {}
    graphList.value = [{ title: 'Speed', color: colors[0] }]
}

function onVehicleChange(data) {
    graphs = {}
    graphList.value = [{ title: 'Speed', color: colors[0] }]
}

function initChart() {
    chart.addTimeSeries(speedGraph, { strokeStyle: colors[0], lineWidth: 2 })
    chart.streamTo(canvas.value, 40)
}

function initColors() {
    for (let i = 15; i > 0; i--) {
        let c = rainbow(15, i)
        colors.push(`rgb(${Math.round(255 * c[0])}, ${Math.round(255 * c[1])}, ${Math.round(255 * c[2])})`)
    }
}
</script>

<style scoped lang="scss">
.btg-app {
    position: relative;
    height: 100%;
    width: 100%;
    font-family: Consolas, Monaco, Lucida Console, Liberation Mono;

    >.legends-container {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0.625em;
        left: 0.3em;
        font-weight: bold;

        >.legend {
            padding: 0.125em;
        }
    }
}
</style>