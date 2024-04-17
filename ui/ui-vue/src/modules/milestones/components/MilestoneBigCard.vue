<template>
  <div class="milestone-card">
    <div class="header-wrapper">
      <BngCardHeading class="header"> </BngCardHeading>
    </div>
    <BngCard class="card">
      <div class="content">
        <div class="content-wrapper" :class="[type, { 'large-badge': isLargeBadge(type) }]">
          <ScrollingBackground class="animated-background" icon="test/images/Union.svg"></ScrollingBackground>
          <div class="sash"></div>
          <div v-if="isLargeBadge(type)" class="main-content">
            <MilestoneBadge class="badge" :type="type"></MilestoneBadge>
            <span class="message"><slot></slot></span>
          </div>
          <div v-else class="main-content">
            <div class="message-secondary" v-if="!isLargeBadge(type)"><slot name="title"></slot></div>
            <div class="message-container">
              <span v-if="getIconUrl(type)" class="message-icon" :class="[type]"></span>
              <span class="message"><slot></slot></span>
            </div>
          </div>
        </div>
      </div>
    </BngCard>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { getAssetURL } from "@/utils"
import { BngCard, BngCardHeading } from "@/common/components/base"
import MilestoneBadge from "./MilestoneBadge"
import ScrollingBackground from "./ScrollingBackground.vue"

const props = defineProps({
  type: {
    type: String,
    validator(value) {
      console.log("validator", value)
      return ["aiRace", "chase", "delivery", "stunt", "beamxp", "beambuck"].includes(value)
    },
  },
})
const iconImageUrl = computed(() => `url(${getAssetURL(getIconUrl(props.type))})`)

function isLargeBadge(type) {
  switch (type) {
    case "aiRace":
    case "chase":
    case "delivery":
    case "stunt":
      return true
    case "beamxp":
    case "beambuck":
    default:
      return false
  }
}

function getIconUrl(type) {
  switch (type) {
    case "beambuck":
      return "test/images/beambuck.svg"
    case "beamxp":
      return "test/images/beamxp.svg"
    default:
      return undefined
  }
}
</script>

<style scoped lang="scss">
$default-backdrop-color: #3864a5;
$aiRace-backdrop-color: var(--bng-add-red-500);
$chase-backdrop-color: var(--bng-add-blue-500);
$delivery-backdrop-color: var(--bng-add-green-500);
$stunt-backdrop-color: #ae01b4;
$beambuck-backdrop-color: var(--bng-add-green-500);
$beamxp-backdrop-color: var(--bng-orange-500);

$font-color: white;
$sash-height: 45%;

.milestone-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  font-family: Overpass, var(--fnt-defs);
  font-style: italic;
  color: $font-color;

  > .header-wrapper {
    width: 55%;
    display: flex;
    border-radius: 8px 8px 0 0;
    background-color: rgba(0, 0, 0, 0.6);

    :deep(.header) {
      margin-block: 0;
      margin: 0.5em 0 0;
      margin-block-start: 0.5em;
    }
  }

  > .card {
    border-radius: 0 8px 8px;
    width: 100%;
    height: 100%;

    > .content {
      width: 100%;
      height: 100%;

      > .content-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-top: 0.25em solid transparent;
        border-bottom: 0.25em solid transparent;
        overflow: hidden;

        &::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 8px;
          background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), $default-backdrop-color;
        }

        > .animated-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
        }

        > .sash {
          position: absolute;
          height: $sash-height;
          width: 110%;
          transform: rotate(-5deg);
          background: $default-backdrop-color;

          &::before {
            top: -0.5em;
          }

          &::after {
            bottom: -0.5em;
          }

          &::before,
          &::after {
            content: "";
            position: absolute;
            height: 0.5em;
            left: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.5);
          }
        }

        > .main-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          transform: rotate(-5deg);

          > .subtitle {
            font-size: 32px;
            font-weight: 800;
          }

          > .message-secondary {
            font-weight: 800;
            font-size: 36px;
            line-height: 200%;
          }

          > .message-container {
            display: flex;
            align-items: center;
            justify-content: center;

            > .message-icon {
              display: inline-block;
              background: white;
              mask-image: v-bind(iconImageUrl);
              mask-repeat: no-repeat;
              mask-size: contain;
              -webkit-mask-image: v-bind(iconImageUrl);
              -webkit-mask-repeat: no-repeat;
              -webkit-mask-size: contain;

              &.beambuck {
                width: 3.25em;
                height: 3.25em;
                transform: rotate(5deg);
                margin-bottom: 0.5em;
              }

              &.beamxp {
                width: 4.25em;
                height: 4.25em;
                transform: rotate(3deg);
              }
            }

            > .message {
              font-weight: 800;
              font-size: 36px;
              line-height: 200%;
              padding-left: 0.5em;

              :deep(h1) {
                // unsupported by cef so have to add margin
                margin-block: 0;
                margin: 0;
              }
            }
          }
        }

        &.large-badge {
          > .main-content {
            position: absolute;
            top: 18%;
            bottom: calc($sash-height - 20%);
            width: 30%;

            .badge {
              height: 75%;
              width: 90%;
            }

            .message {
              font-size: 24px;
              line-height: 24px;

              :deep(h1) {
                margin-block: 0;
                margin: 0;
              }
            }
          }
        }

        &.aiRace {
          &::before {
            background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), $aiRace-backdrop-color;
          }

          > .sash {
            background: $aiRace-backdrop-color;
          }
        }

        &.delivery {
          &::before {
            background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), $delivery-backdrop-color;
          }

          > .sash {
            background: $delivery-backdrop-color;
          }
        }

        &.chase {
          &::before {
            background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), $chase-backdrop-color;
          }

          > .sash {
            background: $chase-backdrop-color;
          }
        }

        &.stunt {
          &::before {
            background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), $stunt-backdrop-color;
          }

          > .sash {
            background: $stunt-backdrop-color;
          }
        }

        &.beambuck {
          &::before {
            background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), $beambuck-backdrop-color;
          }

          > .sash {
            background: $beambuck-backdrop-color;
          }
        }

        &.beamxp {
          &::before {
            background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), $beamxp-backdrop-color;
          }

          > .sash {
            background: $beamxp-backdrop-color;
          }
        }
      }
    }
  }
}
</style>
