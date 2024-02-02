<template>
    <div ref="fiContainerRef" class="fi-container">
        <ForcedInduction ref="forcedInductionRef"></ForcedInduction>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLibStore } from "@/services"
import { roundDec } from '@/utils/maths';
import ForcedInduction from './forcedInduction.vue';

const { $game } = useLibStore()

const forcedInductionRef = ref(null)
const fiContainerRef = ref(null)
const enabled = ref(false)

onMounted(() => {
    forcedInductionRef.value.wireThroughRoundDec(roundDec)

    forcedInductionRef.value.wireThroughUnitSystem((val, func) => UiUnits[func](val))
    $game.streams.add(['forcedInductionInfo'])
})

onUnmounted(() => {
    $game.streams.remove(['forcedInductionInfo'])
})

$game.events.on('VechicleChange', () => forcedInductionRef.value.reset())

$game.events.on('VehicleFocusChanged', (data) => {
    if (data.mode == 1 && forcedInductionRef.value !== null) {
        forcedInductionRef.value.reset()
    }
})

$game.events.on('onStreamsUpdate', (streams) => {
    if (forcedInductionRef.value === null)
        return

    var newEnabled = forcedInductionRef.value.isStreamValid(streams)
    if (newEnabled) {
        if (newEnabled && !enabled.value) {
            fiContainerRef.value.style.opacity = 1
        }
        forcedInductionRef.value.update(streams)
    } else {
        if (!newEnabled && enabled) {
            fiContainerRef.value.style.opacity = 0
        }
    }
    enabled.value = newEnabled
})
</script>

<style scoped lang="scss">
.fi-container {
    height: 100%;
    width: 100%;
}
</style>