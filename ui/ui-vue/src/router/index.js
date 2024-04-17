import { createRouter, createWebHashHistory } from "vue-router"
import { reportState } from "@/services/stateReporter.js"

import CareerRoutes from "@/modules/career/routes"
import CreditsRoutes from "@/modules/credits/routes"
import DebugRoutes from "@/modules/debug/routes"
import DecalsRoutes from "@/modules/decals/routes"
import GarageRoutes from '@/modules/garage/routes'
import LiveryEditorRoutes from "@/modules/liveryEditor/routes"
import MissionRoutes from "@/modules/missions/routes"
import RefuelRoutes from "@/modules/refuel/routes"
import VehicleConfigRoutes from '@/modules/vehicleConfig/routes'
import MainMenuRoutes from '@/modules/mainmenu/routes'

import NotFoundView from "@/views/NotFound.vue"

const isDevMode = process.env.NODE_ENV === "development"

const routes = [
  ...CareerRoutes,
  ...CreditsRoutes,
  ...DecalsRoutes,
  ...GarageRoutes,
  ...LiveryEditorRoutes,
  ...MissionRoutes,
  ...RefuelRoutes,
  ...VehicleConfigRoutes,
  ...MainMenuRoutes,
  ...(isDevMode ? DebugRoutes : []),

  {
    path: "/:catchAll(.*)*",
    name: "unknown",
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to, from) => {
  // console.log(`Router from:${from.path} to:${to.path}`)
  // console.log(to.matched[0].name)
  reportState(to.path, true, from.path)
})

export default router
