<!-- BNGBngSoundClass Directive Demo -->
<template>
		<bng-button accent="secondary" tabindex="1" v-bng-sound-class="'bng_click_hover_generic'">v-bng-sound-class="'bng_click_hover_generic'"</bng-button><br />
		<bng-button accent="secondary" tabindex="1" v-bng-sound-class="'bng_click_hover_generic'" mute>v-bng-sound-class="'bng_click_hover_generic'" mute</bng-button><br />
		<bng-button accent="outlined" tabindex="1" v-bng-sound-class="'bng_click_hover_bigmap'" :mute="true">v-bng-sound-class="'bng_click_hover_bigmap'" :mute="true"</bng-button><br />
		<bng-button accent="outlined" tabindex="1" v-bng-sound-class="'bng_click_hover_bigmap'" :mute="1">v-bng-sound-class="'bng_click_hover_bigmap'" :mute="1"</bng-button><br />
		<bng-button accent="text" tabindex="1" v-bng-sound-class="'bng_click_hover_bigmap'" :mute="false">v-bng-sound-class="'bng_click_hover_bigmap'" :mute="false"</bng-button><br />
		<bng-button accent="text" tabindex="1" v-bng-sound-class="'bng_click_hover_bigmap'" :mute="0">v-bng-sound-class="'bng_click_hover_bigmap'" :mute="0"</bng-button><br />
		<bng-button @click="toggle" tabindex="1" v-bng-sound-class="'bng_click_hover_generic'" :mute="muted">{{ muted ? "Muted" : "Not muted"}} (Click to toggle)</bng-button><br />
		<bng-button @click="playSound">Play sound</bng-button>
</template>

<style scoped>
	.bng-button {
		margin-bottom: 1em;
	}
</style>

<script setup>
	import { BngButton } from '@/common/components/base'
	import { ref } from "vue"
	import { lua } from "@/bridge"

	import { vBngSoundClass } from "@/common/directives"

	const muted = ref(false)

	function toggle() { muted.value = !muted.value }

	function playSound() {
		lua.ui_audio.playEventSound('bng_click_generic', 'click')
		lua.core_vehicles.getCurrentVehicleDetails().then(c=>console.log(c))
	}

</script>