import VehicleConfig from "@/modules/vehicleConfig/views/VehicleConfig.vue"
import Mirrors from "@/modules/vehicleConfig/views/Mirrors.vue"

// routes must start with "menu.vehicleconfig" to get a proper angular menu wrapping
// related files:
//  vue:
//   ui\ui-vue\src\modules\vehicleConfig\components\Tuning.vue:98
//   ui\ui-vue\src\modules\vehicleConfig\views\Mirrors.vue:43
//  angular:
//   ui\entrypoints\main\main.js:459
//   ui\modules\vehicleconfig\vehicleconfig.js:182
//   ui\modules\vehicleconfig\vehicleconfig.html:37
//   ui\modules\vehicleconfig\partial.tuning.html:4

export default [
  {
    path: "/vehicle-config/vue/:tab?",
    name: "menu.vehicleconfig.vue",
    component: VehicleConfig,
    props: true,
  },
  {
    path: "/vehicle-config/vue/tuning",
    name: "menu.vehicleconfig.vue.tuning",
    component: VehicleConfig,
    props: { tab: "tuning" },
  },
  {
    path: "/vehicle-config/vue/tuning/mirrors",
    name: "menu.vehicleconfig.vue.tuning.mirrors",
    component: Mirrors,
    props: { exitRoute: "menu.vehicleconfig.vue-angular.tuning" },
  },
  {
    path: "/vehicle-config/vue/tuning/mirrors",
    name: "menu.vehicleconfig.vue.tuning.mirrors.with-angular",
    component: Mirrors,
    props: { exitRoute: "menu.vehicleconfig.tuning" },
  },
  {
    path: "/vehicle-config/vue/tuning/mirrors",
    name: "garagemode.tuning.mirrors",
    component: Mirrors,
    props: { exitRoute: "garagemode.tuning" },
  },
]
