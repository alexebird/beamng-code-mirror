<template>
  <BngCard v-if="branchData" class="branch-skill-card" @click="openBranchPage(branchKey)" :style="{ '--branch-color': branchColor }">
    <AspectRatio class="image-container aspect-ratio" :image="branchData.cover" :ratio="'16:9'" />
    <div class="branch-details">
      <div class="branch-progress">
        <div class="badge">
          <div class="backdrop">{{ branchData.value.color }}</div>
          <BngIcon class="icon-branch" :type="icons[branchData.glyphIcon]" />
        </div>
        <BngProgressBar
          v-if="branchData"
          class="main-stat-progress-bar"
          :headerLeft="$ctx_t(branchData.name)"
          :headerRight="$ctx_t(branchData.levelLabel)"
          :value="branchData.max == -1 ? 1 : branchData.value - branchData.min"
          :max="branchData.max == -1 ? 1 : branchData.max - branchData.min"
          :showValueLabel="true"
          :valueLabelFormat="branchData.max == -1 ? branchData.value.toString() + '&nbsp;XP' : '#value#&nbsp;XP'" />
      </div>
      <div class="skill-levels-wrapper">
        <div v-for="skill in branchData.skills">
          <BngProgressBar
            v-if="branchData"
            class="stat-progress-bar"
            :headerLeft="$ctx_t(skill.name)"
            :headerRight="$ctx_t(skill.levelLabel)"
            :value="skill.max == -1 ? 1 : skill.value - skill.min"
            :max="skill.max == -1 ? 1 : skill.max - skill.min"
            :showValueLabel="true"
            :valueLabelFormat="skill.max == -1 ? skill.value.toString() + '&nbsp;XP' : skill.isInDevelopment ? 'Coming Soon!' : '#value#&nbsp;XP'" />
        </div>
      </div>
    </div>
  </BngCard>
</template>

<script setup>
import { lua } from "@/bridge"
import { BngCard, BngProgressBar, BngIcon, icons } from "@/common/components/base"
import { onMounted } from "vue"
import { ref, computed } from "vue"
import { getAssetURL } from "@/utils"
import { AspectRatio } from "@/common/components/utility"

const props = defineProps({
  branchKey: String,
})
const emit = defineEmits(["openBranchPage"])

const branchData = ref()

const iconImageUrl = computed(() => branchData.value && `url(${getAssetURL(branchData.value.icon)})`)
// const branchColor = computed(() => branchData.value && branchData.value.color)

const branchColor = computed(() => {
  const color = branchData.value && branchData.value.color
  if (!color) return ""
  if (color.startsWith("#")) {
    return hexToRgb(color)
  } else if (color.startsWith("var(--")) {
    return `${color}`
  } else {
    return "transparent"
  }
})

const openBranchPage = branchKey => emit("openBranchPage", branchKey)
function setup(data) {
  // console.log(data)
  branchData.value = data
  branchData.value.skills = sortOptions(data.skills)
}

