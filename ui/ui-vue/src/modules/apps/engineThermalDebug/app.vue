<template>
    <div class="bng-app thermal-clutch-debug" >
        <div v-for="(set, index) in data" :key="index" class="set">
            <div class="set-name">{{ $t(set.name) }}</div>
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

const streamsList = ['engineThermalData']

const data = ref(null)

onMounted(() => {
    $game.streams.add(streamsList)
})

onUnmounted(() => {
    $game.streams.remove(streamsList)
})

$game.events.on('onStreamsUpdate', (streams) => 
    data.value = streams.engineThermalData ? parseData(streams.engineThermalData) : null)

function parseData(data) {
    return [
        {
            str: $game.units.buildString('temperature', data.coolantTemperature, 0),
            name: 'ui.apps.engine_thermal_debug.coolant',
            warn: data.coolantTemperature > data.thermostatTemperature && data.coolantTemperature < 120 && data.thermostatStatus == 1,
            error: data.coolantTemperature > 120
        },
        {
            str: $game.units.buildString('temperature', data.oilTemperature, 0),
            name: 'ui.apps.engine_thermal_debug.oil',
            warn: data.oilTemperature > 140,
            error: data.oilTemperature > 150
        },
        {
            str: $game.units.buildString('temperature', data.engineBlockTemperature, 0),
            name: 'ui.apps.engine_thermal_debug.block',
        },
        {
            str: $game.units.buildString('temperature', data.cylinderWallTemperature, 0),
            name: 'ui.apps.engine_thermal_debug.cylinderlWall',
        },
        {
            str: $game.units.buildString('temperature', data.exhaustTemperature, 0),
            name: 'ui.apps.engine_thermal_debug.exhaustManifold',
        },
        {
            str: data.thermostatStatus.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.coolantThermostat',
            warn: data.thermostatStatus > 0.9
        },
        {
            str: data.airRegulatorStatus.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.airRegulator',
            warn: data.airRegulatorStatus > 0.9
        },
        {
            str: $game.units.buildString('speed', data.radiatorAirSpeed, 0),
            name: 'ui.apps.engine_thermal_debug.radiatorAirSpeed',
        },
        {
            str: data.radiatorAirSpeedEfficiency.toFixed(4),
            name: 'ui.apps.engine_thermal_debug.radiatorAirSpeedEfficiency',
        },
        {
            str: data.fanActive,
            name: 'ui.apps.engine_thermal_debug.radiatorFanActive'
        },
        {
            str: data.coolantMass.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.coolantMass',
        },
        {
            str: data.coolantLeakRateOverpressure.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.coolantLeakRateOverpressure',
            warn: data.coolantLeakRateOverpressure > 0,
        },
        {
            str: data.coolantLeakRateHeadGasket.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.coolantLeakRateHeadGasket',
            warn: data.coolantLeakRateHeadGasket > 0,
        },
        {
            str: data.coolantLeakRateRadiator.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.coolantLeakRateRadiator',
            warn: data.coolantLeakRateRadiator > 0,
        },
        {
            str: data.coolantLeakRateOverall.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.coolantLeakRateOverall',
            warn: data.coolantLeakRateOverall > 0,
        },
        {
            str: data.coolantEfficiency.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.coolantEfficiency',
            warn: data.coolantEfficiency < 1,
            error: data.coolantEfficiency === 0
        },
        {
            str: data.oilThermostatStatus.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilThermostat',
            warn: data.oilThermostatStatus > 0.9
        },
        {
            str: data.oilMass.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilMass',
            warn: data.oilMass < data.miniumSafeOilMass || data.oilMass > data.maximumSafeOilMass,
        },
        {
            str: data.miniumSafeOilMass.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.miniumSafeOilMass',
        },
        {
            str: data.maximumSafeOilMass.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.maximumSafeOilMass',
        },
        {
            str: data.oilLeakRateOilpan.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilLeakRateOilpan',
            warn: data.oilLeakRateOilpan > 0,
        },
        {
            str: data.oilLeakRateRadiator.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilLeakRateRadiator',
            warn: data.oilLeakRateRadiator > 0,
        },
        {
            str: data.oilLeakRateGravity.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilLeakRateGravity',
            warn: data.oilLeakRateGravity > 0,
        },
        {
            str: data.oilLeakRatePistonRingDamage.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilLeakRatePistonRingDamage',
            warn: data.oilLeakRatePistonRingDamage > 0,
        },
        {
            str: data.oilLeakRateOverall.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilLeakRateOverall',
            warn: data.oilLeakRateOverall > 0,
        },
        {
            str: data.oilStarvingSevernessXY.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilStarvingSevernessXY',
            warn: data.oilStarvingSevernessXY > 0,
        },
        {
            str: data.oilStarvingSevernessZ.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilStarvingSevernessZ',
            warn: data.oilStarvingSevernessZ > 0,
        },
        {
            str: data.maximumSafeG.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.maximumSafeG'
        },
        {
            str: data.oilLubricationCoef.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.oilLubricationCoef',
            warn: data.oilLubricationCoef < 1,
        },
        {
            str: data.missingOilDamage.toFixed(3),
            name: 'ui.apps.engine_thermal_debug.missingOilDamage',
            warn: data.missingOilDamage > 0,
        },
        {
            str: data.engineEfficiency.toFixed(2),
            name: 'ui.apps.engine_thermal_debug.engineEfficiency',
        },
        {
            str: $game.units.buildString('energy', data.energyToCylinderWall, 0),
            name: 'ui.apps.engine_thermal_debug.qtocylinderwall',
        },
        {
            str: $game.units.buildString('energy', data.energyCylinderWallToCoolant, 0),
            name: 'ui.apps.engine_thermal_debug.qcylinderwalltocoolant',
        },
        {
            str: $game.units.buildString('energy', data.energyCoolantToAir, 0),
            name: 'ui.apps.engine_thermal_debug.qcoolanttoair',
        },
        {
            str: $game.units.buildString('energy', data.energyCoolantToBlock, 0),
            name: 'ui.apps.engine_thermal_debug.qcoolanttoblock',
        },
        {
            str: $game.units.buildString('energy', data.energyCylinderWallToBlock, 0),
            name: 'ui.apps.engine_thermal_debug.qcylinderwalltoblock',
        },
        {
            str: $game.units.buildString('energy', data.energyBlockToAir, 0),
            name: 'ui.apps.engine_thermal_debug.qblocktoair',
        },
        {
            str: $game.units.buildString('energy', data.energyToOil, 0),
            name: 'ui.apps.engine_thermal_debug.qtooil',
        },
        {
            str: $game.units.buildString('energy', data.energyCylinderWallToOil, 0),
            name: 'ui.apps.engine_thermal_debug.qcylinderwalltooil',
        },
        {
            str: $game.units.buildString('energy', data.energyOilToAir, 0),
            name: 'ui.apps.engine_thermal_debug.qoilradiatortoair',
        },
        {
            str: $game.units.buildString('energy', data.energyOilSumpToAir, 0),
            name: 'ui.apps.engine_thermal_debug.qoilsumptoair',
        },
        {
            str: $game.units.buildString('energy', data.energyToExhaust, 0),
            name: 'ui.apps.engine_thermal_debug.qtoexhaust',
        },
        {
            str: $game.units.buildString('energy', data.energyExhaustToAir, 0),
            name: 'ui.apps.engine_thermal_debug.qexhausttoair',
        },
        {
            str: data.engineBlockOverheatDamage.toFixed(),
            name: 'ui.apps.engine_thermal_debug.blockDamage',
            warn: data.engineBlockOverheatDamage > 0
        },
        {
            str: data.oilOverheatDamage.toFixed(),
            name: 'ui.apps.engine_thermal_debug.oilDamage',
            warn: data.oilOverheatDamage > 0
        },
        {
            str: data.cylinderWallOverheatDamage.toFixed(),
            name: 'ui.apps.engine_thermal_debug.cylinderwallDamage',
            warn: data.cylinderWallOverheatDamage > 0
        },
        {
            str: data.headGasketBlown,
            name: 'ui.apps.engine_thermal_debug.headGasketBlown',
            error: data.headGasketBlown
        },
        {
            str: data.pistonRingsDamaged,
            name: 'ui.apps.engine_thermal_debug.pistonRingsDamaged',
            error: data.pistonRingsDamaged
        },
        {
            str: data.connectingRodBearingsDamaged,
            name: 'ui.apps.engine_thermal_debug.connectingRodBearingsDamaged',
            error: data.connectingRodBearingsDamaged
        }
    ]
}
</script>

<style scoped lang="scss">
.thermal-clutch-debug {
    overflow-y: auto;
    padding: 1em;

    >.set {
        display: flex;

        >.set-name {
            width: 67%;
        }

        >.set-value {
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