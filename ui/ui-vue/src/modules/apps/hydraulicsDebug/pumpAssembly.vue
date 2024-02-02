<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="210" viewBox="0 0 200 310">
        <g transform="translate(100, 0)">
            <accumulator></accumulator>
        </g>
        <g transform="translate(0, 110)">
            <reliefValve></reliefValve>
        </g>
        <g transform="translate(110, 190)">
            <pump></pump>
        </g>
        <path d="M56 122 L56 138 M54 120 L128 120 M130 122 L130 98 M130 120 L158 120 M160 118 L160 190" stroke="black"
            stroke-width="4" />
    </svg>
</template>

<script setup>
import accumulator from './components/accumulator.vue'
import pump from './components/pump.vue'
import reliefValve from './components/reliefValve.vue'
</script>

<style scoped lang="scss"></style>