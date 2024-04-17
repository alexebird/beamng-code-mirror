<template>
  <div
    :class="{
      'bng-accitem': true,
      // type
      'bng-accitem-normal': !opts.static && !opts.selectable,
      'bng-accitem-static': opts.static,
      'bng-accitem-expandable': !opts.static,
      'bng-accitem-selectable': opts.selectable,
      // state
      'bng-accitem-expanded': !opts.static && opts.expanded && !opts.disabled,
      'bng-accitem-selected': opts.selected,
    }"
    v-bng-disabled="opts.disabled">
    <div
      ref="elCaption"
      class="bng-accitem-caption"
      @click="opts.captionClick"
      @keyup.space="opts.captionClick"
      @focus="emit('focus', $event)"
      v-bind="{
        'bng-nav-item': opts.navigable.enabled ? true : undefined,
        'bng-ui-scope': opts.navigable.scope || undefined,
      }"
      v-bng-on-ui-nav:ok.asMouse.focusRequired
      v-bng-on-ui-nav:focus_l,focus_r.focusRequired="navControls">
      <BngIcon
        v-if="!opts.static"
        class="bng-accitem-caption-expander"
        :type="icons.arrowSmallRight"
        @click.stop="opts.expandClick"
        @keyup.space="opts.expandClick" />
      <span ref="elCaptionContent" class="bng-accitem-caption-content">
        <slot name="caption">Unnamed item</slot>
      </span>
      <div v-if="$slots.controls" ref="elCaptionControls" @click.stop class="bng-accitem-caption-controls">
        <slot name="controls"></slot>
      </div>
    </div>
    <Transition :name="opts.animated ? 'bng-acc-trans' : null">
      <div class="bng-accitem-content" v-if="!opts.static && opts.expanded && !opts.disabled">
        <slot>Empty</slot>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, watch, inject, provide, onMounted, onBeforeUnmount } from "vue"
