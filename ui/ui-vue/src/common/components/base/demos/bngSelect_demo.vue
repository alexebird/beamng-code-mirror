<template>
  <div>
    <bng-select mute :options="[1, 2, 3]" @valueChanged="demo" />
    <bng-select
      :value="false"
      @valueChanged="demo"
      :options="[
        ['Yes', true],
        ['No', false],
      ]"
      :config="{
        label: ([label]) => label,
        value: ([, value]) => value,
      }"
    />
    <bng-select
      @valueChanged="demo"
      loop
      value="LOOPING"
      :options="[
        { l: 'this', v: 'THIS' },
        { l: 'is', v: 'IS' },
        { l: 'looping', v: 'LOOPING' },
      ]"
      :config="{
        label: x => x.l,
        value: x => x.v,
      }"
    />
    Value emitted out of component: {{ eventValue }}
    <br />
    Label emitted out of component: {{ eventLabel }}
  </div>
</template>

<script setup>
import { BngSelect } from "@/common/components/base"
import { ref } from "vue"

let eventValue = ref(false)
let eventLabel = ref("")
function demo(value, label) {
  eventValue.value = value
  eventLabel.value = label
}
</script>

<style scoped>
div {
  max-width: 50%;
}
.bng-select {
  /* display: flex;
  align-items: center;
  -webkit-user-select: none;
  color: currentColor; */
  /* height: 35px; */
  margin-bottom: 1rem;
}
</style>
