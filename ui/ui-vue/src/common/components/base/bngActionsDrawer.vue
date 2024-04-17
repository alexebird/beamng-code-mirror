<!-- bngActionsDrawer - a drawer with a list of action 'buttons' -->
<template>
  <div class="actions-drawer">
    <BngDrawer>
      <template #header>
        {{ header }}
      </template>
      <template v-if="showHeaderActions && headerActions" #headerOptions>
        <BngButton v-for="action in headerActions" :key="action.value" tabindex="1" :accent="action.accent" @click="$emit('headerActionClicked', action.value)">
          {{ action.label }}
        </BngButton>
      </template>
      <template #content>
        <Tabs v-if="grouped" class="categories-tab bng-tabs">
          <Tab v-for="category of actions" :key="category.category" :heading="category.category">
            <BngActionsList
              :key="category.category"
              :actions="category.items"
              :selected="selected"
              :class="{ expanded: expanded }"
              @actionClick="value => onActionClicked(value)"></BngActionsList>
          </Tab>
        </Tabs>
        <BngActionsList
          v-else
          :actions="actions"
          :selected="selected"
          :class="{ expanded: expanded }"
          @actionClick="value => onActionClicked(value)"></BngActionsList>
      </template>
    </BngDrawer>
  </div>
</template>

<script setup>
import { BngDrawer, BngActionsList, BngButton } from "@/common/components/base"
import { Tabs, Tab } from "../utility"

const props = defineProps({
  header: {
    type: String,
    required: true,
  },
  headerActions: Array,
  showHeaderActions: {
    type: Boolean,
    default: true,
  },
  grouped: Boolean,
  actions: {
    type: [Array, Object],
    required: true,
  },
  selected: {
    type: [String, Number],
  },
  expanded: Boolean,
})

const emit = defineEmits(["actionClick", "headerActionClicked", "categoryChanged"])
const onActionClicked = action => emit("actionClick", action)
</script>

<style scoped lang="scss">
$text-color: white;

.actions-drawer {
  color: $text-color;
  font-family: "Overpass";
  height: 100%;
  width: 100%;

  :deep(.bng-drawer) {
    .card-wrapper,
    .bng-card-wrapper,
    .card-cnt,
    .content {
      width: 100%;
    }
  }

  .categories-tab {
    height: 100%;
    overflow-y: auto;

    :deep(.tab-content) {
      background: transparent;
    }
  }

  // :deep(.categories-filter) {
  //   overflow-y: auto;
  //   max-width: initial;
  //   width: 100%;

  //   &::-webkit-scrollbar {
  //     display: none;
  //   }
  // }
}
</style>
