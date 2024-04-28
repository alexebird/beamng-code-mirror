<!-- bngDropdown - a dropdown component -->
<template>
  <div
    v-bind="$attrs"
    ref="container"
    class="bng-dropdown"
    :class="class"
    v-bng-disabled="disabled"
    @click="!disabled && (opened = !opened)"
    tabindex="0"
    bng-nav-item
    bng-ui-scope="bng-dropdown"
    v-bng-on-ui-nav:ok.asMouse.focusRequired
    @focusout="focusedOut">
    <BngIcon
      :type="icons.arrowSmallRight"
      :class="{
        'dropdown-arrow': true,
        'dropdown-arrow-top': openedTop,
        opened: opened,
      }" />
    <slot name="display">Select</slot>
    <div
      ref="content"
      class="bng-dropdown-content"
      :class="class"
      v-show="opened"
      v-bng-auto-scroll:top
      bng-nav-scroll
      bng-ui-scope="bng-dropdown-content"
      v-bng-on-ui-nav:back="navBack"
      v-bng-on-ui-nav:focus_u,focus_d="navContents"
      @click.stop=""
      @mouseover.stop=""
      @mouseenter.stop=""
      @mousedown.stop=""
      @mouseup.stop="">
      <slot v-if="opened"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUpdated, onUnmounted } from "vue"
import { createPopper } from "@popperjs/core"
import { vBngAutoScroll, vBngDisabled, vBngOnUiNav } from "@/common/directives"
import { BngIcon, icons } from "@/common/components/base"
import { collectRects, navigate } from "@/services/crossfire"

const props = defineProps({
  modelValue: Boolean,
  disabled: Boolean,
  class: {
    type: [String, Array, Object],
  },
})

const emit = defineEmits(["update:modelValue", "provideFocus"])

const container = ref(null)
const content = ref(null)

const openedTop = ref(false)
let popperInstance = null

const opened = ref(props.modelValue)
watch(
  () => props.modelValue,
  val => (opened.value = val)
)
watch(opened, val => emit("update:modelValue", val))


const focusedOut = $event => {
  const isInsideBngDropdown = $event.relatedTarget && container.value.contains($event.relatedTarget)
  const isInsideDropdown = $event.relatedTarget && content.value.contains($event.relatedTarget)
  if (!isInsideBngDropdown && !isInsideDropdown) {
    opened.value = false
  }
}

function navBack() {
  opened.value && (opened.value = false)
  container.value.focus()
}

function navContents(evt) {
  if (!content.value) return
  const dir = evt.detail.name === "focus_u" ? "up" : "down"
  let res = navigate(collectRects(dir, content.value), dir)
  if (!res) {
    let elm
    if (dir === "down") elm = content.value.children.item(0)
    else elm = [...content.value.children].at(-1)
    elm && typeof elm.focus === "function" && elm.focus()
  }
}

onMounted(() => {
  popperInstance = createPopper(container.value, content.value, {
    placement: "bottom-start",
    strategy: "fixed",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 4],
        },
      },
      {
        name: "bng-direction",
        enabled: true,
        phase: "write",
        fn({ state }) {
          openedTop.value = state.placement.startsWith("top")
        },
      },
    ],
  })
  emit("provideFocus", () => container.value.focus())
})

onUpdated(async () => {
  await popperInstance.update()
})

onUnmounted(() => {
  if (popperInstance) popperInstance.destroy()
})
</script>

<style lang="scss" scoped>
@import "@/styles/modules/mixins";
.bng-dropdown {
  $f-offset: 0.25rem;
  $rad: $border-rad-1;

  display: flex;
  align-items: center;

  position: relative;
  padding: 0.25em;
  padding-right: 0.75em;
  border-radius: $rad;
  background: var(--bng-cool-gray-700);
  cursor: pointer;
  user-select: none;
  margin: 0.25rem;
  min-width: 6em;
  pointer-events: auto;

  & > .dropdown-arrow {
    font-size: 1.5em;
    transition: transform 100ms ease-in-out;
    &.opened {
      transform: rotate(90deg);
      &.dropdown-arrow-top {
        transform: rotate(-90deg);
      }
    }
  }

  // &:focus::before {
  //   content: "";
  //   display: block;
  //   position: absolute;
  //   top: -1px;
  //   bottom: -1px;
  //   left: -1px;
  //   right: -1px;
  //   border-radius: 0.25em;
  //   border: 2px solid var(--bng-orange-b400);
  //   pointer-events: none;
  //   z-index: var(--zorder_main_menu_navigation_focus);
  // }

  @include modify-focus($rad, $f-offset);
  &[disabled] {
    pointer-events: none;
    background: var(--bng-cool-gray-800);
    color: var(--bng-cool-gray-600);

    &:focus::before {
      display: none;
    }
    & > .dropdown-arrow {
      color: inherit !important;
    }
  }
}

.bng-dropdown-content {
  position: absolute;
  margin-top: 0.25em;
  background: grey;
  display: flex; // required to make inner content receive the dimensions
  flex-direction: column;
  // min-height: 1.875em; // single item height (1.375em) plus padding (0.5em)
  max-height: 20rem;
  overflow-y: auto;
  z-index: 10000;
  padding: 0.25rem 0;
  > :deep(*) {
    flex: 1 1 auto;
  }
  cursor: default;
  user-select: unset;
}
</style>
