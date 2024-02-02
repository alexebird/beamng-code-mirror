<template>
  <div :class="{ 'gauge-wrapper': true, [type]: true }">
    <div :class="{ 'pulse-container': true, pulsing: fuelling }">
      <div class="pulser" :style="gaugeStyle"></div>
    </div>
    <svg class="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="6 0 280 280" width="280" height="280">
      <defs>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feFlood :flood-color="GAUGE_DEFAULTS[type].cssColour" result="flood1" />
          <feComposite in="flood1" in2="SourceGraphic" operator="in" result="floodShape" />
          <feGaussianBlur in="floodShape" stdDeviation="4" result="blur" />
          <feMerge result="blurs">
            <feMergeNode in="blur" />
          </feMerge>
          <feComposite in="blurs" in2="SourceGraphic" operator="out" />
        </filter>
      </defs>
      <path class="gauge-back" d="M50,210 A110,110 0 1,1 244,210" style="fill: none" />
      <path class="gauge-level blur" d="M50,210 A110,110 0 1,1 244,210" :style="gaugeLevelStyle" />
      <path class="gauge-level" d="M50,210 A110,110 0 1,1 244,210" :style="gaugeLevelStyle" />
    </svg>
    <bng-icon class="icon" :type="GAUGE_DEFAULTS[type].icon" />
    <div class="gauge-label">
      <span>{{ minLabel }}</span>
      <span class="info">{{ label || "&nbsp;" }}</span>
      <span>{{ maxLabel }}</span>
    </div>
  </div>
</template>

<script>
import { icons } from "@/assets/icons"
const DASH_ARR_LENGTH = 455
const GAUGE_TYPES = ["refuel", "recharge"]

const GAUGE_DEFAULTS = {
  refuel: {
    cssColour: "var(--bng-orange-b400)",
    gradientColour: `${0xff},${0x66},${0x00}`, // #ff6600
    icon: icons.general.refuel,
  },
  recharge: {
    cssColour: "var(--bng-add-blue-600)",
    gradientColour: `${0x5f},${0x9d},${0xf9}`, // #5f9df9
    icon: icons.general.recharge,
  },
}
</script>

<script setup>
import { computed } from "vue"
import { BngIcon } from "@/common/components/base"

const GAUGE_LABELS = window.bngVue.isProd
  ? {
      refuel: "ui.refuel.refueling",
      recharge: "ui.refuel.recharging",
    }
  : {
      refuel: "Refuelling",
      recharge: "Recharging",
    }

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    default: "refuel",
    validator: v => GAUGE_TYPES.includes(v) || v === "",
  },
  fuelling: {
    type: Boolean,
    default: false,
  },
  label: String,
  maxLabel: String,
  minLabel: String,
})

const gaugeLevelStyle = computed(() => ({
  stroke: GAUGE_DEFAULTS[props.type].cssColour,
  fill: "none",
  strokeDasharray: DASH_ARR_LENGTH,
  strokeDashoffset: DASH_ARR_LENGTH - props.value * DASH_ARR_LENGTH,
}))

const gaugeStyle = computed(() => ({
  background: `radial-gradient(22% 22% at 50% 53%, rgba(${GAUGE_DEFAULTS[props.type].gradientColour}, 0.76) 0%, rgba(${
    GAUGE_DEFAULTS[props.type].gradientColour
  }, 0.18) 64.06%, rgba(${GAUGE_DEFAULTS[props.type].gradientColour}, 0) 100%)`,
}))
</script>

<style lang="scss" scoped>
@keyframes pulsing {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.25;
  }

  100% {
    opacity: 1;
  }
}

.pulse-container {
  opacity: 0;
  transition: opacity 0.5s;

  &.pulsing {
    opacity: 1;
  }
}

.pulser {
  animation: pulsing 1s ease-in-out infinite;
}

.gauge-wrapper {
  display: inline-block;
  position: relative;
  font-family: "Overpass";
}

.icon {
  position: absolute;
  transform: translateX(-50%) translateY(-50%);
  width: 4.5em !important;
  height: 4.5em !important;
}

.full,
.pulser {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

path {
  stroke-width: 25;
}

.gauge-back {
  stroke: #000;
}

.gauge-level {
  transition: stroke-dashoffset 0.5s;
}

.blur {
  filter: url(#glow);
  opacity: 0.8;
}

.icon {
  left: 50%;
  top: 52%;
}
// .refuel {
//   & .icon {
//     left: 50%;
//     top: 50%;
//   }
// }

// .recharge {
//   & .icon {
//     left: 50%;
//     top: 50%;
//   }
// }

.gauge-label {
  position: absolute;
  top: 79%;
  left: 11%;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  right: 11%;

  & span {
    width: 2.25rem;
    font-size: 90%;
  }

  & span:not(.info) {
    width: auto;
  }

  & span.info {
    width: auto;
    font-weight: 700;
    font-size: 120%;
  }

  & span:nth-of-type(3) {
    text-align: right;
  }
}
</style>
