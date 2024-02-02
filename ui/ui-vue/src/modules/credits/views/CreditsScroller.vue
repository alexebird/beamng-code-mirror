<template>
	<div class="md-content" id="bng-credits-wrapper-v" tabindex="0" @keypress="exit" bng-ui-scope="credits" v-bng-on-ui-nav:menu,back="exit">
		<div class="bng-credits-content">
			<img :src="imageURL" alt="" />

			<div v-for="(category, cIndex) in credits" :key="{ cIndex }">
				<div class="creditsCategory">{{ $t(category.translateId) }}</div>
				<div v-for="(member, mIndex) in category.members" :key="{ mIndex }">
					<div class="creditsMember" :key="mIndex">
						{{ member.first }}
						<span v-if="member.aka" style="text-transform: none">"{{ member.aka }}"</span>
						{{ member.last }}
						<span v-if="member.title" class="title">.{{ $t(member.title) }}</span>
						&nbsp;<!-- allow to print blank lines using empty fields-->
					</div>
				</div>
			</div>

			<div style="padding-top: 70%"></div>
		</div>
	</div>
</template>

<script setup>
import { lua } from '@/bridge'
import { onMounted, onUnmounted } from "vue"
import { getAssetURL } from "@/utils"

import credits from "@/modules/credits/data"

import { vBngOnUiNav } from "@/common/directives"


import { useUINavScope } from "@/services/uiNav"
useUINavScope('credits')


const imageURL = getAssetURL('beamngdrive.png')

const exit = () => {
	running = false
	window.bngVue.gotoGameState("menu.mainmenu")
}
let running = true

const start = () => {
	lua.extensions.load('ui_credits')
	lua.ActionMap.enableInputCommands(true)
	lua.scenetree['maincef:setMaxFPSLimit'](60)
	const wrap = document.getElementById("bng-credits-wrapper-v")
	wrap.focus()
	scrollContainer(wrap, 65, exit)
}

const kill = () => {
	lua.extensions.unload('ui_credits')
	lua.scenetree['maincef:setMaxFPSLimit'](30)
}
onMounted(start)
onUnmounted(kill)

function scrollContainer(container, pxPerSecond = 65, cbDone = null) {
	// TODO: add support for window resize
	const targetPos = container.scrollHeight - container.clientHeight
	const scrollSpeed = pxPerSecond / 1000 // px/ms
	let currentPos = 0,
		lastTime = 0,
		smoother = 0
	window.requestAnimationFrame(function step(timestamp) {
		lastTime = timestamp // so smoother won't freak out on occasionally-high initial value
		window.requestAnimationFrame(function step(timestamp) {
			smoother += (timestamp - lastTime - smoother) * 0.02
			const moveDelta = smoother * scrollSpeed
			lastTime = timestamp
			currentPos += moveDelta
			if (running && currentPos < targetPos) {
				container.scrollTop = currentPos
				window.requestAnimationFrame(step)
			} else {
				if (cbDone) cbDone()
			}
		})
	})
}
</script>

<style scoped lang="scss">
.md-content {
	display: block;
	position: relative;
	overflow: auto;
	-webkit-overflow-scrolling: touch;
	overflow-x: hidden;
}

#bng-credits-wrapper-v {
	width: 100%;
	height: 100%;
	background: radial-gradient(ellipse at top left, #334455 0%, #000 100%);
	text-align: center;
	overflow: hidden;
	&:focus {
		outline: none !important;
		box-shadow: none !important;
		&::before {
			content: "" !important;
			border: none;
		}
	}
}

.bng-credits-content {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	font-family: "Overpass", var(--fnt-defs);
	/* font-family: 'Roboto Condensed'; - if something breaks there */
	text-transform: uppercase;
	color: #fff;
	& .creditsCategory {
		display: block;
		margin-top: 120px;
		margin-bottom: 25px;
		font-size: 32px;
		font-weight: bold;
	}
	& .creditsMember {
		display: block;
		margin-bottom: 8px;
		font-size: 24px;
		color: white;
		font-style: normal;
	}
	& .title {
		margin-bottom: 8px;
		font-size: 24px;
		color: var(--bng-orange-b400);
		font-style: italic;
	}
}

</style>
