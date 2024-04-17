<template>
  <div :class="['popup', 'popup-style-' + appearance]" bng-ui-scope="_confirmPopup" v-bng-on-ui-nav:*="handleCancelWithBack">
    <div class="popup-content">
      <div class="popup-title" v-if="title">{{ title }}</div>
      <div class="popup-body" v-if="messageIsComponent"><component :is="message.component" v-bind="message.props" /></div>
      <div class="popup-body" v-else v-html="message" />
      <div class="popup-buttons">
        <BngButton
          v-for="button in buttons"
          v-bind="button.extras"
          @click="$emit('return', button.value)"
        >{{ button.label }}</BngButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { BngButton } from "@/common/components/base"
import { vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import { UI_EVENTS, UI_EVENT_GROUPS } from "@/bridge/libs/UINavEvents"
useUINavScope("_confirmPopup")

const emit = defineEmits(["return"])

const props = defineProps({
  appearance: String,
  popupActive: Boolean,
  message: {
    type: [String, Object],
    required: true,
  },
  title: String,
  buttons: Array,
})

const messageIsComponent = computed(() => props.message && typeof props.message === "object" && props.message.component)


const handleCancelWithBack = e => {
  if ([UI_EVENTS.back, UI_EVENTS.menu].includes(e.detail.name)) emit('return', null)
  return [...UI_EVENT_GROUPS.focusMove, UI_EVENTS.ok].includes(e.detail.name)
}

</script>

<script>
import { popupPosition } from "@/services/popup"

export default {
  // export popup settings (optional)
  wrapper: {
    blur: true,
    style: null,
  },
  position: popupPosition.center,
  animated: true,
}
</script>

<style lang="scss" scoped>
$border-rad: 0.75em;

.popup {
  position: relative;
  display: inline-block;
  min-width: 20em;
  max-width: 40em;
  border: 0.3em;
  color: #fff;
  border-radius: $border-rad;

  transition: box-shadow 200ms;
  box-shadow: 0 1em 0em 1em rgba(#000, 0.0);
  &.popup-active {
    box-shadow: 0 1em 4em 1em rgba(#000, 0.3);
  }

  &.popup-inactive {
    filter: grayscale(50%);
    .popup-content > * {
      opacity: 0.5;
    }
  }

  .popup-content {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #252525;
    border-radius: $border-rad;
    overflow: hidden;
  }

  .popup-title {
    background: #333;
    padding: 0.3em;
    font-size: 1.2em;
    text-align: center;
  }

  .popup-body {
    margin: 1em 0;
    padding: 0 1em;
    text-align: center;
  }

  .popup-buttons {
    margin: 1em 0 0.5em 0;
    padding: 0 1em;
    text-align: center;
  }
}

// popup appearances
.popup-style-experimental {
  padding: 0.2em;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(#f00, 0.3) 0 0.5em,
    #f00 0.5em 1.5em
  );

  .popup-title {
    background: #700;
  }
}

</style>
