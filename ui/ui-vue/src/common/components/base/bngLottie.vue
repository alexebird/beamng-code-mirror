<!-- bngLottie - display a Lottie animation, or one of our predefined Lottie icons -->
<template>
  <div ref="elem" class="bng-lottie-animation" :style="css"></div>
</template>

<script>
  import icons, { defaultCSS } from "@/assets/lottieIcons"
  import LottieService from '@/services/lottie'
</script>

<script setup>

import { ref, onMounted, onUnmounted, watch } from "vue"

const props = defineProps({
  icon: String,
  value: undefined,
  path: String,
  loop: Boolean,
  autoplay: Boolean,
  initialSegment: Number,
  startFrame: Number,
  onLottieAnimCreated: Function
})

const css = ref({}), elem = ref(null)
let cfg, BngLottieID

onMounted(() => {
  if (props.icon) {

    // one of our internal Lottie icons
    let lottieAnim, onChange, icon = icons[props.icon]
    if (!icon) throw new Error(`Unknown Lottie icon: ${props.icon}`)
    css.value = {...defaultCSS, ...icon.style}
    cfg = {...icon.lottie}
    cfg.element = elem.value
    cfg.onLottieAnimCreated = anim => {
      lottieAnim = anim
      if (icon.onLoad) icon.onLoad.bind({lottie: lottieAnim})()
      if (icon.onChange) (onChange = icon.onChange.bind({lottie: lottieAnim}))(props.value)
    }
    if (icon.onChange) watch( ()=>props.value, (...newOld) => lottieAnim && onChange(...newOld) )

  } else {

    // direct (vanilla lottie file)
    cfg = {
      element: elem.value,
      path: props.path,
      loop: props.loop,
      autoplay: props.autoplay,
      initialSegment: props.initialSegment,
      startFrame: props.startFrame,
      onLottieAnimCreated: props.onLottieAnimCreated
    }
  }
  
  BngLottieID = LottieService.register(cfg)
})

onUnmounted(() => BngLottieID && LottieService.unregister(BngLottieID))


</script>

<style lang="scss" scoped>

.bng-lottie-animation {
  width: 3em;
  height: 3em;
  margin: -0.5em;
}

</style>
