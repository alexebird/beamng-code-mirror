<template>
  <div class="paintingPage">
    <BngCardHeading> Painting </BngCardHeading>

    <Tabs class="bng-tabs" :selected-index="0" :make-tab-header-classes="headerClass" :style="headerVars">
      <Tab v-for="(paint, idx) in paints" :key="idx" :heading="$t('ui.trackBuilder.matEditor.paint') + ' ' + (idx + 1)">
        <h3>
          <BngSwitch v-model="advanced"> Paint editor </BngSwitch>
        </h3>
        <PaintPicker v-model="paints[idx]" :show-main="advanced" :presets="presets" :presets-editable="true" @change="onChange" />
      </Tab>
    </Tabs>

    <BngButton @click="apply">Apply</BngButton>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue"
import { lua } from "@/bridge"
import { Tabs, Tab } from "@/common/components/utility"
import { BngCardHeading, BngSwitch, BngButton } from "@/common/components/base"
import PaintPicker from "@/modules/vehicleConfig/components/PaintPicker.vue"
import Paint from "@/utils/paint"

const advanced = ref(false)

const presets = ref({})
lua.career_modules_painting.getFactoryPaint().then(data => (presets.value = data))

const paints = ref([])
lua.career_modules_painting.getPaintData().then(data => {
  if (!data || !Array.isArray(data)) {
    paints.value = []
    paintFilters.value = []
    return
  }
  paints.value = data.map(val => reactive(new Paint({ paint: val })))
})

const props = defineProps({
  buttonTarget: Object,
  closeButton: {
    type: Boolean,
    default: true,
  },
})

function headerClass(tab) {
  return {
    "painting-tab": true,
    [`painting-tab-${tab.id}`]: true,
  }
}
const headerVars = computed(() =>
  paints.value.reduce(
    (res, paint, idx) => ({
      ...res,
      [`--painting-dot-${idx}`]: `hsl(${Paint.hslCssStr(paint.hsl)})`,
    }),
    {}
  )
)

function onChange() {
  lua.career_modules_painting.setPaints(paints.value.map(paint => paint.paintObject))
}

const apply = () => lua.career_modules_painting.apply()
const close = () => lua.career_modules_painting.close()

defineExpose({
  apply,
  close,
})
</script>

<style scoped lang="scss">
.paintingPage {
  color: white;
  padding: 1em;
  overflow: auto;
}

:deep(.painting-tab) {
  &::after {
    content: "";
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: 1em;
    margin-left: 0.5em;
  }
  @for $i from 0 through 2 {
    &.painting-tab-#{$i}::after {
      background-color: var(--painting-dot-#{$i});
    }
  }
}
</style>
