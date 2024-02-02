<template>
    <div class="bng-app cd-container" layout="column" layout-align="center center">
        <span>{{ cameraDistance }}</span>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLibStore } from "@/services"

const { $game } = useLibStore()
const cameraDistance = ref(null)

onMounted(() => {
    $game.api.engineLua('extensions.load("ui_cameraDistanceApp")')
})

onUnmounted(() => {
    $game.api.engineLua('extensions.unload("ui_cameraDistanceApp")')
})

$game.events.on('cameraDistance', function (distance, errMsg) {
    if (distance < 0) {
        cameraDistance.value = errMsg
    } else {
        cameraDistance.value = $game.units.buildString('length', distance, 2)
    }
})
</script>

<style scoped lang="scss">
.cd-container {
    font-size: 1.4em;
}
</style>