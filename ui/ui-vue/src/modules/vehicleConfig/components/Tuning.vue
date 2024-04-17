<template>
  <div
    :class="{
      innerTuningCard: true,
      'with-background': withBackground,
    }"
    v-bng-blur="withBackground">
    <div v-if="tuningStore.buckets" class="tuning-form" bng-nav-scroll>
      <div v-if="mirrorsShown">
        <BngButton v-bng-disabled="!mirrorsEnabled" @click="toMirrors">{{ $t("ui.mirrors.name") }}</BngButton>
      </div>
      <div v-for="(subCategories, category) in tuningStore.buckets" :key="category">
        <h2>{{ category }}</h2>
        <div v-for="(variables, subCategory) in subCategories" :key="subCategory">
          <h3 v-if="subCategory !== 'Other'">{{ subCategory }}</h3>
          <div v-for="varData in variables" :key="category + subCategory + varData.name">
            <div class="variable-title">{{ varData.title }}</div>
            <div class="variable-box">
              <BngSlider
                ref="inputs"
                :min="varData.minDis"
                :max="varData.maxDis"
                :step="varData.stepDis"
                v-model="tuningStore.tuningVariables[varData.name].valDis"
                @valueChanged="onChange" />
            </div>
            <BngInput
              type="number"
              :min="varData.minDis"
              :max="varData.maxDis"
              :step="varData.stepDis"
              v-model="tuningStore.tuningVariables[varData.name].valDis"
              @valueChanged="onChange"
              :suffix="varData.unit" />
          </div>
        </div>
      </div>
    </div>
    <div class="tuning-static">
      <advancedWheelsDebug ref="awdApp" v-show="awdShow" />
      <!-- <Teleport :disabled="!buttonTarget" :to="buttonTarget"> -->
      <BngSwitch v-if="awdApp && awdApp.hasData" v-model="awdShow">{{ $t("ui.garage.tune.advWheel") }}</BngSwitch>
      <BngSwitch v-model="autoApply">{{ $t("ui.garage.liveUpdates") }}</BngSwitch>
      <BngButton :disabled="autoApply || !isChanged" @click="apply">{{ $t("ui.common.apply") }}</BngButton>
      <BngButton v-if="closeButton" @click="close" accent="attention"><BngBinding ui-event="back" deviceMask="xinput" />{{ $t("ui.common.close") }}</BngButton>
      <!-- </Teleport> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onUnmounted, computed } from "vue"
import { vBngBlur, vBngDisabled } from "@/common/directives"
import { BngButton, BngSwitch, BngSlider, BngInput, BngBinding } from "@/common/components/base"
import { advancedWheelsDebug } from "@/modules/apps"
import { useTuningStore } from "../stores/tuningStore"
import { default as UINavEvents, UI_EVENT_GROUPS } from "@/bridge/libs/UINavEvents"
import { debounce } from "@/utils/rateLimit"
import { useBridge } from "@/bridge"
const { lua } = useBridge()

const tuningStore = useTuningStore()

const props = defineProps({
  withBackground: Boolean,
  buttonTarget: {
    type: Object,
  },
  closeButton: Boolean, // used in career mode
})

const awdApp = ref()
const awdShow = ref(false)

const apply = () => {
  tuningStore.apply()
  for (let ipt of inputs.value) ipt.markClean()
}
const close = () => {
  // if (isChanged.value) {
  //   // TODO: confirmation
  // }
  tuningStore.close()
}

import { useSettings } from "@/services/settings.js"
const mirrorsShown = ref(true)
const mirrorsEnabled = ref(false)
let mirrorsRoute = "menu.vehicleconfig.vue.tuning.mirrors"
const toMirrors = () => bngVue.gotoGameState(mirrorsRoute)

const inputs = ref([])

const isChanged = computed(() => {
  for (let ipt of inputs.value) {
    if (ipt.dirty) return true
  }
  return false
})

defineExpose({
  apply,
  close,
})

const autoApply = ref(false)
const applyDebounce = debounce(apply, 3000)

function onChange() {
  autoApply.value && applyDebounce()
}

onBeforeMount(async () => {
  if (await lua.extensions.gameplay_garageMode.isActive()) mirrorsRoute = "garagemode.tuning.mirrors"
  // else if (await lua.career_career.isActive()) mirrorsRoute = "career.tuning.mirrors"

  if (await lua.career_career.isActive()) {
    mirrorsShown.value = false
  } else {
    mirrorsEnabled.value = (await useSettings()).values.GraphicDynMirrorsEnabled
  }

  await tuningStore.init()
  await tuningStore.requestInitialData()
  UINavEvents.setFilteredEvents(UI_EVENT_GROUPS.focusMoveScalar)
})

onUnmounted(async () => {
  await tuningStore.notifyOnMenuClosed()
  tuningStore.$dispose()
  UINavEvents.clearFilteredEvents()
})
</script>

<style scoped lang="scss">
.innerTuningCard {
  display: flex;
  width: 100%;
  height: 100%;
  flex-flow: column;
  > * {
    flex: 1 1 auto;
    width: 100%;
  }
  > .tuning-static {
    flex: 0 0 auto;
  }

  &.with-background {
    background-color: rgba(0, 0, 0, 0.6);
  }

  color: white;

  .tuning-form {
    padding: 1.5em;
    text-align: center;
    overflow-y: scroll;
  }

  .variable-title {
    text-align: left;
  }

  .variable-box {
    float: left;
    width: 65%;
    padding-right: 0.5em;
  }
}
</style>
