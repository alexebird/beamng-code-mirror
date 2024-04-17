<!-- Tabs Demo -->
<template>
  <h2>Class: bng-tabs</h2>
  <Tabs class="bng-tabs" @change="handleChange">
    <Tab heading="Tab 1" marked>I am the first tab!</Tab>
    <Tab heading="Tab 2">The second tab...</Tab>
    <Tab heading="Tab 3" :selected="true">Tab three</Tab>
    <Tab heading="Tab 4">The final tab in the set</Tab>
  </Tabs>

  <h2>Class: none</h2>
  <Tabs>
    <Tab heading="aaTab 1">bbbI am the first tab!</Tab>
    <Tab heading="aaTab 2">bbbThe second tab...</Tab>
    <Tab heading="aaTab 3">bbbTab three</Tab>
    <Tab heading="aaTab 4">bbbThe final tab in the set</Tab>
  </Tabs>

  <h2>With 2 TabLists (and blurs)</h2>
  <Tabs class="bng-tabs" @change="handleChange">
    <TabList v-bng-blur />
    <Tab heading="Tab 1" marked>I am the first tab!<br/><br/></Tab>
    <Tab heading="Tab 2">The second tab...<br/><br/></Tab>
    <Tab v-bng-blur heading="Tab 3" :selected="true">Tab three<br/><br/></Tab>
    <Tab heading="Tab 4">The final tab in the set<br/><br/></Tab>
    <br/>
    <TabList v-bng-blur />
  </Tabs>
</template>

<script setup>
import { Tabs, Tab, TabList } from "@/common/components/utility"
import { vBngBlur } from "@/common/directives"

const handleChange = (tab, old) => {
  console.log("Old tab:", old)
  console.log("New tab:", tab)
}
</script>

<style lang="scss" scoped>
:deep(.tab-active) {
  font-weight: bold;
}
</style>
