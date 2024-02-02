<!-- BNGAutoScroll Directive Demo -->
<template>
    <h1>Bng Auto Scroll</h1>
    <div class="scroller" v-bng-auto-scroll:bottom>
        <div v-for="item in items">
            Item {{ item }}
        </div>
    </div>
    <BngButton @click="() => items++">Add Item</BngButton>
</template>

<script setup>
import { ref } from 'vue'
import { vBngAutoScroll } from '@/common/directives'
import { BngButton } from '@/common/components/base';

const items = ref(100)
</script>

<style scoped lang="scss">
.scroller {
    overflow-y: auto;
    height: 50%;
}
</style>