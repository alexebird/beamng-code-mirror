<template>
  <div class="recovery-wrapper" bng-ui-scope="recoveryPrompt">
    <BngCard>
      <BngCardHeading type="ribbon"> {{ popupData.title }} </BngCardHeading>
      <div class="content">
        <BngImageTile
          v-for="(button, index) in popupData.buttons"
          v-bng-disabled="!button.enabled"
          v-bng-focus-if="!index"
          :class="{ 'recovery-option': true, 'show-hold': button.confirmationText }"
          :icon="icons[button.icon]"
          bng-nav-item
          tabindex="1"
          v-bng-on-ui-nav:ok.asMouse.focusRequired
          v-bng-click="{
            clickCallback: e => clickHandler(index, button, e.fromController),
            holdCallback: button.confirmationText ? () => executeButtonAction(index, button) : null,
            holdDelay: 500,
            repeatInterval: 0,
          }">
          <span class="label">{{ $ctx_t(button.label) }}</span>
          <BngDivider v-if="button.price" />
          <BngUnit class="units" v-if="button.price" :beambucks="button.price.money.amount" :options="{ formatter: x => ~~x }" />
        </BngImageTile>
        <div v-if="popupData.warningMessage" class="notification">
          {{ popupData.warningMessage }}
        </div>
      </div>
      <template #buttons>
        <BngButton
          v-bng-on-ui-nav:back,menu.asMouse
          v-if="popupData.cancelButton"
          :label="popupData.cancelButton.label"
          accent="attention"
          @click="cancelClickHandler" />
      </template>
    </BngCard>
  </div>
</template>

<script setup>
import { BngButton, BngCard, BngCardHeading, BngImageTile, BngDivider, BngUnit, icons } from "@/common/components/base"
import { onMounted, ref, onUnmounted } from "vue"
import { lua, useBridge } from "@/bridge"
import { vBngDisabled, vBngFocusIf, vBngOnUiNav, vBngClick } from "@/common/directives"
import { useGameContextStore } from "@/services"
import { openConfirmation } from "@/services/popup"
import { useUINavScope } from "@/services/uiNav"
import { default as UINavEvents, UI_EVENTS } from "@/bridge/libs/UINavEvents"
import { $translate } from "@/services/translation"

const { events } = useBridge()

useUINavScope("recoveryPrompt")

const emit = defineEmits(["return"])
const gameContextStore = useGameContextStore()
const { closeRecoveryPrompt } = gameContextStore

let popupData = ref({})

async function openConfirmationPopup(index, button) {
  const res = await openConfirmation("", button.confirmationText || "Are you sure?", [
    { label: $translate.instant("ui.common.yes"), value: true },
    { label: $translate.instant("ui.common.no"), value: false },
  ])
  if (res) executeButtonAction(index, button)
}

const clickHandler = (index, button, fromController) => {
  if (button.confirmationText && !fromController) {
    openConfirmationPopup(index, button)
    return
  }
  if (!button.confirmationText) executeButtonAction(index, button)
}

const executeButtonAction = (index, button) => {
  lua.core_recoveryPrompt.uiPopupButtonPressed(index + 1)
  if (!button.keepMenuOpen) {
    closeRecoveryPrompt()
    emit("return", true)
  }
}

const cancelClickHandler = () => {
  lua.core_recoveryPrompt.uiPopupCancelPressed()
  if (!popupData.value.cancelButton.keepMenuOpen) {
    closeRecoveryPrompt()
    emit("return", true)
  }
}

const updateRecoveryPopupData = () => {
  lua.core_recoveryPrompt.getUIData().then(value => (popupData.value = value))
}

events.on("updateRecoveryPopupData", updateRecoveryPopupData)

const start = () => {
  UINavEvents.activate()
  UINavEvents.clearFilteredEvents()
  updateRecoveryPopupData()
}

const kill = () => {
  events.off("updateRecoveryPopupData", updateRecoveryPopupData)
  if (window.bngVue.getCurrentRoute().name == "unknown") UINavEvents.setFilteredEvents.allExcept(UI_EVENTS.menu, UI_EVENTS.pause, UI_EVENTS.center_cam)
}

onMounted(start)
onUnmounted(kill)
</script>

<script>
import { popupPosition, popupContainer } from "@/services/popup"
export default {
  wrapper: {
    fade: true, // everything but popup will fade away (become semi-transparent and desaturated)
    blur: true, // fullscreen in-game blur
    style: popupContainer.transparent, // can be multiple in array
  },
  position: [popupPosition.center, popupPosition.center], // can be single w/o array
}
</script>

<style scoped lang="scss">
@import "@/styles/modules/density";

:deep(.show-hold) {
  background: linear-gradient(
    to top,
    rgba(var(--bng-orange-300-rgb), calc(20% * var(--hold-completion))) 0%,
    rgba(var(--bng-orange-300-rgb), calc(80% * var(--hold-completion))) calc(100% * var(--hold-completion)),
    rgba(0, 0, 0, 0) calc(100% * var(--hold-completion)),
    rgba(0, 0, 0, 0)
  );
}

.recovery-wrapper {
  color: white;
  max-width: 32em;
  .content {
    display: flex;
    flex-flow: row wrap;
    align-items: stretch;
    align-content: baseline;
    justify-content: center;
    padding: 0.5em 0.5em;
    .notification {
      flex: 1 1 auto;
      // border: 0.125rem solid var(--bng-add-red-700);
      border-radius: $border-rad-2;
      margin: 0.5rem 0.25rem;
      padding: 0.75em;
      background-color: rgba(var(--bng-add-red-700-rgb), 0.4);
    }
    .recovery-option {
      align-items: baseline;
      font-size: 1em;

      &.tile {
        align-items: center;
        flex: 0.5 0 8em;
        margin: 0.25rem;
        // padding: 0.5rem 0.5rem 1rem;
        // padding: 0.5rem;
        padding: 0;
        justify-content: flex-start;
        & > :deep(.contents) {
          display: grid;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem 0.75rem 0.5rem;
          & > .units {
            padding: 0;
            align-self: center;
            justify-self: center;
          }
        }
      }

      .vertical-divider {
        margin-top: 0;
        margin-bottom: 0;
      }

      .units {
        display: inline-flex;
        align-items: baseline;
      }

      & > .label {
        flex: 1 1 auto;
      }
      .units-icon,
      .recovery-icon {
        margin-right: 0.125em;
        font-size: 1.5em;
      }

      .recovery-icon {
        font-size: 2em;
      }

      .units-icon {
        transform: translateY(0.05em);
      }

      :deep(.info-item) {
        padding: 0.5rem;
        .icon {
          width: auto;
          height: auto;
        }
      }
    }
  }
}
</style>
