<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="210" height="150" viewBox="0 0 210 150" 
        stroke="black" stroke-width="4" fill="none">
        <rect x="3" y="23" width="195" height="58" />
        <line x1="68" y1="22" x2="68" y2="80" />
        <line x1="136" y1="22" x2="136" y2="80" />

        <!-- consumer connector -->
        <g>
            <path d="M90 0 L90 40 M85 40 L95 40" />
            <path d="M115 0 L115 40 M110 40 L120 40" />
        </g>

        <!-- left segment -->
        <!-- arrow up -->
        <g>
            <line x1="22" y1="28" x2="22" y2="80" />
            <path d="M22 28 L19 33 L22 32 L25 33 Z" fill="black" />
        </g>
        <!-- arrow down -->
        <g>
            <line x1="48" y1="21" x2="48" y2="70" />
            <path d="M48 75 L45 70 L48 71 L51 70 Z" fill="black" />
        </g>

        <!-- right segment -->
        <!-- arrow down -->
        <g>
            <line x1="150" y1="24" x2="186" y2="74" />
            <path d="M190 75 L187 70 L190 71 L193 70 Z" transform="rotate(-35, 190, 79)" fill="black" />
        </g>
        <!-- arrow up -->
        <g>
            <line x1="189" y1="28" x2="150" y2="80" />
            <path d="M190 27 L187 32 L190 31 L193 32 Z" transform="rotate(35, 190, 27)" fill="black" />
        </g>


        <!-- center segment -->
        <g stroke="black">
            <path d="M115 65 L115 103 M110 65 L120 65" fill="black" />
            <path d="M105 95 L105 115 L125 115 L125 95" fill="none" />
        </g>

        <!-- pump assembly connector -->
        <g stroke="black">
            <path d="M90 65 L90 140 M85 65 L95 65" />
        </g>
    </svg>
</template>

<script setup>
</script>

<style scoped lang="scss"></style>