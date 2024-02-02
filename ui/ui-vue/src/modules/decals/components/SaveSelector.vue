<template>
  <LayoutSingle class="layout-content-full layout-align-center">
    <div class="decals-load-view">
      <BngCard class="load-card">
        <BngCardHeading>Dynamic Decals</BngCardHeading>
        <div class="load-content">
          <div class="action-heading">create new file</div>
          <div class="action-entry">
            <bng-input class="action-select" floating-label="save name" v-model="newSaveFilename" />
            <!-- <bng-button class="action-btn" :disabled="!newSaveFilename" @click="onCreate">create</bng-button> -->
            <button class="action-btn" :disabled="!newSaveFilename" @click="onCreate">create</button>
          </div>
          <div class="divider">
            <span class="text">or</span>
          </div>
          <div class="action-heading">load saved file</div>
          <div class="action-entry">
            <bng-dropdown class="action-select" v-model="selectedSaveFile" :items="availableSaveFiles" />
            <!-- <bng-button :disabled="!selectedSaveFile" @click="onLoad">load</bng-button> -->
            <button :disabled="!selectedSaveFile" @click="onLoad">load</button>
          </div>
        </div>
      </BngCard>
    </div>
  </LayoutSingle>
</template>

<script setup>
import { ref, computed } from "vue"
import { LayoutSingle } from "@/common/layouts"
import { BngButton, BngCard, BngCardHeading, BngInput, BngDropdown } from "@/common/components/base"

const props = defineProps({
  saveFiles: {
    type: Array,
    required: true,
  },
})

const emits = defineEmits(["load", "create"])

const newSaveFilename = ref(null)
const selectedSaveFile = ref(null)

const availableSaveFiles = computed(() => (props.saveFiles ? props.saveFiles.map(x => ({ label: x.name, value: x.location })) : []))

const onLoad = async () => {
  emits("load", selectedSaveFile.value)
}

const onCreate = () => {
  emits("create", newSaveFilename.value)
}
</script>

<style scoped lang="scss">
.decals-load-view {
  width: 80vh;
  height: 80vh;
  color: white;

  > :deep(.load-card) {
    > .card-cnt {
      padding: 0.75rem;
    }

    .load-content {
      display: flex;
      flex-direction: column;

      > .action-heading {
        display: flex;
        // justify-content: center;
        align-items: center;
        font-weight: 400;
        font-size: 1.25rem;
      }

      > .action-entry {
        display: flex;
        align-items: center;
        justify-content: center;

        > .action-select {
          flex-grow: 1;
        }
      }

      > .divider {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 0.5rem 0;

        > .text {
          padding: 0 1rem;
        }

        &::before,
        &::after {
          content: "";
          display: inline-block;
          height: 1px;
          flex-grow: 1;
          background: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .button-actions {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
