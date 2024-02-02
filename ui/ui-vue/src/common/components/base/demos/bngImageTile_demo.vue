<template>
  Icon, no label
  <BngImageTile :icon="$xp" />
  Icon, label
  <BngImageTile label="Label" :icon="$xp" />
  Image, no label
  <BngImageTile :icon="$xp" />
  Image, label
  <BngImageTile label="Label" :icon="$xp" />
  Label only
  <BngImageTile label="Label" />
</template>

<script setup>
import { icons } from "@/common/components/base/bngIcon.vue"
import { BngImageTile } from "@/common/components/base"
const $xp = icons.general.beamXP
</script>
