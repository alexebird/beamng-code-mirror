<!-- BNGBlur Directive Demo -->
<template>

	<p>To see this demo working, make sure you are running it while the game engine is displaying something.</p>

	<p>
		<div v-bng-blur="blur1" class="blurbox">1</div>
		<div v-bng-blur="!blur1" class="blurbox">2</div>
		<div v-bng-blur="blur1" class="blurbox">3</div>
		<div v-bng-blur="!blur1" class="blurbox">4</div>
		<div v-bng-blur="blur1" class="blurbox">5</div>
		<div v-bng-blur="!blur1" class="blurbox">6</div>
	</p>
	<bng-button accent="secondary" tabindex="1" @click="swap">Change blur values</bng-button>
	<br><br><br>
	<bng-button accent="secondary" tabindex="1" @click="swap2">{{blur2 ? 'Remove' : 'Add'}} blurred area</bng-button>
	<div v-if="blur2" v-bng-blur class="blurbox alt">New Blurred Area</div>

</template>

<style scoped>
	.blurbox {
		display: inline-block;
		width:200px;
		height:100px;
		margin:5px;
		text-align: center;
		font-size:40px;
		line-height: 100px;
		border: 2px solid gray;
		background-color: #0003;
		border-radius: 4px;
	}
	.alt {
		margin-left:50px;
		width: 400px;
		font-size: 20px;
		vertical-align: top;
	}
</style>

<style>
	.components-demo.blurdemo {
		background-color: #0006 !important;
	}
</style>

<script setup>
	import { BngButton } from '@/common/components/base'
	import { ref, onMounted, onUnmounted } from "vue"

	import { vBngBlur } from "@/common/directives"

	const
		lighten = (state=true) => {
			const container = document.querySelector('.components-demo')
			container && container.classList[state?'add':'remove']('blurdemo')
		},
		swap = () => blur1.value = !blur1.value,
		swap2 = () => blur2.value = !blur2.value


	const blur1 = ref(true)
	const blur2 = ref(false)

	onMounted(lighten)
	onUnmounted(() => lighten(false))

</script>