import { vBngDisabled, vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import { collectRects, navigate } from "@/services/crossfire"
import { BngIcon, icons } from "@/common/components/base"

const props = defineProps({
  static: Boolean,
  expanded: Boolean,
  disabled: Boolean,
  animated: Boolean,
  selectable: {
    type: [Boolean, Object],
    default: false,
  },
  selected: Boolean,
  data: {},
  navigable: {
    type: [Boolean, Object],
    default: false,
  },
})

const elCaption = ref()
const elCaptionContent = ref()
const elCaptionControls = ref()

const reg = inject("accordion-item-register")
const unreg = inject("accordion-item-unregister")
const toggle = inject("accordion-item-toggle")
const select = inject("accordion-item-select")

const opts = reactive({
  id: -1,
  captionClick: () => (opts.selectable ? select(opts) : opts.expandClick()),
  expandClick: () => !props.static && toggle(opts),
  static: props.static,
  expanded: props.expanded,
  disabled: props.disabled,
  animated: props.animated,
  selected: props.selected,
  selectable: props.selectable,
  navigable: { enabled: false },
  data: props.data,
})

const emit = defineEmits(["focus", "expanded"])

watch(
  () => props.static,
  val => (opts.static = val)
)
watch(
  () => props.expanded,
  val => !opts.static && toggle(opts, val)
)
watch(
  () => props.disabled,
  val => (opts.disabled = val)
)
watch(
  () => opts.disabled,
  val => !val && props.disabled && (opts.disabled = props.disabled)
)
watch(
  () => props.animated,
  val => (opts.animated = val)
)
watch(
  () => props.selectable,
  val => (opts.selectable = val)
)
watch(
  () => props.selected,
  val => (opts.selected = val)
)
// watch(() => opts.selected, val => childSelect && childSelect(null, val))
watch(
  () => opts.expanded,
  val => {
    emit("expanded", !opts.static && !opts.disabled && val)
    // nextTick(() => val && childSelect && childSelect(null, opts.selected))
  }
)
watch(
  () => props.data,
  val => (opts.data = val)
)

watch(
  () => props.navigable,
  val => {
    if (typeof val !== "object" && typeof val === "boolean" && !val) {
      opts.navigable = { enabled: false }
      return
    }
    opts.navigable = {
      enabled: true,
      scope: null,
      ...(typeof val === "object" ? val : {}),
    }
  },
  { immediate: true }
)
opts.navigable.scope && useUINavScope(opts.navigable.scope)

const navControls = evt => {
  const dir = evt.detail.name === "focus_l" ? "left" : "right"
  let res
  if (elCaptionControls.value) {
    if (evt.target === elCaption.value) {
      // if we're on caption, navigate to controls
      res = navigate(collectRects(dir, elCaptionControls.value), dir, elCaptionContent.value)
    } else {
      // if we're in controls, navigate inside them
      res = navigate(collectRects(dir, elCaption.value), dir)
      // focus on caption if we're on a left-most item in controls
      if (!res && dir === "left") {
        elCaption.value.focus()
        return
      }
    }
  }
  // if nothing is found, navigate elsewhere
  !res && navigate(collectRects(dir), dir, elCaption.value)
}

// for AccordionTree
let childSelect
provide("accordion-item-childSelect", select => (childSelect = (item, value) => opts.selectable && opts.selectable.multi && select(item, value)))
provide("accordion-item-parent", opts)

onMounted(() => reg(opts))
onBeforeUnmount(() => unreg(opts))
</script>

<style lang="scss" scoped>
.bng-accitem {
  flex: 0 0 auto;
  position: relative;
  width: 100%;
  margin: 0.1rem 0;
  text-align: left;

  &[disabled] {
    pointer-events: none;
    opacity: 0.5;
  }

  > .bng-accitem-caption {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    justify-content: stretch;
    align-items: center;
    border-radius: 0.45em;
    transition: background-color 200ms;

    > .bng-accitem-caption-expander {
      flex: 0 0 1em;
      font-size: 1.5em;
      margin-top: -0.075em;
      transition: transform 200ms;
      cursor: pointer;
    }
    > .bng-accitem-caption-content {
      flex: 1 1 auto;
      font-weight: bold;
      color: white;
      user-select: none;
      -webkit-user-select: none;
    }
    > .bng-accitem-caption-controls {
      flex: 0 1 auto;
      display: flex;
      flex-flow: row nowrap;
      justify-content: stretch;
      align-items: center;
      overflow: hidden;
      cursor: initial;
    }
  }

  /// types:
  // bng-accitem-normal -- not static and not selectable
  // bng-accitem-static
  // bng-accitem-expandable
  // bng-accitem-selectable
  /// states:
  // bng-accitem-expanded
  // bng-accitem-selected
  &.bng-accitem-normal > .bng-accitem-caption {
    cursor: pointer;
  }
  &.bng-accitem-expandable > .bng-accitem-caption {
    margin: 0 -0.5rem;
    padding: 0.25rem 0.5rem 0.25rem 0.1rem;
  }
  &.bng-accitem-static > .bng-accitem-caption {
    width: calc(100% + 1rem);
    margin-left: -0.5rem;
    padding: 0.25rem 0.5em 0.25rem 0.75rem;
  }
  &.bng-accitem-static > .bng-accitem-caption {
    > .bng-accitem-caption-content {
      font-weight: normal;
    }
  }
  &.bng-accitem-expanded > .bng-accitem-caption {
    background-color: var(--bng-cool-gray-700);
    > .bng-accitem-caption-expander {
      transform: rotate(90deg);
    }
  }
  &.bng-accitem-selected > .bng-accitem-caption {
    background-image: linear-gradient(90deg, rgba(255, 102, 0, 0.35) 0%, rgba(255, 255, 255, 0) 100%) !important;
  }

  > .bng-accitem-content {
    position: relative;
    display: block;
    padding-left: 1rem;
    > :deep(.bng-accordion-container) {
      // for visually-better tree structure
      padding-left: 0;
      padding-right: 0;
    }
  }

  // note: grid-template-rows trick cannot be used here because our cef does not support its transition
  .bng-acc-trans-enter-active,
  .bng-acc-trans-leave-active {
    transition: transform 200ms ease-in-out, opacity 200ms ease-in-out;
    transform-origin: 0% 0%;
  }
  .bng-acc-trans-enter-from,
  .bng-acc-trans-leave-to {
    opacity: 0;
    transform: scale(1, 0);
  }
  .bng-acc-trans-enter-to,
  .bng-acc-trans-leave-from {
    transform: scale(1, 1);
  }
}
</style>
