<template>
  <BngSwitch v-model="animated">Animated</BngSwitch>
  <BngSwitch v-model="singular">Single expanded item</BngSwitch>
  <BngSwitch v-model="expanded" :disabled="singular">Expand all</BngSwitch>
  <BngSwitch v-model="items[4].disabled">Disable 5th</BngSwitch>
  <BngSwitch v-model="disabled">Disable all</BngSwitch>

  <BngButton @click="addItem()">Add new item</BngButton>
  <BngButton @click="remItem()">Remove last item</BngButton>

  <div class="accrow">
    <div>
      <h3>Example</h3>
      <Accordion :singular="singular" :animated="animated" :expanded="expanded" :disabled="disabled">
        <AccordionItem v-for="(item, idx) of items" :static="item.static" :expanded="item.expanded" :disabled="item.disabled">
          <template #caption>
            {{ item.caption }}
          </template>
          <template #controls>
            <BngButton @click.stop="remItem(idx)">Remove</BngButton>
          </template>
          {{ item.content }}
        </AccordionItem>
      </Accordion>
    </div>
    <div>
      <h3>Basic tree-like structure</h3>
      <Accordion :singular="singular" :animated="animated" :expanded="expanded" :disabled="disabled">
        <AccordionItem v-for="(item, idx) of items" :static="item.static" :expanded="item.expanded" :disabled="item.disabled">
          <template #caption>
            {{ item.caption }}
          </template>
          <template #controls>
            <BngButton @click.stop="remItem(idx)">Remove</BngButton>
          </template>
          <Accordion :singular="singular" :animated="animated">
            <AccordionItem v-for="(item, idx) of items" :static="item.static" :disabled="item.disabled">
              <template #caption>
                {{ item.caption }}
              </template>
              <template #controls>
                <BngButton @click.stop="remItem(idx)">Remove</BngButton>
              </template>
              <Accordion :singular="singular" :animated="animated">
                <AccordionItem v-for="(item, idx) of items" :static="item.static" :disabled="item.disabled">
                  <template #caption>
                    {{ item.caption }}
                  </template>
                  <template #controls>
                    <BngButton @click.stop="remItem(idx)">Remove</BngButton>
                  </template>
                  <Accordion :singular="singular" :animated="animated">
                    <AccordionItem v-for="(item, idx) of items" :static="item.static" :disabled="item.disabled">
                      <template #caption>
                        {{ item.caption }}
                      </template>
                      <template #controls>
                        <BngButton @click.stop="remItem(idx)">Remove</BngButton>
                      </template>
                      {{ item.content }}
                    </AccordionItem>
                  </Accordion>
                </AccordionItem>
              </Accordion>
            </AccordionItem>
          </Accordion>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { BngSwitch, BngButton } from "@/common/components/base"
import { Accordion, AccordionItem } from "@/common/components/utility"

const singular = ref(false)
const expanded = ref(false)
const disabled = ref(false)
const animated = ref(false)

const items = ref([])

for (let i = 1; i <= 10; i++) {
  const isStatic = [4, 9].includes(i)
  const isExpanded = [2, 5, 7].includes(i)
  items.value.push({
    static: isStatic,
    caption: `Item ${i}`,
    content: `Content for the item ${i}` + (isExpanded ? ", expanded by default" : ""),
    expanded: isExpanded,
    disabled: false,
  })
}

function addItem() {
  items.value.push({
    caption: `Item ${items.value.length + 1}`,
    content: `Content for the item ${items.value.length + 1}`,
  })
}

function remItem(idx = -1) {
  items.value.splice(idx, 1)
}
</script>

<style lang="scss" scoped>
.accrow {
  // font-size: 1rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  > * {
    flex: 0 0 49.5%;
    width: 49.5%;
  }
}
:deep(.bng-accitem-caption) {
  .bng-button {
    font-size: 0.9em;
    top: -0.1em;
    margin: -0.2em 0;
    padding-top: 0;
    padding-bottom: 0.2em;
    min-height: unset;
  }
  &:not(:hover) .bng-button {
    display: none;
  }
}
</style>
