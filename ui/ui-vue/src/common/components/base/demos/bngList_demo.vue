<template>
  <div>
    <div class="demo-row">
      <div>
        Default List
        <BngSwitch @click="icons1 = !icons1" :checked="icons1">Icons</BngSwitch>
      </div>
      <BngList :icons="icons1" :items="sampleData1" @click="onSelect" />
    </div>
    <div class="demo-row">
      <div>
        Vehicle part list and path
        <BngSwitch @click="icons2 = !icons2" :checked="icons2">Icons</BngSwitch>
      </div>
      <BngList :tile="BngListItemPart" :icons="icons2" :path="samplePath" :items="sampleData2" @click="onSelect" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { BngList, BngListItemPart, BngSwitch, icons } from "@/common/components/base"
const iconNames = Object.keys(icons)
const randomIcon = () => icons[iconNames[~~(Math.random() * iconNames.length)]]

const icons1 = ref(true)
const icons2 = ref(false)

const sampleData1 = ["String item"]
for (let i = 1; i <= 8; i++) {
  sampleData1.push({
    label: "Object item " + i,
    icon: randomIcon(),
  })
}
sampleData1.push({
  label: "Disabled item",
  icon: randomIcon(),
  disabled: true,
})

const sampleData2 = []
for (let i = 1; i <= 10; i++) {
  const disabled = i > 7
  const itm = {
    name: "Object item " + i,
    icon: randomIcon(),
    integrity: Math.random(),
    color: Array.from({ length: 3 }, () => ~~(Math.random() * 255)),
    category: Math.random() < 0.5, // if it has subparts
    description: !disabled ? "Some description" : "Disabled item",
    tags: ["tag 1", "tag 2"],
    disabled,
    installed: Math.random() < 0.5,
  }
  if (Math.random() < 0.2) {
    itm.name += " long name is long"
    itm.description += " with longer description"
  }
  sampleData2.push(itm)
}

const samplePath = [{ name: "Lorem" }, { name: "Opossum" }, { name: "Dolor" }]

function onSelect(item) {
  console.log(item)
}
</script>

<style scoped>
.demo-row {
  display: block;
  margin-top: 1em;
}
</style>
