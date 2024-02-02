angular.module('beamng.apps')
.directive('brakeThermalDebug', [function () {
  return {
    templateUrl: '/ui/modules/apps/BrakeThermalDebug/app.html',
    replace: true,
    restrict: 'EA',
    scope: true,
    controller: ['$log', '$scope', function ($log, $scope) {
      var streamsList = ['wheelThermalData']
      StreamsManager.add(streamsList)
      $scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      $scope.gearText = ''
      $scope.wheels = []
      $scope.displayWheel1 = null
      $scope.displayWheel2 = null

      var _reset = function () {
        $scope.$evalAsync(function () {
          $scope.wheels = []
          $scope.displayWheel1 = null
          $scope.displayWheel2 = null
        })
      }

      $scope.$on('streamsUpdate', function (event, data) {
        if (!data.wheelThermalData) {
          $scope.data = []
          return
        }

        if ($scope.wheels.length < 1) {
          var wheelKeys = Object.keys(data.wheelThermalData.wheels)
          $scope.wheels = wheelKeys
          $scope.displayWheel1 = wheelKeys[wheelKeys.length-1]
          $scope.displayWheel2 = wheelKeys[0]
          $scope.$digest()
          return
        }

        if ( !($scope.displayWheel1 in data.wheelThermalData.wheels) ||
             !($scope.displayWheel2 in data.wheelThermalData.wheels)) {
          _reset()
          return
        }

        $scope.$evalAsync(function () {
          var currentWheels = Object.keys(data.wheelThermalData.wheels)
          if (currentWheels.length != $scope.wheels.length)
            $scope.wheels = currentWheels

          $scope.data = makeDataDisplayable(data.wheelThermalData, $scope.displayWheel1, $scope.displayWheel2)
        })
      })

      $scope.$on('VehicleFocusChanged', _reset)
      $scope.$on('VehicleReset', _reset)

      var makeDataDisplayable = function (data, displayWheel1, displayWheel2) {
        return [{
              name: 'ui.apps.brake_thermal_debug.brakeType',
              str1: data.wheels[displayWheel1].brakeType,
              str2: data.wheels[displayWheel2].brakeType,
          }, {
              name: 'ui.apps.brake_thermal_debug.padType',
              str1: data.wheels[displayWheel1].padMaterial,
              str2: data.wheels[displayWheel2].padMaterial,
          }, {
              name: 'ui.apps.brake_thermal_debug.surfaceTemp',
              str1: UiUnits.buildString('temperature', data.wheels[displayWheel1].brakeSurfaceTemperature, 0),
              str2: UiUnits.buildString('temperature', data.wheels[displayWheel2].brakeSurfaceTemperature, 0),
          }, {
        name: 'ui.apps.brake_thermal_debug.coreTemp',
              str1: UiUnits.buildString('temperature', data.wheels[displayWheel1].brakeCoreTemperature, 0),
              str2: UiUnits.buildString('temperature', data.wheels[displayWheel2].brakeCoreTemperature, 0),
          }, {
              name: 'ui.apps.brake_thermal_debug.energyToBrakeSurface',
              str1: UiUnits.buildString('energy', data.wheels[displayWheel1].energyToBrakeSurface, 0),
              str2: UiUnits.buildString('energy', data.wheels[displayWheel2].energyToBrakeSurface, 0),
      }, {
              name: 'ui.apps.brake_thermal_debug.energySurfaceToCore',
              str1: UiUnits.buildString('energy', data.wheels[displayWheel1].energyBrakeSurfaceToCore, 0),
              str2: UiUnits.buildString('energy', data.wheels[displayWheel2].energyBrakeSurfaceToCore, 0),
          }, {
              name: 'ui.apps.brake_thermal_debug.energySurfaceToAir',
              str1: UiUnits.buildString('energy', data.wheels[displayWheel1].energyBrakeSurfaceToAir, 0),
              str2: UiUnits.buildString('energy', data.wheels[displayWheel2].energyBrakeSurfaceToAir, 0),
      }, {
              name: 'ui.apps.brake_thermal_debug.energyCoreToAir',
              str1: UiUnits.buildString('energy', data.wheels[displayWheel1].energyBrakeCoreToAir, 0),
              str2: UiUnits.buildString('energy', data.wheels[displayWheel2].energyBrakeCoreToAir, 0),
          }, {
              name: 'ui.apps.brake_thermal_debug.energyRadiationToAir',
              str1: UiUnits.buildString('energy', data.wheels[displayWheel1].energyRadiationToAir, 0),
              str2: UiUnits.buildString('energy', data.wheels[displayWheel2].energyRadiationToAir, 0),
          }, {
              name: 'ui.apps.brake_thermal_debug.surfaceCooling',
              str1: data.wheels[displayWheel1].surfaceCooling.toFixed(2),
              str2: data.wheels[displayWheel2].surfaceCooling.toFixed(2),
          }, {
              name: 'ui.apps.brake_thermal_debug.coreCooling',
              str1: data.wheels[displayWheel1].coreCooling.toFixed(2),
              str2: data.wheels[displayWheel2].coreCooling.toFixed(2),
      }, {
              name: 'ui.apps.brake_thermal_debug.thermalEfficiency',
              str1: data.wheels[displayWheel1].brakeThermalEfficiency.toFixed(2),
              str2: data.wheels[displayWheel2].brakeThermalEfficiency.toFixed(2),
      }, {
              name: 'ui.apps.brake_thermal_debug.padGlazing',
              str1: data.wheels[displayWheel1].padGlazingFactor.toFixed(2),
              str2: data.wheels[displayWheel2].padGlazingFactor.toFixed(2),
          }, {
              name: 'ui.apps.brake_thermal_debug.finalEfficiency',
              str1: data.wheels[displayWheel1].finalBrakeEfficiency.toFixed(2),
              str2: data.wheels[displayWheel2].finalBrakeEfficiency.toFixed(2),
              warn1: (data.wheels[displayWheel1].finalBrakeEfficiency <= 0.90),
              warn2: (data.wheels[displayWheel2].finalBrakeEfficiency <= 0.90),
              error1: (data.wheels[displayWheel1].finalBrakeEfficiency < 0.85),
              error2: (data.wheels[displayWheel2].finalBrakeEfficiency < 0.85)

      }, {
              name: 'ui.apps.brake_thermal_debug.slope',
              str1: data.wheels[displayWheel1].slopeSwitchBit,
              str2: data.wheels[displayWheel2].slopeSwitchBit,
          }
        ]
      }
    }]
  }
}])
