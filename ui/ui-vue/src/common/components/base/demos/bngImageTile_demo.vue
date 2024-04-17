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
import { BngImageTile, icons } from "@/common/components/base"
const $xp = icons.beamXPLo
</script>
