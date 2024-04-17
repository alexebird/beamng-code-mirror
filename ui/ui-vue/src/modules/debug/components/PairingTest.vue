<template>
  <div>
    <div class="test-row">
      Component pair:
      <BngDropdown
        v-for="(sel, idx) in view" :key="`list_${idx}`"
        v-model="view[idx]"
        :items="components"
      >
        <template #display>{{ view[idx].label }}</template>
      </BngDropdown>
    </div>
    <div class="layout-test">
      <span class="layout-baseline">View:</span>
      <component
        v-for="(item, idx) in view" :key="`test_${idx}`"
        :is="item.value"
        v-bind="props"
      >{{ allProps.inner.enabled ? allProps.inner.value : undefined }}</component>
      Quick brown fox jumps over a lazy dog.
    </div>
    <div>
      Props:
      <BngPillCheckbox
        v-for="(prop, key) in allProps" :key="`prop_${key}`"
        v-model="prop.enabled"
      >{{ key }}</BngPillCheckbox>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue"
import * as BaseComponentExports from "@/common/components/base"
import { BngDropdown, BngPillCheckbox } from "@/common/components/base"

const components = Object.keys(BaseComponentExports)
  .filter(name => !name.endsWith("Demo"))
  .map(name => ({ label: name, value: BaseComponentExports[name] }))

const view = ref(["BngInput", "BngButton"])
for (let i in view.value)
  view.value[i] = components.find(itm => itm.label === view.value[i])

const props = computed(() =>
  Object.keys(allProps)
    .filter(name => allProps[name].enabled && !allProps[name].excludeFromProps)
    .reduce((res, name) => ({ ...res, [name]: allProps[name].value }), {})
)

const allProps = reactive({
  inner: { enabled: true, excludeFromProps: true, value: "Test" },
  value: { enabled: true, value: 123 },
  min: { enabled: true, value: 0 },
  max: { enabled: true, value: 200 },
  items: { enabled: false, value: [{label: 'item 1', value: 1 }, {label: 'item 2', value: 2 }, {label: 'item 3', value: 3 }] },
  options: { enabled: false, value: [1,2,3] },
  icon: { enabled: false, value: "check" },
})
</script>

<style lang="scss" scoped>
.test-row > :deep(.bng-dropdown) {
  display: inline-flex;
}
</style>
