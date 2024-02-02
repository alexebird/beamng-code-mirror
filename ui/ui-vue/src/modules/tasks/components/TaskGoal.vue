<template>
  <div class="task-goal" :class="{ success: complete && success, fail: complete && !success, animate: animate }">
    <div class="label">
      <span class="checkbox" :style="checkboxSvgs"></span>
      <span class="text">
        <slot v-if="slots.label" name="label"></slot>
        <template v-else-if="label">
          <DynamicComponent :template="labelParsed" />
        </template>
      </span>
    </div>
    <span class="description">
      <slot v-if="slots.description" name="description"></slot>
      <template v-else-if="description">
        <DynamicComponent :template="descriptionParsed" />
      </template>
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch, inject } from "vue"
import { useSlots } from "vue"
import { getAssetURL } from "@/utils"
import { $content, $translate } from "@/services"
import { DynamicComponent } from "@/common/components/utility"

const props = defineProps({
  label: [String, Object],
  description: [String, Object],
  complete: Boolean,
  success: Boolean,
  settings: {
    type: Object,
    default: {
      animate: false,
      animateOnMount: false,
      successCallback: Function,
    },
  },
})

const slots = useSlots()

const animationSettings = inject("animationSettings", props.settings)

const animate = ref(false)

const labelParsed = computed(() => $content.bbcode.parse($translate.contextTranslate(props.label, true)))
const descriptionParsed = computed(() => $content.bbcode.parse($translate.contextTranslate(props.description, true)))
const checkboxSvgs = computed(() => ({
  "--checkbox-empty": `url(${getAssetURL("icons/general/checkbox-empty.svg")})`,
  "--checkbox-ok": `url(${getAssetURL("icons/general/checkbox-ok.svg")})`,
  "--checkbox-nope": `url(${getAssetURL("icons/general/checkbox-nope.svg")})`,
}))

watch(
  () => [props.complete, props.success],
  (newValues, oldValues) => {
    const isComplete = newValues[0],
      isSuccess = newValues[1]

    animate.value = animationSettings.animate && isComplete

    if (isSuccess) animationSettings.successCallback()
  }
)

onBeforeMount(() => {
  animate.value = props.settings.animate && props.settings.animateOnMount
})
</script>

<style scoped lang="scss">
$goalSuccessBackground: #40444f;
$goalSuccessColor: #ffffff;
$goalFailBackground: #6c1313;
$textColor: #ffffff;

.task-goal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0.5em;
  border-radius: 0.25em;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.6);
  border: 0.125em solid transparent;

  &.success {
    background: $goalSuccessBackground;

    > .label > .text {
      color: $goalSuccessColor;
    }

    > .description {
      color: $goalSuccessColor;
    }

    > .label > .checkbox {
      mask-image: var(--checkbox-ok);
      -webkit-mask-image: var(--checkbox-ok);
    }

    &.animate {
      animation: completeGoal 1.2s cubic-bezier(0.65, 0, 0.35, 1);

      > .label > .checkbox {
        animation: completeCheckbox 0.6s linear 0.4s forwards;
      }
    }
  }

  &.fail {
    background: $goalFailBackground;

    > .label > .checkbox {
      mask-image: var(--checkbox-nope);
      -webkit-mask-image: var(--checkbox-nope);
    }

    &.animate {
      animation: failGoal 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;

      > .label > .checkbox {
        -webkit-mask-image: var(--checkbox-empty);
        mask-image: var(--checkbox-empty);
        animation: failCheckbox 0.6s linear 0.4s forwards;
      }
    }
  }

  > .label {
    display: flex;
    align-items: center;

    > .checkbox {
      display: inline-block;
      width: 1em;
      height: 1em;
      margin-top: 0.1em;
      mask-image: var(--checkbox-empty);
      -webkit-mask-image: var(--checkbox-empty);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      background: $textColor;
      flex-shrink: 0;
      transition: mask-image;
    }

    > .text {
      font-size: 1.2em;
      line-height: 1.2em;
      font-weight: 500;
      letter-spacing: 0.01em;
      margin-left: 0.55em;
      // this is a hack to fix angular css leaking in and should be removed once properly fixed
      color: $textColor;
    }

    > .description {
      margin-left: 1.8em;
    }
  }

  > .description {
    margin-left: 1.8em;
    font-family: "Noto Sans";
    font-size: 1em;
    font-weight: 400;
    line-height: 1.5em;
    /* identical to box height, or 150% */
    letter-spacing: 0.01em;
  }
}

@keyframes completeGoal {
  10% {
    transform: scale(1.02, 1.05);
    font-size: 1.1em;
  }

  33% {
    background: #cbcbcb;
  }

  40% {
    border-color: #ff6600;
  }

  80% {
    transform: scale(1.02, 1.05);
    font-size: 1.1em;
  }

  100% {
    transform: scale(1);
    font-size: 1em;
    background: $goalSuccessBackground;
    border-color: transparent;
  }
}

@keyframes completeCheckbox {
  0% {
    -webkit-mask-image: var(--checkbox-ok);
    mask-image: var(--checkbox-ok);
    transform: scale(1);
  }

  30% {
    transform: scale(1.5);
  }

  100% {
    -webkit-mask-image: var(--checkbox-ok);
    mask-image: var(--checkbox-ok);
    transform: scale(1);
  }
}

@keyframes failGoal {
  10% {
    transform: scale(1.02, 1.05);
  }

  17% {
    background: #ac0000;
  }

  80% {
    transform: scale(1.02, 1.05);
  }

  100% {
    background: $goalFailBackground;
    transform: scale(1);
  }
}

@keyframes failCheckbox {
  0% {
    -webkit-mask-image: var(--checkbox-nope);
    mask-image: var(--checkbox-nope);
    transform: scale(1);
  }

  30% {
    transform: scale(1.5);
  }

  100% {
    -webkit-mask-image: var(--checkbox-nope);
    mask-image: var(--checkbox-nope);
    transform: scale(1);
  }
}
</style>
