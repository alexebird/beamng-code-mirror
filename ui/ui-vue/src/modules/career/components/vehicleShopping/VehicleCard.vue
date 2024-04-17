<template>
  <BngCard :class="'vehicle-card row'">
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
            :iconType="icons.bus"
            :valueLabel="units.buildString('length', vehicle.Mileage, 0)" />
          <BngPropVal
            class="prop-small"
            style="flex: 1 0 auto"
            :iconColor="'var(--bng-cool-gray-300)'"
            :iconType="icons.bus"
            :valueLabel="vehicle.Drivetrain" />
          <div v-if="vehicle.Value <= vehicleShoppingData.playerAttributes.money.value"><BngUnit class="car-price" :beambucks="vehicle.Value" />*</div>
          <div v-else style="color: rgb(245, 29, 29)"><BngUnit class="car-price" :beambucks="vehicle.Value" />* Insufficient Funds</div>
        </div>
      </div>
      <div class="car-data">
        <BngPropVal :iconType="icons.powerGauge04" :keyLabel="'Power:'" :valueLabel="units.buildString('power', vehicle.Power, 0)" />
        <BngPropVal :iconType="icons.odometer" :keyLabel="'Mileage:'" :valueLabel="units.buildString('length', vehicle.Mileage, 0)" />
        <BngPropVal :iconType="getAttributeIcon(vehicle, 'Transmission')" :keyLabel="'Transmission:'" :valueLabel="vehicle.Transmission" />
        <BngPropVal :iconType="getAttributeIcon(vehicle, 'Fuel Type')" :keyLabel="'Fuel type:'" :valueLabel="vehicle['Fuel Type']" />
        <BngPropVal :iconType="getAttributeIcon(vehicle, 'Drivetrain')" :keyLabel="'Drivetrain:'" :valueLabel="vehicle.Drivetrain" />
        <BngPropVal :iconType="icons.weight" :keyLabel="'Weight:'" :valueLabel="units.buildString('weight', vehicle.Weight, 0)" />
      </div>
    </div>
    <template #buttons>
      <div style="width: 100%">
        <BngPropVal style="float: left" v-if="!vehicleShoppingData.currentSeller" :keyLabel="'Seller:'" :valueLabel="vehicle.sellerName" />
        <BngPropVal
          style="float: left"
          v-if="!vehicleShoppingData.currentSeller"
          :keyLabel="'Distance:'"
          :valueLabel="units.buildString('length', vehicle.distance, 1)" />
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
        @click="confirmTaxi(vehicle)"
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
  </BngCard>
</template>

<script>
import { icons } from "@/common/components/base"

const DRIVE_TRAIN_ICONS = {
  AWD: icons.AWD,
  "4WD": icons["4WD"],
  FWD: icons.FWD,
  RWD: icons.RWD,
  drivetrain_special: icons.drivetrainSpecial,
  drivetrain_generic: icons.drivetrainGeneric,
  defaultMissing: icons.drivetrainGeneric,
  defaultUnknown: icons.drivetrainGeneric,
}

const FUEL_TYPE_ICONS = {
  Battery: icons.charge,
  Gasoline: icons.fuelPump,
  Diesel: icons.fuelPump,
  defaultMissing: icons.fuelPump,
  defaultUnknown: icons.fuelPump,
}

const TRANSMISSION_ICONS = {
  Automatic: icons.transmissionA,
  Manual: icons.transmissionM,
  defaultMissing: icons.transmissionM,
  defaultUnknown: icons.transmissionM,
}
</script>

<script setup>
import { lua, useBridge } from "@/bridge"
import { BngCard, BngButton, BngPropVal, BngUnit } from "@/common/components/base"
import { AspectRatio } from "@/common/components/utility"
import { openConfirmation } from "@/services/popup"
import { $translate } from "@/services/translation"

const { units } = useBridge()

const props = defineProps({
  vehicleShoppingData: Object,
  vehicle: Object,
})

const confirmTaxi = async vehicle => {
  const res = await openConfirmation("", `Do you want to taxi to this vehicle for ${units.beamBucks(vehicle.quickTravelPrice)}?`, [
    { label: $translate.instant("ui.common.yes"), value: true },
    { label: $translate.instant("ui.common.no"), value: false, extras: { accent: "attention" } },
  ])
  if (res) quickTravelToVehicle(vehicle)
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

const getAttributeIcon = (vehicle, attribute) => {
  let iconDict
  if (attribute == "Drivetrain") {
    iconDict = DRIVE_TRAIN_ICONS
  } else if (attribute == "Fuel Type") {
    iconDict = FUEL_TYPE_ICONS
  } else if (attribute == "Transmission") {
    iconDict = TRANSMISSION_ICONS
  }

  if (!vehicle[attribute]) return iconDict.defaultMissing

  let icon = iconDict[vehicle[attribute]]
  return icon || iconDict.defaultUnknown
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
</style>
