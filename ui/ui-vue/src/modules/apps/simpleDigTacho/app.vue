<template>
    <div style="width:100%; height:100%;" class="bng-app" layout="column">
        <div style="display:flex; justify-content: center; align-items: baseline;">
            <!-- this ^ has to be display flex instead of the layout attribute from angular since the latter has no baseline option -->
            <span style="font-size:1.3em; font-weight:bold;">
                <span style="color: rgba(255, 255, 255, 0.8)"> {{ leadingZeros }}</span>
                <span>{{ rpm }}</span>
            </span>
            <span style="font-size:0.9em; font-weight:bold; margin-left:2px">RPM</span>
        </div>
        <small style="text-align:center; color: rgba(255, 255, 255, 0.8); font-size: 0.75em">
            {{ $t('ui.apps.digTacho.engine') }} <span>(x{{ numToBig }})</span>
        </small>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLibStore } from "@/services"

const { $game } = useLibStore()

$game.streams.add(['engineInfo'])

const numToBig = ref('1')
const speed = ref(NaN)
const rpm = ref(0)
const leadingZeros = ref(null)

onMounted(() => {
    console.log('simpleDigTacho mounted')
    $game.events.on('onStreamsUpdate', onStreamsUpdate)
})

onUnmounted(() => {
    // $log.debug('<simple-dig-tacho> destroyed')
    console.log('simpleDigTacho unmounted')
    $game.streams.remove(['engineInfo'])
    $game.events.off('onStreamsUpdate', onStreamsUpdate)
})

function onStreamsUpdate(streams) {
    if (!streams.engineInfo)
        return

    rpm.value = Math.round(streams.engineInfo[4])
    if (rpm.value.toString().length > 4) {
        const help = Math.pow(10, rpm.value.toString().length - 4)
        numToBig.value = help.toString()
        rpm.value = Math.round(rpm.value / help)
    } else {
        numToBig.value = '1'
    }
    rpm.value = rpm.value.toString().slice(-4)
    if (!isNaN(rpm.value)) {
        leadingZeros.value = ('0000').slice(rpm.value.length)
    }
}
</script>

<style scoped lang="scss"></style>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     