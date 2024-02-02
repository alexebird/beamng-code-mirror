<template>
    <!-- width="200" height="310" -->
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="210" viewBox="0 0 200 310">
        <g v-if="consumerType === 'hydraulicMotor'" transform="translate(68, 0)">
            <hydraulicMotor />
        </g>
        <g v-else-if="consumerType === 'cylinder'">
            <cylinder />
        </g>

        <g v-if="consumerType === 'hydraulicMotor'">
            <path d="M92 88 L40 88 L40 35 L68 35" stroke="black" stroke-width="4" fill="none"  />
            <path d="M113 88 L165 88 L165 35 L131 35" stroke="black" stroke-width="4" fill="none"  />
        </g>
        <g v-if="consumerType === 'cylinder'">
            <path d="M92 88 L65 88 L65 54" stroke="black" stroke-width="4" fill="none" />
            <path d="M113 88 L135 88 L135 54" stroke="black" stroke-width="4" fill="none" />
        </g>
        
        <g transform="translate(0, 90)">
            <valve />
        </g>
    </svg>
</template>

<script setup>
import { onMounted } from 'vue'
//import { SVG, extend as SVGextend, Element as SVGElement } from '@svgdotjs/svg.js'
import valve from './components/valve.vue'
import hydraulicMotor from './components/hydraulicMotor.vue'
import cylinder from './components/cylinder.vue'

const props = defineProps({
    consumerType: {
        type: String,
        required: true,
        validator(value) {
            return ['cylinder', 'hydraulicMotor'].includes(value)
        }
    }
})

onMounted(() => {
    // // initialize SVG.js
    // var draw = SVG().addTo('body')

    // // draw pink square
    // draw.rect(100, 100).move(100, 50).fill('#f06')
    console.log('props', props.consumerType)
})
</script>

<style scoped lang="scss"></style>