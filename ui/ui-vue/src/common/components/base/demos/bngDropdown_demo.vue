<template>
  <div class="dropdemo">
    <div>
      <h3>Default</h3>
      <BngDropdown v-model="value" :items="itemsMany" @valueChanged="onValueChanged" />
    </div>
    <div>
      <h3>Disabled</h3>
      <BngDropdown v-model="value" :items="items" disabled />
    </div>
    <div>
      <h3>With custom text</h3>
      <BngDropdown v-model="value" :items="items" @valueChanged="onValueChanged">
        <template #display v-if="!value"> Choose an item here </template>
        <template #display v-if="value"> {{ items.find(itm => itm.value === value).label }} selected, great! </template>
      </BngDropdown>
    </div>
    <div>
      <h3>With a highlighter</h3>
      Highlight: <input v-model.trim="highlight" />
      <br />
      <BngDropdown v-model="value" :items="items" :highlight="highlight" @valueChanged="onValueChanged" />
    </div>
    <div>
      <h3>With a search field</h3>
      <BngDropdown v-model="value" :items="itemsMany" :show-search="true" @valueChanged="onValueChanged" />
    </div>
    <div>
      <h3>With a different long name handling</h3>
      <BngPillCheckbox v-for="val in longNamesList" :marked="longNames === val" @click="longNames = val">{{ val }}</BngPillCheckbox>
      <BngDropdown class="long-names" v-model="value" :items="itemsMany" :long-names="longNames" @valueChanged="onValueChanged" />
    </div>
    <div>
      <h3>Dropdown container with custom content</h3>
      <BngDropdownContainer>
        <BngList class="inner-list" :items="sampleList" icons style="width: 30em" />
      </BngDropdownContainer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue"
import { BngDropdown, BngDropdownContainer, BngPillCheckbox, BngList, icons } from "@/common/components/base"

const itemsMany = [
  { label: "Item one", value: 1 },
  { label: "Item two", value: 2 },
  { label: "Item three", value: 3 },
  { label: "Item four", value: 4 },
  { label: "Item five", value: 5 },
  { label: "Item six", value: 6 },
  { label: "Item seven", value: 7 },
  { label: "Item eight", value: 8 },
  { label: "Item nine", value: 9 },
  { label: "Item ten", value: 10 },
  { label: "Item eleven", value: 11 },
  { label: "Item twelve", value: 12 },
  { label: "Item thirteen", value: 13 },
  { label: "Item fourteen", value: 14 },
  { label: "Item fifteen", value: 15 },
  { label: "Item sixteen", value: 16 },
  { label: "Item seventeen", value: 17 },
  { label: "Item eighteen", value: 18 },
  { label: "Item nineteen", value: 19 },
  { label: "Item twenty", value: 20 },
]

const items = itemsMany.slice(0, 3)

const iconNames = Object.keys(icons)
const randomIcon = () => icons[iconNames[~~(Math.random() * iconNames.length)]]

const sampleList = []
for (let i = 1; i <= 10; i++) {
  sampleList.push({
    label: "Object item " + i,
    icon: randomIcon(),
  })
}

const value = ref(null)

const highlight = ref("two")

const onValueChanged = value => {
  console.log("event listener: value changed", value)
}

const stopWatcher = watch(
  () => value.value,
  (current, prev) => {
    console.log("watcher: dropdown value changed", current)
  }
)

const longNames = ref("oneline")
const longNamesList = ["oneline", "wrap", "cut"]

onUnmounted(() => stopWatcher())
</script>

<style lang="scss" scoped>
.dropdemo {
  display: flex;
  flex-flow: row wrap;
  > * {
    flex: 0 1 30%;
    width: 30%;
    margin: 1em 1%;
  }
}

.inner-list {
  max-height: 100%;
}

.long-names {
  width: 5em;
}
</style>
