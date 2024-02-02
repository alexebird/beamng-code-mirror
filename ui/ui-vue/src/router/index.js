import { createRouter, createWebHashHistory } from "vue-router"

import CareerRoutes from "@/modules/career/routes"
import CreditsRoutes from "@/modules/credits/routes"
import DebugRoutes from "@/modules/debug/routes"
import DecalsRoutes from "@/modules/decals/routes"
import GarageRoutes from '@/modules/garage/routes'
import RefuelRoutes from "@/modules/refuel/routes"

import NotFoundView from "@/views/NotFound.vue"

const isDevMode = process.env.NODE_ENV === "development"

const routes = [
  ...CreditsRoutes,
  ...DecalsRoutes,
  ...RefuelRoutes,
  ...CareerRoutes,
  ...GarageRoutes,
  ...(isDevMode ? DebugRoutes : []),

  {
    path: "/:catchAll(.*)",
    name: "unknown",
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// router.afterEach((to, from) => {
//   console.log(`Router from:${from.path} to:${to.path}`)
//   console.log(to.matched[0].name)
// })

export default router
