<!-- BNGOnUiNav Directive Demo -->
<template>
  <div bng-ui-scope="test" v-bng-on-ui-nav:*.modified='testing'>
    <BngButton accent="secondary" tabindex="1" v-bng-on-ui-nav:back="() => handleClick('back')" @click="() => handleClick('click 1')">Click 1 (back)</BngButton>&nbsp;
    <BngButton accent="secondary" v-bng-on-ui-nav:menu,back="() => handleClick('menu')" tabindex="2" @click="() => handleClick('click 2')">Click 2 (menu)</BngButton>
  </div>
  <BngButton @click=toggleBlock>{{ block ? "Unfilter" : "Filter"}}</BngButton>
</template>

<style scoped>
  .bng-button {
    margin-bottom: 1em;
  }
  span {
    font-weight: bold;
  }

</style>

<script setup>
  import { useUINavScope } from "@/services/uiNav"
  import { default as UINavEvents, UI_EVENTS, UI_EVENT_GROUPS } from "@/bridge/libs/UINavEvents"
  import { BngButton } from '@/common/components/base'
  import { vBngOnUiNav } from "@/common/directives"

  import { ref } from 'vue'
  // const events = [UI_EVENTS.menu, UI_EVENT_GROUPS.radialMenu]
  const events = [UI_EVENTS.menu, UI_EVENTS.back]

  const block = ref(false)

  const toggleBlock = (...p) => {
    console.log(p)
    block.value =!block.value
    block.value ? UINavEvents.setFilteredEvents(events) : UINavEvents.clearFilteredEvents()
  }

  const scope = useUINavScope('test')

console.log(scope.current.value)
console.log(scope.set)

  function handleClick(value) {
    console.log('We goin\' back... Directive success:', value)
  }

  function testing(value, modifier, extras, eventName) {
    console.log('Catchall:', value, modifier, extras, eventName)
  }

</script>