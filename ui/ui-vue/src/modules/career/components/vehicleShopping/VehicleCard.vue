<template>
  <bng-card :class="'vehicle-card row'">
    <AspectRatio class="cover" :ratio="'16:9'" :image="vehicle.preview"> </AspectRatio>
    <div class="car-details">
      <div class="car-value">
        <div class="car-name">
          <h3 class="name">{{ vehicle.year }} {{ vehicle.Name }}</h3>
          <div class="brand">{{ vehicle.Brand }}</div>
        </div>
        <div class="main-data">
          <BngPropVal
            class="prop-small"
            :iconColor="'var(--bng-cool-gray-300)'"
            :iconType="icons.drive.busroutes"
            :valueLabel="units.buildString('length', vehicle.Mileage, 0)"
          />
          <BngPropVal
            class="prop-small"
            style="flex: 1 0 auto"
            :iconColor="'var(--bng-cool-gray-300)'"
            :iconType="icons.drive.busroutes"
            :valueLabel="vehicle.Drivetrain"
          />
          <div v-if="vehicle.Value <= vehicleShoppingData.playerAttributes.money.value">
            <BngPropVal class="car-price" :iconType="icons.general.beambuck" :valueLabel="units.beamBucks(vehicle.Value) + '*'" />
          </div>
          <div v-else style="color: rgb(245, 29, 29)">
            <BngPropVal class="car-price" :iconType="icons.general.beambuck" :valueLabel="units.beamBucks(vehicle.Value) + '*'" />
            Insufficient Funds
          </div>
        </div>
      </div>
      <div class="car-data">
        <BngPropVal :iconType="icons.general.power_gauge_04" :keyLabel="'Power:'" :valueLabel="units.buildString('power', vehicle.Power, 0)" />
        <BngPropVal :iconType="icons.general.odometer" :keyLabel="'Mileage:'" :valueLabel="units.buildString('length', vehicle.Mileage, 0)" />
        <BngPropVal :iconType="getAttributeIcon(vehicle, 'Transmission')" :keyLabel="'Transmission:'" :valueLabel="vehicle.Transmission" />
        <BngPropVal :iconType="getAttributeIcon(vehicle, 'Fuel Type')" :keyLabel="'Fuel type:'" :valueLabel="vehicle['Fuel Type']" />
        <BngPropVal :iconType="getAttributeIcon(vehicle, 'Drivetrain')" :keyLabel="'Drivetrain:'" :valueLabel="vehicle.Drivetrain" />
        <BngPropVal :iconType="icons.general.weight" :keyLabel="'Weight:'" :valueLabel="units.buildString('weight', vehicle.Weight, 0)" />
      </div>
    </div>
    <template #buttons>
      <div style="width: 100%">
        <BngPropVal style="float: left" v-if="!vehicleShoppingData.currentSeller" :keyLabel="'Seller:'" :valueLabel="vehicle.sellerName" />
        <BngPropVal
          style="float: left"
          v-if="!vehicleShoppingData.currentSeller"
          :keyLabel="'Distance:'"
          :valueLabel="units.buildString('length', vehicle.distance, 1)"
        />
        <BngPropVal style="float: left" :keyLabel="'Required Insurance:'" :valueLabel="vehicle.requiredInsurance.name" />
      </div>

      <span
        style="flex: 1 0 auto; justify-content: flex-end; padding: 0.5em 0.75em; font-weight: 400; font-family: var(--fnt-defs)"
        v-if="vehicleShoppingData.disableShopping"
        >{{ vehicleShoppingData.disableShoppingReason }}</span
      >

      <BngButton
        v-if="vehicle.sellerId === vehicleShoppingData.currentSeller"
        @click="showVehicle(vehicle.shopId)"
        accent="secondary"
        :disabled="vehicleShoppingData.disableShopping"
        >Inspect Vehicle</BngButton
      >
      <BngButton v-else @click="showVehicle(vehicle.shopId)" accent="secondary" :disabled="vehicleShoppingData.disableShopping">Set Route</BngButton>

      <BngButton
        v-if="!vehicleShoppingData.currentSeller"
        :disabled="vehicleShoppingData.playerAttributes.money.value < vehicle.quickTravelPrice || vehicleShoppingData.disableShopping"
        @click="setTaxiPopup(true)"
        :accent="vehicle.sellerId === 'private' ? 'main' : 'secondary'"
        ><span style="flex: 1 0 auto">Take Taxi</span></BngButton
      >

      <BngButton
        v-if="vehicle.sellerId !== 'private'"
        :disabled="vehicleShoppingData.tutorialPurchase || vehicleShoppingData.disableShopping"
        @click="openPurchaseMenu('instant', vehicle.shopId)"
        >Purchase</BngButton
      >
    </template>
  </bng-card>

  <div v-if="taxiPopupOpen">
    <div v-bng-blur class="blurBackground"></div>
    <BngCard class="modalPopup">
      <h3 style="padding: 10px">Do you want to taxi to this vehicle for {{ units.beamBucks(vehicle.quickTravelPrice) }}?</h3>
      <BngButton @click="quickTravelToVehicle(vehicle)"> Yes </BngButton>
      <BngButton @click="setTaxiPopup(false)" accent="attention"> No </BngButton>
    </BngCard>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { lua, useBridge } from "@/bridge"
