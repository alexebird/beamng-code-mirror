<template>
  <div :class="{
    'innerTuningCard': true,
    'with-background': withBackground,
  }">
    <div v-if="tuningStore.buckets" class="tuning-form">
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
                @valueChanged="onChange"
              />
            </div>
            <BngInput
              type="number"
              :min="varData.minDis"
              :max="varData.maxDis"
              :step="varData.stepDis"
              v-model="tuningStore.tuningVariables[varData.name].valDis"
              @valueChanged="onChange"
              :suffix="varData.unit"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="tuning-static">
      <advancedWheelsDebug ref="awdApp" v-show="awdShow" />
      <!-- <Teleport :disabled="!buttonTarget" :to="buttonTarget"> -->
        <BngSwitch v-if="awdApp && awdApp.hasData" v-model="awdShow">{{ $t("ui.garage.tune.advWheel") }}</BngSwitch>
        <BngSwitch v-model="autoApply">{{ $t("ui.garage.tune.live") }}</BngSwitch>
        <BngButton :disabled="autoApply || !isChanged" @click="apply">{{ $t("ui.common.apply") }}</BngButton>
        <BngButton v-if="closeButton" @click="close">{{ $t("ui.common.close") }}</BngButton>
      <!-- </Teleport> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onUnmounted, computed } from "vue"
import { BngButton, BngSwitch, BngSlider, BngInput } from "@/common/components/base"
import { advancedWheelsDebug } from "@/modules/apps"
import { useTuningStore } from "../stores/tuningStore"
import { default as UINavEvents, UI_EVENT_GROUPS } from "@/bridge/libs/UINavEvents"
import { debounce } from "@/utils/rateLimit"

const tuningStore = useTuningStore()

const props = defineProps({
  withBackground: {
    type: Boolean,
    default: false,
  },
  buttonTarget: {
    type: Object,
  },
  closeButton: { // used in career mode
    type: Boolean,
    default: false,
  },
})

const awdApp = ref()
const awdShow = ref(false)

const apply = () => {
  tuningStore.apply()
  for (let ipt of inputs.value)
    ipt.markClean()
}
const close = () => {
  // if (isChanged.value) {
  //   // TODO: confirmation
  // }
  tuningStore.close()
}

const inputs = ref([])

const isChanged = computed(() => {
  for (let ipt of inputs.value) {
    if (ipt.dirty)
      return true
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
