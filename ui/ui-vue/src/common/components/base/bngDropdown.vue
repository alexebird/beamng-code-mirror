<!-- bngDropdown - a dropdown component -->
<template>
  <div
    v-bind="$attrs"
    ref="bngDropdownRef"
    class="bng-dropdown"
    :class="{ disabled: disabled }"
    :tabindex="tabIndexValue"
    @click="disabled ? null : clicked()"
    @focusout="focusedOut"
  >
    <BngIcon class="dropdownArrow" span :type="icons.arrow.small.right" :class="{ opened: showOptions }" />
    <slot name="display">{{ headerText }}</slot>
  </div>
  <div ref="dropdown" v-bng-auto-scroll:top v-show="showOptions" class="dropdown-options">
    <div
      v-for="item in items"
      class="dropdown-option"
      bng-nav-item
      :class="{ selected: selectedItem && selectedItem.value === item.value }"
      :key="item.value"
      :tabindex="tabIndexValue"
      @click="select(item)"
      @keyup.enter="select(item)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated, onUnmounted } from "vue"
import { createPopper } from "@popperjs/core"
import { vBngAutoScroll } from "@/common/directives"
import { BngIcon } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const props = defineProps({
  modelValue: {
    type: [Number, String, Boolean, Object],
  },
  items: {
    type: Array,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(["update:modelValue", "valueChanged"])

const bngDropdownRef = ref(null)
const dropdown = ref(null)
const showOptions = ref(false)

const selectedValue = computed({
  get: () => props.modelValue,
  set: newValue => notifyListeners(newValue),
})
const selectedItem = computed(() => props.items.find(x => x.value === selectedValue.value))
const headerText = computed(() =>
  selectedItem.value && selectedItem.value.value !== null && selectedItem.value.value !== undefined ? selectedItem.value.label : "Select"
)
const tabIndexValue = computed(() => (props.disabled ? -1 : 0))

const clicked = () => setShowOptions(!showOptions.value)

const focusedOut = $event => {
  const isInsideBngDropdown = $event.relatedTarget && bngDropdownRef.value.contains($event.relatedTarget)
  const isInsideDropdown = $event.relatedTarget && dropdown.value.contains($event.relatedTarget)
  if (!isInsideBngDropdown && !isInsideDropdown) {
    setShowOptions(false)
  }
}

const select = item => {
  setShowOptions(false)
  selectedValue.value = item.value
}

const setShowOptions = show => (showOptions.value = show)

const notifyListeners = value => {
  emits("update:modelValue", value)
  emits("valueChanged", value)
}

let popperInstance = null

onMounted(() => {
  popperInstance = createPopper(bngDropdownRef.value, dropdown.value, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 4],
        },
      },
    ],
  })
})

onUpdated(async () => {
  await popperInstance.update()
})

onUnmounted(() => {
  if (popperInstance) popperInstance.destroy()
})
</script>

<style scoped lang="scss">
@import "@/styles/modules/mixins";
.bng-dropdown {
  $f-offset: 0.25rem;
  $rad: $border-rad-1;

  display: flex;
  align-items: center;

  position: relative;
  padding: 0.25em 0.5em;
  border-radius: $rad;
  background: var(--bng-cool-gray-700);
  cursor: pointer;
  user-select: none;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  min-width: 6em;
  // font-size: inherit;
  // line-height: 1.25em;
  padding-left: 1.5em;
  pointer-events: auto;

  & > .dropdownArrow {
    width: 1.5em;
    height: 1.5em;
    position: absolute;
    left: 0;
    top: calc(50% - 0.75em);
    transition: all 100ms ease-in-out;
    &.opened {
      transform: rotate(90deg);
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
  &.disabled {
    pointer-events: none;
    background: var(--bng-cool-gray-800);
    color: var(--bng-cool-gray-600);

    &:focus::before {
      display: none;
    }
    & > .dropdownArrow {
      background-color: var(--bng-cool-gray-600) !important;
    }
  }
}

.dropdown-options {
  position: absolute;
  margin-top: 0.25em;
  background: grey;
  max-height: 20rem;
  overflow-y: auto;
  z-index: 10000;
  padding: 0.25rem;

  > .dropdown-option {
    padding: 0.25em 0.5em;
    position: relative;
    cursor: pointer;

    &.selected {
      background: var(--bng-orange-b400);
    }
  }
}
</style>
