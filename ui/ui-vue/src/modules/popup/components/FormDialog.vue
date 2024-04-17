<template>
  <div class="form-dialog">
    <div v-if="title" class="form-dialog-toolbar">
      <div class="toolbar-title">
        {{ title }}
      </div>
    </div>
    <div :class="{ 'no-title': !title }" class="form-dialog-content">
      <div v-if="description" class="content-description">
        {{ description }}
      </div>
      <div class="content-wrapper">
        <component :is="view" v-model="modelValue" />
      </div>
    </div>
    <div class="form-actions-bar">
      <BngButton accent="attention" @click="onCancel">Cancel</BngButton>
      <BngButton @click="onSave" :disabled="!isSaveButtonEnabled">Save</BngButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { BngButton } from '@/common/components/base'

const props = defineProps({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  view: {
    type: [Object, String],
    required: true,
  },
  formModel: {
    type: [Object, String, Number, Boolean],
    required: true,
  },
  formValidator: {
    type: Function,
    default: (formModel) => true,
  }
})

const emit = defineEmits(["return"])

const modelValue = ref(props.formModel)

const isSaveButtonEnabled = computed(() => props.formValidator(modelValue.value))

const onSave = () => emit("return", { success: true, value: modelValue.value })
const onCancel = () => emit("return", { success: false })
</script>

<style lang="scss" scoped>
$border-top: 0.5rem 0.5rem 0 0;

.form-dialog {
  display: flex;
  flex-direction: column;
  color: white;
  max-width: 40rem;

  >.form-dialog-toolbar {
    background: #333;
    padding: 0.5rem;
    overflow: hidden;
    border-radius: $border-top;

    >.toolbar-title {
      padding: 0 0.5rem;
      font-size: 1.2em;
    }
  }

  >.form-dialog-content {
    padding: 1rem;
    background-color: #252525;
    overflow: hidden;

    &.no-title {
      border-radius: $border-top;
    }

    >.content-description {
      padding: 1rem;
      border-radius: 0.125rem;
      font-size: 0.9rem;
      background: rgba(0, 0, 0, 0.4);
    }

    >.content-wrapper {
      padding-top: 0.5rem;
    }
  }

  >.form-actions-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0.5rem;
    background-color: #252525;
    border-radius: 0 0 0.5rem 0.5rem;
  }
}
</style>