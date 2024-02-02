<template>
    <div class="fi-debug">
        <div class="measure" v-for="m in filteredMeasures" :key="m.key">
            <div class="name">{{ m.name }}</div>
            <div class="value">{{ m.val }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLibStore } from "@/services"

const { $game } = useLibStore()

const streamsList = ['forcedInductionInfo']
const defaultMeasures = [
    { name: 'RPM', key: 'rpm' },
    { name: 'Boost', key: 'boost', type: 'pressure' },
    { name: 'Power Coef', key: 'coef' },
    { name: 'Pressure Pulses', key: 'pulses' },
    { name: 'SC Loss', key: 'loss' },
    { name: 'Exhaust Power', key: 'exhaustPower' },
    { name: 'Friction', key: 'friction' },
    { name: 'Backpressure', key: 'backpressure' },
    { name: 'Wastegate Factor', key: 'wastegateFactor' },
    { name: 'Turbo Temp', key: 'turboTemp', type: 'temperature' },
]

const measures = ref([])
const filteredMeasures = computed(() => measures.value.filter(m => m.val !== undefined))

onMounted(() => {
    $game.streams.add(streamsList)
    $game.events.on('onStreamsUpdate', onStreamsUpdate)
    $game.events.on('VehicleReset', init)
    $game.events.on('VehicleFocusChanged', init)
    init()
})

onUnmounted(() => {
    $game.streams.remove(streamsList)
    $game.events.off('onStreamsUpdate', onStreamsUpdate)
    $game.events.off('VehicleReset', init)
    $game.events.off('VehicleFocusChanged', init)
})

function onStreamsUpdate(streams) {
    if (!streams.forcedInductionInfo)
        return

    measures.value.forEach((x) => {
        const val = streams.forcedInductionInfo[x.key]

        if (val === undefined)
            return

        x.val = x.type !== undefined
            ? $game.units.buildString(x.type, val, 2) : val.toFixed(2)
    })
}

function init() {
    measures.value = defaultMeasures
}

</script>

<style scoped lang="scss">
.fi-debug {
    height: 100%;
    overflow: auto;
    background-color: rgba(255, 255, 255, 0.9);

    >.measure {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.25em 0;

        >.name {
            text-align: right;
            width: 50%;
            padding: 0 0.5em;
        }

        >.value {
            width: 50%;
            padding: 0 0.5em;
            font-family: monospace;
            font-size: 1.2em;
        }
    }
}
</style>