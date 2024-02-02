import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { useLibStore } from "@/services"

export const useMissionDetailsStore = defineStore("missionDetails", () => {
  const { $game } = useLibStore()
  const mission = ref({
    id: "some-mission-id",
    name: "Mission",
    description:
      "Varius habitant ullamcorper lectus quam sagittis, a. Lacus mi sit lectus augue " +
      "dolor egestas sed donec. Felis ornare enim tortor amet, amet. Eu turpis ut ut turpis sed. " +
      "Sem arcu porttitor diam ultrices cum mus fermentum sit magna. Neque, vitae tellus pellentesque orci. " +
      "Est lorem nec, erat elit. Ultricies ultricies gravida diam amet in quis. Varius habitant ullamcorper " +
      "lectus quam sagittis, a. Lacus mi sit lectus augue dolor egestas sed donec. Felis ornare enim tortor amet, " +
      "amet. Eu turpis ut ut turpis sed. Sem arcu porttitor diam ultrices cum mus fermentum sit magna. Neque, vitae " +
      "tellus pellentesque orci. Est lorem nec, erat elit. Ultricies ultricies gravida diam amet in quis.",
    preheadings: ["Jungle Rock Island"],
    images: ["test/images/milestone-1.png", "test/images/milestone-2.png", "test/images/milestone-3.png"],
    taskInfo: {
      vehicle: "Gavril T-series",
      tasks: ["task 1", "task 2", "task 3", "task 4", "task 5"],
    },
    missionSettings: {
      difficulty: {
        value: "normal",
        options: [
          { label: "Easy", value: "easy" },
          { label: "Normal", value: "normal" },
          { label: "Hard", value: "hard" },
        ],
      },
      attributes: [
        { label: "label 1", value: "value 1" },
        { label: "label 2", value: "value 2" },
        { label: "label 3", value: "value 3" },
        { label: "label 4", value: "value 4" },
        { label: "label 5", value: "value 5" },
      ],
    },
    vehicleSettings: {
      image: "test/images/milestone-1.png",
      vehicleId: "some-vehicle-id",
      attributes: [
        { label: "label 1", value: "value 1" },
        { label: "label 2", value: "value 2" },
        { label: "label 3", value: "value 3" },
        { label: "label 4", value: "value 4" },
        { label: "label 5", value: "value 5" },
      ],
    },
    ratings: {
      ranking: [
        { label: "label 1", value: "value 1" },
        { label: "label 2", value: "value 2" },
        { label: "label 3", value: "value 3" },
        { label: "label 4", value: "value 4" },
        { label: "label 5", value: "value 5" },
        { label: "label 6", value: "value 6" },
        { label: "label 7", value: "value 7" },
        { label: "label 8", value: "value 8" },
        { label: "label 9", value: "value 9" },
        { label: "label 10", value: "value 10" },
      ],
    },
  })

  return { mission }
})