import { BngCard, BngButton, BngPropVal } from "@/common/components/base"
import { AspectRatio } from "@/common/components/utility"
import { icons } from "@/common/components/base/bngIcon.vue"
import { vBngBlur } from "@/common/directives"

const { units } = useBridge()

const props = defineProps({
  vehicleShoppingData: Object,
  vehicle: Object,
})

const taxiPopupOpen = ref(false)

const setTaxiPopup = open => {
  taxiPopupOpen.value = open
}

const showVehicle = shopId => {
  lua.career_modules_vehicleShopping.showVehicle(shopId)
}

const quickTravelToVehicle = vehicle => {
  lua.career_modules_vehicleShopping.quickTravelToVehicle(vehicle.shopId)
}

const openPurchaseMenu = (purchaseType, shopId) => {
  lua.career_modules_vehicleShopping.openPurchaseMenu(purchaseType, shopId)
}

const driveTrainIcons = {
  AWD: icons.general.awd,
  "4WD": icons.general["4wd"],
  FWD: icons.general.fwd,
  RWD: icons.general.rwd,
  drivetrain_special: icons.general.drivetrain_special,
  drivetrain_generic: icons.general.drivetrain_generic,
  defaultMissing: icons.general.drivetrain_generic,
  defaultUnknown: icons.general.drivetrain_special,
}

const fuelTypeIcons = {
  Battery: icons.general.charge,
  Gasoline: icons.general.fuel,
  Diesel: icons.general.fuel,
  defaultMissing: icons.general.fuel,
  defaultUnknown: icons.general.fuel,
}

const transmissionIcons = {
  Automatic: icons.general.transmission_a,
  Manual: icons.general.transmission_m,
  defaultMissing: icons.general.transmission_m,
  defaultUnknown: icons.general.transmission_m,
}

const getAttributeIcon = (vehicle, attribute) => {
  let iconDict
  if (attribute == "Drivetrain") {
    iconDict = driveTrainIcons
  } else if (attribute == "Fuel Type") {
    iconDict = fuelTypeIcons
  } else if (attribute == "Transmission") {
    iconDict = transmissionIcons
  }

  if (vehicle[attribute] == null || vehicle[attribute] == undefined) {
    return iconDict.defaultMissing
  }

  let icon = iconDict[vehicle[attribute]]
  if (icon == null || icon == undefined) {
    return iconDict.defaultUnknown
  }
  return icon
}
</script>

