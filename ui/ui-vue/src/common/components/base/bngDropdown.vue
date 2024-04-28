<!-- bngDropdown - a dropdown component -->
<template>
  <BngDropdownContainer
    v-bind="$attrs"
    v-model="opened"
    :disabled="disabled"
    :class="{
      'with-search': showSearch,
      [`dropdown-longnames-${longNames}`]: true
    }"
    @provideFocus="getFocusContainer">
    <template #display>
      <slot name="display">
        <span class="dropdown-display" v-bng-highlighter="highlighter">{{ headerText }}</span>
      </slot>
    </template>
    <div v-if="showSearch" class="dropdown-search">
      <BngInput v-model.trim="search" floating-label="Search" />
    </div>
    <!-- TODO: should we show this when there are no elements at all, not just because of search? -->
    <div v-if="search && itemsView.length === 0">
      <!-- FIXME: move this to a common string -->
      {{ $t("ui.repository.no_mods_found") }}
    </div>
    <div v-else
      v-for="(item, idx) in itemsView"
      class="dropdown-option"
      bng-nav-item
      bng-ui-scope="bng-dropdown-option"
      v-bng-on-ui-nav:ok.asMouse.focusRequired
      :class="{ selected: selectedItem && selectedItem.value === item.value }"
      :key="item.value"
      :tabindex="tabIndexValue"
      @click="select(item)"
      @keyup.enter="select(item)"
      v-bng-focus-if="(selectedItem && selectedItem.value === item.value) || idx === 0"
      v-bng-highlighter="highlighter">
      {{ item.label }}
    </div>
  </BngDropdownContainer>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { BngDropdownContainer, BngInput } from "@/common/components/base"
import { vBngHighlighter, vBngFocusIf, vBngOnUiNav } from "@/common/directives"

const props = defineProps({
  modelValue: {
    type: [Number, String, Boolean, Object],
  },
  items: {
    type: Array,
    required: true,
  },
  showSearch: Boolean,
  highlight: {
    type: [String, Array, RegExp],
  },
  disabled: Boolean,
  longNames: {
    type: String,
    default: "oneline",
    validator: val => ["oneline", "wrap", "cut"].includes(val),
  },
})

const emit = defineEmits(["update:modelValue", "valueChanged"])

const opened = ref(false)

const search = ref("")
const searchTerm = computed(() => search.value.toLowerCase())

// reset search on close
watch(() => opened.value, val => !val && (search.value = ""))

const itemsView = computed(() => (searchTerm.value ? props.items.filter(itm => itm.label.toLowerCase().indexOf(searchTerm.value) > -1) : props.items))
const highlighter = computed(() => search.value || props.highlight)

const selectedValue = computed({
  get: () => props.modelValue,
  set: newValue => notifyListeners(newValue),
})
const selectedItem = computed(() => props.items.find(x => x.value === selectedValue.value))
const headerText = computed(() =>
  selectedItem.value && selectedItem.value.value !== null && selectedItem.value.value !== undefined ? selectedItem.value.label : "Select"
)
const tabIndexValue = computed(() => (props.disabled ? -1 : 0))

let focusContainer = () => {}
const getFocusContainer = focus => (focusContainer = focus)

const select = item => {
  opened.value = false
  if (selectedValue.value !== item.value) selectedValue.value = item.value
  focusContainer()
}

const notifyListeners = value => {
  emit("update:modelValue", value)
  emit("valueChanged", value)
}
</script>

<style lang="scss" scoped>
.dropdown-option {
  flex: 1 0 auto !important;
  padding: 0.25em 0.5em;
  position: relative;
  cursor: pointer;

  // override for focus frame
  &::before {
    top: 0px !important;
    left: 0px !important;
    right: 0px !important;
    bottom: 0px !important;
  }

  &.selected {
    background-color: var(--bng-orange-b400);
  }
}

.with-search {
  padding-top: 0;
}

.dropdown-search {
  position: sticky;
  display: inline-block;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 2.2em;
  z-index: 1;
  > * {
    margin-top: -0.3em;
    background-color: rgba(#aaa, 0.8);
  }
}

.dropdown-longnames-oneline {
  .dropdown-display,
  .dropdown-option {
    white-space: nowrap;
  }
}
.dropdown-longnames-wrap {
  .dropdown-display,
  .dropdown-option {
    white-space: normal;
  }
}
.dropdown-longnames-cut {
  .dropdown-display,
  .dropdown-option {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

</style>
