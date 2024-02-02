<!--*** Test Page for BeamNG Vue UI Elements -->
<template>
	<div v-bng-blur="true" style="height: 100%; width: 100%">Blur Test</div>
	<div class="test-page" v-bng-blur="true">
    <bng-select :options="[1,2,3]" /><br />
    <div tabindex="0">test focusable div</div>
    Button with bngSoundClass: <bng-button @click="buttonClickHandler" v-bng-sound-class:bng_click_hover_bigmap>Hover/Click Me</bng-button>
    <div style="margin-top: 1em;">
      Default Switch
      <bng-switch></bng-switch>
    </div>
    <div style="margin-top: 1em;">
      Disabled Switch
      <bng-switch :disabled="true"></bng-switch>
    </div>
    <div style="margin-top: 1em;">
      Labeled switch <br />
      <bng-switch>Labeled-text</bng-switch>
    </div>
    <div style="margin-top: 1em;">
      Disabled Labeled switch <br />
      <bng-switch :disabled="true">Labeled-text</bng-switch>
    </div>
    <div style="margin-top: 1em;">
      Default Slider
      <bng-slider :min="0" :max="100" name="default-slider"
        @valueChanged="onDefaultSliderValueChanged"/>
      {{defaultSliderValue}}
    </div>
    <div style="margin-top: 1em;">
      Step Slider
      <bng-slider :min="0" :max="100" :step="10" name="step-slider"
                  @valueChanged="onStepSliderValueChanged"/>
      {{stepSliderValue}}
    </div>
    <div style="margin-top: 1em; width: 90%;">
      Pill
      <bng-pill :options="bngPillOptions" @valueChanged="onPillValueChanged" />
    </div>
	<bng-button :whenClicked="buttonClickHandler">
		bng button baby! passing a function prop
	</bng-button>
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
