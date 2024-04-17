// Mission related routes
import * as views from "./views"

export default [
  {
    path: "/mission",
    children: [

      // Details
      {
        path: "details",
        name: "mission-details",
        component: views.MissionDetails,
      },
      
    ],
  },
]
