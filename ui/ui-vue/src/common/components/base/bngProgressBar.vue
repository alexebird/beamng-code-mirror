<!-- bngProgressBar - progress bar -->
<template>
  <div class="bng-progress-bar">
    <div v-if="headerLeft || headerRight" class="header">
      <span class="header-left">{{ headerLeft }}</span>
      <span class="header-right">{{ headerRight }}</span>
    </div>
    <div class="progress-bar">
      <div v-if="showValueLabel" class="info" v-html="valueHTML" />
      <span class="progress-fill" ref="progressFillRef"></span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    required: true,
  },
  headerLeft: String,
  headerRight: String,
  showValueLabel: {
    type: Boolean,
    default: true,
  },
  valueLabelFormat: {
    type: String,
    default: '#value#'
  },
})

defineExpose({
  decreaseValueBy,
  increaseValueBy,
  setValue: value => updateCurrentValue(value),
})

const currentValue = ref(null)
const progressFillRef = ref(null)

const valueHTML = computed(()=>props.valueLabelFormat.replace('#value#', `<span class="value-label">${currentValue.value}</span><span>${props.max}</span>`))

const progressFillUnits = computed(() => 100 - ((currentValue.value - props.min) / (props.max - props.min)) * 100)

watch(
  () => props.value,
  newValue => updateCurrentValue(newValue)
)

onMounted(() => {
  updateCurrentValue(props.min > props.value ? props.min : props.value)
})

/* Exposed Functions */
function decreaseValueBy(value) {
  const newValue = currentValue.value - value

  if (newValue < props.min) return

  updateCurrentValue(newValue)
}

function increaseValueBy(value) {
  const newValue = currentValue.value + value

  if (newValue > props.max) return

  updateCurrentValue(newValue)
}

function updateCurrentValue(newValue) {
  currentValue.value = newValue
  updateProgressFill(progressFillUnits.value)
}

/* Private Functions */
function updateProgressFill(percentage) {
  window.requestAnimationFrame(() => (progressFillRef.value.style.right = `${percentage}%`))
}
</script>

<style scoped lang="scss">

$background-color: rgba(255, 255, 255, 0.15);

$font-color: #ffffff;
$font-top-line-space: 1px;

$info-z-index: 2;
$info-divider-height: 0.9em;
$info-divider-color: white;

$progress-fill-color: #ff6600;
$progress-fill-z-index: 1;

.bng-progress-bar {
  font-family: Overpass, var(--fnt-defs);
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 125%;

  > .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-style: italic;
  }

  > .progress-bar {
    position: relative;
    background-color: $background-color;
    height: 1.5em;

    > .info {
      position: relative;
      display: flex;
      align-items: flex-start;
      padding: 0.2em 1em 0;
      z-index: $info-z-index;

      :deep(.value-label) {
        position: relative;
        padding-right: 1.34em;

        &::after {
          content: "";
          position: absolute;
          top: calc(50% - ($info-divider-height / 2) - $font-top-line-space);
          right: 0.6em;
          width: 0.1em;
          height: $info-divider-height;
          background: $info-divider-color;
          transform: matrix(0.94, 0, -0.37, 1, 0, 0);
        }
      }
    }

    > .progress-fill {
      position: absolute;
      display: inline-block;
      top: 0;
      bottom: 0;
      left: 0;
      background-color: $progress-fill-color;
      z-index: $progress-fill-z-index;
    }
  }
}

</style>
