<template>
  <div
    :class="{
      'part-tile': true,
      'part-tile-row': layout === 'table',
      'with-icon': icon,
      'is-installed': !!data.installed,
    }"
    role="“button”"
    v-bng-disabled="data.disabled">
    <BngIcon class="icon" v-if="icon" :type="data.icon || icons.noNameControllerButton" />
    <div
      :class="{
        pictograms: true,
        'with-cat': !!data.category,
      }">
      <BngCondition :integrity="'integrity' in data ? data.integrity : 1.0" :color="data.color || '#000'" />
      <BngIcon v-if="data.category" class="category" :type="icons.listIndented" />
    </div>
    <div :class="['info', !!data.description ? 'with-desc' : 'without-desc']">
      <div class="tags" v-if="data.tags">
        <span v-for="tag in data.tags">{{ tag }}</span>
      </div>
      <span class="name" v-bng-tooltip:top="!!data.description ? data.name : undefined">{{ data.name }}</span>
      <span class="desc" v-if="data.description">{{ data.description }}</span>
    </div>
  </div>
</template>

<script>
export default {
  width: 14, // em
  margin: 0.25, // em, on each side
}
</script>

<script setup>
import { vBngDisabled, vBngTooltip } from "@/common/directives"
import { BngCondition, BngIcon, icons } from "@/common/components/base"

defineProps({
  data: {
    /* {
      name - part name
      [description] - part description
      [icon] - icon name
      [integrity] - integrity level, 0.0..1.0
      [color] - paint
      [category] - true if it has subparts
      [tags] - list of string tags
    } */
    type: Object,
    required: true,
  },
  icon: {
    type: Boolean,
    default: true,
  },
  layout: {
    type: String,
    default: "tile",
  },
  containerWidth: Number,
})
</script>

<style lang="scss" scoped>
.part-tile {
  &:not(.part-tile-row) {
    flex: 1 0 14em;
    width: 14em;
    max-width: 14em;
    &.with-icon {
      flex: 1 0 15em;
      width: 15em;
      max-width: 15em;
    }
  }

  height: 5.25em;
  margin: 0.25em;

  &.part-tile-row {
    flex: 0 0 100%;
    width: 100%;
    height: 2.5em;
  }

  display: flex;
  flex-flow: row;
  flex-wrap: nowrap;
  justify-content: stretch;
  align-content: stretch;

  background-color: rgba(#000, 0.6);
  color: #fff;

  &.is-installed {
    color: var(--bng-orange);
  }

  > * {
    margin: 0.5em 0.125em;
  }
  > *:first-child {
    margin-left: 0.5em;
  }
  > .icon {
    margin-left: 0.2em;
  }
  > *:last-child {
    margin-right: 0.5em;
  }

  &.selected,
  &:hover,
  &:focus,
  &:focus-within {
    background-color: rgba(#747474, 0.8);
  }

  &:focus,
  &:focus-within {
    .tags {
      z-index: 100;
    }
  }

  &[disabled] {
    pointer-events: none;
    > * {
      color: #aaa;
    }
  }
}

.icon {
  flex: 0 0 1em;
  width: 1em;
  height: 1em;
  font-size: 3em;
}
.part-tile-row .icon {
  flex: 0 0 auto;
  width: auto;
  height: 100%;
}

.pictograms {
  flex: 0 0 1.75em;
  width: 1.75em;
  // height: 3.25em;
  padding: 0.2em;
  border-radius: 0.2em;
  background-color: rgba(#000, 0.8);
  // &.with-cat {
  // }
  .category {
    font-size: 1.25em;
  }
}
.part-tile-row .pictograms {
  flex: 0 0 auto;
  width: auto;
  padding: 0;
}

.info {
  flex: 1 1 60%;
  width: 60%;
  position: relative;
  height: 4em;
  > * {
    display: block;
    width: 100%;
    padding: 0.25em;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  &.without-desc > .name {
    white-space: normal;
    text-overflow: initial;
  }
  .name {
    font-weight: 700;
  }
  .desc {
    font-weight: 400;
  }
  .tags {
    display: none;
    position: absolute;
    top: -1.5em;
    left: 0;
    right: 0;
    overflow: hidden;
    > * {
      padding: 0 0.2em;
      margin-right: 0.2em;
      background-color: rgba(#000, 0.8);
      border: 1px solid #2f4858;
      border-radius: 0.2em;
      font-size: 0.8em;
      font-weight: 500;
      &:hover {
        border: 1px solid rgba(#000, 0.8);
        background-color: #2f4858;
      }
    }
  }
}
</style>
