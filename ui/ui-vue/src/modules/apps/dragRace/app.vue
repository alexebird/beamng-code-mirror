<template>
    <div class="bng-app drag-race">
        <div class="content" v-if="dragRaceState.hasFinished">
            <h1>Race finished</h1>
            <div v-for="(player, index) in players" :key="index">
                {{ player.name }}
            </div>
        </div>
        <div v-else>
            <h1>Waiting for race to finish</h1>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useLibStore } from '@/services'

const { $game } = useLibStore()

// state
const dragRaceState = reactive({
    hasFinished: true
})
const players = ref([
    {
        name: 'player 1'
    },
    {
        name: 'player 2'
    },
])

onMounted(() => {
    // events
    $game.events.on('DragRaceFinished', onDragRaceFinished)
})

onUnmounted(() => {
    $game.events.off('DragRaceFinished', onDragRaceFinished)
})

function onDragRaceFinished(data) {
    dragRaceState.hasFinished = true
}
</script>

<style scoped lang="scss">
.drag-race {
    >.content {}
}
</style>