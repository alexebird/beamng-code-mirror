<template>
  <div class="awd-container bng-app">
    <table class="awd-table" v-if="orderedData && orderedData.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Camber</th>
          <th>Toe</th>
          <th>Caster</th>
          <th>SAI</th>
        </tr>
      </thead>
      <tr v-for="w in orderedData">
        <td class="data-name">{{ w.name }}</td>
        <td>{{ format(w.camber) }}</td>
        <td>{{ format(w.toe) }}</td>
        <td>{{ format(w.caster) }}</td>
        <td>{{ format(w.sai) }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useLibStore } from "@/services"

const { $game } = useLibStore()
const streamList = ["advancedWheelDebugData"]

const data = ref([])
const hasData = computed(() => Array.isArray(data.value) && data.value.length > 0)
const orderedData = computed(() => {
  if (!Array.isArray(data.value)) return []
  return data.value.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
})

defineExpose({ hasData })

onMounted(() => {
  // console.log("advancedWheelsDebug mounted")
  $game.streams.add(streamList)
  register()
})

onUnmounted(() => {
  // console.log("advancedWheelsDebug unmounted")
  $game.streams.remove(streamList)
  $game.api.activeObjectLua('extensions.advancedwheeldebug.registerDebugUser("advancedWheelDebugApp", false)')
})

const register = () => $game.api.activeObjectLua('extensions.advancedwheeldebug.registerDebugUser("advancedWheelDebugApp", true)')

const format = value => (value ? parseFloat(value).toFixed(3) : "")

$game.events.on("onStreamsUpdate", streams => (data.value = streams["advancedWheelDebugData"]))

$game.events.on("VehicleReset", register)

$game.events.on("VehicleChange", register)
</script>

<style scoped lang="scss">
.awd-container {
  padding: 1em;

  .awd-table {
    width: 100%;

    thead > tr {
      text-align: justify;
    }

    th {
      text-align: left;
    }
    th:first-child {
      text-align: center;
    }

    td {
      width: 20%;
      font-size: 0.875em;
      font-weight: 400;
      letter-spacing: 0.01em;
      line-height: 1.4em;
      text-align: left;

      &.data-name {
        font-weight: 500;
        line-height: 1.7em;
        text-align: center;
      }
    }
  }
}
</style>
