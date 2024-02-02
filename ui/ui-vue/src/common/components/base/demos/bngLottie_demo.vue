<template>
  <div>
    <h2>Lottie Icons and Animations</h2>
    <p>Show one of our internally defined Lottie icons, or a general Lottie asset:</p>
    <div class="samples">
      <span class="check">Check icon: <BngLottie icon="check" :value="checkVal" ngclass="{ 'fail': prog.failed, 'success': prog.done }" /></span>
      &nbsp;&nbsp;&nbsp;
      <BngButton accent="secondary" @click="setCheckVal('')">No value</BngButton>&nbsp;
      <BngButton accent="secondary" @click="setCheckVal('v')">Value 'v'</BngButton>&nbsp;
      <BngButton accent="secondary" @click="setCheckVal('x')">Value 'x'</BngButton>
      <br /><br />
      Direct Lottie file:&nbsp;&nbsp; <BngButton @click="showMe" accent="secondary">{{ showTest ? "Hide" : "Show" }}</BngButton
      ><BngLottie v-if="showTest" class="test" :path="getAssetURL('lottie-animations/test.json')" autoplay loop :start-frame="0" />
    </div>
  </div>
</template>

<script setup>
import { getAssetURL } from "@/utils"
import { ref } from "vue"
import { BngLottie, BngButton } from "@/common/components/base"

const checkVal = ref(""),
  showTest = ref(false),
  setCheckVal = val => (checkVal.value = val),
  showMe = () => {
    showTest.value = !showTest.value
  }
</script>

<style scoped>
.samples {
  margin: 3em;
  padding: 30px;
  border: 1px solid #333;
  border-radius: 0.5em;
  height: 22em;
}

:deep(.bng-lottie-animation.test) {
  width: 15em;
  height: 15em;
  margin-left: 3em;
}

.check :deep(.bng-lottie-animation) {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin-left: 0.5em;
}

.check :deep(.bng-lottie-animation .icon-fill path),
.check :deep(.bng-lottie-animation .checkbox-frame path) {
  fill: white;
  transition: all 0.25s ease-in-out;
}

.check :deep(.bng-lottie-animation .icon-ripple-fill path) {
  fill: rgba(255, 255, 255, 0.4);
  transition: all 0.25s ease-in-out;
}
</style>
