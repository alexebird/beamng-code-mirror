<template>
  <div class="list-container">
    <div class="list-toolbar">
      <div class="list-path" v-if="pathLength > -1">
        <div v-if="pathLimit && pathLength > pathLimit" v-bng-blur="true">&mldr;</div>
        <div v-for="(item, idx) in pathView"
          class="list-path-item"
          v-bng-blur="true"
          @click="notify('click', item, 'pathClick')"
          @focus="notify('focus', item, 'pathFocus')"
        >{{ item.name }}</div>
      </div>
      <div v-else></div>
      <div class="list-layout-toggle">
        <!-- FIXME: update icon -->
        <BngButton
          :accent="layoutSelected === 'tile' ? 'outlined' : 'text'"
          Xicon=""
          @click="layoutSelected = 'tile'"
        >
          <BngIcon glyph="&#xBEBA3;" />
        </BngButton>
        <BngButton
          :accent="layoutSelected === 'table' ? 'outlined' : 'text'"
          Xicon=""
          @click="layoutSelected = 'table'"
        >
          <BngIcon glyph="&#xBEBA2;" />
        </BngButton>
      </div>
    </div>
    <div
      ref="cont"
      :class="{
        'list-content': true,
        [`list-layout-${layoutSelected}`]: true,
        'list-item-width': !!tileWidth,
      }"
      :style="{
        '--list-item-width': `${tileWidth}em`,
        '--list-item-margin': `${tileMargin}em`
      }"
      v-bng-blur="true"
    >
      <component
        :is="tileComponent"
        :layout="layoutSelected"
        :container-width="contWidth"
        v-for="(item, idx) in itemsView"
        v-bng-focus-if="(item.hasOwnProperty('selected') ? item.selected : idx === 0) && !item.disabled"
        :icon="icons"
        :data="item"
        @click="notify('click', item)"
        @focus="notify('focus', item)"
      ></component>
    </div>
  </div>
</template>

<script>
export default {
  layout: {
    default: "tile",
    tile: "tile",
    table: "table",
  },
}
</script>

<script setup>
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue"
import { vBngBlur, vBngFocusIf } from "@/common/directives"
import { BngButton, BngIcon, BngListItemDefault } from "@/common/components/base"

const emitter = defineEmits(["click", "focus", "pathClick", "pathFocus"])

const props = defineProps({
  layout: {
    type: String,
    default: "tile",
  },
  path: { // aka breadcrumbs
    type: Array,
  },
  pathLimit: { // how many items to display in path
    type: Number,
    default: 3,
  },
  items: {
    type: Array,
    required: true,
  },
  icons: {
    type: Boolean,
    default: true,
  },
  tile: { // tile component to use
    type: Object,
  },
})

const tileComponent = shallowRef(props.tile || BngListItemDefault)
watch(() => props.tile, () => {
  tileComponent.value = props.tile || BngListItemDefault
  updWidth()
})

const layoutSelected = ref(props.layout)
watch(() => props.layout, () => layoutSelected.value = props.layout || "tile")
watch(() => layoutSelected.value, () => updWidth())

// when it's -1, that means we won't use path at all
const pathLength = computed(() => Array.isArray(props.path) ? props.path.length : -1)
const pathView = computed(() => Array.isArray(props.path) ? (props.pathLimit ? props.path.slice(-props.pathLimit) : props.path) : [])

const itemsView = computed(() => Array.isArray(props.items) ? props.items : [])

const cont = ref()
let contWidth = 0
const tileWidth = ref(0)
const tileMargin = ref(0)
const resizeObserver = new ResizeObserver(updWidth)
onMounted(() => nextTick(() => resizeObserver.observe(cont.value)))
onBeforeUnmount(() => {
  resizeObserver.unobserve(cont.value)
  resizeObserver.disconnect()
})
function updWidth(entries = []) {
  tileMargin.value = tileComponent.value.margin
  if (layoutSelected.value !== "tile") {
    tileWidth.value = 0
    return
  }
  // get real font-size
  const fontSize = window.getComputedStyle(cont.value, null).fontSize
  // static scrollbar size in px
  const scrollWidth = 12
  // get container width
  const width = (entries[0] ? entries[0].contentRect.width : cont.value.getBoundingClientRect().width) - scrollWidth
  // convert width to em
  contWidth = width / +fontSize.substring(0, fontSize.length - 2)
  if (contWidth === 0)
    return
  const baseWidth = tileComponent.value.width || 10 // em
  const baseMargin = tileComponent.value.margin || 0 // em, each side
  if (contWidth <= baseWidth * 1.5) {
    tileWidth.value = contWidth - baseMargin * 2
  } else {
    const num = contWidth / baseWidth
    tileWidth.value = baseWidth * (num / ~~num) - baseMargin * 2
  }
  // TODO: create aspect-ratio option
}

function notify(event, item, outEvent=null) {
  let error
  if (event in item && typeof item[event] === "function") {
    try {
      item[event]()
    } catch (err) {
      error = err
    }
  }
  emitter(outEvent || event, item)
  if (error)
    throw error
}
</script>

<style lang="scss" scoped>
.list-container {
  display: flex;
  flex-flow: column;
  justify-content: stretch;
  width: 100%;
  height: 100%;

  & > * {
    flex: 0 0 auto;
  }
  &, & * {
    position: relative;
    font-family: "Overpass", var(--fnt-defs);
  }
}

.list-toolbar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: stretch;
  align-items: center;

  > * {
    flex: 1 1 auto;
    width: auto;
  }

  .list-path {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    overflow: hidden;

    > div {
      flex: 0 1 auto;
      max-width: 10em;
      padding: 0.1em 0.5em;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-style: italic;
      white-space: nowrap;
      text-overflow: ellipsis;
      // cursor: pointer;
      &.list-path-item:hover {
        color: var(--bng-orange);
      }
      &:last-child {
        pointer-events: none;
      }
    }
  }

  .list-layout-toggle {
    flex: 0 0 auto;
    > * {
      min-width: unset;
      width: 2em;
    }
  }
}

.list-content { /* list container */
  flex: 0 1 auto;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: rgba(0, 0, 0, 0.5);

  &.list-layout-tile {
    flex-flow: row wrap;
  }

  &.list-layout-table {
    flex-flow: column;
    > * {
      flex: 0 0 auto !important;
      width: calc(100% - var(--list-item-margin, 0)) !important;
      min-width: unset !important;
      max-width: unset !important;
    }
  }

  &.list-item-width > * {
    flex: 0 0 var(--list-item-width) !important;
    width: var(--list-item-width) !important;
    min-width: unset !important;
    max-width: unset !important;
  }
}

</style>
