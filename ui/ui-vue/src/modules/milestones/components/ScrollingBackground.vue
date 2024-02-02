<template>
  <div class="scroller"></div>
</template>

<script setup>
import { computed, onBeforeMount, ref } from "vue"
import { getAssetURL } from "@/utils"

const iconData = ref(null)

const rootSvgStart =
  'data:image/svg+xml;utf8,<svg width="80" height="80" viewBox="0 -8 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg"><image width="64" height="64" href="'
const rootSvgEnd = '"/></svg>'

const rootSvg = computed(() => `${rootSvgStart}${iconData.value}${rootSvgEnd}`)
const backgroundStyle = computed(() => `url('${rootSvg.value}') 0 0 repeat`)
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
})

onBeforeMount(() => {
  getFileContent(getAssetURL(props.icon), data => {
    console.log("data content", data)
    iconData.value = data
  })
})

function getFileContent(url, callback) {
  console.log("url", url)

  const request = new XMLHttpRequest()

  request.open("GET", url, true)
  request.responseType = "blob"
  request.onload = function () {
    const reader = new FileReader()

    reader.readAsDataURL(request.response)
    reader.onload = function (e) {
      console.log("data received")
      callback(e.target.result)
    }
  }

  request.send()
}
</script>

<style scoped lang="scss">
.scroller {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    z-index: -1;
    background: v-bind(backgroundStyle);
    background-size: 50px 80px;

    transform: rotate(-30deg);
    animation: scroll 0.75s infinite normal linear;
    opacity: 0.25;
  }
}

@keyframes scroll {
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: 100px;
  }
}
</style>
