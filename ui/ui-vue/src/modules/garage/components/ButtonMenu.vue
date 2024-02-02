<template>
  <div
    class="garage-menugroup"
    _:disabled="disable"
  >
    <TransitionGroup name="btnmnu-start-fade">
      <slot name="left" v-if="!disable && expanded"></slot>
    </TransitionGroup>
    <ButtonItem :active="!disable && expanded" @click="expanded = !expanded"
      :addclass="`garage-menugroup-toggle ${addclass}`"
      :disable="disable"
      :icon="icon"
    ><slot name="toggle">Toggle</slot></ButtonItem>
    <TransitionGroup name="btnmnu-end-fade">
      <slot name="right" v-if="!disable && expanded"></slot>
    </TransitionGroup>
  </div>
</template>

<style lang="scss">
.btnmnu-start-fade-enter-active,
.btnmnu-start-fade-leave-active,
.btnmnu-end-fade-enter-active,
.btnmnu-end-fade-leave-active {
  transition: opacity 200ms;
}
/// enter delays are commented out because of in-game blur looks odd with them
// .btnmnu-start-fade-enter-active,
// .btnmnu-end-fade-leave-active {
.btnmnu-end-fade-leave-active {
  @for $i from 1 through 10 {
    &:nth-last-child(#{$i}) {
      transition-delay: #{$i * 50}ms;
    }
  }
}
// .btnmnu-start-fade-leave-active,
// .btnmnu-end-fade-enter-active {
.btnmnu-start-fade-leave-active {
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      transition-delay: #{$i * 50}ms;
    }
  }
}
.btnmnu-start-fade-enter-from,
.btnmnu-start-fade-leave-to,
.btnmnu-end-fade-enter-from,
.btnmnu-end-fade-leave-to {
  opacity: 0;
}

.garage-menugroup {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  /* portrait mode */
  @media (max-width: 1081px) and (orientation: portrait) {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row-reverse;
    font-size: 0.75em;
    &:not(:last-child) {
      margin-right: 1em;
    }
  }

  .garage-button {
    margin-left: 0;
    margin-right: 0;
    width: 8em;
    max-width: 8em;

    border-bottom: 0.1em solid #fff;

    .garage-button-icon {
      min-width: 2em;
      min-height: 2em;
    }

    &:not(.garage-menugroup-toggle),
    &.garage-menugroup-toggle.garage-button-active {
      border-radius: 0;
      &:first-child {
        border-radius: 4px 0 0 4px;
      }
      &:last-child {
        border-radius: 0 4px 4px 0;
      }
    }

    &:not(.garage-menugroup-toggle).garage-button-active {
      .garage-button-icon {
        background-color: var(--bng-orange);
      }
      .garage-button-text {
        color: var(--bng-orange);
      }
    }

    &:hover,
    &.garage-button-active {
      border-bottom-color: var(--bng-orange);
    }
    &.garage-menugroup-toggle.garage-button-active {
      background-color: var(--bng-orange);
    }
    &.garage-menugroup-toggle:not(.garage-button-active) {
      border-bottom-color: transparent; /* to prevent vertical jump on show/hide */
    }
  }
}
</style>

<script setup>
import { ref } from "vue";
import ButtonItem from "../components/ButtonItem.vue";

defineProps({
  icon: {
    type: String,
    default: "/ui/assets/SVG/24/test-cone.svg"
  },
  addclass: {
    type: String,
    default: ""
  },
  focus: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  },
})

const expanded = ref(false);
</script>
