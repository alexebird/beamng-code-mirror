<template>
    <h1>Hydraulics Debug</h1>
    <button @click="decrease">dec</button>
    <button @click="increase">inc</button>
    <button @click="addhydraulicMotor">motor</button>
    <button @click="addCylinder">cylinder</button>
    <button @click="removeConsumer">Remove Consumer</button>
    <div>
        offset: {{ offset }}
        left: {{ offsetLeft }}
    </div>
    <div class="hydraulics-debug">
        <svg width="100%" height="100%">
            <defs>
                <linearGradient id="myGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop :offset="offsetLeft" stop-color="green" />
                    <stop offset="0" stop-color="black" />
                </linearGradient>
            </defs>
            <g transform="translate(0, 150)" id="pumpAssembly">
                <pumpAssembly />
            </g>
            <g v-for="consumer, index in consumers" :transform="`translate(${(index + 1) * 100}, 95)`">
                <consumer :consumerType="consumer.type" />
            </g>
            <rect x="80" y="236.5" :width="(100 * (consumers.length - 1) + 66)" height="2" fill="url(#myGradient)" />
        </svg>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLibStore } from "@/services"
import accumulator from './components/accumulator.vue'
import pump from './components/pump.vue'
import reliefValve from './components/reliefValve.vue'
import cylinder from './components/cylinder.vue'
import valve from './components/valve.vue'

import hydraulicMotor from './components/hydraulicMotor.vue'
import pumpAssembly from './pumpAssembly.vue'
import consumer from './consumer.vue'

//specify sensors needed here
const streamsList = []

const { $game } = useLibStore()

const offset = ref(0)
const offsetLeft = computed(() => `${offset.value}%`)

const increase = () => {
    if (offset.value <= 100) {
        offset.value += 10
    }
}
const decrease = () => {
    if (offset.value > 0) {
        offset.value -= 10
    }
}

const consumers = ref([
    {
        type: 'hydraulicMotor'
    },
    {
        type: 'cylinder'
    }
])

const addCylinder = function() {
    consumers.value.push({type:'cylinder'})
}
const addhydraulicMotor = function() {
    consumers.value.push({type:'hydraulicMotor'})
}
const removeConsumer = function(index = null) {
    if(index !== null) {
        consumers.value.splice(index, 1)
    } else {
        consumers.value.pop()
    }
}

onMounted(() => {
    $game.events.on('onStreamsUpdate', onStreamsUpdate)
    $game.streams.add(streamsList)
})

onUnmounted(() => {
    $game.events.off('onStreamsUpdate', onStreamsUpdate)
    $game.streams.remove(streamsList)
})

function onStreamsUpdate(streams) {
    if (!streams.sensors) {
        return
    }
    //
}

</script>

<style scoped lang="scss">
.hydraulics-debug {
    width: 100%;
    height: 100%;
}
</style>