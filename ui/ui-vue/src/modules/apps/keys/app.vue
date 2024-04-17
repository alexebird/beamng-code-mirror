<template>
  <div v-if="players.length > 1 || (bindings[show] && bindings[show].length > 0)" class="bindings-app">
    <div @click="toggleSmall()" class="binding-show">
      <span v-if="small" class="toggle-icon">
        <BngIcon class="key-icon" :type="icons.arrowSmallLeft" />
      </span>
      <span v-else class="toggle-icon">
        <BngIcon class="key-icon" :type="icons.arrowSmallRight" />
      </span>
    </div>
    <div class="players-binding" v-if="!small && (players.length > 1 || (bindings[show] && bindings[show].length > 0))">
      <div v-if="!small && players.length > 1">
        <BngButton v-if="bindings.length > 1" @click="backward()" />
        <span>Player {{ show }}</span>
        <BngButton v-if="bindings.length > 1" @click="forward()" />
      </div>
      <div v-if="bindings[show].length > 0 && !small" class="bindings-container">
        <div v-for="entry in bindings[show]" class="binding-item">
          <div>
            {{ $t(entry.action) }}
          </div>
          <div>
            <BngBinding v-for="b in entry.control" :deviceKey="b.c" :device="b.d" :show-unassigned="true" @click="goToBindings(entry, b)"></BngBinding>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useLibStore } from "@/services/libStore"
import { BngButton, BngBinding, BngIcon, icons } from "@/common/components/base"

const { $game } = useLibStore()

const bindings = ref([])
const small = ref(true)
const timeout = ref(null)
const show = ref(0)
const players = ref([])

const forward = () => {
  show.value = (show.value + 1) % bindings.value.length
}

const backward = () => {
  show.value = show.value === 0 ? bindings.value.length - 1 : show.value - 1
}

const toggleSmall = () => {
  small.value = !small.value
  clearTimeout(timeout)
}

const goToBindings = (action, control) => {
  $game.events.emit("MenuHide", false)
  bngVue.gotoGameState("menu.options.controls.bindings.edit", { params: { action: action.actionName, oldBinding: { control: control.c, device: control.n } } })
}

onMounted(() => {
  $game.events.on("InputBindingsChanged", onInputBindingsChanged)
  $game.events.on("VehicleChange", showBriefly)
  $game.events.on("VehicleFocusChanged", showBriefly)

  $game.api.engineLua('extensions.core_input_bindings.notifyUI("keys app: link init")')

  // copied this copy
  // copied, no clue why there needs to be this timeout
  setTimeout(function () {
    $game.api.engineLua("settings.notifyUI()")
  }, 200)
})

onUnmounted(() => {
  $game.events.off("InputBindingsChanged", onInputBindingsChanged)
  $game.events.off("VehicleChange", showBriefly)
  $game.events.off("VehicleFocusChanged", showBriefly)
})

function showBriefly() {
  if (small.value) {
    timeout.value = setTimeout(() => (small.value = true), 10000)
  }
  small.value = false
}

function onInputBindingsChanged(data) {
  const specialKeys = []
  players.value = []

  for (let i = 0; i < data.bindings.length; i++) {
    for (let j = 0; j < data.bindings[i].contents.bindings.length; j++) {
      let bind = data.bindings[i].contents.bindings[j]

      if (specialKeys[bind.player] === undefined) {
        specialKeys[bind.player] = []
      }
      // Count the number of players (no other functionality)
      if (!players.value[bind.player]) {
        players.value[bind.player] = true
      }

      if (data.actions[bind.action] && data.actions[bind.action].cat === "vehicle_specific") {
        let exAt = existsAt(specialKeys[bind.player], bind.action)
        if (exAt.length === 0) {
          specialKeys[bind.player].push({
            control: [
              {
                c: bind.control,
                d: data.bindings[i].contents.devicetype,
                n: data.bindings[i].devname,
              },
            ],
            actionName: bind.action,
            action: data.actions[bind.action].title,
            order: data.actions[bind.action].order,
            i: j,
          })
        } else {
          specialKeys[bind.player][exAt[0]].control.push({
            c: bind.control,
            d: data.bindings[i].contents.devicetype,
            n: data.bindings[i].devname,
          })
        }
      }
    }
  }

  for (var k in specialKeys) {
    specialKeys[k].sort(function (a, b) {
      return a.order - b.order
    })
  }

  bindings.value = specialKeys.map(function (elem) {
    return elem.sort(function (a, b) {
      return a.order - b.order
    })
  })

  if (show.value >= bindings.value.length) {
    show.value = 0
  }
}

function existsAt(arr, ac) {
  return arr
    .map(function (elem, i) {
      return elem.actionName === ac ? i : -1
    })
    .filter(function (elem) {
      return elem !== -1
    })
}
</script>

<style scoped lang="scss">
.bindings-app {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 100%;

  > .binding-show {
    > .toggle-icon {
      display: inline-block;
      padding: 0.25em;
      background: var(--bng-black-o4);

      > .key-icon {
        width: 1em;
        height: 1em;
        color: #fff;
        opacity: 0.7;
        transition-duration: 0.3s;
        font-size: 2rem;

        &:hover {
          opacity: 1;
          transition-duration: 0.3s;
        }
      }
    }
  }

  > .players-binding {
    flex-grow: 1;
    color: white;
    background: var(--bng-black-o4);
    overflow: auto;

    > .bindings-container {
      min-height: 38px;
      padding: 0 0.25em;

      > .binding-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.25em 0;
      }
    }
  }
}
</style>
