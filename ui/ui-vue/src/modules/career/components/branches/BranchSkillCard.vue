<template>
  <BngCard v-if="branchData" class="branch-skill-card" @click="openBranchPage(branchKey)">
    <AspectRatio class="image-container aspect-ratio" :image="branchData.cover">
      <div class="branch-header">
        <span class="milestone-badge" :class="[branchData.id]">
          <span class="backdrop"></span>
          <span class="badge-container">
            <span class="badge"></span>
          </span>
        </span>
      </div>
      <h1 class="branch-label">{{ $ctx_t(branchData.name) }}</h1>
    </AspectRatio>
    <div class="branch-details">
      <BngProgressBar
        v-if="branchData"
        class="main-stat-progress-bar"
        :headerRight="$ctx_t(branchData.levelLabel)"
        :value="branchData.max == -1 ? 1 : branchData.value - branchData.min"
        :max="branchData.max == -1 ? 1 : branchData.max - branchData.min"
        :showValueLabel="true"
        :valueLabelFormat="branchData.max == -1 ? branchData.value.toString()+'&nbspXP' : '#value#&nbspXP'" />
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
            :valueLabelFormat="skill.max == -1 ? skill.value.toString()+'&nbspXP' : skill.isInDevelopment ? 'Coming Soon!' : '#value#&nbspXP'" />
        </div>
      </div>
    </div>
  </BngCard>
</template>

<script setup>
import { lua } from "@/bridge"
import { BngCard, BngProgressBar } from "@/common/components/base"
import { onMounted } from "vue"
import { ref, computed } from "vue"
import { getAssetURL } from "@/utils"
import { AspectRatio } from "@/common/components/utility"
import { $translate } from "@/services/translation"

const props = defineProps({
  branchKey: String,
})
const emit = defineEmits(["openBranchPage"])

const branchData = ref()

const iconImageUrl = computed(() => branchData.value && `url(${getAssetURL(branchData.value.icon)})`)
const branchColor = computed(() => branchData.value && branchData.value.color)

const openBranchPage = branchKey => emit("openBranchPage", branchKey)
function setup(data) {
  // console.log(data)
  branchData.value = data
  branchData.value.skills = sortOptions(data.skills)
}

function sortOptions(data) {
  return [...data].sort((a, b) => a.order < b.order)
}

onMounted(async () => {
  setup(await lua.career_modules_branches_landing.getBranchSkillCardData(props.branchKey))
})
</script>

<style scoped lang="scss">
$backdrop-shape: polygon(26% 8%, 73% 8%, 92% 39%, 64% 100%, 19% 100%, 0 70%);

.branch-skill-card {
  display: flex;
  flex-flow: column;
  position: relative;
  border-radius: var(--bng-corners-2);
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
  &:focus {
    background-color: rgba(255, 255, 255, 0.5);
  }

  .image-container {
    //border-bottom: 4rem solid v-bind(branchColor);
    box-shadow: inset 0rem -4rem 0rem 0rem v-bind(branchColor);

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
    padding-top: 0.5em;
    .skill-levels-wrapper {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      padding: 1em 0.5em 0.5rem;

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
