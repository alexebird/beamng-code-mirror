<template>
    <svg width="100%" height="100%" viewBox="0 0 244 244">
        <g ref="circle" :transform="`rotate(${rotateOrigin})`">
            <circle r="122" cy="122" cx="122" class="circle" />
            <text x="115" y="34" class="text">
                <tspan x="115" y="34">N</tspan>
            </text>
            <text y="110" x="115" class="text">
                <tspan rotate="90" y="115" x="210">E</tspan>
            </text>
            <text x="129" y="210" class="text">
                <tspan rotate="180" x="129" y="210">S</tspan>
            </text>
            <text y="122" x="34" class="text">
                <tspan rotate="270" x="34" y="122">W</tspan>
            </text>
        </g>
        <path d="M122 90 L105 154 L139 154 Z" ref="arrow" class="arrow" />
    </svg>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLibStore } from "@/services"

const streamsList = ['sensors']

const { $game } = useLibStore()

const arrow = ref(null),
    circle = ref(null),
    yawDegrees = ref(0)

const bbox = computed(() => arrow.value ? arrow.value.getBBox() : null)
const rotateOrigin = computed(() => bbox.value
    ? `${yawDegrees.value} ${(bbox.value.x + bbox.value.width / 2)} ${(bbox.value.y + bbox.value.height / 2)}`
    : 0)

onMounted(() => {
    $game.events.on('onStreamsUpdate', onStreamsUpdate)
    $game.streams.add(streamsList)
})

onUnmounted(() => {
    $game.events.off('onStreamsUpdate', onStreamsUpdate)
    $game.streams.remove(streamsList)
})

function onStreamsUpdate(streams) {
    if (!streams.sensors)
        return

    yawDegrees.value = streams.sensors.yaw * 180 / Math.PI + 180
}
</script>

<style scoped lang="scss">
.circle {
    fill: rgba(0, 0, 0, 0.43);
}

.text {
    font-style: normal;
    font-variant: normal;
    font-weight: normal;
    font-stretch: semi-condensed;
    font-size: 35px;
    line-height: 125%;
    font-family: 'Lucida Console';
    -inkscape-font-specification: 'Lucida Console Semi-Condensed';
    letter-spacing: 0px;
    word-spacing: 0px;
    fill: #FFFFFF;
}

.arrow {
    fill: #FFFFFF;
}
</style>