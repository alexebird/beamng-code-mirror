<template>
  <div class="task-header">
    <div>
      <slot v-if="slots.title" name="title"></slot>
      <template v-else-if="title">
        <DynamicComponent :template="titleParsed" />
      </template>
    </div>
    <div class="description">
      <slot v-if="slots.description" name="description"></slot>
      <template v-else-if="description">
        <DynamicComponent :template="descriptionParsed" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { useSlots, computed } from "vue"
import { $content, $translate } from "@/services"
import { DynamicComponent } from "@/common/components/utility"

const props = defineProps({
  title: [String, Object],
  description: [String, Object],
})

const slots = useSlots()

const titleParsed = computed(() => $content.bbcode.parse($translate.contextTranslate(props.title, true)))
const descriptionParsed = computed(() => $content.bbcode.parse($translate.contextTranslate(props.description)))
</script>

<style scoped lang="scss">
.task-header {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 0.625em;
  padding-left: 1.25em;
  padding-right: 1.25em;
  padding-bottom: 0.5em;
  border-bottom: 0.17em solid #ff6600;
  font-style: italic;
  font-weight: 800;
  font-size: 1.5em;
  line-height: 110%;
  letter-spacing: 0.01em;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.6);
  width: 100%;
  transform-origin: left;

  &::before {
    content: "";
    position: absolute;
    display: block;
    width: 2em;
    height: 1em;
    left: -1em;
    top: 0.41em;
    transform: matrix(0.94, 0, -0.38, 1, 0, 0);
    background: #ff6600;
  }

  > .description {
    font-style: normal;
    font-weight: 500;
    font-size: 0.83em;
    line-height: 1em;
    /* or 120% */
    letter-spacing: 0.01em;
  }
}
</style>
