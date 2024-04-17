<!-- BNGBngSoundClass Directive Demo -->
<template>
		<BngButton accent="secondary" tabindex="1" v-bng-sound-class="'bng_click_hover_generic'">v-bng-sound-class="'bng_click_hover_generic'"</BngButton><br />
		<BngButton accent="secondary" tabindex="1" v-bng-sound-class="'bng_click_hover_generic'" mute>v-bng-sound-class="'bng_click_hover_generic'" mute</BngButton><br />
		<BngButton accent="outlined" tabindex="1" v-bng-sound-class="'bng_click_hover_bigmap'" :mute="true">v-bng-sound-class="'bng_click_hover_bigmap'" :mute="true"</BngButton><br />
		<BngButton accent="outlined" tabindex="1" v-bng-sound-class="'bng_click_hover_bigmap'" :mute="1">v-bng-sound-class="'bng_click_hover_bigmap'" :mute="1"</BngButton><br />
		<BngButton accent="text" tabindex="1" v-bng-sound-class="'bng_click_hover_bigmap'" :mute="false">v-bng-sound-class="'bng_click_hover_bigmap'" :mute="false"</BngButton><br />
		<BngButton accent="text" tabindex="1" v-bng-sound-class="'bng_click_hover_bigmap'" :mute="0">v-bng-sound-class="'bng_click_hover_bigmap'" :mute="0"</BngButton><br />
		<BngButton @click="toggle" tabindex="1" v-bng-sound-class="'bng_click_hover_generic'" :mute="muted">{{ muted ? "Muted" : "Not muted"}} (Click to toggle)</BngButton><br />
		<BngButton @click="ts" tabindex="1" v-bng-sound-class="dynamicSound">{{ dynamicSound }} (Click to change sound)</BngButton><br />
		<BngButton @click="playSound">Play sound</BngButton>
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
	const dynamicSound = ref('bng_click_hover_bigmap')

	function toggle() { muted.value = !muted.value }
	function toggleSound() { dynamicSound.value = (dynamicSound.value === 'bng_click_hover_bigmap') ? 'bng_click_hover_generic': 'bng_click_hover_bigmap' }
	const ts = () => window.setTimeout(toggleSound,500)

	function playSound() {
		lua.ui_audio.playEventSound('bng_click_generic', 'click')
	}

</script>