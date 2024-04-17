<template>
  <LayoutSingle v-bng-blur bng-ui-scope="livery-main" v-bng-on-ui-nav:back,menu="goBack" class="layout-content-full layout-align-center">
    <BngCard class="livery-main">
      <BngCardHeading type="ribbon">Livery Editor</BngCardHeading>
      <div class="main-content">
        <BngImageTile :icon="icons.plus" label="Create a new livery" bng-nav-item tabindex="0" @click="onCreateClicked" />
        <BngImageTile :icon="icons.catalog01" label="Manage saved liveries" bng-nav-item tabindex="0" @click="navigateFileManager" />
      </div>
    </BngCard>
  </LayoutSingle>
</template>

<script setup>
import { useUINavScope } from "@/services/uiNav"
import { vBngOnUiNav, vBngBlur } from "@/common/directives"
import router from "@/router"
import { BngCard, BngCardHeading, BngImageTile, icons } from "@/common/components/base"
import { LayoutSingle } from "@/common/layouts"
import { lua } from "@/bridge"

useUINavScope("livery-main")

const onCreateClicked = () => {
  lua.extensions.ui_liveryEditor_editor.createNew()
  router.replace({ name: "LiveryEditor" })
}

const navigateFileManager = () => {
  router.push({ name: "LiveryManager" })
}

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.livery-main {
  width: 30rem;
  color: white;
}

.main-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  > *:not(:last-child) {
    margin-right: 1rem;
  }
}
</style>
