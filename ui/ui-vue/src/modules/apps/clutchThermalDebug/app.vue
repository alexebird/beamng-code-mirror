<template>
    <div class="bng-app thermal-clutch-debug" v-if="data">
        <div v-for="(set, index) in data" :key="index" class="set">
            <div class="set-name">{{ set.name }}</div>
            <div class="set-value" :class="{ 'thermal-warning': set.warn, 'thermal-error': set.error }">
                {{ set.str }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useLibStore } from "@/services"

const { $game } = useLibStore()
const streamsList = ['clutchThermalData']

const data = ref([])

onMounted(() => {
    $game.streams.add(streamsList)
})

onUnmounted(() => {
    $game.streams.remove(streamsList)
})

$game.events.on('onStreamsUpdate', (streams) => {
    if (streams.clutchThermalData) {
        data.value = parseData(streams.clutchThermalData)
    } else {
        data.value = null
    }
})

function parseData(data) {
    return [
        {
            str: $game.units.buildString('temperature', data.clutchTemperature, 0),
            name: 'Clutch temperature',
            warn: data.clutchTemperature > data.maxSafeTemp && data.clutchTemperature <= data.efficiencyScaleEnd,
            error: data.clutchTemperature > data.efficiencyScaleEnd
        },
        {
            str: $game.units.buildString('temperature', data.maxSafeTemp, 0),
            name: 'Max safe temperature',
        },
        {
            str: $game.units.buildString('temperature', data.efficiencyScaleEnd, 0),
            name: 'Efficiency scale end',
        },
        {
            str: data.thermalEfficiency.toFixed(3),
            name: 'Clutch efficiency',
            warn: data.thermalEfficiency < 1 && data.thermalEfficiency >= 0.5,
            error: data.thermalEfficiency < 0.5
        },
        {
            str: $game.units.buildString('energy', data.energyToClutch, 0),
            name: 'Q to clutch',
        },
        {
            str: $game.units.buildString('energy', data.energyClutchToBellHousing, 0),
            name: 'Q clutch to bell housing',
        }
    ]
}
</script>

<style scoped lang="scss">
.thermal-clutch-debug {
    overflow: auto;
    padding: 1em;

    > .set {
        display: flex;

        > .set-name {
            width: 67%;
        }

        > .set-value {
            width: 33%;

            &.thermal-warning {
                background-color: #aaaa55;
                color: #444411;
            }

            &.thermal-error {
                background-color: #ff5555;
                color: #440000;
            }
        }
    }
}
</style>