angular.module('beamng.stuff')

  /**
    Future how to use:
    Call quickRaceLoader.getQuickraceList(), which contanis a list of levels.
    Each level has a levelInfo-property, which is the info from the info.json in the level.
    Also, each level has a tracks-property list, which contains all the tracks.
    After getting these, display them and let the user select them. Use the LightRunnerService
    if you want to, it works for now. Let the user select a vehicle. I copied and modified
    some code of the vehicleselect-screen.
    Once you have a level, track and vehicle, call quickRaceLoader.startQuickrace(level, track, vehicle).
    This will merge the data and create one scenario file, which is then loaded by
    the scenario_scenarios.lua code.
  **/

  .factory('LightRunnerService', function () {
    var selections = {}
    var mode = ''

    function reset() {
      selections.level = {
        name: '',
        file: null,
        preview: '/ui/images/appDefault.png',
        targetState: 'quickraceLevelselect',
      }
      selections.track = {
        name: '',
        file: null,
        preview: '/ui/images/appDefault.png',
        targetState: 'quickraceTrackselect',
        disabled: true
      }
      selections.vehicle = {
        name: '',
        file: null,
        preview: '/ui/images/appDefault.png',
        targetState: { state: 'vehicles', args: { mode: 'lightRunner'} }
      }
    }

    reset()

    return {
      getSelections: function () { return selections; },
      setLevel: function (level) { selections.level = level; },
      setTrack: function (track) { selections.track = track; },
      setVehicle: function (vehicle) { selections.vehicle = vehicle; },
      setMode: function (newMode) { mode = newMode; },
      getMode: function () { return mode; },
      reset: reset,
      accessibility: function () {
        for (var key in selections) {
          selections[key].disabled = key === 'track'
        }
      }
    }
  })

  .controller('LightRunnerController', ['$filter', '$scope', '$state', '$interval', '$stateParams', 'LightRunnerService', 'VehicleSelectConfig', 'gamepadNav',
    function ($filter, $scope, $state, $interval, $stateParams, LightRunnerService, VehicleSelectConfig, gamepadNav) {
      var prevCross = gamepadNav.crossfireEnabled()
        , prevGame = gamepadNav.gamepadNavEnabled()
        , prevSpatial = gamepadNav.gamepadNavEnabled()


      if ($stateParams.mode) {
        LightRunnerService.setMode($stateParams.mode)
      }

      gamepadNav.enableCrossfire(true)
      gamepadNav.enableGamepadNav(false)

      var highscores = []
      var tmpVehicle = null
      var todNames = ['night', 'sunrise', 'morning', 'earlyNoon', 'noon', 'lateNoon', 'afternoon', 'evening', 'sunset']
      $scope.showLapRecords = false
      //local tod = {   0.5,    0.755,    0.8,        0.9,        0,      0.1,      0.175,       0.23,      0.245}

      $scope.todChanged = function () {
        $scope.selections.track.file.todText = "{{ :: 'ui.quickrace.tod." + todNames[$scope.selections.track.file.tod % 9] + "' | translate }}"
      }

      $scope.isDisabled = function () {
        return !$scope.selections.level.file || !$scope.selections.track.file || !$scope.selections.vehicle.file
      }

      // Colours used for lightrunner skins
      var glowColors = [
        red = '1 0 0 1.4',
        green = '0 1 0 1.4',
        blue = '0 0 1 1.4',
        lightblue = '0 0.9 1 1.4',
        orange = '1 0.5 0 1.4',
        yellow = '1 1 0 1.4',
        lime = '0.2 1 0 1.4'
      ]

      // register quickrace configuration for vehicleselector
      if (VehicleSelectConfig.configs['lightRunner'] === undefined) {
        VehicleSelectConfig.addConfig('lightRunner', {
          hide: {
            'removeBtns': true,
            'spawnNew': true
          },
          backButtonRef: '^.lightrunnerOverview',
          selected: (carObj, model, config, color, spawnNew) => {
            if (config == null) config = carObj.default_pc
            if (color == null) color = carObj.default_color
            LightRunnerService.setVehicle({
              official: carObj.aggregates.Source['BeamNG - Official'],
              model: model,
              config: config,
              color: color,
              color2: config === 'powerglow' ? glowColors[Math.floor(Math.random() * glowColors.length)] : carObj.default_color_2,
              name: carObj.Name,
              preview: carObj.preview,
              targetState: { state: 'vehicles', args: { mode: 'lightRunner'} },
              file: carObj
            })

            VehicleSelectConfig.configs['lightRunner'].backButtonRef = '^.lightrunnerOverview'
            $state.go(`^.lightrunnerOverview`)
          },
          selectButton: 'ui.quickrace.selectVehicle',
          parentState: 'menu',
          name: 'lightRunner',
          // filter: {
          //   'Type': ['Prop', 'Trailer'],
          // },
          restrict: {
            key: ["powerglow"],
            Type: ["Car", "Truck"],
          },
          getVehicles: function () {
            if ($stateParams.vehicles) {
              return $stateParams.vehicles
            }
            return undefined
          },
          showConfigurations: true
        })
      }


      $scope.difText = function (num) {
        var val = ['ui.scenarios.difficulty.easy', 'ui.scenarios.difficulty.medium', 'ui.scenarios.difficulty.hard', 'ui.scenarios.difficulty.veryHard']
        return val[Math.floor(parseFloat(num) / 25)]
      }

      $scope.selections = LightRunnerService.getSelections()

      bngApi.engineLua('scenario_quickRaceLoader.getQuickraceList()', function (res) {
        $scope.$evalAsync(function () {
          var levels = res

          if (!$scope.selections.vehicle.file) {
            bngApi.engineLua('core_vehicles.getModel("sbr")', function (res) {
              LightRunnerService.setVehicle({
                official: res.configs["powerglow"].aggregates.Source['BeamNG - Official'],
                model: res.model.key,
                config: res.configs["powerglow"].key,
                name: res.configs["powerglow"].Name,
                preview: res.configs["powerglow"].preview,
                file: res.model,
                targetState: { state: 'vehicles', args: { mode: 'lightRunner'} }
              })
            })
          }

          var level = levels.find((e) =>  e.levelName === "glow_city")
          if (!$scope.selections.level.file) {
            LightRunnerService.setLevel({
              name: level.name,
              preview: level.preview,
              file: level,
              disabled: true
            })
          }

          var track = level.tracks.find((e) => e.name === "Argon Curves")

          if (!$scope.selections.track.file) {
            if (track) {
              if (track.reversible) {
                track.reverse = false; // init this
              }
              if (track.allowRollingStart) {
                track.rollingStart = false; // and this
              }
              LightRunnerService.setTrack({
                name: track.name,
                file: track,
                targetState: 'lightrunnerTrackSelect',
                preview: track.preview,
                disabled: false
              })
            }
          }
        })
      })

      if ($stateParams.level && $stateParams.level.name) {
        var preview = null
        if ($stateParams.level.previews.length > 0) {
          preview = $stateParams.level.previews[Math.floor(Math.random() * $stateParams.level.previews.length)]
        }
        LightRunnerService.setLevel({
          name: $stateParams.level.name,
          preview: preview,
          file: $stateParams.level,
          // targetState: 'quickraceLevelselect',
          disabled: true
        })
      }

      if ($stateParams.track && $stateParams.track.name) {
        LightRunnerService.setTrack({
          name: $stateParams.track.name,
          file: $stateParams.track,
          preview: $stateParams.track.previews,
          reversePreview: $stateParams.track.reversePreview,
          targetState: 'lightrunnerTrackSelect',
          disabled: true
        })
      }

      // if (LightRunnerService.getMode !== 'lightRunner') {
      //   bngApi.engineLua('core_vehicles.getCurrentVehicleDetails()', (res) => {
      //     if (LightRunnerService.getSelections().vehicle.name === "") {
      //       if (res && res.model && (res.model.Type === "Prop" || res.model.Type == "Trailer"))
      //         return
      //       LightRunnerService.setVehicle({
      //         official: res.configs.aggregates.Source['BeamNG - Official'],
      //         model: res.model.key,
      //         config: res.current.config_key,
      //         color: res.current.color,
      //         name: res.configs.Name,
      //         preview: res.configs.preview,
      //         file: res.model,
      //         targetState: { state: 'vehicles', args: { mode: 'quickrace', event: 'lightRunner' } }
      //       })
      //     }
      //   })
      // }

      $scope.goToState = function (selection) {
        if (!selection.disabled) {
          if (typeof selection.targetState === 'string') {
            $state.go('^.' + selection.targetState)
          }
          else {
            $state.go('^.' + selection.targetState.state, selection.targetState.args)
          }
        }
      }

      $scope.changeLaps = function () {
        if ($scope.selections.track.file.lapCount == 0 && $scope.selections.track.file.allowRollingStart) {
          $scope.selections.track.file.rollingStart = true
        }
      }

      $scope.startRace = function () {
        if ($scope.selections.level.file == null) {
          console.log("no level specified!")
          return
        }
        if ($scope.selections.track.file == null) {
          console.log("no track specified!")
          return
        }
        if ($scope.selections.vehicle.file == null) {
          console.log("no vehicle specified!")
          return
        }
        //console.log($scope.selections.vehicle)
        var lCode = bngApi.serializeToLua($scope.selections.level.file)
        var tCode = bngApi.serializeToLua($scope.selections.track.file)
        var vCode = bngApi.serializeToLua($scope.selections.vehicle)
        var luaCode = 'scenario_quickRaceLoader.startQuickrace(' + lCode + ' , ' + tCode + ' , ' + vCode + ', "lightRunner")'


        if ($scope.selections.level.file && $scope.selections.track.file && $scope.selections.vehicle) {
          bngApi.engineLua(luaCode)
          // LightRunnerService.reset()
          $scope.$emit('CloseMenu')
        }
      }

      $scope.toggleShowLapRecords = function () {
        $scope.showLapRecords = !$scope.showLapRecords
      }

      $scope.settingsChanged = function () {
        if (!$scope.selections.level.file || !$scope.selections.track.file) {
          $scope.$evalAsync(function () {
            $scope.highscores = []
          })
          return
        }

        var luaCmd = 'core_highscores.getScenarioHighscores("'
        luaCmd = luaCmd + $scope.selections.level.file.levelName + '","'
        luaCmd = luaCmd + $scope.selections.track.file.trackName + '","'

        var configKey = "standing"
        if ($scope.selections.track.file.rollingStart && $scope.selections.track.file.lapCount > 0 && !$scope.showLapRecords)
          configKey = "rolling"
        if ($scope.selections.track.file.reverse)
          configKey += "Reverse"
        if (!$scope.showLapRecords)
          configKey += $scope.selections.track.file.lapCount
        else
          configKey += 0

        luaCmd = luaCmd + configKey + '")'
        tmpVehicle = LightRunnerService.getSelections().vehicle

        bngApi.engineLua(luaCmd, function (res) {
          $scope.$evalAsync(function () {
            $scope.highscores = res
          })
        })
      }
      $scope.settingsChanged()
      $scope.$on('$destroy', () => {
        gamepadNav.enableCrossfire(prevCross)
        gamepadNav.enableGamepadNav(prevGame)
      })

      var popoverCounter = 0
      $scope.showRecord = function (index) {
        if ($scope.highscores[index].vehicleModel == null)
          return
        var luaCmd = "core_vehicles.getModel('" + $scope.highscores[index].vehicleModel + "')"
        popoverCounter++
        var current = popoverCounter
        bngApi.engineLua(luaCmd, function (res) {
          if (popoverCounter != current)
            return
          $scope.$evalAsync(function () {
            $scope.selections.vehicle = {}
            $scope.selections.vehicle.file = {}
            $scope.selections.vehicle.file.Brand = res.model.Brand
            $scope.selections.vehicle.file.Country = res.model.Country
            $scope.selections.vehicle.file['Derby Class'] = res.model['Derby Class']
            $scope.selections.vehicle.name = res.configs[$scope.highscores[index].vehicleConfig].Name
            $scope.selections.vehicle.preview = []
            $scope.selections.vehicle.preview[0] = res.configs[$scope.highscores[index].vehicleConfig].preview
          })
        })
      }

      $scope.selectRecord = function (index) {
        if ($scope.highscores[index].vehicleModel == null)
          return
        var luaCmd = "core_vehicles.getModel('" + $scope.highscores[index].vehicleModel + "')"
        popoverCounter++
        var current = popoverCounter
        bngApi.engineLua(luaCmd, function (res) {
          if (popoverCounter != current)
            return
          $scope.$evalAsync(function () {
            $scope.selections.vehicle.brand = res.model.Brand
            $scope.selections.vehicle.file = res.model
            $scope.selections.vehicle.file['Derby Class'] = res.model['Derby Class']
            $scope.selections.vehicle.color = res.configs[$scope.highscores[index].vehicleConfig].default_color
            $scope.selections.vehicle.name = res.configs[$scope.highscores[index].vehicleConfig].Name
            $scope.selections.vehicle.preview = []
            $scope.selections.vehicle.preview[0] = res.configs[$scope.highscores[index].vehicleConfig].preview
            $scope.selections.vehicle.config = $scope.highscores[index].vehicleConfig
            $scope.selections.vehicle.model = $scope.highscores[index].vehicleModel
            tmpVehicle = $scope.selections.vehicle
          })
        })
      }

      $scope.hideRecord = function () {
        popoverCounter++
        var current = popoverCounter
        $scope.$evalAsync(function () {
          if (popoverCounter != current)
            return
          $scope.selections.vehicle = tmpVehicle
        })
      }
    }])
  .controller('LightRunnerTrackController', ['$filter', 'LightRunnerService', '$scope', '$state', '$interval', 'VehicleSelectConfig',
    function ($filter, LightRunnerService, $scope, $state, $interval, VehicleSelectConfig) {

      var levelName = LightRunnerService.getSelections().level.name
      var available = []
      $scope.filtered = []
      $scope.selected = null
      $scope.query = ''

      $scope.tilesOrder = [
        { label: 'Difficulty', key: 'difficulty' },
        { label: 'Date', key: '-date' },
        { label: 'Author', key: 'authors' },
        { label: 'Players', key: '-maxPlayers' },
      ]

      $scope.selectedOrder = $scope.tilesOrder[0].key

      bngApi.engineLua("", function (res) {
        available = []
        showList(LightRunnerService.getSelections().level.file.tracks)
      })

      function showList(res) {
        $scope.filtered = []

        for (var i = 0; i < res.length; i++) {
          if (res[i].previews && res[i].previews.length > 0) {
            res[i].preview = res[i].previews[0]

            if (res[i].reversePreviews && res[i].reversePreviews.length > 0)
              res[i].reversePreview = res[i].reversePreviews[0]
            else
              res[i].reversePreview = null
            res[i].preImgIndex = 0
            res[i].maxPlayers = 0

            for (var j in res[i].vehicles) {
              var v = res[i].vehicles[j]
              if (v.playerUsable == true) res[i].maxPlayers++
              if (v.driver && v.driver.player == true) res[i].maxPlayers++
            }
            if (res[i].playersCountRange) res[i].maxPlayers = res[i].playersCountRange.max
            res[i].minPlayers = res[i].maxPlayers
            if (res[i].playersCountRange) res[i].minPlayers = res[i].playersCountRange.min
          }

        }

        available = res

        $scope.$watchGroup(['query', 'selectedOrder'], function (value) {
          var temp = $filter('filter')(available, value[0])
          temp = $filter('orderBy')(temp, [value[1], 'name'])
          $scope.filtered = temp
          $scope.selected = $scope.filtered[0]
        })

        $scope.$digest(); // trigger the $watchGroup
      }



      // TODO: select the first entry of the filtered list always
      var selectedTimer = 0;//Timer to make previews one by one in a certain duration


      function changePreview() {
        $scope.selected.preImgIndex++
        if ($scope.selected.preImgIndex > $scope.selected.previews.length - 1) {
          $scope.selected.preImgIndex = 0
        }
        $scope.selected.preview = $scope.selected.previews[$scope.selected.preImgIndex]
      }

      $scope.difText = function (num) {
        var val = ['ui.scenarios.difficulty.easy', 'ui.scenarios.difficulty.medium', 'ui.scenarios.difficulty.hard', 'ui.scenarios.difficulty.veryHard']
        return val[Math.floor(parseFloat(num) / 25)]
      }

      $scope.openRepo = function () {
        //window.location.href = 'http-external://www.beamng.com/resources/categories/scenario_scenarios.8/?ingame=2'
      }

      $scope.selectTrack = function (level) {
        //console.log(level)
        $interval.cancel(selectedTimer)
        $scope.selected = level
        if (!$scope.selected.previews) {
          $scope.selected.preview = null
          return
        }
        $scope.selected.preview = $scope.selected.previews[$scope.selected.preImgIndex]
        if ($scope.selected.previews.length > 1) {
          selectedTimer = $interval(changePreview, 3000)
        }
      }

      $scope.startTrack = function (track, gameState, goToVehicles) {
        //scenario.raceFile = "quickrace/skycurve1"
        //var luaCmd = 'scenario_scenarios.start(' + bngApi.serializeToLua(scenario) + ')'
        //bngApi.engineLua(luaCmd)
        // bngApi.engineLua("dump(" + bngApi.serializeToLua(track) + ")")

        if (track.reversible) {
          track.reverse = false; // init this
        }

        if (track.allowRollingStart) {
          track.rollingStart = false; // and this
        }

        LightRunnerService.setTrack({
          name: track.name,
          file: track,
          preview: track.preview,
          reversePreview: track.reversePreview,
          targetState: 'lightrunnerTrackSelect'
        })
        if (goToVehicles && LightRunnerService.getSelections().vehicle.model == null) {
          VehicleSelectConfig.configs['lightRunner'].backButtonRef = '^.lightrunnerTrackSelect'
          $state.go(`menu.vehicles`, { mode: 'lightRunner', event: 'lightRunner' })
        } else {
          VehicleSelectConfig.configs['lightRunner'].backButtonRef = '^.lightrunnerOverview'
          $state.go(`^.lightrunnerOverview`)
        }
        //$state.go(`^.quickraceOverview`)
      }
    }])

  ;
