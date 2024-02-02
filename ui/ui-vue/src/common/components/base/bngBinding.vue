<!-- bngBinding - visually display an action binding -->
<template>
  <span v-if="display" :ui-event="uiEvent">
    <!-- control uses a generic representation -->
    <kbd :class="{light: !dark, dark: dark}" v-if="viewerObj && !viewerObj.special">
      <span>
        <bng-icon span class="bng-binding-icon" :title="viewerObj.icon" :type="viewerObj.icon" :color="dark ? 'rgb(250, 250, 250)': '#000'"/>
        <!-- <md-icon :astyle="{color: (dark ? 'white' : 'black')}">{{ viewerObj.icon }}</md-icon> -->
        <span>{{ viewerObj.control.toUpperCase().replace(/( |-)/g, ' + ')}}</span>
      </span>
    </kbd>
    <!-- control uses a dedicated svg -->
    <bng-icon span class="bng-binding-icon" :title="viewerObj.ownIcon" :type="viewerObj.ownIcon" :color="dark ? '#000': 'rgb(250, 250, 250)'" v-if="viewerObj && viewerObj.special"/>
    <!-- control is not assigned, fallback to empty display -->
    <kbd :class="{light: !dark, dark: dark}" v-if="!viewerObj && showUnassigned">
      <span><span class="n-a">[N/A]</span></span>
    </kbd>
  </span>
</template>

<script setup>
import { BngIcon } from '@/common/components/base'
import { computed } from "vue"
import useControls from "@/services/controls"


const Controls = useControls()

const props = defineProps({
  action: String,
  showUnassigned: Boolean,
  device: String,
  deviceKey: String,
  dark: Boolean,
  deviceMask: [String, Function],
  uiEvent: String
})

const viewerObj = computed(() => Controls.makeViewerObj(props))

const display = computed(() => {
  if (!props.deviceMask || !viewerObj.value) return true
  const dev = viewerObj.value.devName
  if (typeof props.deviceMask === 'function') return props.deviceMask(dev)
  return dev.startsWith(props.deviceMask)
})


</script>

<style lang="scss" scoped>

  kbd {
    vertical-align: middle;
    display: inline-block;
    margin-right:0.2em;
    min-width: 1em;
    padding: .1em .3em;
    font: monospace;
    text-align: center;
    text-decoration: none;
    -moz-border-radius: .3em;
    -webkit-border-radius: .3em;
    border-radius: .25em;
    border: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
    & > span{
      text-transform: uppercase;
      display:inline-flex;
      & > span {
        font-size: 0.8em;
        line-height: 1.6em;
        padding-bottom: 0.1em;
        position: relative;
        top: 0.1em;
        padding-right: 0.2em;
      }
      & > span.n-a {
        margin: 0;
        top: -0.1em;
        padding-right: 0;
      }
    }
  }

kbd, kbd.dark, .dark-keys kbd, .key, .key.dark, .dark-keys .key {
  background: rgb(80, 80, 80);
  background: -moz-linear-gradient(top, rgb(60, 60, 60), rgb(80, 80, 80));
  background: -webkit-gradient(linear, left top, left bottom, from(rgb(60, 60, 60)), to(rgb(80, 80, 80)));
  color: rgb(250, 250, 250);
}

kbd.light, .light-keys kbd, .key.light, .light-keys .key {
  background: rgb(250, 250, 250);
  background: -moz-linear-gradient(top, rgb(210, 210, 210), rgb(255, 255, 255));
  background: -webkit-gradient(linear, left top, left bottom, from(rgb(220, 220, 220)), to(rgb(240, 240, 240)));
  color:  rgb(0, 0, 0);
  border: solid;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.20);
}

  .bng-binding-icon {
    min-width: 1.4em;
    min-height: 1.4em;
    margin: 0.1em;
    display: inline-block;
    vertical-align: middle;
  }

</style>