<style scoped lang="scss">
.vehicle-card {
  margin: 0.75rem 0.5rem;
  min-width: 16rem;
  max-width: 28rem;
  flex: 1 0.25 18rem;
  // background-color: #ffffff;
  & :deep(.card-cnt) {
    // background-color: #ffffff;
    flex-flow: row wrap;
  }
  & .cover {
    flex: 1 1 100%;
  }
  .car-details {
    display: flex;
    flex-flow: column nowrap;
    flex: 1 1 auto;
    .car-value {
      padding: 0.5em;
      font-family: "Overpass", var(--fnt-defs);
      display: flex;
      flex-flow: column nowrap;
      .car-name {
        padding-bottom: 0.5rem;
        min-height: 5.5rem;
        .name {
          font-weight: 800;
          font-style: italic;
          margin: 0.25em 0 0 0;
        }
        .brand {
          font-weight: 600;
          color: var(--bng-cool-gray-100);
        }
      }
      .main-data {
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-end;
        align-items: center;
        & > .prop-small {
          font-size: 0.8rem;
          padding-left: 1.75em;
          padding-top: 0.25em;
          padding-bottom: 0.25em;
          color: var(--bng-cool-gray-300);
          flex: 0 0 auto;
          & > :deep(.value-label) {
            font-weight: 400;
          }
          & > :deep(.icon) {
            // width: 1em;
            // height: 1em;
            top: 0.2em;
            left: 0.125em;
          }
        }
      }
      .car-price {
        font-size: 1rem;
        // border: 0.0625rem solid rgba(white, 0.25);
        border-radius: var(--bng-corners-1);
        padding-top: 0.25em;
        padding-bottom: 0.25em;
        align-self: flex-end;
        flex: 0 0 auto;
        & > :deep(.icon) {
          top: 0.25em;
        }
      }
    }
    .car-data {
      display: none;
      flex-flow: row wrap;
      & > * {
        max-width: 15em;
        flex: 1 0 15em;
      }
    }
  }

  .taxi-price {
    position: relative;
    font-size: 0.8rem;
    line-height: 1.25em;
    padding-top: 0.125em;
    padding-bottom: 0.125em;
    padding-left: 1.5em;
    padding-right: 0.5em;
    margin-left: 0.5em;
    border: 0.0625rem solid rgba(white, 0.25);
    border-radius: var(--bng-corners-1);
    & > :deep(.icon) {
      // width: 1em;
      // height: 1em;
      top: 0em;
      left: 0.125em;
    }
  }

  .buttons > .bng-button {
    font-family: var(--fnt-defs);
  }

  &.row {
    max-width: calc(100% - 1rem);
    flex: 1 0 100%;

    .prop-small {
      display: none;
    }
    .cover {
      flex: 0 0 22rem;
    }

    @media screen and (max-width: 719px) {
      & .cover {
        flex: 1 1 100%;
      }
    }

    @media screen and (max-width: 900px) {
      .car-details > .car-value {
        flex-flow: row wrap !important;
      }
    }

    @media screen and (min-width: 720px) {
      :deep(.card-cnt) {
        flex-flow: row nowrap;
      }
      .car-details {
        padding-left: 1rem;
        .car-name {
          .name {
            font-size: 1.5rem;
            min-width: 15rem;
          }
        }
      }
    }

    :deep(.card-cnt) {
      align-items: flex-start;
    }
    .car-details {
      flex: 1 1 auto;
      min-width: 18rem;
      // padding-bottom: 1rem;
      .car-value {
        flex-flow: row nowrap;
        align-items: flex-start;
        .car-name {
          flex: 1 1 auto;
          padding-right: 0.5rem;
        }
        .car-price {
          font-size: 1.25rem;
          align-self: auto;
          flex: 0 0 auto;
        }
      }
      .car-data {
        display: flex;
        padding-bottom: 0.75rem;
      }
    }
  }
}

.blurBackground {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.781);
  z-index: 1000;
}

.modalPopup {
  position: fixed;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  // TODO: This is hacky. should be properly moved into a popup modal component
  z-index: 1001;

  & :deep(.card-cnt) {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
