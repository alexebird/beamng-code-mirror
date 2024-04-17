<template>
  <Accordion v-if="parts" class="branch-category">
    <PartsBranch
      v-for="part in parts"
      :entry="part"
      :display-names="displayNames"
      :show-auxiliary="showAuxiliary"
      :flat-entry="flatEntry"
      :highlighter="highlighter"
      @select="select"
      @highlight="highlight"
      @change="change" />
  </Accordion>

  <AccordionItem
    v-else-if="(entry.parts && entry.val !== '') || (entry.options && entry.options.length > 0)"
    :static="flatEntry || !entry.parts"
    :class="{ 'item-changed': entry.changed }"
    navigable
    @mouseover.stop="select(entry)"
    @focus.stop="select(entry)">
    <template #caption>
      <span v-bng-highlighter="highlighter">
        {{ displayNames ? entry.name : entry.description }}
      </span>
    </template>
    <template #controls>
      <BngDropdown
        v-if="entry.options"
        v-model="entry.val"
        :items="entryOpts"
        :highlight="highlighter"
        :show-search="entryOpts.length > 5"
        long-names="cut"
        @valueChanged="change(entry)"
        @focus="select(entry)" />
      <BngButton
        accent="text"
        :class="{ 'visibility-toggle': true, 'visibility-toggle-on': entry.highlight }"
        _:icon="entry.highlight ? icons.eyeSolidOpened : icons.eyeSolidClosed"
        @click="toggleHighlight(entry)"
        bng-nav-item
        bng-ui-scope="vehconfig-parts-branch-bng-button"
        v-bng-on-ui-nav:ok.asMouse.focusRequired>
        <!-- TODO: remove min-* overrides when base :icon button styles will be finalised -->
        <BngIcon :type="entry.highlight ? icons.eyeSolidOpened : icons.eyeSolidClosed" />
      </BngButton>
    </template>

    <PartsBranch
      v-if="!flatEntry && entry.parts"
      :parts="entry.parts"
      :display-names="displayNames"
      :show-auxiliary="showAuxiliary"
      :highlighter="highlighter"
      @select="select"
      @highlight="highlight"
      @change="change" />
  </AccordionItem>
</template>

<script setup>
import { computed } from "vue"
import { BngDropdown, BngButton, BngIcon, icons } from "@/common/components/base"
import { vBngHighlighter, vBngOnUiNav } from "@/common/directives"
import { useUINavScope } from "@/services/uiNav"
import { Accordion, AccordionItem } from "@/common/components/utility"
import PartsBranch from "./PartsBranch.vue"

useUINavScope("vehconfig-parts-branch")

const props = defineProps({
  parts: {
    type: Array,
    default: undefined,
  },
  entry: {
    type: Object,
    default: {},
  },
  flatEntry: Boolean,
  displayNames: Boolean,
  showAuxiliary: Boolean,
  highlighter: [String, Array, RegExp],
})

const emit = defineEmits(["select", "highlight", "change"])
const select = entry => emit("select", entry)
const highlight = entry => emit("highlight", entry)
const change = entry => emit("change", entry)

function toggleHighlight(entry) {
  entry.highlight = !entry.highlight
  highlight(entry)
}

const entryOpts = computed(() => props.entry.options.filter(opt => !opt.isAuxiliary || props.showAuxiliary || props.entry.val === opt.val))
</script>

<style lang="scss" scoped>
.branch-category > :deep(.bng-accitem) {
  &.bng-accitem-expanded > .bng-accitem-caption .bng-dropdown {
    // make dropdown a bit darker in caption of expanded item
    background-color: var(--bng-cool-gray-800);
  }
  > .bng-accitem-caption,
  > .bng-accitem-content {
    padding-top: 0rem;
    padding-bottom: 0rem;
  }
}

.item-changed > :deep(.bng-accitem-caption) {
  background-image: linear-gradient(90deg, rgba(255, 102, 0, 0.35) 0%, rgba(255, 255, 255, 0) 100%) !important;
}

:deep(.bng-accitem-caption-controls) {
  flex: 0 1 auto;
}

.visibility-toggle {
  min-width: unset !important;
  min-height: unset !important;
  > * {
    font-size: 1.5em !important;
    opacity: 0.8;
  }
  &:not(.visibility-toggle-on) > * {
    opacity: 0.5;
  }
}
</style>
