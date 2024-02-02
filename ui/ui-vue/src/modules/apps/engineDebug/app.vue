<template>
    <div class="bng-app">
        {{ $t('ui.apps.engineinfo.rpm') }}: {{ data.rpm }}<br>
        {{ $t('ui.apps.engineinfo.gear') }}: {{ data.gearText }}<br>
        {{ $t('ui.apps.engineinfo.flywheelTorque') }}: {{ data.engineT }} <br>
        {{ $t('ui.apps.engineinfo.wheelTorque') }}: {{ data.wheelT }}
    </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from 'vue';
import { useLibStore } from "@/services"

const { $game } = useLibStore()

const streamsList = ['engineInfo']

const data = reactive({
    engineT: 0,
    wheelT: 0,
    rpm: 0,
    gearText: ''
})

onMounted(() => $game.streams.add(streamsList))

onUnmounted(() => $game.streams.remove(streamsList))

$game.events.on('onStreamsUpdate', (streams) => {
    if (streams.engineInfo === null)
        return

    data.engineT = $game.units.buildString('torque', streams.engineInfo[8], 0)
    data.wheelT = $game.units.buildString('torque', streams.engineInfo[19], 0)
    data.rpm = streams.engineInfo[4].toFixed()
    data.gearText = getGearText(streams.engineInfo[16], streams.engineInfo[6], streams.engineInfo[7])
})

const getGearText = (gear, fGear, rGear) => {
    if (gear > 0)
        return 'F ' + gear + ' / ' + fGear
    
    if (gear < 0)
        return 'R ' + Math.abs(gear) + ' / ' + rGear

    return 'N'
}
</script>

<style scoped lang="scss"></style>