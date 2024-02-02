// Career routes --------------------------------------

import * as views from './views'

export default [
  {
    path: '/career',
    children: [

      // Logbook
      {
        path: 'logbook/:id(\\*?.*?)?',
        name: 'logbook',
        component: views.Logbook,
        props:true
      },

      // Computer
      {
        path: 'computer',
        name: 'menu.computer',
        component: views.Computer,
        props: true,
      },

          // Vehicle Inventory
          {
            path: 'vehicleInventory',
            name: 'menu.vehicleInventory',
            component: views.VehicleInventory
          },

          // Tuning
          {
            path: 'tuning',
            name: 'menu.tuning',
            component: views.Tuning,
          },

          // Painting
          {
            path: 'painting',
            name: 'menu.painting',
            component: views.Painting,
          },

          // Repair
          {
            path: 'repair/:header?',
            name: 'menu.repair',
            component: views.Repair,
            props: true
          },

          // Part Shopping
          {
            path: 'partShopping',
            name: 'menu.partShopping',
            component: views.PartShopping,
          },

          // Part Inventory
          {
            path: 'partInventory',
            name: 'menu.partInventory',
            component: views.PartInventory,
          },

          // Vehicle Purchase
          {
            path: 'vehiclePurchase/:vehicleInfo?/:playerMoney?/:inventoryHasFreeSlot?/:lastVehicleInfo?',
            name: 'menu.vehiclePurchase',
            component: views.VehiclePurchase,
            props: true
          },

          // Vehicle Shopping
          {
            path: 'vehicleShopping',
            name: 'menu.vehicleShopping',
            component: views.VehicleShopping,
          },

          // Insurance policies List
          {
            path: 'insurancePolicies',
            name: 'menu.insurancePolicies',
            component: views.InsurancePolicies,
          },

      // Inspect Vehicle
      {
        path: 'inspectVehicle',
        name: 'menu.inspectVehicle',
        component: views.InspectVehicle,
      },

      // Cargo Overview
      {
        path: 'cargoOverview/:facilityId?/:parkingSpotPath?',
        name: 'menu.cargoOverview',
        component: views.CargoOverview,
        props: true
      },

    ]
  }
]
