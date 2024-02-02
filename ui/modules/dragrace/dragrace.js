angular.module('beamng.stuff')

/**
  Future how to use:
  Call quickRaceLoader.getQuickraceList(), which contanis a list of levels.
  Each level has a levelInfo-property, which is the info from the info.json in the level.
  Also, each level has a tracks-property list, which contains all the tracks.
  After getting these, display them and let the user select them. Use the DragraceService
  if you want to, it works for now. Let the user select a vehicle. I copied and modified
  some code of the vehicleselect-screen.
  Once you have a level, track and vehicle, call quickRaceLoader.startQuickrace(level, track, vehicle).
  This will merge the data and create one scenario file, which is then loaded by
  the scenario_scenarios.lua code.
**/

.factory('DragraceService', function() {
  var selections= {}

  function reset () {
    selections.vehicle = {
      name: '',
      file:null,
      preview: '/ui/images/appDefault.png',
      targetState: {state: 'vehicles', args: {mode: 'dragRace'}}
    }
  }

  reset()

  return {
    getSelections:  function()        { return selections;            },
    setVehicle:    function(vehicle)  { selections.vehicle   = vehicle; },
    reset : reset,
    accessibility: function () {
      for (var key in selections) {
        selections[key].disabled = key === 'track'
      }
    }
  }
})

.controller('DragRaceController', ['$filter', '$scope', '$state', '$interval', '$stateParams', 'DragraceService', 'VehicleSelectConfig', 'gamepadNav', '$timeout', '$rootScope',
  function($filter,  $scope, $state, $interval, $stateParams, DragraceService, VehicleSelectConfig, gamepadNav, $timeout, $rootScope) {

  var prevCross = gamepadNav.crossfireEnabled()
  var prevGame = gamepadNav.gamepadNavEnabled()


  gamepadNav.enableCrossfire(true)
  gamepadNav.enableGamepadNav(false)

  $scope.isDisabled = function () {
    return !$scope.selections.vehicle.file
  }

  // register dragRace configuration for vehicleselector
  if (VehicleSelectConfig.configs['dragRace'] === undefined) {
    VehicleSelectConfig.addConfig('dragRace', {
      hide: {
        'removeBtns': true,
        'spawnNew': true
      },
      backButtonRef : '^.dragRaceOverview',
      selected: (carObj, model, config, color, spawnNew) => {
        if(config == null ) config = carObj.default_pc
        if(color == null ) color = carObj.default_color
        //console.log(carObj)
        DragraceService.setVehicle({
          official: carObj.aggregates.Source['BeamNG - Official'],
          model: model,
          config: config,
          color: color,
          name: carObj.Name,
          preview: carObj.preview,
          targetState: {state: 'vehicles', args: {mode: 'dragRace'}},
          file: carObj

        })

        VehicleSelectConfig.configs['dragRace'].backButtonRef = '^.dragRaceOverview'
        $state.go(`^.dragRaceOverview`)
      },
      selectButton: 'ui.quickrace.selectVehicle',
      parentState: 'menu',
      name: 'dragRace',
      filter: {
        'Type': ['Prop', 'Trailer']
      },
      getVehicles: function() {
        if ($stateParams.vehicles) {
          return $stateParams.vehicles
        }
        return undefined
      }
    })
  }

  if ($stateParams.results) {
    $scope.results = $stateParams.results
  }
  $scope.cinematicEnabled = $stateParams.cinematicEnabled

  $scope.selections = DragraceService.getSelections()

  bngApi.engineLua('core_vehicles.getCurrentVehicleDetails()', (res) => {
    if (DragraceService.getSelections().vehicle.name === "") {
      if(res && res.model && (res.model.Type === "Prop" || res.model.Type == "Trailer"))
        return
      DragraceService.setVehicle({
        official: res.configs.aggregates.Source['BeamNG - Official'],
        model: res.model.key,
        config: res.current.config_key,
        color: res.current.color,
        name: res.configs.Name,
        preview: res.configs.preview,
        file: res.model,
        targetState: {state: 'vehicles', args: {mode: 'dragRace'}}
      })
    }
  })

  $scope.getTargetState = function (card) {
    if (card.disabled) {
      return '.' // . = current state
    } else if (typeof card.targetState === 'string') {
      return `^.${card.targetState}`
    }
    return `^.${card.targetState.state}(${JSON.stringify(card.targetState.args)})`
  }

  $scope.startRace = function() {
    if($scope.selections.vehicle.file == null) {
      console.log("no vehicle specified!")
      return
    }
    var vCode = bngApi.serializeToLua($scope.selections.vehicle)
    var luaCode = 'freeroam_dragRace.selectOpponent(' + vCode + ')'

    if ($scope.selections.vehicle) {
      var fallback = $timeout(() => {
        // if the car isn't spawned by now it will probably not spawn at all, so remove the waiting sign
        $rootScope.$broadcast('app:waiting', false)
      }, 3000)

      $rootScope.$broadcast('app:waiting', true, function () {
        bngApi.engineLua(luaCode, function() {
          $timeout($rootScope.$broadcast('app:waiting', false))
          $timeout.cancel(fallback)
        })
      })
      $scope.$emit('CloseMenu')
    }
  }

  $scope.enableCinematicCam = false
  $scope.enableProTree = false
  $scope.exitDragRace = false

  $scope.$on('$destroy', () => {
    gamepadNav.enableCrossfire(prevCross)
    gamepadNav.enableGamepadNav(prevGame)
    if ($scope.exitDragRace === false) {
      bngApi.engineLua(`freeroam_dragRace.closeOverview()`)
    }
  })

  bngApi.engineLua(`settings.getValue('uiUnitLength')`, function(data) {
    $scope.unit = data
  })

  $scope.resetRace = function() {
    bngApi.engineLua(`freeroam_dragRace.restartRace()`)
  }

  bngApi.engineLua(`freeroam_dragRace.enableCinematicCam()`, function(data) {
    $scope.$evalAsync(function() {
      $scope.enableCinematicCam = data
    })
  })

  bngApi.engineLua(`freeroam_dragRace.enableProTree()`, function(data) {
    $scope.$evalAsync(function() {
      $scope.enableProTree = data
    })
  })

  $scope.exit = function() {
    $scope.exitDragRace = true
    bngApi.engineLua(`freeroam_dragRace.exit()`)
    $state.go('menu')
  }

  $scope.updateCinematicCam = function(newValue) {
    bngApi.engineLua(`freeroam_dragRace.enableCinematicCam(${newValue})`)
  }

  $scope.updateProTree = function(newValue) {
    bngApi.engineLua(`freeroam_dragRace.enableProTree(${newValue})`)
  }

  $scope.selectRandomOpponent = function (sameClass) {
    bngApi.engineLua(`freeroam_dragRace.selectRandomOpponent(${sameClass})`, function (data) {
      $scope.$evalAsync(function () {
        var vehicle = data
        DragraceService.setVehicle({
          official: vehicle.Source['BeamNG - Official'],
          model: vehicle.model_key,
          config: vehicle.key,
          color: vehicle.default_color,
          name: vehicle.Name,
          preview: vehicle.preview,
          targetState: { state: 'vehicles', args: { mode: 'dragRace' } },
          file: vehicle
        })
      })
    })
  }

}]);
