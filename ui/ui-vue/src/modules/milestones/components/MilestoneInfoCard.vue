<template>
  <div class="milestone-info-card">
    <img :src="getAssetURL(milestone.image)" />
    <div class="info">
      <span class="title">{{ milestone.title }}</span>
      <span class="badge">{{ milestone.badgeText }}</span>
      <span class="description">{{ milestone.description }}</span>
    </div>
  </div>
</template>

<script setup>
import { getAssetURL } from "@/utils"

const props = defineProps({
  milestone: {
    type: Object,
    required: true,
    validator(value) {
      return (
        value.hasOwnProperty("title") &&
        typeof value.title === "string" &&
        value.hasOwnProperty("badgeText") &&
        typeof value.badgeText === "string" &&
        value.hasOwnProperty("description") &&
        typeof value.description === "string" &&
        value.hasOwnProperty("image") &&
        typeof value.image === "string"
      )
    },
  },
})
</script>

<style scoped lang="scss">
$font-color: white;
$font: Overpass, var(--fnt-defs);
$background: rgba(0, 0, 0, 0.6);
$border-radius: 0.5em;
$badge-border-color: #3e4351;

.milestone-info-card {
  display: flex;
  flex-direction: column;
  border-radius: $border-radius;
  font-family: $font;
  background: $background;
  color: $font-color;

  > .img {
    width: 100%;
    object-fit: cover;
  }

  > .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5em;

    > .title {
      font-weight: 700;
      font-size: 1.1em;
    }

    > .badge {
      align-self: center;
      padding: 0.25em 1em;
      border: 1px solid $badge-border-color;
      border-radius: 0.5em;
      margin-top: 0.25em;
      margin-bottom: 0.75em;
      font-size: 0.89em;
      font-weight: 700;
    }

    > .description {
      font-weight: 400;
      font-size: 0.89em;
      line-height: 1.125em;
      padding-bottom: 0.5em;
    }
  }
}
</style>
