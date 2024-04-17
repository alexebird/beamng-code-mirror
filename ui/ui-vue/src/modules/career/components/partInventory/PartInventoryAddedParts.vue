<template>
  <div>
    The following additional parts have been added to the vehicle from your inventory to fill the core slots:
    <table style="width: 100%">
      <thead>
        <tr>
          <th>id</th>
          <th>Description</th>
          <th>Location</th>
          <th>Mileage</th>
          <th>Part Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(part, key) in parts" :key="key">
          <td>{{ part.id }}</td>
          <td>{{ part.description.description }}</td>
          <td>{{ getLocationName(part) }}</td>
          <td>{{ units.buildString("length", part.partCondition.odometer, 0) }}</td>
          <td>{{ units.beamBucks(part.finalValue) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useBridge } from "@/bridge"

const { units } = useBridge()

const props = defineProps({
  parts: {
    type: Object,
    default: {},
  },
})

const getLocationName = part => (part.location ? "Vehicle No. " + part.location + " (" + part.vehicleModel + ")" : "Inventory")
</script>

<style scoped lang="scss">
table {
  border-collapse: collapse;
  & thead th {
    border-bottom: 1px solid rgb(170, 170, 170);
  }
  // border: 1px solid rgb(170, 170, 170);
  margin-top: 1em;
  & th,
  & td {
    // border: 1px solid rgb(170, 170, 170);
    padding: 2px;
    padding-right: 10px;
    text-align: left;
  }
  & td {
    opacity: 0.8;
  }
}
</style>
