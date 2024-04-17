// Garage routes --------------------------------------
import Garage from "@/modules/garage/views/Garage.vue"

export default [
  {
    path: "/garagemode/:component?",
    name: "garagemode",
    component: Garage,
    props: true,
  },
  {
    path: "/garagemode/tuning",
    name: "garagemode.tuning",
    component: Garage,
    props: { component: "tuning" },
  },
]
