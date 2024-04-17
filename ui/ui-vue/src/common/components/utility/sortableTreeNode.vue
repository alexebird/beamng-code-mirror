<template>
  <div class="sortable-tree__node">
    <div
      v-bng-draggable="!disabled"
      :data-draggable-index="index"
      :data-draggable-key="item[itemKey]"
      :data-draggable-group="group"
      :data-draggable-level="level"
      :data-draggable-path="`${path ? path + '/' : ''}${index}`"
      :data-draggable-parent-key="parentKey"
      class="content-wrapper"
    >
      <component :is="$templates['nodeItem']" :nodeItem="item"></component>
    </div>

    <div v-if="item.children" class="sortable-subtree">
      <sortableTreeNode
        v-for="(child, childIndex) in item.children"
        :item="child"
        :index="childIndex"
        :itemKey="itemKey"
        :path="`${path ? path + '/' : ''}${index}`"
        :parentKey="item[itemKey]"
        :group="group"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup>
import { vBngDraggable } from "@/common/directives"
import { inject } from "vue"

defineProps({
  item: {
    type: Object,
    required: true,
  },
  itemKey: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  parentKey: {
    type: String,
  },
  level: {
    type: Number,
    default: 0,
  },
  group: {
    type: String,
  },
  path: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const $templates = inject("$templates", null)
</script>

<style lang="scss" scoped>
.sortable-tree__node {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  user-select: none;

  > .content-wrapper {
    width: 100%;
    border: 0.25rem solid transparent;
  }
}

.sortable-subtree {
  padding-left: 0.5rem;
}
</style>
