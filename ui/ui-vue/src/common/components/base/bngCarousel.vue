<template>
  <div class="bng-carousel">
    <div class="content"></div>
    <div class="navigation" v-if="items.length > 1">
      <div v-for="(item, index) in items" :key="index" class="navigation-item" :class="{ active: navState.selected === index }" @click="select(index)"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive } from "vue"
import { getAssetURL } from "@/utils"

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  current: {
    type: Number,
    default: 0,
  },
  transition: {
    type: Boolean,
    default: true,
  },
  transitionTime: {
    type: Number,
    default: 3000,
  },
  loop: {
    type: Boolean,
    default: true,
  },
})

let transitionTimer = null

const navState = reactive({
  selected: props.current,
})

const images = computed(() => props.items.map(x => getAssetURL(x)))
const selectedImage = computed(() => images.value[navState.selected])

const image = computed(() => `url(${selectedImage.value})`)

const select = index => {
  disposeTransition()
  navState.selected = index
  setupTransition()
}

onMounted(() => {
  setupTransition()
})

onBeforeUnmount(() => {
  disposeTransition()
})

function setupTransition() {
  if (props.transition) {
    transitionTimer = setInterval(() => {
      navState.selected = navState.selected < images.value.length - 1 ? (navState.selected += 1) : 0
    }, props.transitionTime)
  }
}

function disposeTransition() {
  if (props.transition && transitionTimer !== null) clearInterval(transitionTimer)
}
</script>

<style scoped lang="scss">
.bng-carousel {
  position: relative;
  height: 100%;
  width: 100%;
  min-width: 8rem;
  min-height: 10rem;

  > .content {
    height: 100%;
    width: 100%;
    background-image: v-bind(image);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  > .navigation {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    width: 100%;
    bottom: 0;

    > .navigation-item {
      background: white;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

      &.active {
        width: 0.75rem;
        height: 0.75rem;
      }
    }
  }
}
</style>
