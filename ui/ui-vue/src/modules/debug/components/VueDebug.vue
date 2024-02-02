<template>
	<Teleport to="body">
		<div v-if="showDebug" id="vue-debug">
			<div :style="{ display: isOpen ? 'block' : 'none' }" class="main">
				Current hash: {{ hash }}<br>
				Route name: {{ routeName }}
				<hr />
				<button @click="components" v-if="showComponents">Show Components</button>
				<button @click="menu" v-if="showComponents">Main Menu</button><br /><br />
				<select multiple @input="selectRoute">
					<option v-for="route in routes" :key="route">{{ route }}</option>
				</select>
			</div>
			<div class="handle" @click="toggleOpen">
				<span><strong>Vue</strong><span class="route-info" v-if="!isOpen">: {{ path }} [ {{routeName}} ]</span></span
				><a @click="closeDebug">x</a>
			</div>
		</div>
	</Teleport>
</template>

<script setup>
import { useRoute } from "vue-router"
import { computed, ref } from "vue"
import router from "@/router"

const routes = router
	.getRoutes()
	.map(r => r.name)
	.filter(n => n!=='routelist')
	.sort()

const route = useRoute(),
	hash = ref(location.hash.split("#")[1]),
	path = computed(() => route.path),
	routeName = computed(() => route.name),
	showDebug = ref(window._VueDebugState),
	isOpen = ref(window._VueDebugOpen),
	showComponents = router.hasRoute("components")

const bngVue = window.bngVue || {}

bngVue.debug = (state = true) => (showDebug.value = window._VueDebugState = state)
bngVue.reset = () => bngVue.gotoGameState("menu.mainmenu")

function toggleOpen() {
	isOpen.value = window._VueDebugOpen = !isOpen.value
}

function selectRoute(e) {
	bngVue.gotoGameState(e.target.value)
}

function components() {
	bngVue.showComponents()
	toggleOpen()
}
function menu() {
	bngVue.reset()
	toggleOpen()
}

// add component demo shortcut if we're in dev mode
if (process.env.NODE_ENV === "development") {
	bngVue.showComponents = () => {
		bngVue.gotoGameState("components")
	}
}

const closeDebug = e => {
	e.stopPropagation()
	bngVue.debug(false)
}

addEventListener("hashchange", e => {
	hash.value = e.newURL.split("#")[1]
})
</script>

<style scoped>
:root *:focus::before {
	content: none;
}

#vue-debug {
	z-index: var(--zorder_index_mdcontent) !important;
	position: absolute;
	background: #000c;
	color: white;
	left: 0;
	top: 50%;
	font-size: 10pt;
	transform: translateX(-50%) rotate(270deg);
	transform-origin: 50% 0;
	width: 300px;
	border-radius: 0 0 0.75em 0.75em;
	box-sizing: border-box;
}
.main {
	transform: rotate(90deg) translate(300px, 0);
	transform-origin: right top;
	height: 300px;
	width: 300px;
	padding: 1em 0.5em;
	box-sizing: border-box;
	background-color: #000d;
}
.handle {
	padding: 4px 12px 6px;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
}
.route-info {
	font-size:90%;
}
</style>
