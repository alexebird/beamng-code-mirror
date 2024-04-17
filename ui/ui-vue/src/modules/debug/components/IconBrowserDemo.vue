<template>
  <div class="layout">
    <div>
      <BngSwitch v-model="useIconsObject">Use objects in attributes</BngSwitch>
      (see instructions below)

      <h2>BngIcon</h2>
      Icon: <BngDropdown class="icon-list" v-model="iconPreview" :items="iconList" show-search />
      <div class="row">
        <BngColorPicker v-model="colour.icon" view="simple" />
        <div class="center">
          <BngIcon class="icon-preview" :type="icons[iconPreview]" :color="colour.iconHex" />
          <div>Tags: {{ icons[iconPreview].tags.join(", ") }}</div>
        </div>
      </div>
      <BngInput v-model="iconHtml" readonly />

      <h2>BngIconMarker</h2>
      <div class="row three">
        <div class="nowrap">Backdrop: <BngDropdown class="icon-list" v-model="iconMarker" :items="markerList" /></div>
        <div class="nowrap">Point to side: <BngDropdown class="icon-list" v-model="markerPoint" :items="markerPointList" /></div>
        <div class="nowrap center"><BngSwitch v-model="useMarkerIcon">Use icon</BngSwitch></div>
      </div>
      <div class="row three">
        <div>
          <span class="bold">Back side (outline)</span>
          <BngColorPicker v-model="colour.back" view="simple" />
        </div>
        <div>
          <span class="bold">Front side (under icon)</span>
          <BngColorPicker v-model="colour.front" view="simple" />
        </div>
        <div class="center">
          <br />
          <BngIconMarker
            class="icon-preview"
            :type="useMarkerIcon ? icons[iconPreview] : undefined"
            :marker="iconMarker"
            :point="markerPoint"
            :color="colour.markerHex" />
        </div>
      </div>
      <BngInput v-model="markerHtml" readonly />

      <h2>Importing (wrong, please ignore for now)</h2>
      <div>
        To import component, add this line to <span class="tt">&lt;script setup&gt;</span>:<br />
        <span class="tt">import { BngIcon, BngIconMarker } from "@/common/components/base"</span><br />
        <br />
        To import icons object, also add this line:<br />
        <span class="tt">import { icons } from "@/common/components/base"</span><br />
        Or same for BngIconMarker:<br />
        <span class="tt">import { icons, markers, markerPoints } from "@/common/components/base/bngIconMarker.vue"</span><br />
      </div>
    </div>

    <div>
      <!-- sizes -->
      <Accordion :singular="true">
        <AccordionItem v-for="(tags, size) in iconTree" :expanded="size === '24'" :selected="icons[iconPreview].size == size">
          <template #caption>Size: {{ size }}</template>
          <template #controls>{{ Object.keys(iconsBySize[size]).length }} icons</template>
          <span v-if="size === '24'">Those icons are suittable for most cases</span>
          <span v-else-if="size === '48'">Those icons are made for big buttons</span>
          <span v-else-if="size === '56'">Backdrop icons</span>
          <!-- tags -->
          <Accordion>
            <AccordionItem v-for="tag in tags" :selected="icons[iconPreview].size == size && icons[iconPreview].tags.includes(tag.name)">
              <template #caption>{{ tag.name }}</template>
              <template #controls>{{ tag.icons.length }} icons</template>
              <!-- icons -->
              <Accordion>
                <AccordionItem v-for="name in tag.icons" class="icon-entry" static :selected="iconPreview === name" @click="iconPreview = name">
                  <template #caption>
                    <BngIcon :type="icons[name]" />
                    {{ name }}
                  </template>
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
import { ref, computed, reactive } from "vue"
import { BngIcon, BngIconMarker, BngDropdown, BngColorPicker, BngInput, BngSwitch, icons, iconsBySize } from "@/common/components/base"
import { Accordion, AccordionItem } from "@/common/components/utility"
import { markers, markerPoints } from "@/common/components/base/bngIconMarker.vue"
import { HSLToRGB, RGBToHex3 } from "@/utils/color"

const sorter = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())

const iconTree = Object.keys(iconsBySize).reduce((res, size) => {
  !(size in res) && (res[size] = [])
  const tags = []
  for (const [name, icon] of Object.entries(iconsBySize[size])) {
    for (const tag of icon.tags) {
      let idx = tags.indexOf(tag)
      if (idx === -1) {
        res[size].push({ name: tag, icons: [] })
        idx = tags.length
        tags.push(tag)
      }
      res[size][idx].icons.push(name)
    }
  }
  res[size].sort((a, b) => sorter(a.name, b.name))
  return res
}, {})

const iconPreview = ref("aperture")
const iconList = Object.keys(icons)
  .sort(sorter)
  .map(name => ({ label: `${name} (${icons[name].size})`, value: name }))

const iconMarker = ref("circlePin")
const markerList = markers.map(name => ({ label: name, value: name }))
const markerPoint = ref("down")
const markerPointList = markerPoints.map(point => ({ label: point, value: point }))

const hsl2hex = hsl => "#" + RGBToHex3(HSLToRGB(hsl.hue, hsl.saturation, hsl.luminosity))
const colour = reactive({
  icon: { hue: 0.067, saturation: 1, luminosity: 0.5 },
  back: { hue: 0.067, saturation: 1, luminosity: 0.5 },
  front: { hue: 0.5, saturation: 0.75, luminosity: 0.1 },
  iconHex: computed(() => hsl2hex(colour.icon)),
  backHex: computed(() => hsl2hex(colour.back)),
  frontHex: computed(() => hsl2hex(colour.front)),
  markerHex: computed(() => (colour.backHex === colour.iconHex ? [colour.backHex, colour.frontHex] : [colour.backHex, colour.frontHex, colour.iconHex])),
})

const useIconsObject = ref(false)
const useMarkerIcon = ref(true)

const attrHtml = (attr, obj, icon) => (useIconsObject.value ? `:${attr}="${obj}.${icon}"` : `${attr}="${icon}"`)
const iconHtml = computed(
  () => `${useIconsObject.value ? "" : "Wrong, please ignore for now  "}<BngIcon ${attrHtml("type", "icons", iconPreview.value)} color="${colour.iconHex}" />`
)
const markerHtml = computed(() => {
  const res = [`${useIconsObject.value ? "" : "Wrong, please ignore for now  "}<BngIconMarker`]
  useMarkerIcon.value && res.push(attrHtml("type", "icons", iconPreview.value))
  res.push(attrHtml("marker", "markers", iconMarker.value))
  markerPoint.value !== "down" && res.push(attrHtml("point", "markerPoints", markerPoint.value))
  res.push(`:color = "[${colour.markerHex.map(c => `"${c} "`).join(", ")}]"`)
  res.push("/>")
  return res.join(" ")
})
</script>

<style lang="scss" scoped>
.tt {
  font-family: monospace;
  background-color: #aaa3;
  padding: 0 0.3em;
}

.layout {
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  > * {
    flex: 0 0 50%;
    width: 50%;
    overflow: auto;
  }
}

.row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  > * {
    flex: 0 0 48%;
    width: 48%;
  }
  &.three > * {
    flex: 0 0 32%;
    width: 32%;
  }
}

.center {
  text-align: center;
}

.nowrap {
  white-space: nowrap;
}

.bold {
  font-weight: 600;
}

:deep(.icon-list) {
  display: inline-flex;
}

.icon-preview {
  font-size: 5em;
  border: 1px dashed #aaa;
}

.icon-entry {
  cursor: pointer;
}
</style>
