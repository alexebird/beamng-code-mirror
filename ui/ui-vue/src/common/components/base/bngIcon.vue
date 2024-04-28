<!-- bngIcon - a simple icon -->
<template>
  <span v-if="!asImage" class="icon-base" :style="iconStyle" v-bind="isKnownGlyph ? {} : {unknown: type.glyph || type || NO_ICON_TYPE_GIVEN}">{{iconGlyph}}</span>
  <BngImageAsset v-else v-bind="imageProps" />
</template>

<script setup>
import { computed, useAttrs } from "vue"
import { BngImageAsset } from "@/common/components/base"

const props = defineProps({
  type: {
    type: [String, Object],
    default: "",
    // TODO - fill in this validator once we have a way to validate icons?
    //validator: v => iconTypesList.includes(v),
  },
  color: String,
})

const iconStyle = computed(() => ({
  '--icon-color': props.color || "#fff",
  ...(!isKnownGlyph.value && { "-webkit-text-stroke": "1px #f00" }),
}))

const attrs = useAttrs()

const imageProps = computed(() => ({
  ...(asImage && { mask: ["mask", "span"].includes(attrs.asImage) }),
  ...(props.color && { bgColor: props.color }),
  ...(!isKnownGlyph && { unknown: type.glyph || type || NO_ICON_TYPE_GIVEN, bgColor: "#f00" }),
  src: svgForIcon(props.type),
}))

const asImage = computed(() => !OFF_VALUES.includes(attrs.asImage))

const iconGlyph = computed(() => isKnownGlyph.value || icons.placeholder.glyph)
const isKnownGlyph = computed(() => props.type.glyph || (typeof props.type === "string" && props.type))
</script>

<script>
import { icons, iconsBySize, iconsByTag, getIconsWithTags } from "@/assets/fonts/bngIcons/bngIcons.js"

const svgForIcon = ({ fileSvg }) => `fonts/bngIcons/${fileSvg}`
const NO_ICON_TYPE_GIVEN = "[ No icon type given ]"

const OFF_VALUES = [null, undefined, false, "0", "false", 0]

export { icons, iconsBySize, iconsByTag, getIconsWithTags, svgForIcon }
</script>

<style lang="scss" scoped>
.icon-base {
  font-family: "bngIcons" !important;
  align-self: center;
  display: inline-block;
  font-size: 1.5em;
  color: var(--icon-color);
  font-weight: 100 !important;
}
</style>
