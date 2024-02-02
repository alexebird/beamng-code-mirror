angular.module('beamng.stuff')
.controller('GameContextController', ['$state', '$stateParams', '$scope', '$rootScope', 'gamepadNav', 'translateService', function ($state, $stateParams, $scope, $rootScope, gamepadNav, translateService) {

  //let crossfireEnabled = gamepadNav.crossfireEnabled()
  //let gamepadNavEnabled = gamepadNav.gamepadNavEnabled()
  //let spatialNavEnabled = gamepadNav.spatialNavEnabled()
  //gamepadNav.enableCrossfire(true)
  //gamepadNav.enableGamepadNav(false)

  $scope.missions = []
  $scope.context = ""

  $scope.options = {}

  const isCareerMode = $stateParams.isCareer

  const getMissionType = mission => translateService.contextTranslate(mission.missionTypeLabel, true)
  const getMissionDifficulty = mission => {
    const attr = mission.additionalAttributes && Array.isArray(mission.additionalAttributes) && mission.additionalAttributes.find(a=>a.labelKey==="Difficulty")
    return attr ? attr.valueKey : ''
  }
  const setMissionTypeHeader = mission => {
    $scope.currentMission.type = mission ? getMissionType(mission) : ''
    $scope.currentMission.difficulty = mission ? getMissionDifficulty(mission) : ''
  }

  let met = '<icon class="material-icons" style="color: rgba(128,255,128,0.8); font-size: 2em">check</md-icon>'
  let unmet = '<icon class="material-icons" style="color: rgba(255,128,128,0.8); font-size: 2em">close</md-icon>'
  function unpackStartability(details) {
    if(details === undefined) return "";
    let label = "<li>" + translateService.contextTranslate(details.label, true) + (details.met? ' (DONE)' : '') + "</li>"
    if(details.nested && details.nested.length > 0) {
      let ret = label + "<ul>"
      details.nested.forEach(function(e){
        ret = ret + unpackStartability(e)
      })
      return ret + "</ul>"
    } else {
      return label
    }
  }

  $scope.$on('$destroy', function() {
    bngApi.engineLua("career_career.requestPause(false)");
  })

  function rows2cols(d) {
    return d.labels.map((label, i) => [
      { label },
      ...(Array.isArray(d.rows) ? d.rows : []).map(arr => arr[i])
    ]);
  }

  $scope.parseData = function(res) {
    if(res.repairOptions){
      $scope.repairOptions = res.repairOptions
      $scope.options.currRepairOption = $scope.repairOptions[0]
    }
    else
    {
      $scope.repairOptions = {}
    }

    $scope.startWarning = res.startWarning

    $scope.isWalking = res.isWalking
    $scope.isCareerActive = res.isCareerActive

    if(!res || res.context === null) {
      $scope.missions = []
      $scope.context = "empty"
      $scope.missionCount = 0
    }
    else
    {
      $scope.context = res.context
      if(res.context == "availableMissions") {
        $scope.missions = res.missions
        $scope.currentMission = res.missions[0]
        $scope.missionIndex = 0
        $scope.missionCount = $scope.missions.length
        if($scope.currentMission === undefined) {
          $scope.missionCount = 0
        }
        if(res.preselectedMissionId) {
          for (let i = 0; i < $scope.missions.length; i++) {
            if($scope.missions[i].id === res.preselectedMissionId) {
              $scope.currentMission = $scope.missions[i]
              $scope.missionIndex = i
            }
          }
        }


      }else if(res.context == "ongoingMission") {
        $scope.currentMission = res.mission
      }else if(res.context == "empty") {
        $scope.missions = []
        $scope.context = "empty"
        $scope.missionCount = 0
      }
    }
    $scope.missions.forEach(function(m) {
      m.unlockList = "<ul>"+unpackStartability(m.unlocks.startableDetails)+"</ul>"
      const progress = m.formattedProgress.formattedProgressByKey;
      for (let key in progress) {
        progress[key].ownAggregateCols = rows2cols(progress[key].ownAggregate);
        progress[key].attemptsCols = rows2cols(progress[key].attempts);
      }
    })
    $scope.currentMission.userSettingsAreDefault = $scope.checkSettingsAreDefault()
    setMissionTypeHeader($scope.currentMission)

    if($scope.context == "ongoingMission") {
      bngApi.engineLua("career_career.requestPause(true)");
    }
    setRepairButtonVisibility()
  }

  $scope.checkSettingsAreDefault = function() {
    let same = true
    let def = $scope.currentMission.defaultUserSettings
    let mis = $scope.currentMission.userSettings
    if(mis === undefined) return true;
    if(mis.length == 0 || mis.length === undefined) return true;
    for(var entry of mis) {
      same = same  &&(entry.value === def[entry.key])
    }
    return same
  }

  function setRepairButtonVisibility() {
    $scope.showRepairCard = false
    $scope.repairStartButton = {
      enabled : false,
    }
    if ( $scope.currentMission != null ){
      if($scope.currentMission.tutorialActive){ //no need to repair your damaged vehicle during tutorial
        return
      }
      for (let i = 0; i < $scope.currentMission.userSettings.length; i++) {
        let setting = $scope.currentMission.userSettings[i]
        if (setting.key == "setupModuleVehicles" && setting.values[setting.value - 1].l == "Player Vehicle") {

            if($scope.isCareerActive && !$scope.isWalking && $scope.needsRepair && $scope.currentMission.unlocks.startable){
              $scope.showRepairCard = true
            }

            if($scope.isWalking){
              $scope.repairStartButton = {
                enabled : true,
                reason : "Cannot start this challenge on foot with current settings"
              }
          }
          else if($scope.needsRepair && $scope.isCareerActive)
          {
            $scope.repairStartButton = {
              enabled : !$scope.options.currRepairOption.available,
              reason : $scope.options.currRepairOption.notEnoughDisplay
            }
          }
        }
      }
    }
  }

  $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    if(toState && toState.name == "menu.careermission") {
      bngApi.engineLua('core_gameContext.getGameContext(true)', function(res) {
        $scope.$evalAsync(() =>$scope.parseData(res))
      })
    }
  })

  $scope.settingsChanged = function() {
    console.log($scope.currentMission.userSettings)
    $scope.currentMission.userSettingsAreDefault = $scope.checkSettingsAreDefault()
    let fun = 'gameplay_markerInteraction.changeUserSettings('+bngApi.serializeToLua($scope.currentMission.id)+','+bngApi.serializeToLua($scope.currentMission.userSettings)+')'
    bngApi.engineLua(fun)
    setRepairButtonVisibility()
  }



  $scope.$on('missionProgressKeyChanged',function (event, data) {
    let missionId = data.missionId
    let progressKey = data.progressKey
    if($scope.currentMission.id == missionId){
      $scope.currentMission.currentProgressKey = progressKey
    }
  })

  $scope.$on('AvailableMissionsChanged',function (event, data) {
    $scope.$evalAsync(() => $scope.parseData(data))
  })

  $scope.$on('gameContextPlayerVehicleDamageInfo',function (event, data) {
    $scope.needsRepair = data.needsRepair
    setRepairButtonVisibility()
  })

  $scope.selectMissionFromList = function(index) {
    $scope.$evalAsync(() =>{
      $scope.currentMission = $scope.missions[index]
      setMissionTypeHeader($scope.currentMission)
      $scope.missionIndex = index
      $scope.currentMission.userSettingsAreDefault = $scope.checkSettingsAreDefault()
      setRepairButtonVisibility()
      //$scope.$apply()
    })
  }

  $scope.repairChanged = function(){
    setRepairButtonVisibility()
  }

  $scope.nextMission = function() {
    $scope.selectMissionFromList(($scope.missionIndex + 1)%$scope.missions.length)

  }
  $scope.prevMission = function() {
    $scope.selectMissionFromList(($scope.missionIndex - 1 + $scope.missions.length)%$scope.missions.length)
  }


  $scope.startMissionById = function(id) {
    let userSettings = {}
    if($scope.currentMission.userSettings) {
      for(let i = 0; i < $scope.currentMission.userSettings.length; i++) {
        let setting = $scope.currentMission.userSettings[i]
        userSettings[setting.key] = setting.value
      }
    }
    let startingOptions = {}
    if($scope.options.currRepairOption && $scope.isCareerActive){
      startingOptions = {
        repair :
        {
          type : $scope.options.currRepairOption.type,
          cost : $scope.options.currRepairOption.cost,
        }
      }
    }

    let fun = 'gameplay_markerInteraction.startMissionById('+bngApi.serializeToLua(id)+','+bngApi.serializeToLua(userSettings)+','+bngApi.serializeToLua(startingOptions)+')'
    console.log(fun)
    bngApi.engineLua(fun)
    $scope.$emit('MenuToggle')
  }

  $scope.stopMissionById = function(id) {
    if($scope.currentMission.tutorialActive) return;
    let fun = 'gameplay_markerInteraction.stopMissionById('+bngApi.serializeToLua(id)+')'
    console.log(fun)
    bngApi.engineLua(fun)
    $scope.$emit('MenuToggle')
  }

  $scope.btnClicked = function(btn) {
    let fun = btn.fun
    console.log(fun)
    bngApi.engineLua(fun)
    $scope.$emit('MenuToggle')
  }

  $scope.back = function() {
    $rootScope.$broadcast('MenuToggle')
  }

  $scope.fn = function() {
    console.log($scope.currentMission)
  }

  $scope.resumeMission = function() {
    // $state.go('play')
    history.go(-2) // go back to the state that brought us here (is this the best way? Feels hacky)
  }
}])


.directive('gameContextMiniInfo', ['$rootScope', function ($rootScope) {
  return {
    template: '<div class="game-context-mini-info" ng-show="showMission" ng-transclude></div>',
    replace: true,
    transclude: true,

    link: function (scope, element, attrs) {
      scope.showMission = true


      $rootScope.$on('$stateChangeStart', (_, state) => {
        //console.log(state)
      })
    }
  }
}])

.directive('bngCard', function () {
  return {
    template:
    `<div class="card card-style-{{cardStyle || 'default'}}" bng-blur="true" bng-no-nav="{{!!action}}" bng-sound-class="{{action ? 'bng_click_hover_generic' : ''}}">
      <div class="card-title" ng-if="title">
        {{title}}
      </div>
      <div class="card-content-slot" ng-transclude>
      </div>
      <div bng-nav-item ng-class="{'card-actions-wrapper': true, disabled: actionDisabled}" ng-if="action">
        {{action}}
      </div>
    </div>`,
    replace: true,
    transclude: true,
    scope: {
      cardStyle: "@",
      title: "@",
      action: "=",
      actionDisabled: "="
    }
  }
});
