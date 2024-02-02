<!-- bngUnit_demo -->
<template>
  <h2>BngUnit Demo</h2>
  <div>
    <span>svg:</span>
    <br />
    <BngUnit :xp="0" /> <br />
    <BngUnit :xp="1234.23123" /> <br />
    <BngUnit :beambucks="0" /> <br />
    <BngUnit :beambucks="1234.333245" /> <br />
    <BngUnit :beambucks="1234.333245" :options="{ formatter: false }" /> <br />
    <BngUnit @click="console.log(123)" :beambucks="1234.333245" :options="{ formatter: x => ~~x }" /> <br />
    <BngUnit :stars="3" /> <br />
    <BngUnit :bonusstars="4" /> <br />
    <BngUnit :notadefinedunit="1234.333245" /> <br />
  </div>
</template>

<script setup>
import { BngUnit } from "@/common/components/base"
</script>

<style scoped>
span {
  color: #fff;
}
</style>
