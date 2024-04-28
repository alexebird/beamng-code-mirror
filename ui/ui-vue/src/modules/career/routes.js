// Career routes --------------------------------------

import * as views from "./views"

export default [
  {
    path: "/career",
    children: [
      // Career Pause
      {
        path: "pause",
        name: "pause",
        component: views.Pause,
        props: true,
      },

      // Logbook
      {
        path: "logbook/:id(\\*?.*?)?",
        name: "logbook",
        component: views.Logbook,
        props: true,
      },

      {
        path: "milestones/:id(\\*?.*?)?",
        name: "milestones",
        component: views.Milestones,
        props: true,
      },

      // Computer
      {
        path: "computer",
        name: "computer",
        component: views.Computer,
        props: true,
      },

      // Vehicle Inventory
      {
        path: "vehicleInventory",
        name: "vehicleInventory",
        component: views.VehicleInventory,
      },

      // Tuning
      {
        path: "tuning",
        name: "tuning",
        component: views.Tuning,
      },

      // Painting
      {
        path: "painting",
        name: "painting",
        component: views.Painting,
      },

      // Repair
      {
        path: "repair/:header?",
        name: "repair",
        component: views.Repair,
        props: true,
      },

      // Part Shopping
      {
        path: "partShopping",
        name: "partShopping",
        component: views.PartShopping,
      },

      // Part Inventory
      {
        path: "partInventory",
        name: "partInventory",
        component: views.PartInventory,
      },

      // Vehicle Purchase
      {
        path: "vehiclePurchase/:vehicleInfo?/:playerMoney?/:inventoryHasFreeSlot?/:lastVehicleInfo?",
        name: "vehiclePurchase",
        component: views.VehiclePurchase,
        props: true,
      },

      // Vehicle Shopping
      {
        path: "vehicleShopping",
        name: "vehicleShopping",
        component: views.VehicleShopping,
      },

      // Insurance policies List
      {
        path: "insurancePolicies",
        name: "insurancePolicies",
        component: views.InsurancePolicies,
      },

      // Inspect Vehicle
      {
        path: "inspectVehicle",
        name: "inspectVehicle",
        component: views.InspectVehicle,
      },

      // Delivery Reward
      {
        path: "cargoDeliveryReward",
        name: "cargoDeliveryReward",
        component: views.CargoDeliveryReward,
        props: true,
      },

      // Cargo Overview
      {
        path: "cargoOverview/:facilityId?/:parkingSpotPath(\\*?.*?)?",
        name: "cargoOverview",
        component: views.CargoOverview,
        props: true,
      },

      //Branch Landing Page
      {
        path: "progressLanding/",
        name: "progressLanding",
        component: views.ProgressLanding,
      },

      //Branch Landing Page
      {
        path: "branchPage/:branchKey?/",
        name: "branchPage",
        component: views.BranchPage,
        props: true,
      },
    ],
  },
]
