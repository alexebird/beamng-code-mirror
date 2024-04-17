<template>
  <div class="paintingPage">
    <BngCardHeading> Painting </BngCardHeading>

    <Tabs class="bng-tabs" :selected-index="0" :make-tab-header-classes="headerClass" :style="headerVars" @change="changedPaintIndexTab">
      <Tab v-for="(paint, idx) in paints" :key="idx" :heading="$t('ui.trackBuilder.matEditor.paint') + ' ' + (idx + 1)">
        <Tabs class="bng-tabs" :selected-index="0" @change="changedTopLevelPaintClassTab">
          <Tab heading="Factory"></Tab>

          <!-- TODO - remove ALL these hardcoded, repeated colour class values -->

          <Tab heading="Gloss">
            <BngButton @click="changedPaintClassTab('matte')" :accent="colorClass != 'matte' ? 'secondary' : undefined">Matte</BngButton>
            <BngButton @click="changedPaintClassTab('semiGloss')" :accent="colorClass != 'semiGloss' ? 'secondary' : undefined">Semi Gloss</BngButton>
            <BngButton @click="changedPaintClassTab('gloss')" :accent="colorClass != 'gloss' ? 'secondary' : undefined">Full Gloss</BngButton>
          </Tab>
          <Tab heading="Metallic">
            <BngButton @click="changedPaintClassTab('semiMetallic')" :accent="colorClass != 'semiMetallic' ? 'secondary' : undefined">Semi Metallic</BngButton>
            <BngButton @click="changedPaintClassTab('metallic')" :accent="colorClass != 'metallic' ? 'secondary' : undefined">Metallic</BngButton>
            <BngButton @click="changedPaintClassTab('chrome')" :accent="colorClass != 'chrome' ? 'secondary' : undefined">Chrome</BngButton>
          </Tab>

          <Tab heading="Custom"></Tab>
        </Tabs>
      </Tab>
    </Tabs>

    <BngCard>
      <!-- TODO - remove inline styling -->
      <div style="margin: 0.5em">
        <PaintPicker
          ref="paintPicker"
          v-model="paints[paintIndex]"
          :show-main="showPickerMain()"
          :presets="getPickerShowPresets() ? presets : undefined"
          :presets-editable="getPickerPresetsEditable()"
          :advanced-open="false"
          :show-advanced-switch="false"
          @change="onChange" />

        <!-- TODO - remove inline styling -->
        <div v-if="showClearCoatOption()" style="margin-top: 1em">
          <input bng-nav-item type="checkbox" id="clearCoat" v-model="clearCoatActive" v-on:change="clearCoatCheckboxCallback" />
          <label for="clearCoat">Add Clear Coat (Baseprice: {{ units.beamBucks(prices.clearcoatBase.money.amount) }})</label>

          <BngColorSlider v-if="clearCoatActive" v-model="clearCoatPolish" @change="changeClearCoatPolish"> Clear Coat Polish </BngColorSlider>
        </div>
      </div>
    </BngCard>

    <BngCard class="shoppingCart">
      <div v-if="changedPaint" class="innerShoppingCart">
        <!-- TODO - remove inline styling -->
        <table style="width: 100%">
          <tr>
            <th></th>
            <th class="article">Option</th>
            <th class="price">Price</th>
          </tr>
          <tr v-for="(date, idx) in getShoppingCartTable()">
            <th><BngButton v-if="date.topLevel" @click="resetPaint(date.index)">remove</BngButton></th>
            <!-- TODO - remove inline styling -->
            <th class="article" :style="{ paddingLeft: date.topLevel ? '0em' : '2em' }">{{ date.name }}</th>
            <th class="price">{{ units.beamBucks(date.price) }}</th>
          </tr>
          <tr>
            <th></th>
            <!-- TODO - remove inline styling -->
            <th class="article" style="padding-top: 5px; font-size: 1.3em">Total</th>
            <th class="price" style="padding-top: 5px; font-size: 1.3em">{{ units.beamBucks(totalPrice) }}</th>
          </tr>
        </table>
      </div>
      <BngButton
        :disabled="!canPay || !changedPaint"
        show-hold
        v-bng-on-ui-nav:ok.asMouse.focusRequired
        v-bng-click="{
          holdCallback: () => apply(),
          holdDelay: 1000,
          repeatInterval: 0,
        }">
        Purchase and Apply
      </BngButton>
    </BngCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { lua, useBridge } from "@/bridge"
