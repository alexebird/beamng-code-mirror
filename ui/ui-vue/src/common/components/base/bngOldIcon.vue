<!-- bngIcon - a simple icon -->
<template>
  <!-- <span class="bngiconGlyph" v-if="glyph !== ''" :style="glyphStyle">{{props.glyph}}</span> -->
  <span class="bngicon" v-if="span" :style="spanStyle"><slot></slot></span>
  <img class="bngicon" v-else :src="iconImageURL" alt="" />
</template>

<script>
import { getAssetURL } from "@/utils"
import { icons, iconTypesList } from "@/assets/icons"

export { icons, iconTypesList }
</script>

<script setup>
import { computed } from "vue"

const props = defineProps({
  type: {
    type: String,
    validator: v => iconTypesList.includes(v),
  },
  span: {
    type: Boolean,
    default: true,
  },
  mask: {
    type: Boolean,
    default: true,
  },
  // glyph: {
  //   type: String,
  //   default: "",
  // },
  color: String
})

const iconImageURL = computed(() => getAssetURL(`icons/${props.type}.svg`))

// const glyphStyle = computed(() => ({
//   fontFamily: "bngIcons",
//   color: props.color || '#fff'
// }))

const spanStyle = computed(() => ({
  [props.mask ? "maskImage" : "backgroundImage"]: `url(${iconImageURL.value})`,
  backgroundColor: props.color || '#fff'
}))

</script>

<style lang="scss" scoped>
span.bngicon {
  align-self: center;
  background-repeat: no-repeat;
  background-size: contain;
  mask-repeat: no-repeat;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  display: inline-block;
  width: 1em;
  height: 1em;
}
// span.bngiconGlyph {
//   align-self: center;
//   display: inline-block;
//   font-size: 1rem;
// }
</style>
