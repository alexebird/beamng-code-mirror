import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { MilestoneType } from "./milestoneTypes"
import MilestoneBigCard from "./components/MilestoneBigCard"
import MilestoneBranchListCard from "./components/MilestoneBranchListCard.vue"
import MilestoneInfoListCard from "./components/MilestoneInfoListCard.vue"
import MilestoneScoreListCard from "./components/MilestoneScoreListCard.vue"
import MilestoneBadge from "./components/MilestoneBadge.vue"
import ScrollingBackground from "./components/ScrollingBackground.vue"

export const useMilestoneStore = defineStore("milestone", () => {
  const currentComponentName = ref("score")
  const properties = ref({
    bigCard: {
      type: MilestoneType.AiRace,
    },
    info: {
      milestones: [
        {
          title: "Ibishu performance pack 3",
          description: "Vitae felis nulla mattis libero. Pellentesque egestas cursus odio sollicitudin amet, ipsum.",
          badgeText: "unlocked",
          image: "test/images/milestone-1.png",
        },
        {
          title: "Drag Strip",
          description: "Vitae felis nulla mattis libero. Pellentesque egestas cursus odio sollicitudin amet, ipsum.",
          badgeText: "unlocked",
          image: "test/images/milestone-2.png",
        },
        {
          title: "Ibishu Pigeon Rock Dove",
          description: "Vitae felis nulla mattis libero. Pellentesque egestas cursus odio sollicitudin amet, ipsum.",
          badgeText: "unlocked",
          image: "test/images/milestone-3.png",
        },
      ],
    },
    branches: {
      branches: [
        {
          id: 1,
          name: "Motorsport",
          description: `Justo, justo eget dui, quis. Sollicitudin mattis odio lectus feugiat habitasse faucibus dui in sagittis. Enim amet, in sit fermentum amet. Sed mattis mattis aliquet sit volutpat odio ornare lectus. Praesent lacus, malesuada non, non venenatis id cursus ac. Egestas erat molestie facilisi eu, accumsan, id. Duis enim sit in nisl. Dictum vel bibendum sit rhoncus eleifend facilisis volutpat. Laoreet vel, diam mi, ut eget. Vitae sed ornare aliquet in condimentum. Quis adipiscing mollis at lacus. Viverra enim viverra malesuada lobortis tristique congue.
                    Vitae lacus id in neque. Convallis interdum mi aliquam aliquam turpis. Proin purus, tortor habitasse integer. Pulvinar aliquet tempus, at tempor sed quis. Eu venenatis, ut feugiat pellentesque ac sagittis. Nibh est urna lorem varius. Volutpat fames maecenas sit a, volutpat.`,
          image: "test/images/milestone-1.png",
          showFlag: true,
        },
        {
          id: 2,
          name: "Laborer",
          description: `Justo, justo eget dui, quis. Sollicitudin mattis odio lectus feugiat habitasse faucibus dui in sagittis. Enim amet, in sit fermentum amet. Sed mattis mattis aliquet sit volutpat odio ornare lectus. Praesent lacus, malesuada non, non venenatis id cursus ac. Egestas erat molestie facilisi eu, accumsan, id. Duis enim sit in nisl. Dictum vel bibendum sit rhoncus eleifend facilisis volutpat. Laoreet vel, diam mi, ut eget. Vitae sed ornare aliquet in condimentum. Quis adipiscing mollis at lacus. Viverra enim viverra malesuada lobortis tristique congue.
                    Vitae lacus id in neque. Convallis interdum mi aliquam aliquam turpis. Proin purus, tortor habitasse integer. Pulvinar aliquet tempus, at tempor sed quis. Eu venenatis, ut feugiat pellentesque ac sagittis. Nibh est urna lorem varius. Volutpat fames maecenas sit a, volutpat.`,
          image: "test/images/milestone-2.png",
          showFlag: false,
        },
        {
          id: 3,
          name: "Specialist",
          description: `Justo, justo eget dui, quis. Sollicitudin mattis odio lectus feugiat habitasse faucibus dui in sagittis. Enim amet, in sit fermentum amet. Sed mattis mattis aliquet sit volutpat odio ornare lectus. Praesent lacus, malesuada non, non venenatis id cursus ac. Egestas erat molestie facilisi eu, accumsan, id. Duis enim sit in nisl. Dictum vel bibendum sit rhoncus eleifend facilisis volutpat. Laoreet vel, diam mi, ut eget. Vitae sed ornare aliquet in condimentum. Quis adipiscing mollis at lacus. Viverra enim viverra malesuada lobortis tristique congue.
                    Vitae lacus id in neque. Convallis interdum mi aliquam aliquam turpis. Proin purus, tortor habitasse integer. Pulvinar aliquet tempus, at tempor sed quis. Eu venenatis, ut feugiat pellentesque ac sagittis. Nibh est urna lorem varius. Volutpat fames maecenas sit a, volutpat.`,
          image: "test/images/milestone-3.png",
          showFlag: false,
        },
        {
          id: 4,
          name: "Specialist",
          description: `Justo, justo eget dui, quis. Sollicitudin mattis odio lectus feugiat habitasse faucibus dui in sagittis. Enim amet, in sit fermentum amet. Sed mattis mattis aliquet sit volutpat odio ornare lectus. Praesent lacus, malesuada non, non venenatis id cursus ac. Egestas erat molestie facilisi eu, accumsan, id. Duis enim sit in nisl. Dictum vel bibendum sit rhoncus eleifend facilisis volutpat. Laoreet vel, diam mi, ut eget. Vitae sed ornare aliquet in condimentum. Quis adipiscing mollis at lacus. Viverra enim viverra malesuada lobortis tristique congue.
                    Vitae lacus id in neque. Convallis interdum mi aliquam aliquam turpis. Proin purus, tortor habitasse integer. Pulvinar aliquet tempus, at tempor sed quis. Eu venenatis, ut feugiat pellentesque ac sagittis. Nibh est urna lorem varius. Volutpat fames maecenas sit a, volutpat.`,
          image: "test/images/milestone-3.png",
          showFlag: false,
        },
      ],
    },
    score: {
      scores: [
        {
          type: "beambuck",
          description: "100000",
        },
        {
          type: "beamxp",
          description: "123456",
        },
        {
          type: "beambuck",
          description: "200000",
        },
        {
          type: "beamxp",
          description: "678901",
        },
        {
          type: "beambuck",
          description: "300000",
        },
      ],
      visibleCards: 2,
    },

    // For testing
    animatedBackground: {
      icon: "test/images/Union.svg",
    },
    milestoneBadge: {
      type: MilestoneType.AiRace,
    },
  })

  const currentProperties = computed(() => properties.value[currentComponentName.value])
  const currentComponent = computed(() => {
    switch (currentComponentName.value) {
      case "bigCard":
        return MilestoneBigCard
      case "info":
        return MilestoneInfoListCard
      case "branches":
        return MilestoneBranchListCard
      case "score":
        return MilestoneScoreListCard
      case "animatedBackground":
        return ScrollingBackground
      case "milestoneBadge":
        return MilestoneBadge
    }
  })

  function setCurrentComponent(type) {
    currentComponentName.value = type
  }
  function setCurrentBigCardBadge(type) {
    properties.value["bigCard"].type = type
  }
  function setCurrentMilestoneBadge(type) {
    properties.value["milestoneBadge"].type = type
  }
  function increaseVisibleCards() {
    if (properties.value["score"].scores.length === properties.value["score"].visibleCards) return

    properties.value["score"].visibleCards++
  }
  function decreaseVisibleCards() {
    console.log("visibleCards", properties.value["score"].visibleCards)
    if (properties.value["score"].visibleCards === 1) return

    properties.value["score"].visibleCards--
  }

  return {
    currentComponentName,
    properties,
    currentProperties,
    currentComponent,
    setCurrentComponent,
    setCurrentBigCardBadge,
    setCurrentMilestoneBadge,
    increaseVisibleCards,
    decreaseVisibleCards,
  }
})
