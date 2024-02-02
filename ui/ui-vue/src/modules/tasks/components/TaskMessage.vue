<template>
  <div class="task-message">
    <div class="title">
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
import { computed, useSlots } from "vue"
import { $content, $translate } from "@/services"
import { DynamicComponent } from "@/common/components/utility"

const props = defineProps({
  title: String,
  description: String,
})

const slots = useSlots()

const titleParsed = computed(() => $content.bbcode.parse($translate.contextTranslate(props.title, true)))
const descriptionParsed = computed(() => $content.bbcode.parse($translate.contextTranslate(props.description)))
</script>

<style scoped lang="scss">
.task-message {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0.5em 2em;
  transform-origin: left;
  border-radius: 0.25em;
  overflow: hidden;
  flex-shrink: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  border: 0.125em solid transparent;

  &::before {
    content: "";
    position: absolute;
    display: block;
    top: 0.5em;
    bottom: 0.5em;
    left: 0.75em;
    width: 0.25em;
    background: #ff6600;
  }

  > .title {
    font-size: 1.12em;
    line-height: 1.2em;
    font-weight: 500;
    letter-spacing: 0.01em;
    margin-bottom: 0.05em;
    // Hack to prevent angular css leaking
    background: none;
  }

  > .description {
    font-family: "Noto Sans";
    font-size: 1em;
    font-weight: 400;
    line-height: 1.5em;
    /* identical to box height, or 150% */
    letter-spacing: 0.01em;
  }
}
</style>
