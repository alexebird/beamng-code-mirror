<template>
  <div class="components-demo">
    <h1>BNG UI Component Demos</h1>
    <div class="demo-layout">
      <div class="index">
        <span v-for="[listName, componentList] in Object.entries(componentLists)" :key="listName">
          <h3>{{listName}}</h3>
          <ul class="components-list">
            <li
              :class="{ current: current == component.name }"
              v-for="component in componentList"
              :key="component"
              @click="() => loadDemo(component.name)"
            >
              {{ component.name }}
            </li>
          </ul>
        </span>
      </div>
      <div class="demo" :class="[current]">
        <component v-if="demoView" :is="demoView" />
        <div v-else>No {{ current }} demo available</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as BaseComponentExports from "@/common/components/base"
import * as UtilityComponentExports from "@/common/components/utility"
import * as DirectiveExports from "@/common/directives"
import * as LayoutExports from "@/common/layouts"
import PairingTest from "../components/PairingTest.vue"
import PopupDemo from "../components/PopupDemo.vue"
import { computed, ref } from "vue"

const current = ref("")

const demoView = computed(() => getDemo(current.value))

const getDemo = name => ({
  ...BaseComponentExports,
  ...UtilityComponentExports,
  ...DirectiveExports,
  ...LayoutExports,
  PairingTestDemo: PairingTest,
  PopupDemo,
}[`${name}Demo`])

const makeComponentsList = exportedComponents => Object.keys(exportedComponents)
  .filter(name => !name.endsWith("Demo"))
  .map(name => ({ name, hasDemo: !!exportedComponents[`${name}Demo`] }))
  .filter(component => component.hasDemo)

const componentLists = {
  'Base' : makeComponentsList(BaseComponentExports),
  'Utility': makeComponentsList(UtilityComponentExports),
  'Directives': makeComponentsList(DirectiveExports),
  'Layouts': makeComponentsList(LayoutExports),
  'Special': [
    { name: "PairingTest" },
    { name: "Popup" },
  ]
}

function loadDemo(component) {
  current.value = component
}
</script>

<style lang="scss" scoped>
$bgcolor: var(--bng-black-o8);
$textcolor: #fff;
$highlight_textcolor: #fff;
$hasdemo_textcolor: var(--bng-orange-100);
$current_background_color: var(--bng-cool-gray-700);
$fontsize: 18px;

.components-demo {
  padding: 50px;
  background-color: $bgcolor;
  color: $textcolor;
  font-size: $fontsize;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.index {
  overflow-y: auto;
}

.demo-layout {
  display: flex;
  position: absolute;
  /* top: 0; */
  right: 0;
  left: 60px;
  bottom: 0;
  top: 150px;
}
.demo {
  width: calc(100% - 12em);
  margin: 1em;
  position: relative;
  border: 1px solid #333;
  border-radius: 0.5em;
  padding:1em;
  overflow-y: auto;
}
.demo.BngTooltip {
  overflow-x: visible;
  overflow-y: visible;
}

.layout-test {
  border: 1px dotted #ccc;
  .layout-baseline {
    position: relative;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100vw;
      $testbrd: 1px dashed #f0f;
      border: {
        top: $testbrd;
        bottom: $testbrd;
      };
      pointer-events: none;
    }
  }
}

.components-list {
  margin: 0;
  list-style: none;
  padding: 0;
  li {
    padding: 0.25em 0.5em;
    border-radius: 0.25em;
    cursor: pointer;
    margin: 0;
    color: $hasdemo_textcolor;
    &.current {
      background-color: $current_background_color;
      color: var(--bng-orange-b400);
    }
    &:hover {
      color: $highlight_textcolor;
    }
  }
}
</style>