function sortOptions(data) {
  return [...data].sort((a, b) => a.order < b.order)
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

onMounted(async () => {
  setup(await lua.career_modules_branches_landing.getBranchSkillCardData(props.branchKey))
})
</script>

<style scoped lang="scss">
$backdrop-shape: polygon(26% 8%, 73% 8%, 92% 39%, 64% 100%, 19% 100%, 0 70%);

.branch-skill-card {
  cursor: pointer;
  display: flex;
  flex-flow: column;
  position: relative;
  border-radius: var(--bng-corners-2);
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  translate: all ease-in 50ms;
  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.02);
    box-shadow: inset 0 0 0 0.25rem rgb(var(--branch-color));
  }
  &:focus {
    background-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.02);
  }

  .image-container {
    //border-bottom: 4rem solid v-bind(branchColor);
    box-shadow: inset 0rem -0.125rem 0rem 0rem rgb(var(--branch-color));

    .branch-label {
      font-family: Overpass, var(--fnt-defs);
      font-size: 2rem;
      font-weight: 800;
      text-align: center;
      margin: 0;
      position: absolute;
      top: 80%;
    }

    .branch-header {
      display: flex;
      flex-flow: column;

      .milestone-badge {
        position: absolute;
        display: inline-block;
        width: 6rem;
        height: 6rem;
        margin: 0;
        top: 35%;
        left: 35%;

        > .backdrop {
          position: absolute;
          display: inline-block;
          width: 100%;
          height: 90%;
          clip-path: $backdrop-shape;
          background: rgba(0, 0, 0, 0.4);

          // Inner layer
          &::before {
            position: absolute;
            content: "";
            display: inline-block;
            width: calc(100% - 8px);
            height: calc(100% - 8px);
            top: 4px;
            left: 4px;
            clip-path: $backdrop-shape;
            opacity: 0.4;
            background-color: v-bind(branchColor);
          }

          // Middle layer
          &::after {
            position: absolute;
            content: "";
            display: inline-block;
            width: calc(100% - 16px);
            height: calc(100% - 16px);
            top: 8px;
            left: 8px;
            clip-path: $backdrop-shape;
            background-color: v-bind(branchColor);
          }
        }

        > .badge-container {
          position: relative;
          display: inline-block;
          > .badge {
            display: inline-block;
            width: 100%;
            height: 100%;
            background-color: white;
            mask-image: v-bind(iconImageUrl);
            -webkit-mask-image: v-bind(iconImageUrl);
            mask-repeat: no-repeat;
            -webkit-mask-repeat: no-repeat;
            mask-size: contain;
            -webkit-mask-size: contain;
          }
        }

        &.labourer {
          > .badge-container {
            left: 5%;
            top: 30%;
            width: 85%;
            height: 85%;
          }
        }
        &.motorsport {
          > .badge-container {
            left: 25%;
            top: 25%;
            width: 65%;
            height: 65%;
          }
        }
        &.adventurer {
          > .badge-container {
            left: 10%;
            top: 25%;
            width: 70%;
            height: 70%;
          }
        }
        &.specialized {
          > .badge-container {
            left: 15%;
            top: 15%;
            width: 80%;
            height: 80%;
          }
        }
      }
    }
  }

  .branch-details {
    .branch-progress {
      position: relative;
      padding: 1rem 0 0.5rem 0;
      background: rgb(var(--branch-color));
      .badge {
        position: absolute;
        top: -4.75rem;
        width: 6rem;
        height: 6rem;
        left: 50%;
        transform: translateX(-50%);
        > .icon-branch {
          position: absolute;
          font-size: 4.5rem;
          top: 50%;
          left: 50%;
          transform-origin: 50% 50%;
          transform: translate(-55%, -50%) rotate(-3deg);
          z-index: 2;
        }
        > .backdrop {
          position: absolute;
          display: inline-block;
          width: 100%;
          height: 90%;
          clip-path: $backdrop-shape;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1;

          // Inner layer
          &::before {
            position: absolute;
            content: "";
            display: inline-block;
            width: calc(100% - 8px);
            height: calc(100% - 8px);
            top: 4px;
            left: 4px;
            clip-path: $backdrop-shape;
            opacity: 0.4;
            background-color: rgb(var(--branch-color));
          }

          // Middle layer
          &::after {
            position: absolute;
            content: "";
            display: inline-block;
            width: calc(100% - 16px);
            height: calc(100% - 16px);
            top: 8px;
            left: 8px;
            clip-path: $backdrop-shape;
            background-color: rgb(var(--branch-color));
          }
        }
      }
      :deep(.header) {
        padding-bottom: 0.25rem;
        .header-left {
          font-size: 2rem;
        }
      }
      :deep(.progress-bar) {
        background-color: rgba(0, 0, 0, 0.25);
      }
    }
    .skill-levels-wrapper {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      padding: 1em 0.5em 2rem;
      background: border-box 50% 100% / 100% 105% linear-gradient(to bottom, rgba(var(--branch-color), 0.75), rgba(var(--branch-color), 0.2) 80%);

      .stat-progress-bar {
        //padding: 0 0.25em 0;
      }
      .skills-label {
        grid-column-end: span 1;
        text-align: center;
      }
    }

    .main-stat-progress-bar {
      padding: 0 0.5rem 0;
      font-size: 1.5rem;
    }
  }
}
</style>
