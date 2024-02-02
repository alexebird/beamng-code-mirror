<template>
  <div bng-ui-scope="click_demo">
    <h1>Bng Click</h1>
    <p>
      <template v-if="eventType"> {{ eventType }} - {{ count }} </template>
      <template v-else> No event </template>
    </p>
    <div style="display: flex">
      <BngButton v-bng-click="clickEvent">Click</BngButton>
      <p>v-bng-click</p>
    </div>
    <div style="display: flex">
      <BngButton v-bng-click="{ clickCallback: clickEvent }">Click</BngButton>
      <p v-html="`v-bng-click='{ clickCallback: clickEvent }'`"></p>
    </div>
    <div style="display: flex">
      <BngButton v-bng-click:hold="holdEvent">Hold</BngButton>
      <p v-html="`v-bng-click:hold`"></p>
    </div>
    <div style="display: flex">
      <BngButton v-bng-click:hold="{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 400 }"> Hold </BngButton>
      <p v-html="`v-bng-click:hold='{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 400 }'`"></p>
    </div>
    <p>The two examples below show how we can visualise the 'hold' behaviour using the <code>show-hold</code> attribute on our normal buttons. The target element of the directive will have a css var (<code>--hold-completion</code>) applied to it - the value is a 0-100%).</p>
    <div style="display: flex">
      <BngButton show-hold v-bng-on-ui-nav:ok.asMouse v-bng-click="{ clickCallback: clickEvent, holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 400 }"> Click & Hold </BngButton>
      <p v-html="`v-bng-click:hold='{ clickCallback: clickEvent, holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 400 }'`"></p>
    </div>
    <div style="display: flex">
      <BngButton disable accent="main" show-hold v-bng-on-ui-nav:ok.asMouse v-bng-click="{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }"> Hold (No repeat, also works with button X on controller) </BngButton>
      <p v-html="`v-bng-click:hold='{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }'`"></p>
    </div>
    <div style="display: flex">
      <BngButton accent="secondary" show-hold v-bng-on-ui-nav:ok.asMouse.modified v-bng-click="{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }"> Hold (No repeat, also works with modified button X on controller) </BngButton>
      <p v-html="`v-bng-click:hold='{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }'`"></p>
    </div>
    <div style="display: flex">
      <BngButton accent="text" show-hold v-bng-on-ui-nav:ok.asMouse.focusRequired v-bng-click="{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }"> Hold (No repeat, also works with button X on controller - with focus only) </BngButton>
      <p v-html="`v-bng-click:hold='{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }'`"></p>
    </div>
    <div style="display: flex">
      <BngButton accent="outlined" show-hold v-bng-on-ui-nav:ok.asMouse.modified.focusRequired v-bng-click="{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }"> Hold (No repeat, also works with modified button X on controller - with focus only) </BngButton>
      <p v-html="`v-bng-click:hold='{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }'`"></p>
    </div>
    <div style="display: flex">
      <BngButton accent="attention" show-hold v-bng-on-ui-nav:ok.asMouse v-bng-click="{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }"> Hold (No repeat, also works with button X on controller) </BngButton>
      <p v-html="`v-bng-click:hold='{ holdCallback: holdEvent, holdDelay: 1000, repeatInterval: 0 }'`"></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { vBngClick, vBngOnUiNav } from "@/common/directives"
import { BngButton } from "@/common/components/base"
import { useUINavScope } from "@/services/uiNav"

useUINavScope('click_demo')

const
  count = ref(0),
  eventType = ref(""),

  doAction = currentEvent => () => {
    console.log("doAction", currentEvent)
    if (eventType.value && eventType.value !== currentEvent) {
      count.value = 1
      eventType.value = currentEvent.value
    } else {
      count.value++
    }
    eventType.value = currentEvent
  },

  clickEvent = doAction("click"),
  holdEvent = doAction("hold")


</script>

<style scoped>
  button + p { color: #888; }
</style>
