<template>
	<div class="routes-list">
		<h1>Vue Routes List</h1>
		<p>Click to visit:</p>
		<ul>
			<li v-for="route in routes" :key="route.name"><bng-button @click="go(route)" tabindex="1">{{ route.name }}</bng-button></li>
		</ul>
	</div>
</template>

<script setup>
import { BngButton } from "@/common/components/base"
import router from "@/router"


const routes = router.getRoutes().filter(r=>r.name!=='routelist').sort((a,b)=>a.name>b.name?1:-1)


function go(route) {
	router.push(route)
}

</script>

<style lang="scss" scoped>
$bgcolor: var(--bng-black-o8);
$textcolor: #ccc;
$highlight_textcolor: #fff;
$hasdemo_textcolor: var(--bng-orange-100);
$current_background_color: var(--bng-cool-gray-700);
$fontsize: 18px;

.routes-list {
	padding: 50px;
	background-color: $bgcolor;
	color: $textcolor;
	font-size: $fontsize;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

ul {
	list-style: none;
	margin: 0;
	padding:0;
	overflow-y: auto;
	height: calc(100% - 7em);
}
li {
	margin-bottom:0.5em;
}
.bng-button {
	width:300px;
	justify-content:flex-end;
}


</style>
