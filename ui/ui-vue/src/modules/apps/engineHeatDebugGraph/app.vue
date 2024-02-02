<template>
    <div ref="app" class="engine-hdg">
        <div class="legends">
            <small class="water">{{ $t('ui.apps.engine_heat_debug_graph.water') }}</small>
            <small class="oil">{{ $t('ui.apps.engine_heat_debug_graph.oil') }}</small>
            <small class="block">{{ $t('ui.apps.engine_heat_debug_graph.block') }}</small>
            <small class="exhaust">{{ $t('ui.apps.engine_heat_debug_graph.exhaust') }}</small>
        </div>
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script>
const coolantGraphColor = '#333676',
    oilGraphColor = '#AA8C39',
    blockGraphColor = '#378B2E',
    exhaustGraphColor = '#A7383E'
</script>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useLibStore } from "@/services"

const { $game } = useLibStore()

const streamsList = ['engineThermalData']

const app = ref(null),
    canvas = ref(null)

const isRunning = ref(false)

const appResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]

    // update canvas height and width to match app container
    canvas.value.width = entry.target.offsetWidth
    canvas.value.height = entry.target.offsetHeight
})

const chart = new SmoothieChart({
    minValue: 50,
    maxValue: 150,
    millisPerPixel: 40,
    interpolation: 'bezier',
    grid: {
        fillStyle: 'rgba(250,250,250,0.8)',
        strokeStyle: 'black',
        verticalSections: 0,
        millisPerLine: 0
    },
    labels: { fillStyle: 'black' }
}),
    coolantGraph = new TimeSeries(),
    oilGraph = new TimeSeries(),
    blockGraph = new TimeSeries(),
    exhaustGraph = new TimeSeries()

onMounted(() => {
    initChart()

    appResizeObserver.observe(app.value)

    $game.streams.add(streamsList)
    $game.events.on('onStreamsUpdate', onStreamsUpdate)
})

onBeforeUnmount(() => {
    appResizeObserver.unobserve(app.value)
})

onUnmounted(() => {
    $game.events.off('onStreamsUpdate', onStreamsUpdate)
    $game.streams.remove(streamsList)
})

function onStreamsUpdate(streams) {
    if (streams.engineThermalData) {
        if (!isRunning.value) {
            isRunning.value = true
            chart.start()
        }
        var xPoint = new Date()
        coolantGraph.append(xPoint, streams.engineThermalData.coolantTemperature)
        oilGraph.append(xPoint, streams.engineThermalData.oilTemperature)
        blockGraph.append(xPoint, streams.engineThermalData.engineBlockTemperature)
        exhaustGraph.append(xPoint, streams.engineThermalData.exhaustTemperature)
    } else if (isRunning.value) {
        isRunning.value = false
        chart.stop()
    }
}

function initChart() {
    chart.addTimeSeries(coolantGraph, { strokeStyle: coolantGraphColor, lineWidth: 1 })
    chart.addTimeSeries(oilGraph, { strokeStyle: oilGraphColor, lineWidth: 1 })
    chart.addTimeSeries(blockGraph, { strokeStyle: blockGraphColor, lineWidth: 1 })
    chart.addTimeSeries(exhaustGraph, { strokeStyle: exhaustGraphColor, lineWidth: 1 })
    chart.streamTo(canvas.value, 40)
}
</script>

<style scoped lang="scss">
.engine-hdg {
    position: relative;
    height: 100%;
    width: 100%;
    font-family: Consolas, Monaco, Lucida Console, Liberation Mono;

    >.legends {
        position: absolute;
        display: flex;
        flex-direction: column;
        top: 0;
        left: 5px;

        >* {
            padding: 2px;
        }

        >.water {
            color: #333676;
        }

        >.oil {
            color: #AA8C39;
        }

        >.block {
            color: #378B2E;
        }

        >.exhaust {
            color: #A7383E;
        }
    }
}
</style>