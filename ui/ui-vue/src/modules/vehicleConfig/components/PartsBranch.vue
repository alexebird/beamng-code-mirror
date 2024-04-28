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
    arrow-big
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
  > .bng-accitem-caption {
    align-items: first baseline;
    .bng-accitem-caption-expander {
      margin-bottom: -0.2em;
      align-self: unset;
    }
  }
  // &:not(.bng-accitem-expanded) > .bng-accitem-caption > .bng-accitem-caption-content {
  //   display: flex;
  //   flex-flow: row nowrap;
  //   align-items: center;
  //   justify-content: stretch;
  //   > {
  //     flex: 0 1 auto;
  //   }
  //   &::after {
  //     flex: 1 1 auto;
  //     content: "";
  //     display: inline-block;
  //     height: 0px;
  //     border-bottom: 1px dashed #666;
  //   }
  // }
  > .bng-accitem-caption {
    padding-right: 0.1em;
    .bng-dropdown,
    .visibility-toggle {
      background-color: rgba(var(--bng-cool-gray-800-rgb), 0.75);
    }
  }
  &.bng-accitem-expanded > .bng-accitem-caption {
    // change backgrounds in expanded item
    .bng-dropdown,
    .visibility-toggle {
      background-color: rgba(var(--bng-cool-gray-600-rgb), 0.8);
    }
  }
  > .bng-accitem-caption,
  > .bng-accitem-content {
    padding-top: 0rem;
    padding-bottom: 0rem;
  }
  > .bng-accitem-content {
    $pad: 0.25em;
    background-image: linear-gradient(
      to right,
      transparent calc($pad - 0.15em),
      #fff3 calc($pad - 0.15em) calc($pad + 0.1em),
      #fff2 calc($pad + 0.1em),
      #fff0 5em
    );
  }
}

.item-changed > :deep(.bng-accitem-caption) {
  background-image: linear-gradient(90deg, rgba(255, 102, 0, 0.35) 0%, rgba(255, 255, 255, 0) 100%) !important;
}

:deep(.bng-accitem-caption-controls) {
  flex: 0 0 15em !important;
  width: 15em;
  display: flex;
  flex-flow: row nowrap;
  .bng-dropdown {
    flex: 1 1 auto;
  }
}

.visibility-toggle {
  min-width: unset !important;
  min-height: unset !important;
  height: 2em;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 0;
  > * {
    font-size: 1.5em !important;
    opacity: 0.8;
  }
  &:not(.visibility-toggle-on) > * {
    opacity: 0.5;
  }
}
</style>
