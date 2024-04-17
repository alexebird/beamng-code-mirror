<template>
  <div class="bng-actions-drawer" :class="{ expanded: isDrawerOpen }">
    <BngDrawer :blur="blur" class="bng-drawer">
      <template #header>
        <slot name="header" :actionItem="currentAction" :canGoBack="showBackButton" :goBack="goBack">
          <div class="header-wrapper">
            <BngButton v-if="showBackButton" :icon="icons.arrowLargeLeft" accent="secondary" class="back-btn" @click="goBack">Back</BngButton>
            {{ currentAction.label }}
          </div>
        </slot>
      </template>
      <template #content>
        <div class="drawer-content">
          <div v-if="drawerState.isOpenCatalog && catalogFilters.length > 0" class="filters-wrapper">
            <BngPillFilters v-model="drawerState.drawerFilters" :options="catalogFilters"></BngPillFilters>
          </div>
          <div class="drawer-actions-wrapper">
            <div class="drawer-actions" :class="{ expanded: drawerState.isOpenCatalog }">
              <template v-if="!loading">
                <template v-for="action in currentAction.items" :key="action.value">
                  <div v-if="action.type === 'actionDivider'" class="action-divider">{{ action.label }}</div>
                  <slot v-else name="item" :actionItem="action" :onClick="() => selectAction(action)">
                    <BngImageTile :label="action.label" :icon="action.icon" @click="selectAction(action)" />
                  </slot>
                </template>
              </template>
              <div v-else class="progress-indicator">
                <div class="loader"></div>
              </div>
            </div>
          </div>
          <slot v-if="canViewCatalogDisplayMode" name="footer">
            <BngButton class="catalog-btn" accent="outlined" @click="toggleOpenCatalog">
              <template v-if="drawerState.isOpenCatalog">
                {{ closeDrawerLabel ? closeDrawerLabel : "Collapse catalog" }}
              </template>
              <template v-else>
                {{ openDrawerLabel ? openDrawerLabel : "Open full catalog" }}
              </template>
            </BngButton>
          </slot>
        </div>
      </template>
    </BngDrawer>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue"
import { BngDrawer, BngButton, BngPillFilters, BngImageTile, icons } from "."

/**
 * Represents an action item.
 * @typedef {Object} ActionItem
 * @property {string} label
 * @property {Array<string|number>} value
 * @property {string|Object} icon If true, icon will be used otherwise, image will be used
 * @property {string} image
 * @property {Boolean} lazyLoadItems
 * @property {Boolean} flattenChildren
 * @property {Boolean} allowOpenDrawer
 * @property {ActionItem[]} items
 */

const props = defineProps({
  /**
   * @type {ActionItem}
   * @description
   */
  value: {
    type: Object,
    required: true,
  },
  /**
   * @type {Boolean}
   * @description If true, the items will be rendered in the actions list and label will be used as text for the divider
   */
  flattenChildren: Boolean,
  /**
   * @description If false, will hide the open drawer button
   */
  allowOpenDrawer: Boolean,
  openDrawerLabel: String,
  closeDrawerLabel: String,
  /**
   * @description Display loading state when lazy loading items
   */
  loading: Boolean,
  header: String,
  blur: Boolean,
})

const emit = defineEmits(["update:currentActionPath", "update:loading", "actionClicked", "actionItemChanged", "drawerOpened"])

const drawerState = reactive({
  isOpenCatalog: false,
  currentPath: [],
  drawerFilters: [],
})

const currentActionPath = computed({
  get: () => drawerState.currentPath,
  set: newValue => {
    drawerState.currentPath = newValue
  },
})

const parentAction = computed(() => {
  if (!currentActionPath.value || currentActionPath.value.length === 0) return null

  let currentAction = props.value

  for (let key of currentActionPath.value.slice(0, -1)) {
    currentAction = currentAction.items.find(x => x.value === key)
  }

  return currentAction
})

const currentAction = computed(() => {
  let currentAction = props.value

  for (let key of currentActionPath.value) {
    currentAction = currentAction.items.find(x => x.value === key)
  }

  return currentAction
})

const isDrawerOpen = computed({
  get: () => drawerState.isOpenCatalog,
  set: newValue => {
    drawerState.isOpenCatalog = newValue
    emit("drawerOpened", newValue)
  },
})

const loading = computed({
  get: () => props.loading,
  set: newValue => emit("update:loading", newValue),
})

const canViewCatalogDisplayMode = computed(() => {
  console.log("canViewCatalogDisplayMode")
  if (loading.value === true || currentAction.value.allowOpenDrawer === false) return false

  console.log("currentAction", currentAction.value)
  return currentAction.value.items.every(x => x.lazyLoadItems === true || x.items)
})

const drawerFilterValue = computed({
  get: () => (drawerState.drawerFilters && drawerState.drawerFilters.length > 0 ? drawerState.drawerFilters[0] : null),
  set: newValue => {
    drawerState.drawerFilters = newValue ? [newValue] : []
  },
})

const catalogFilters = computed(() => {
  let activeAction = isDrawerOpen.value ? parentAction.value : currentAction.value
  if (activeAction.items.every(x => (x.items && x.items.length > 0) || x.lazyLoadItems))
    return activeAction.items.map(x => ({ label: x.label, value: x.value }))

  return []
})