import { Tabs, Tab } from "@/common/components/utility"
import { BngCardHeading, BngButton, BngUnit, BngCard, BngColorSlider } from "@/common/components/base"
import { vBngOnUiNav, vBngClick } from "@/common/directives"
import { openConfirmation } from "@/services/popup"
import { $translate } from "@/services/translation"

import PaintPicker from "@/modules/vehicleConfig/components/PaintPicker.vue"
import Paint from "@/utils/paint"

const { units, events } = useBridge()

const presets = ref({})
lua.career_modules_painting.getFactoryPaint().then(data => (presets.value = data))

const colorClass = ref("factory")
const paintIndex = ref(0)
const chosenPackage = ref([{}, {}, {}])
const changedPaint = ref(false)
const totalPrice = ref(0)

const clearCoatActive = ref(false)
const clearCoatPolish = ref(0)

const paints = ref([])
const originalPaints = ref([])
const prices = ref({})
const canPay = ref(false)
const paintPicker = ref(null)

const clearCoatCheckboxCallback = event => {
  clearCoatPolish.value = 0
  changeClearCoatPolish(0)
  enableClearCoat(event.target._modelValue)
}

const enableClearCoat = enabled => {
  paints.value[paintIndex.value]._clearcoat = enabled ? 1 : 0
  paintPicker.value.paintUpdated()
}

const changeClearCoatPolish = value => {
  paints.value[paintIndex.value]._clearcoatRoughness = -0.13 * value + 0.13
  paintPicker.value.paintUpdated()
}

const getShoppingCartTable = () => {
  let res = []

  for (const [index, paintOptions] of chosenPackage.value.entries()) {
    if (!Object.keys(paintOptions).length) continue

    res.push({
      name: "Paint " + (index + 1) + ": " + getNicePaintClassName(paintOptions.paintClass),
      price: prices.value.basePrices[paintOptions.paintClass].money.amount,
      topLevel: true,
      index,
    })

    if (paintOptions.clearCoat) {
      res.push({
        name: "Clearcoat",
        price: prices.value.clearcoatBase.money.amount,
      })
      res.push({
        name: "Extra Clearcoat Polish",
        price: prices.value.clearcoatPolishFactor.money.amount * paintOptions.clearCoatPolish,
      })
    }
  }

  return res
}

const setPaintingShoppingCartData = data => {
  canPay.value = data.canPay
  totalPrice.value = data.totalPrice.money.amount
}
events.on("sendPaintingShoppingCartData", setPaintingShoppingCartData)

lua.career_modules_painting.getPaintData().then(data => {
  prices.value = data.prices
  if (!data || !Array.isArray(data.colors)) {
    paints.value = []
    return
  }
  paints.value = data.colors.map(val => new Paint({ paint: val }))
  originalPaints.value = data.colors.map(val => new Paint({ paint: val }))
})

const getPickerShowPresets = () => colorClass.value == "factory"

const getPickerPresetsEditable = () => colorClass.value == "custom"

const showPickerMain = () => colorClass.value != "factory"

const showClearCoatOption = () => colorClass.value != "factory" && colorClass.value != "custom"

