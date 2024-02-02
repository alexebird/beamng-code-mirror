<template>
  <div :class="['popup', 'popup-style-' + appearance]">
    <div class="popup-content">
      <div class="popup-title" v-if="title">{{ title }}</div>
      <div class="popup-body" v-html="message"></div>
      <div class="popup-buttons">
        <BngButton
          v-for="button in buttons"
          @click="$emit('return', button.value)"
        >{{ $t(button.label) }}</BngButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BngButton } from "@/common/components/base"

defineEmits(["return"])

const props = defineProps({
  appearance: {
    type: String,
  },
  popupActive: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  buttons: {
    type: Array,
    default: [
      { label: "ui.common.okay", value: true },
      { label: "ui.common.cancel", value: false },
    ],
  },
})
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
