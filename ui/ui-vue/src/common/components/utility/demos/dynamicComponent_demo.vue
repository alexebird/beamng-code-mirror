<!-- Dynamic Component Demo -->
<template>
	<h2>Dynamic Component</h2>
	<p>Use it to dynamically create a component based on the passed template. Unknown attrs will form the context passed to the component.</p>
	<p>For this demo, the context being passed is:</p>
	<p><pre>{
&nbsp;&nbsp;testFunction: () => alert('Hello World'),
&nbsp;&nbsp;buttonText: "Dynamically created button"
}</pre></p>
	Template:<br/>
	<textarea v-model="tmp" cols="100" rows="10"></textarea>
	<br/><br/>
	<BngButton accent="secondary" @click="apply">Apply template</BngButton>
	<br/><br/>
	Result:
	<div id="result">
		<DynamicComponent v-if="live" :template="live" v-bind="ctx"/>
	</div>
</template>


<script setup>

import { ref } from "vue"
import { BngButton } from "@/common/components/base"
import { DynamicComponent } from "@/common/components/utility"

const
	tmp = ref('<BngButton @click="testFunction">{{buttonText}}</BngButton>'),
	live = ref(undefined),
	ctx = {
		testFunction: () => alert('Hello World'),
		buttonText: "Dynamically created button"
	},
	apply = () => live.value = tmp.value

</script>

<style lang="scss" scoped>
	#result {
		margin: 20px 0;
		border: 1px solid #666;
		border-radius: 5px;
		padding: 40px;
	}
</style>
