<template>
  <div :class="`menu-item ${addclass} ${active ? 'item-active' : ''} ${disable ? 'item-disabled' : ''}`"
    v-bng-sound-class="'bng_click_hover_generic'"
    bng-nav-item
    _v-focus-if="focus"
    _focus-on-hover
  >
    <div v-if="bgimg !== ''" class="menu-item-icon"><div class="maskimg"></div></div>
    <div v-else-if="icon" class="menu-item-icon"><BngImageAsset :src="icon"></BngImageAsset></div>
    <div class="menu-item-text"><slot></slot></div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { vBngSoundClass } from "@/common/directives";
import { BngImageAsset } from "@/common/components/base"
import { getAssetURL } from "@/utils"

const props = defineProps({
  icon: {
    type: String,
    default: ""
  },
  addclass: {
    type: String,
    default: ""
  },
  active: {
    type: Boolean,
    default: false
  },
  focus: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: "rgba(0,0,0, 0.6)"
  },
  bgimg: {
    type: String,
    default: ""
  }
})

const iconimgstyle = ref(`url("${getAssetURL(props.icon)}")`)
const bgimgstyle = ref(`url("${getAssetURL(props.bgimg)}")`)
const bgcolorstyle = ref(`${props.color}`)
</script>

<style lang="scss">
.menu-item:focus::before {
  border: none !important;
}
.menu-item {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 5px;
  border-radius: var(--bng-corners-1);
  border: 2px solid rgba(0,0,0,0);
  margin: 5px;
  background: v-bind(bgcolorstyle);
  height: 4em;
  .menu-item-icon .maskimg{
    background-color: white;
    -webkit-mask-image: v-bind(iconimgstyle);
    -webkit-mask-size: 100%;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    width: 5em;
    height: 5em;
  }
  .menu-item-icon .bng-image-asset {
    height: 3.5em;
  }
  .menu-item-text {
    color: white;
    /*font-weight: bold;*/
    font-size: 1.8em;
    /*text-align: center;*/
    line-height: 1.8em;
  }
}
.menu-item:focus, .menu-item.on {
  border: 2px solid var(--bng-orange-b400);
  .menu-item-icon .maskimg{
    background-image: v-bind(bgimgstyle);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
}
.primary-items {
  .menu-item {
    display: flex;
    flex-direction: column;
    align-content: space-between;
    height: 15em;
    width: 13em;
    .menu-item-icon {
      margin-left: auto;
      margin-right: auto;
    }
    .menu-item-text {
      margin-left: auto;
      margin-right: auto;
    }
  }
}
</style>