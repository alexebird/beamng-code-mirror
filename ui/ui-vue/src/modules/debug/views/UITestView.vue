<!--*** Test Page for BeamNG Vue UI Elements -->
<template>
	<div v-bng-blur="true" style="height: 100%; width: 100%">Blur Test</div>
	<div class="test-page" v-bng-blur="true">
    <BngSelect :options="[1,2,3]" /><br />
    <div tabindex="0">test focusable div</div>
    Button with bngSoundClass: <BngButton @click="buttonClickHandler" v-bng-sound-class:bng_click_hover_bigmap>Hover/Click Me</BngButton>
    <div style="margin-top: 1em;">
      Default Switch
      <BngSwitch></BngSwitch>
    </div>
    <div style="margin-top: 1em;">
      Disabled Switch
      <BngSwitch :disabled="true"></BngSwitch>
    </div>
    <div style="margin-top: 1em;">
      Labeled switch <br />
      <BngSwitch>Labeled-text</BngSwitch>
    </div>
    <div style="margin-top: 1em;">
      Disabled Labeled switch <br />
      <BngSwitch :disabled="true">Labeled-text</BngSwitch>
    </div>
    <div style="margin-top: 1em;">
      Default Slider
      <BngSlider :min="0" :max="100" name="default-slider"
        @valueChanged="onDefaultSliderValueChanged"/>
      {{defaultSliderValue}}
    </div>
    <div style="margin-top: 1em;">
      Step Slider
      <BngSlider :min="0" :max="100" :step="10" name="step-slider"
                  @valueChanged="onStepSliderValueChanged"/>
      {{stepSliderValue}}
    </div>
    <div style="margin-top: 1em; width: 90%;">
      Pill
      <BngPill :options="bngPillOptions" @valueChanged="onPillValueChanged" />
    </div>
	<BngButton :whenClicked="buttonClickHandler">
		bng button baby! passing a function prop
	</BngButton>
  </div>
</template>

<script setup>
import {
	BngSelect,
	BngSwitch,
	BngSlider,
	BngPill,
	BngButton
} from "@/common/components/base"

import {
  vBngSoundClass,
  vBngBlur
} from "@/common/directives"

import {ref} from "vue";

const defaultSliderValue = ref(0);
function onDefaultSliderValueChanged(value) {
  defaultSliderValue.value = value;
}

const stepSliderValue = ref(0);
function onStepSliderValueChanged(value) {
  stepSliderValue.value=value;
}

const bngPillOptions = [
  { value: 0, name: 'All'},
  { value: 1, name: 'Body'},
  { value: 2, name: 'Engine'},
  { value: 3, name: 'Transmission'},
  { value: 4, name: 'Suspension'},
  { value: 5, name: 'Electrics'}
]
function onPillValueChanged(value) {
  console.log('pill values', value);
}

function buttonClickHandler() {
	alert('Button clicked!')
}

</script>

<style lang="scss" scoped>

$bgcolor: var(--bng-black-o8);
$textcolor: #888 ;
$fontsize: 18px;

/* Use the variables */
.test-page {
	padding:50px;
	background-color: $bgcolor;
	color: $textcolor;
	font-size: $fontsize;
	button {
		color: var(--bng-orange);
		background: rgba(0,0,0,0.8);
		border:none;
	}
}

/* Make sure focusing works correctly */
div, button {
	position: relative;
}
</style>
