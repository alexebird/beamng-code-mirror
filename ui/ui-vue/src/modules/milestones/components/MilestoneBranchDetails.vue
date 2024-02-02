<template>
  <div class="milestone-branch-details" :class="{ 'show-flag': branch.showFlag }">
    <div class="media-container">
      <div class="image-container">
        <img :src="getAssetURL(branch.image)" />
      </div>
      <span class="branch-name">{{ branch.name }}</span>
      <span v-if="branch.showFlag" class="flag-container">
        <milestone-badge type="aiRace"></milestone-badge>
      </span>
    </div>
    <div class="description">{{ branch.description }}</div>
  </div>
</template>

<script setup>
import { getAssetURL } from "@/utils"
import MilestoneBadge from "./MilestoneBadge"

defineProps({
  branch: {
    type: Object,
    required: true,
    validator(value) {
      return (
        value.hasOwnProperty("name") &&
        typeof value.name === "string" &&
        value.hasOwnProperty("image") &&
        typeof value.image === "string" &&
        value.hasOwnProperty("description") &&
        typeof value.description === "string" &&
        (value.showFlag === undefined || value.showFlag === null || typeof value.showFlag === "boolean")
      )
    },
  },
})
</script>

<style scoped lang="scss">
$aiRace-backdrop-color: var(--bng-add-red-600);

.milestone-branch-details {
  width: 208.5px;
  height: 483px;

  color: white;

  &.show-flag {
    > .media-container {
      > .image-container {
        border-bottom: 15px solid $aiRace-backdrop-color;
      }

      > .flag-container {
        position: absolute;
        width: 6.5em;
        height: 6.5em;
        bottom: -2.5em;
        left: calc(50% - 2.78em);
      }
    }

    > .description {
      margin-top: 2em;
      height: calc(55% - 1.78em);
    }
  }

  > .media-container {
    position: relative;
    height: 45%;

    > .image-container {
      height: 100%;
      border-radius: 0.5em;
      overflow: hidden;

      > img {
        object-fit: cover;
        width: 100%;
        height: 100%;
        -webkit-user-drag: none;
      }
    }

    > .branch-name {
      position: absolute;
      display: inline-block;
      width: 100%;
      top: calc(50% - 0.75em);
      left: 0;
      text-align: center;
      font-size: 1.5em;
      font-weight: 800;
      font-style: italic;
      line-height: 1.5em;
      letter-spacing: 0.01em;
      text-shadow: 0 0.25em 0.625em #000000;
    }
  }

  > .description {
    height: calc(55% - 0.5em);
    margin-top: 0.5em;
    font-size: 1em;
    font-weight: 400;
    line-height: 1.5em;
    letter-spacing: 0.01em;
    overflow: hidden;
  }
}
</style>
