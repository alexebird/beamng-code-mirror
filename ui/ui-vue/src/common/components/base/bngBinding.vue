<!-- bngBinding - visually display an action binding -->
<template>
  <span v-if="display" :ui-event="uiEvent">
    <!-- control uses a generic representation -->
    <kbd :class="{light: !dark, dark: dark}" v-if="viewerObj && !viewerObj.special">
      <span>
        <BngIcon class="bng-binding-icon" :title="viewerObj.icon" :type="icons[viewerObj.icon]" :color="dark ? 'rgb(250, 250, 250)': '#000'"/>
        <span>{{ viewerObj.control.toUpperCase().replace(/( |-)/g, ' + ')}}</span>
      </span>
    </kbd>
    <!-- control uses a dedicated svg -->
    <BngIcon class="bng-binding-icon" :title="viewerObj.ownIcon" :type="icons[viewerObj.ownIcon]" :color="dark ? '#000': 'rgb(250, 250, 250)'" v-if="viewerObj && viewerObj.special"/>
    <!-- control is not assigned, fallback to empty display -->
    <kbd :class="{light: !dark, dark: dark}" v-if="!viewerObj && showUnassigned">
      <span><span class="n-a">[N/A]</span></span>
    </kbd>
  </span>
</template>

<script setup>
import { BngIcon } from '@/common/components/base'
import { icons } from '@/common/components/base/bngIcon.vue'
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
    font-family: "Noto Sans Mono", var(--fnt-defs);
    font-weight: 600;
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
      align-items: baseline;
      & > span {
        font-size: 0,8em;
        line-height: 1.5em;
        // padding-bottom: 0.1em;
        position: relative;
        padding-right: 0.25em;
      }
      & > span.n-a {
        margin: 0;
        padding-right: 0;
      }
    }
    .bng-binding-icon {
      font-size: 1.25em;
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
  line-height: 1em;
  font-size: 1.6em;
  display: inline-block;
  vertical-align: baseline;
  transform: translateY(0.0625em);
  font-weight: 400;
}

</style>