// TODO - refactor!!!!
const setCurrentColorClass = () => {
  if (colorClass.value == "matte") {
    paints.value[paintIndex.value]._metallic = 0
    paints.value[paintIndex.value]._roughness = 0.7
    clearCoatActive.value = false
    enableClearCoat(false)
  } else if (colorClass.value == "semiGloss") {
    paints.value[paintIndex.value]._metallic = 0
    paints.value[paintIndex.value]._roughness = 0.13
    clearCoatActive.value = false
    enableClearCoat(false)
  } else if (colorClass.value == "gloss") {
    paints.value[paintIndex.value]._metallic = 0
    paints.value[paintIndex.value]._roughness = 0
    clearCoatActive.value = false
    enableClearCoat(false)
  } else if (colorClass.value == "semiMetallic") {
    paints.value[paintIndex.value]._metallic = 0.5
    paints.value[paintIndex.value]._roughness = 0.5
    clearCoatActive.value = false
    enableClearCoat(false)
  } else if (colorClass.value == "metallic") {
    paints.value[paintIndex.value]._metallic = 1
    paints.value[paintIndex.value]._roughness = 0.5
    clearCoatActive.value = false
    enableClearCoat(false)
  } else if (colorClass.value == "chrome") {
    paints.value[paintIndex.value]._metallic = 1
    paints.value[paintIndex.value]._roughness = 0
    clearCoatActive.value = false
    enableClearCoat(false)
  } else if (colorClass.value == "custom") {
    clearCoatActive.value = false
  }

  if (colorClass.value == "custom") {
    paintPicker.value.setAdvancedVisible(true)
  } else {
    paintPicker.value.setAdvancedVisible(false)
  }
  paintPicker.value.paintUpdated()
}

const changedPaintIndexTab = tab => {
  paintIndex.value = tab.id
  colorClass.value = chosenPackage.value[paintIndex.value].paintClass || "factory"
  paintPicker.value.setAdvancedVisible(colorClass.value == "custom")
  clearCoatActive.value = chosenPackage.value[paintIndex.value].clearCoat
  clearCoatPolish.value = chosenPackage.value[paintIndex.value].clearCoatPolish
}

const changedTopLevelPaintClassTab = tab => {
  const classTab = {
    Factory: "factory",
    Custom: "custom",
    Gloss: "semiGloss",
    Metallic: "metallic",
  }[tab.heading]
  classTab && changedPaintClassTab(classTab)
}

const changedPaintClassTab = paintClass => {
  if (paintClass == "factory") {
    colorClass.value = "factory"
    return
  }
  if (paintClass == "custom") {
    colorClass.value = "custom"
    paintPicker.value.setAdvancedVisible(true)
    clearCoatActive.value = false
    return
  }

  colorClass.value = paintClass
  setCurrentColorClass()
}

function resetPaint(index) {
  chosenPackage.value[index] = {}

  // Copy the original paint
  Object.assign(paints.value[index], originalPaints.value[index])

  lua.career_modules_painting.setPaints(
    paints.value.map(paint => paint.paintObject),
    chosenPackage.value
  )
}

function onChange() {
  chosenPackage.value[paintIndex.value].paintClass = colorClass.value
  chosenPackage.value[paintIndex.value].clearCoat = clearCoatActive.value
  chosenPackage.value[paintIndex.value].clearCoatPolish = clearCoatPolish.value

  changedPaint.value = true

  lua.career_modules_painting.setPaints(
    paints.value.map(paint => paint.paintObject),
    chosenPackage.value
  )
}

async function openConfirmationPopup() {
  const res = await openConfirmation("", "Purchase and apply the new paint for " + units.beamBucks(totalPrice.value) + "?", [
    { label: $translate.instant("ui.common.yes"), value: true },
    { label: $translate.instant("ui.common.no"), value: false },
  ])
  if (res) apply()
}

const NICE_PAINT_CLASS_NAMES = {
  factory: "Factory",
  semiGloss: "Semi Gloss",
  gloss: "Gloss",
  semiMetallic: "Semi Metallic",
  metallic: "Metallic",
  matte: "Matte",
  chrome: "Chrome",
  custom: "Custom",
}
const getNicePaintClassName = paintClass => {
  return NICE_PAINT_CLASS_NAMES[paintClass]
}

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

const apply = () => lua.career_modules_painting.apply()
const close = () => lua.career_modules_painting.close()

const start = () => {
  lua.career_modules_painting.onUIOpened()
}

onMounted(start)

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

.innerShoppingCart {
  overflow-y: auto;
}

.price {
  text-align: right;
  padding-right: 70px;
}

.article {
  text-align: left;
  padding-left: 70px;
}

.shoppingCart {
  padding-top: 2em;
}
</style>
