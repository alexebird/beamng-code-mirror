<template>
    <div class="container" ref="app">
        <canvas ref="canvas" width="280" height="56"></canvas>
        <canvas ref="osCanvas" class="os-canvas"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted, computed } from 'vue'
import { useLibStore } from "@/services"

const streamsList = ['sensors']
const compassWidth = 2000

const { $game } = useLibStore()

const app = ref(null)
const canvas = ref(null)
const osCanvas = ref(null)

const widthLess = computed(() => (compassWidth - canvas.value.width) / 2)

const appResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]

    // update canvas height and width to match app container
    canvas.value.width = entry.target.offsetWidth
    canvas.value.height = entry.target.offsetHeight
})

onMounted(() => {
    initOsCanvas()

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
    if (!streams.sensors)
        return

    const canvasCtx = canvas.value.getContext('2d')
    canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    canvasCtx.fillStyle = "rgba(255,255,255,0.8)"
    canvasCtx.strokeStyle = "rgba(255,255,255,0.6)"

    const heading = streams.sensors.yaw
    const posX = heading * compassWidth / (2 * Math.PI) - widthLess.value

    canvasCtx.drawImage(osCanvas.value, posX, 0)
    if (heading * compassWidth / (2 * Math.PI) - widthLess.value > 0) {
        canvasCtx.drawImage(osCanvas.value, posX - compassWidth, 0)
    } else if (posX + compassWidth < canvas.value.width) {
        canvasCtx.drawImage(osCanvas.value, posX + compassWidth, 0)
    }

    //needle
    canvasCtx.beginPath()
    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = "white"
    canvasCtx.moveTo(canvas.value.width / 2, 40)
    canvasCtx.lineTo(canvas.value.width / 2 - 5, 55)
    canvasCtx.moveTo(canvas.value.width / 2, 40)
    canvasCtx.lineTo(canvas.value.width / 2 + 5, 55)
    canvasCtx.stroke()
}

function initOsCanvas() {
    osCanvas.value.width = compassWidth
    osCanvas.value.height = app.value.offsetHeight

    const osCanvasCtx = osCanvas.value.getContext('2d')
    osCanvasCtx.font = 'bold 17px "Lucida Console", Monaco, monospace'
    osCanvasCtx.textAlign = "center"
    osCanvasCtx.fillStyle = "white"
    osCanvasCtx.strokeStyle = "white"

    for (let i = 0; i < 37; i++) {
        const r = i * Math.PI / 180 * 10
        const posX1 = r * compassWidth / (2 * Math.PI)
        const posX2 = posX1 + compassWidth / 72


        //big lines
        osCanvasCtx.beginPath()
        osCanvasCtx.lineWidth = 2
        osCanvasCtx.moveTo(posX1, 30)
        osCanvasCtx.lineTo(posX1, 50)
        osCanvasCtx.stroke()

        //small lines
        if (i !== 36) {
            osCanvasCtx.beginPath()
            osCanvasCtx.lineWidth = 2
            osCanvasCtx.moveTo(posX2, 30)
            osCanvasCtx.lineTo(posX2, 45)
            osCanvasCtx.stroke()
        }

        //text
        let text = i * 10
        if (text === 0 || text === 360) {
            text = "N"
        } else if (text === 90) {
            text = "E"
        } else if (text === 180) {
            text = "S"
        } else if (text === 270) {
            text = "W"
        }

        osCanvasCtx.fillText(text, posX1, 22)
    }
}
</script>

<style scoped lang="scss">
.container {
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.43);

    > .os-canvas {
        display: none;
    }
}
</style>