<!-- Landing Page -->
<template>
  <LayoutSingle class="layout-content-full flesx-column layout-paddings layout-align-hcenter" v-bng-blur>
    <div class="landing-wrapper" bng-ui-scope="branches" v-bng-on-ui-nav:back,menu="exit">
      <BngScreenHeading> {{ $t("ui.career.landingPage.name") }} </BngScreenHeading>
      <div class="career-page">
        <div class="actions">
          <BngButton class="exitButton" @click="exit" accent="attention"><BngBinding ui-event="back" deviceMask="xinput" />Back</BngButton>
          <CareerStatus class="career-page-status" />
        </div>
        <div class="description">
          {{ $t("ui.career.landingPage.description") }}
        </div>
        <div class="cards-container" bng-ui-scope="branches">
          <BranchSkillCard v-for="branch in BRANCHES" :branchKey="branch" @openBranchPage="openBranchPage" bng-nav-item />
        </div>
      </div>
    </div>
  </LayoutSingle>
</template>

<script setup>
import { LayoutSingle } from "@/common/layouts"
import { BngScreenHeading, BngBinding, BngButton } from "@/common/components/base"
import { vBngBlur, vBngOnUiNav } from "@/common/directives"
import BranchSkillCard from "../components/branches/BranchSkillCard.vue"
import { useUINavScope } from "@/services/uiNav"
import { CareerStatus } from "@/modules/career/components"
import { onMounted } from "vue"
import { lua } from "@/bridge"

useUINavScope("branches") // UI Nav events to fire from (or from focused element inside) element with attribute: bng-ui-scope="branches"

const BRANCHES = ["motorsport", "labourer", "specialized", "adventurer"]

const openBranchPage = branchKey => window.bngVue.gotoGameState("branchPage", { params: { branchKey } })
const exit = () => window.bngVue.gotoGameState("menu.careerPause")

onMounted(() => {
  lua.career_career.requestPause(true)
})
</script>

<style lang="scss" scoped>
$textcolor: #fff;
$fontsize: 1rem;

.layout-content {
  color: $textcolor;
  font-size: $fontsize;
}

.landing-wrapper {
  display: flex;
  flex-flow: column;
  & > .career-page {
    display: flex;
    flex-flow: column;
    height: auto;
    max-width: 92rem;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.6);
    border-radius: var(--bng-corners-3);

    .career-page-status {
      padding: 0.5rem 0.75rem 0.5rem 0.5rem;
      font-weight: 800;
      display: flex;
      justify-content: center;
      align-items: left;
    }
    .description {
      padding: 1rem;
      font-size: 1.25rem;
      flex: 0 0 auto;
    }
    .cards-container {
      flex: 1 0 auto;

      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
      gap: 0.5rem;
      align-items: stretch;

      padding: 1rem;
      overflow: hidden auto;
    }
  }
}

.actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 0.5rem 1rem;
  align-items: center;
  justify-content: space-between;
}
</style>