const showBackButton = computed(() => currentActionPath.value.length > 0)

watch(drawerFilterValue, (newValue, oldValue) => {
  console.log("drawerFilterValue", newValue, oldValue)
  if (newValue && !oldValue) {
    // Drawer has just been opened and filter is set for the first time
    currentActionPath.value = [...currentActionPath.value, newValue]
  } else if (newValue && oldValue) {
    // Drawer is already opened and filter is being changed
    currentActionPath.value = [...currentActionPath.value.slice(0, -1), newValue]
  } else if (!newValue && oldValue) {
    // Drawer is closed and filter is
    currentActionPath.value = [...currentActionPath.value].slice(0, -1)
  }
})

watch(currentActionPath, () => {
  emit("actionItemChanged", currentAction.value, currentActionPath.value)
})

const selectAction = actionItem => {
  if ((actionItem.items && actionItem.items.length > 0) || actionItem.lazyLoadItems === true) {
    if (isDrawerOpen.value) isDrawerOpen.value = false
    currentActionPath.value = [...currentActionPath.value, actionItem.value]
  }

  emit("actionClicked", actionItem)
}

const toggleOpenCatalog = () => {
  if (isDrawerOpen.value) {
    closeDrawer()
  } else {
    openDrawer()
  }
}

const goBack = () => {
  if (isDrawerOpen.value) {
    closeDrawer()
  } else {
    currentActionPath.value = [...currentActionPath.value].slice(0, -1)
  }
}

function openDrawer() {
  drawerFilterValue.value = catalogFilters.value[0].value
  isDrawerOpen.value = true
}

function closeDrawer() {
  drawerFilterValue.value = null
  isDrawerOpen.value = false
}
</script>

<style lang="scss" scoped>
.bng-actions-drawer {
  min-width: 20rem;
  color: white;

  &.expanded {
    width: 100%;
    height: 100%;
  }

  :deep(.bng-drawer) {
    .header-wrapper {
      .back-btn {
        font-size: 1rem;
        margin-left: -1.5rem;
        padding: 0.25rem 1rem;
        min-width: unset;
        min-height: unset;
      }

      .card-heading::before {
        opacity: 0.7;
        z-index: 1;
        height: 2rem;
      }
    }
  }

  .drawer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    overflow: hidden;

    > .filters-wrapper {
      width: 100%;
      padding: 0.5rem;
    }

    > .drawer-actions-wrapper {
      position: relative;
      flex-grow: 1;
      height: 100%;
      width: 100%;
      border-radius: 0.5rem;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        box-shadow: inset 0.75rem 0 1.5rem -0.75rem rgba(0, 0, 0, 0.5), inset -0.75rem 0 1.5rem -0.75rem rgba(0, 0, 0, 0.5);
        z-index: 1;
        pointer-events: none;
      }

      > .drawer-actions {
        display: flex;
        align-self: flex-end;
        height: 100%;
        padding: 1rem 0.5rem;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 0rem 0.5rem 0rem 0rem;
        overflow-x: auto;

        &::-webkit-scrollbar {
          // display: none;
        }

        &.expanded {
          flex-wrap: wrap;
          overflow-x: hidden;
          overflow-y: auto;
          width: 100%;

          // > .action-item {
          //   margin-right: 0.5rem !important;
          //   margin-bottom: 0.5rem;
          // }
        }

        // > .action-item {
        //   display: flex;
        //   justify-content: center;
        //   align-items: center;
        //   height: 6rem;
        //   width: 6rem;
        //   border-radius: 0.5rem;
        //   background: rgba(0, 0, 0, 0.5);

        //   &:not(:last-child) {
        //     margin-right: 0.5rem;
        //   }
        // }

        > .action-divider {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.5rem;
          writing-mode: vertical-rl;
          text-orientation: sideways;
          border-left: 1px solid var(--bng-orange-b400);
        }
      }
    }

    > .catalog-btn {
      margin-top: 0.5rem;
    }
  }

  &.expanded {
    height: 100%;

    :deep(.content) .drawer-actions-wrapper > .drawer-actions {
      align-content: flex-start;
      flex-wrap: wrap;
      overflow-y: auto;
    }
  }

  :deep(.content) {
    padding: 0.5rem;
  }
}

.progress-indicator {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 8.25rem;
  height: 100%;
  width: 100%;

  .loader,
  .loader:before,
  .loader:after {
    border-radius: 50%;
    width: 2.5em;
    height: 2.5em;
    animation-fill-mode: both;
    animation: bblFadInOut 1.8s infinite ease-in-out;
  }

  .loader {
    color: #fff;
    font-size: 7px;
    position: relative;
    text-indent: -9999em;
    transform: translateZ(0);
    animation-delay: -0.16s;

    &::before {
      left: -3.5em;
      animation-delay: -0.32s;
    }

    &::after {
      left: 3.5em;
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 0;
    }
  }

  @keyframes bblFadInOut {
    0%,
    80%,
    100% {
      box-shadow: 0 2.5em 0 -1.3em;
    }

    40% {
      box-shadow: 0 2.5em 0 0;
    }
  }
}
</style>
