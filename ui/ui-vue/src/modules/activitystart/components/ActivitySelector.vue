<template>
  <div class="activity-selector">
    <div class="activities-container">
      <div
        v-for="activity in activities"
        :key="activity"
        class="activity-icon"
        :class="{ highlighted: activity.value === value }"
        @click="onValueChanged(activity.value)"
      >
      <BngSpriteIcon
        :src="'map_'+ activity.icon" style="width:100%; height:100%" /></div>
    </div>
    <BngSelect ref="selectComponent" class="selector-control" mute loop value :options="activityOptions" :config="selectConfig" @valueChanged="onValueChanged">
      <template #display>
        <div class="selector-display">
          <span>{{ selectedOption.label }}</span>
          <BngDivider class="vertical-divider" />
          <span>{{ activities.length }}</span>
        </div>
      </template>
    </BngSelect>
  </div>
</template>

<script>
const selectConfig = {
  label: x => x.label,
  value: x => x.value,
}
</script>

<script setup>
import { computed, ref } from "vue"
import { BngSelect, BngDivider, BngSpriteIcon } from "@/common/components/base"
import { getAssetURL } from "@/utils"

const props = defineProps({
  activities: {
    type: Array,
    required: true,
  },
  value: {
    type: [String, Number],
  },
})

const selectComponent = ref()

const emits = defineEmits(["valueChanged"])

const activityOptions = computed(() => props.activities.map((x, index) => ({ label: index + 1, value: x.value })))
const selectedOption = computed(() => (activityOptions.value ? activityOptions.value.find(x => x.value === props.value) : {}))

const onValueChanged = value => {
  console.log("onValueChanged", value)
  emits("valueChanged", value)
}

defineExpose({
  goNext: () => selectComponent.value.goNext(),
  goPrev: () => selectComponent.value.goPrev(),
})

const defaultMissionIcon = computed(() => `url("${getAssetURL("icons/temp_debug/map_poi_target.svg")}")`)
</script>

<style scoped lang="scss">
@import "@/styles/modules/mixins";

.activity-selector {
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  justify-content: flex-start;

  :deep(.bng-select) {
    padding: 0;
  }

  > .activities-container {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 4rem;
    border-radius: $border-rad-1;
    margin-bottom: 0.5rem;
    align-items: center;

    > .activity-icon {
      background: center / contain no-repeat;
      width: 3rem;
      height: 3rem;
      transition: all 0.2s ease;

      &:not(:last-child) {
        margin-right: 0.25rem;
      }

      &.highlighted {
        width: 3.5rem;
        height: 3.5rem;
        filter: drop-shadow(0rem 0.125rem 0.5rem var(--bng-orange-500));
      }
    }
  }

  > :deep(.selector-control) {
    background: transparent;

    > .selector-display {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      flex: 1 0 0;
      padding: 0.125rem 0.25rem;
      border-radius: var(--border-radius-small, 0.25rem);
      background: var(--background-ui-black-60, rgba(0, 0, 0, 0.6));
      color: var(--bng-cool-gray-200);

      span {
        width: 1.5rem;
        padding: var(--border-radius-small, 0.25rem);
        color: var(--primary-white, #fff);
        text-align: center;
        font-family: Overpass;
        font-size: 1.25rem;
        font-style: normal;
        font-weight: 700;
        line-height: 1.5rem; /* 120% */
      }

      > .vertical-divider {
        background: var(--bng-cool-gray-200);
        color: var(--primary-white, #fff);
        text-align: center;
        font-family: Overpass;
        font-size: 1.25rem;
        font-style: normal;
        font-weight: 700;
        line-height: 1.5rem; /* 120% */
      }
    }
  }
}
</style>
