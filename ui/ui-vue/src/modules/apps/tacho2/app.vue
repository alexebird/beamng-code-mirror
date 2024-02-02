<template>
    <div class="tacho-container">
        <tacho ref="tachoRef"></tacho>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useLibStore } from "@/services"
import tacho from './tacho.vue'

const { $game } = useLibStore()

const tachoRef = ref(null)
const visible = ref(false)
const initialized = ref(false)

onMounted(() => {
    console.log('tacho 2 mounted')
    tachoRef.value.wireThroughUnitSystem((val, func) => UiUnits[func](val))
    $game.streams.add(['electrics', 'engineInfo'])
    $game.events.on('onStreamsUpdate', onStreamsUpdate)
    $game.events.on('VehicleChange', onVehicleChange)
    $game.events.on('VehicleFocusChanged', onVehicleFocusChanged)
})

onUnmounted(() => {
    console.log('tacho2 unmounted')
    $game.streams.remove(['electrics', 'engineInfo'])
    $game.events.off('onStreamsUpdate', onStreamsUpdate)
    $game.events.off('VehicleChange', onVehicleChange)
    $game.events.off('VehicleFocusChanged', onVehicleFocusChanged)
})

function onStreamsUpdate(streams) {
    if (tachoRef.value === null)
        return
        
    // console.log('Tacho Streams update', streams)
    if (tachoRef.value.update(streams)) {
        if (!visible.value) {
            visible.value = true
        }
    } else {
        if (visible) {
            visible.value = false
        }
    }
}

function onVehicleChange() {
    if (tachoRef.value === null)
        return

    tachoRef.value.vehicleChanged()
}

function onVehicleFocusChanged(data) {
    if (tachoRef.value === null)
        return
        
    // console.log('Tacho VehicleFocusChanged', data)
    if (data.mode === true) {
        tachoRef.value.vehicleChanged()
    }
}
</script>

<style scoped lang="scss">
.tacho-container {
    width: 100%;
    height: 100%;
}
</style>