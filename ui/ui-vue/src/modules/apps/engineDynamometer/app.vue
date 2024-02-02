<template>
    <div ref="app" class="engine-dynamometer">
        <div class="legends">
            <small class="torque-flywheel">{{ $t('ui.apps.engine_dynamometer.torqueFlywheel') }}</small>
            <small class="power-flywheel">{{ $t('ui.apps.engine_dynamometer.powerFlywheel') }}</small>
            <small class="power-wheels">{{ $t('ui.apps.engine_dynamometer.powerWheels') }}</small>
            <small class="rpm">{{ $t('ui.apps.engine_dynamometer.rpm') }}</small>
        </div>
        <div class="content">
            <div class="power-label">
                <div class="label">
                    {{ $t('ui.apps.engine_dynamometer.power') }} ({{ powerUnit }})
                </div>
                <div class="ruler" v-for="n, index in tickLabels" :style="{ top: (index * tickSpacing) + 'px' }">
                    {{ (globalMax - index * tickInterval).toFixed(0) }}
                </div>
            </div>
            <div class="canvas-container">
                <canvas ref="canvas" class="canvas"></canvas>
            </div>
            <div class="torque-label">
                <div class="label">
                    {{ $t('ui.apps.engine_dynamometer.torque') }} ({{ torqueUnit }})
                </div>
                <div class="ruler" v-for="n, index in tickLabels" :style="{ top: index * tickSpacing + 'px' }">
                    {{ (globalMax - index * tickInterval).toFixed(0) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const tickLabels = 21
const torqueGraphColor = '#000000'
const powerGraphColor = '#FF0000'
const powerWheelGraphColor = '#FF4400'
const rpmGraphColor = '#0000FF'
</script>

<script setup>
import { ref, onMounted, onUnmounted, computed, onBeforeUnmount } from 'vue';
import { useLibStore } from "@/services"

const { $game } = useLibStore()

const streamsList = ['engineInfo']

const app = ref(null),
    canvas = ref(null)

const globalMax = ref(0),
    torqueUnit = ref(null),
    powerUnit = ref(null),
    tickSpacing = ref(0)

const tickInterval = computed(() => globalMax.value / 10)

const appResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]

    // update canvas height and width to match app container
    canvas.value.width = entry.target.offsetWidth - 130
    canvas.value.height = entry.target.offsetHeight - 20

    tickSpacing.value = canvas.value.height / 10

    console.log('width', entry.target.offsetWidth)
    console.log('height', entry.target.offsetHeight)

    console.log('tickspacing', tickSpacing.value)
    console.log('canvas', canvas.value.width, canvas.value.height)
})

const chart = new SmoothieChart({
    minValue: 0,
    maxValue: 1000,
    millisPerPixel: 20,
    interpolation: 'bezier',
    grid: {
        fillStyle: 'rgba(250,250,250,0.2)',
        strokeStyle: 'grey',
        verticalSections: 20,
        millisPerLine: 1000,
        sharpLines: true
    },
    labels: { disabled: true }
}),
    torqueGraph = new TimeSeries(),
    powerGraph = new TimeSeries(),
    powerWheelGraph = new TimeSeries(),
    rpmGraph = new TimeSeries()

onMounted(() => {
    initChart()

    appResizeObserver.observe(app.value)

    $game.events.on('onStreamsUpdate', onStreamsUpdate)
    $game.streams.add(streamsList)
})

onBeforeUnmount(() => {
    appResizeObserver.unobserve(app.value)
})

onUnmounted(() => {
    $game.events.off('onStreamsUpdate', onStreamsUpdate)
    $game.streams.remove(streamsList)
})

function onStreamsUpdate(streams) {
    if (!streams || !streams.engineInfo)
        return

    const xPoint = new Date()
    const torque = $game.units.torque(streams.engineInfo[8]).val,
        power = $game.units.power(streams.engineInfo[4] * 0.104719755 * streams.engineInfo[8] / 1000 * 1.34102).val,
        wheelPower = $game.units.power(streams.engineInfo[20] / 1000 * 1.34102).val,
        rpm = streams.engineInfo[4] / 10

    torqueUnit.value = $game.units.torque().unit
    powerUnit.value = $game.units.power().unit

    globalMax.value = Math.ceil(Math.max.apply(null, [globalMax.value, torque, power]) / 100) * 100
    chart.options.maxValue = globalMax.value

    torqueGraph.append(xPoint, torque)
    powerGraph.append(xPoint, power)
    powerWheelGraph.append(xPoint, wheelPower)
    rpmGraph.append(xPoint, rpm)
}

function initChart() {
    chart.addTimeSeries(torqueGraph, { strokeStyle: torqueGraphColor, lineWidth: 1.5 })
    chart.addTimeSeries(powerGraph, { strokeStyle: powerGraphColor, lineWidth: 1.5 })
    chart.addTimeSeries(powerWheelGraph, { strokeStyle: powerWheelGraphColor, lineWidth: 1.5 })
    chart.addTimeSeries(rpmGraph, { strokeStyle: rpmGraphColor, lineWidth: 1.5 })
    chart.streamTo(canvas.value, 40)
}
</script>

<style scoped lang="scss">
.engine-dynamometer {
    position: relative;
    height: 100%;
    width: 100%;
    font-family: Consolas, Monaco, Lucida Console, Liberation Mono;
    background-color: rgba(255, 255, 255, 0.9);

    >.legends {
        position: absolute;
        display: flex;
        flex-direction: column;
        top: 20px;
        left: 70px;
        font-weight: bold;

        >* {
            padding: 2px;
        }

        >.torque-flywheel {
            color: #000000;
        }

        >.power-flywheel {
            color: #FF0000;
        }

        >.power-wheels {
            color: #FF4400;
        }

        >.rpm {
            color: #0000FF;
        }
    }

    >.content {
        position: relative;
        display: flex;
        height: 100%;
        width: 100%;

        >.power-label {
            position: relative;

            >.label {
                position: absolute;
                left: -2.2em;
                bottom: 50%;
                transform: rotate(-90deg);
                white-space: nowrap;
            }

            >.ruler {
                position: absolute;
                left: 2.5em;
            }
        }

        >.canvas-container {
            width: 100%;
            height: 100%;
            padding: 0.625em 3.75em;
        }

        >.torque-label {
            position: relative;

            >.label {
                position: absolute;
                right: -2.2em;
                bottom: 50%;
                transform: rotate(90deg);
                white-space: nowrap;
            }

            >.ruler {
                position: absolute;
                right: 2.5em;
            }
        }
    }
}</style>