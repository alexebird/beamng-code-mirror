<template>
  <BngSwitch v-model="itemClass">Styling example</BngSwitch>
  <BngSwitch v-model="multi">Multiselect</BngSwitch>

  <div class="accrow">
    <div>
      <h3>AccordionTree</h3>
      <AccordionTree
        :class="{ 'alt-style': itemClass }"
        :data="data"
        data-field="items"
        __content-field="content"
        selected-field="selected"
        :selectable="{ multi }"
      >
        <template #caption="{ entry }">
          {{ entry.caption }}
        </template>
        <template #controls="{ entry }">
          {{ "items" in entry ? "dir" : "item" }}
        </template>
        <template #default="{ entry }">
          {{ entry.content }}
        </template>
      </AccordionTree>
    </div>
    <div>
      <h3>Parameters</h3>
      <p>
        <span class="pre">data</span> (required)<br/>
        Object or array of objects.
      </p>
      <p>
        <span class="pre">data-field</span> (required)<br/>
        Where array of objects for the next element is.
      </p>
      <p>
        <span class="pre">props-field</span><br/>
        Field name pointing to object with props of an element.
      </p>
      <p>
        <span class="pre">content-field</span><br/>
        Where custom content for expandable item is.
        Can be combined with items (they will go after).
      </p>
      <p>
        <span class="pre">selected-field</span><br/>
        If you want to automatically change the value in data, specify a boolean field name.
      </p>
      <p>
        <span class="pre">selectable</span><br/>
        Enable selectability on a tree.
        Can be boolean or object with selection options, such as <span class="pre">{ multi: true }</span> to enable multiselect mode.<br/>
        When enabled, items can be expanded by clicking on arrow only.
      </p>
    </div>
    <div>
      <h3>Data</h3>
      <textarea readonly>{{ JSON.stringify(data, null, 2) }}</textarea>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { AccordionTree } from "@/common/components/utility"
import { BngSwitch } from "@/common/components/base"

const itemClass = ref(false)
const multi = ref(true)

const data = ref({})

function genItems(lvl = -1) {
  const items = []
  const nested = lvl > -1
  for (let i = 1; i <= (nested ? 5 : 10); i++) {
    // const isExpanded = [2, 5, 7].includes(i)
    const item = {
      caption: `Item ${i}`,
      content: `Content for the item ${i}`,
      selected: false,
      // selected: Math.random() > 0.7,
      // expanded: isExpanded,
      // disabled: false,
    }
    ++lvl < 5 && Math.random() > (nested ? 0.2 : 0.3) && (item.items = genItems(lvl))
    items.push(item)
  }
  return items
}

data.value = genItems()
</script>

<style lang="scss" scoped>
.accrow {
  // font-size: 1rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  > * {
    flex: 0 0 33%;
    width: 33%;
  }
}
.pre {
  font-family: monospace;
}
textarea {
  width: 100%;
  height: 70vh;
  font-size: 0.8rem;
}

.alt-style :deep(.bng-accitem) {
  /// types:
  // bng-accitem-normal -- not static and not selectable
  // bng-accitem-static
  // bng-accitem-expandable
  // bng-accitem-selectable
  /// states:
  // bng-accitem-expanded
  // bng-accitem-selected
  /// nested elements:
  // bng-accitem-caption
  // > bng-accitem-caption-expander
  // > bng-accitem-caption-content
  // > bng-accitem-caption-controls
  // bng-accitem-content
  > .bng-accitem-caption {
    height: 3em;
    background-color: rgba(120, 120, 120, 0.5);
    border-radius: unset;
    &:hover {
      background-color: rgba(120, 120, 120, 0.65);
    }
  }
  &.bng-accitem-static > .bng-accitem-caption {
    padding-left: 1.75rem;
  }
}
</style>
