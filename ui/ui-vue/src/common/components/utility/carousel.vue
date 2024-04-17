<template>
  <div class="bng-carousel" :class="[horizontal ? 'carousel-horizontal' : '', `transition-${transitionType}`]">
    <div ref="carousel" class="carousel-content">
      <slot></slot>
    </div>
    <slot name="navigation">
      <div v-if="navItems && navItems.length > 1" class="navigation">
        <div
          v-for="item in navItems"
          class="navigation-item"
          :key="item.value"
          :class="{ active: navState.selected == item.value }"
          @click="select(item.value)"
        ></div></div
    ></slot>
  </div>
</template>

<script>
const TRANSITION_TYPES = ["none", "smooth"]
</script>

<script setup>
import { ref, reactive, computed, onBeforeUnmount, onMounted, watchEffect, watch } from "vue"

const props = defineProps({
  current: {
    type: [String, Number],
    default: null,
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
  loop: {
    type: Boolean,
    default: true,
  },
  transition: {
    type: Boolean,
    default: false,
  },
  transitionType: {
    type: String,
    default: "none",
    validator(value, props) {
      return TRANSITION_TYPES.includes(value)
    },
  },
  transitionTime: {
    type: Number,
    default: 3000,
  },
})

defineExpose({
  showSlide: value => (navState.selected = value),
  showPrevious,
  showNext,
})

const carousel = ref(null)

const navState = reactive({
  selected: null,
})

const navItems = computed(() => {
  if (!carousel.value) return null

  const carouselItems = [...carousel.value.children].filter(x => x.hasAttribute("data-carousel-item"))

  if (!carouselItems || carouselItems.length === 0) return null

  return carouselItems.map(x => ({
    value: x.dataset.carouselItem,
  }))
})
const currentIndex = computed(() => navItems.value.findIndex(x => x.value === navState.selected))

const select = value => {
  setupTransition()
  navState.selected = value
}
watchEffect(() => {
  if (navItems.value && navItems.value.length > 0 && navState.selected !== null && navState.selected !== undefined) scrollToItem(navState.selected)
})

watch([() => props.transition, () => props.transitionTime], setupTransition)

onMounted(() => {
  setDefaultSlide()
  setupTransition()
})

onBeforeUnmount(() => {
  disposeTransition()
})

function showPrevious() {
  if (currentIndex.value === 0 && props.loop) {
    navState.selected = navItems.value[navItems.value.length - 1].value
  } else if (currentIndex.value > 0) {
    navState.selected = navItems.value[currentIndex.value - 1].value
  }
}

function showNext() {
  if (currentIndex.value === navItems.value.length - 1 && props.loop) {
    navState.selected = navItems.value[0].value
  } else if (currentIndex.value < navItems.value.length - 1) {
    navState.selected = navItems.value[currentIndex.value + 1].value
  }
}
function scrollToItem(value) {
  let targetItem

  for (let item of carousel.value.children) {
    if (item.getAttribute("data-carousel-item") == value) targetItem = item
  }

  if (targetItem) {
    window.requestAnimationFrame(() => {
      carousel.value.scrollTo({
        left: targetItem.offsetLeft,
      })
    })
  }
}

let transitionTimer = null
function setupTransition() {
  if (!navItems.value || navItems.value.length <= 1) return

  if (!props.transition && transitionTimer !== null) {
    disposeTransition()
  } else if (props.transition && transitionTimer !== null) {
    disposeTransition()
    addTransition()
  } else if (props.transition && transitionTimer === null) {
    addTransition()
  }
}

function addTransition() {
  transitionTimer = setInterval(showNext, props.transitionTime)
}

function disposeTransition() {
  if (props.transition && transitionTimer !== null) clearInterval(transitionTimer)
}

function setDefaultSlide() {
  if (props.current !== undefined && props.current !== null) navState.selected = props.current
  else if (navItems.value && navItems.value.length > 0) navState.selected = navItems.value[0].value
}
</script>

<style lang="scss" scoped>
.bng-carousel {
  position: relative;
  height: 100%;
  min-width: 8rem;
  min-height: 10rem;
  overflow: hidden;

  > .carousel-content {
    display: flex;
    height: 100%;
    width: 100%;
    overflow-y: hidden;
    overflow-x: auto;
    pointer-events: none;

    &::-webkit-scrollbar {
      display: none;
    }
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
      display: flex;
      align-items: center;
      justify-content: center;
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

  &.transition-smooth > .carousel-content {
    scroll-behavior: smooth;
  }

  &.carousel-horizontal {
    > .carousel-content {
      overflow-x: hidden;
      overflow-y: auto;
    }

    > .navigation {
      flex-direction: column;
      justify-content: center;
      width: 1rem;
      height: 100%;
      margin-left: 0.5rem;
    }
  }
}
</style>
