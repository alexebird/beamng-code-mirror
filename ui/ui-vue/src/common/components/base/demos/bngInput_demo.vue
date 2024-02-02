<template>
  <div class="input-demo-container">
    <div class="input-entry">
      <bng-input v-model="basicValue" type="number" :min="-10" :max="10" :step="1" @valueChanged="onDefaultValueChanged"> </bng-input>
    </div>
    <div class="input-entry demo-1">
      <bng-input
        ref="iptChanged"
        external-label="Demo 1"
        floating-label="Floating Label"
        prefix="Prefix"
        suffix="Suffix"
        v-model="defaultValue"
        :initial-value="'test'"
        :trailing-icon="icons.general.offbtn"
        @valueChanged="onDefaultValueChanged"
      >
      </bng-input>
      <span v-if="iptChanged">Value is {{ iptChanged.dirty ? "dirty" : "the same" }}</span>
      <BngButton v-if="iptChanged && iptChanged.dirty" @click="iptChanged.markClean()">Mark clean</BngButton>
    </div>
    <div class="input-entry">
      <bng-input
        external-label="Demo 2"
        floating-label="Floating Label"
        prefix="Prefix"
        suffix="Suffix"
        :leading-icon="icons.general.offbtn"
        :trailing-icon="icons.general.offbtn"
        :trailing-icon-outside="true"
      >
      </bng-input>
    </div>
    <div class="input-entry">
      <bng-input floatingLabel="Floating Label" initial-value="test" error-message="Invalid Text" :validate="val => false"></bng-input>
    </div>
    <div class="input-entry">
      <bng-input
        external-label="Demo 3"
        floating-label="Floating Label"
        prefix="Prefix"
        suffix="Suffix"
        :leading-icon="icons.general.offbtn"
        :trailing-icon="icons.general.offbtn"
      >
      </bng-input>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue"
import { BngInput, BngButton } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const basicValue = ref(0)
const defaultValue = ref("test1")

const iptChanged = ref()

const stopBasicValueWatcher = watch(
  () => basicValue.value,
  () => console.log("basic value", basicValue.value)
)

const stopValueWatcher = watch(
  () => defaultValue.value,
  () => {
    console.log("default value", defaultValue.value)
  }
)

const onDefaultValueChanged = val => console.log("onDefaultValueChanged", val)

onUnmounted(() => {
  stopValueWatcher()
  stopBasicValueWatcher()
})
</script>

<style scoped lang="scss">
.demo-1 {
  width: 70%;
}
.input-demo-container {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.input-entry {
  margin-top: 1em;
}
</style>
