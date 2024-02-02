<template>
  <TaskList 
    :header="store.header"
    :tasks="store.tasks" />
</template>

<script setup>
import { provide } from 'vue'
import { useTasksStore } from '@/modules/tasks'
import { TaskList } from '@/modules/tasks'
import { useLibStore } from '@/services'

const { $game } = useLibStore()

const store = useTasksStore()

provide('animationSettings', {
  animate: true,
  animateOnMount: false,
  animateOnMountIntervalDelay: 0.2,
  animateOnEmptyIntervalDelay: 0.1,
  animateOnEmpty: true,
  animateNextTask: true,
  successCallback: playAudio
})

function playAudio() {
  $game.lua.Engine.Audio.playOnce('AudioGui', 'event:>UI>Career>Checkbox')
}
</script>

<style scoped lang="scss">
</style>
