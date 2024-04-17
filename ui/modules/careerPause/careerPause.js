'use strict'

angular.module('beamng.stuff')

.controller('CareerPauseController', ['$rootScope', '$scope', 'toastr', '$state', 'Settings', '$http', '$filter', 'Utils', 'gamepadNav', 'ConfirmationDialog', 'translateService', 'MessageToasterService', function($rootScope, $scope, toastr, $state, Settings, $http, $filter, Utils, gamepadNav, ConfirmationDialog, translateService, messageToasterService) {

  $scope.exitingCareer = false
  $scope.isSlotLoaded = false;
  $scope.isVehicleNameLoaded = false;
  $scope.isLogbookLoaded = false;
  $scope.additionalButtons = [];

//   career pause
  bngApi.engineLua("career_career.sendCurrentSaveSlotData()", data => {
    $scope.slot = data;
    $scope.lastSave = data.date;
    $scope.saveName = data.id;
    $scope.slot.showXPNumbers=true;
    $scope.isSlotLoaded = true;
    $scope.tutorialActive = data.tutorialActive;
  });
  //   additional buttons for modes
  bngApi.engineLua("career_career.getAdditionalMenuButtons()", data => {
    $scope.additionalButtons = data
  });

  $scope.additionalButtonClicked = function(btn) {
    bngApi.engineLua(btn.luaFun);
  }

  bngApi.engineLua("career_career.requestPause(true)");

  $scope.$on('$destroy', function() {
    bngApi.engineLua("career_career.requestPause(false)");
  })

  // $scope.$on("getCurrentSaveSlot", (scope, data) => {
  //   console.log("current save slot", data);
  //   $scope.slot = data
  // });
  function dataIn(data) {

  }

  $scope.exitingCareerSwitch = function() {
    $state.go("menu.mainmenu");
    //$scope.exitingCareer = !$scope.exitingCareer
  }

  $scope.goToentry = function(type, missionId) {
    if(type == "missionUnlocked") {
      $state.go("menu.bigmap", {missionId: missionId})
    }
  }

  $scope.goToQuests = function() {
    $state.go("menu.careerQuests")
  }


  // Angular Logbook Launch
  // $scope.goToLogbook = function(entryId) {
  //   if(entryId !== undefined)
  //     $state.go("menu.careerLogbook",{entryId})
  //   else
  //     $state.go("menu.careerLogbook")
  // }

  $scope.goToLogbook = function(entryId) {
    if(entryId !== undefined)
      $state.go("logbook",{id: (''+entryId).replace(/\//g, '%')})  // forward slashes breaking routing (angular?) - a bit of a hack to fix it
    else
      $state.go("logbook")
  }

  bngApi.engineLua("career_modules_logbook.getLogbookMostRecentUnread()", data => {
    if (!Array.isArray(data)) {
      $scope.isLogbookLoaded = true;
      return;
    }
    $scope.recentLogbookEntries = data
    if ($scope.recentLogbookEntries.length < 3) {
      while ($scope.recentLogbookEntries.length <3) {
        $scope.recentLogbookEntries.push({type: "placeholder", name: "Find more entrynts of interest!"})
      }
    }
    $scope.isLogbookLoaded = true;
  });


  function updateVehicleDetails() {
    bngApi.engineLua("core_vehicles.getCurrentVehicleDetails()", setVehicleDetails)
  }

  function setVehicleDetails(data) {
    $scope.vehicleName = makeVehicleName(data)
    $scope.isVehicleNameLoaded = true;
  }

  $scope.$on("VehicleChange", updateVehicleDetails)


  // todo - move this somewhere as it's basically copied from garage.js and it probably makes sense to have just one function
  function makeVehicleName(data) {
    if (!data) return ''
    // bit of a hack to set name to 'Walking' instead of weird mesh and unicycle stuff...
    // TODO - check if it is safe to be using this translation key for 'walking'
    if (data.current.key=='unicycle') return translateService.contextTranslate('ui.camera.mode.unicycle')
    let name
    if (data.model.Brand) {
      name = `${data.model.Brand} ${data.model.Name}`
    } else {
      name = data.configs.Name
    }
    if (data.configs.Configuration) {
      if (data.configs.Source === "BeamNG - Official") {
        name += ` - ${data.configs.Configuration}`
      } else {
        name += " - Custom" // ?
      }
    }
    return name
  }

  $scope.resume = function() {
    $state.go("play");
  }

  $scope.load = function() {
    if ($scope.tutorialActive) {
      $state.go("menu.career");
      return;
    }
    ConfirmationDialog.open(
      "Your progress will be lost", "Make sure to save before loading",
      [
        { label: "Continue", key: true, default: true },
        { label: "Cancel", key: false, isCancel: true }
      ]
    ).then(res => {
      if (!res) {
        return;
      }
      $state.go("menu.career");
    });
  }

  function infoToast(str) {
    toastr['info'](translateService.contextTranslate(str, true), "", messageToasterService.toastOptions)
  }

  function savedNotify() {
    //infoToast("ui.career.notification.saved")
  }

  $scope.save = function() {
    bngApi.engineLua("career_saveSystem.saveCurrent()", savedNotify)
    $state.go("play");
  }

  $scope.$on("saveFinished", (scope) => {
    if ($scope.exitCareerTo == "mainMenu") {
      savedNotify()
      bngApi.engineLua("career_career.deactivateCareer()");
      bngApi.engineLua("endActiveGameMode()");
      $state.go("menu.mainmenu");
      $scope.exitCareerTo = false
    }else if($scope.exitCareerTo == "freeroam") {
      savedNotify()
      bngApi.engineLua("career_career.deactivateCareerAndReloadLevel()");
      $state.go("play")
    }else if($scope.exitCareerTo == "quit") {
      bngApi.engineLua("quit()");
    }
  });

  $scope.exit = function() {
    if ($scope.tutorialActive) {
      bngApi.engineLua("career_career.deactivateCareer()");
      bngApi.engineLua("endActiveGameMode()");
      $state.go("menu.mainmenu");
      return;
    }
    //Maybe there is a mistake here? Discuss with les seniors
    ConfirmationDialog.open(
      null, "ui.career.exitPrompt",
      [
        { label: "ui.common.yes", key: 1, default: true },
        { label: "ui.common.no", key: 2, isCancel: false },
        { label: "ui.common.cancel", key: 0, isCancel: true }
      ], {lastSave: $scope.lastSave}
    ).then(res => {
      if (!res) {
        $scope.exitingCareer = false
        return;
      }
      else if (res === 2) {
        bngApi.engineLua("career_career.deactivateCareer()");
        bngApi.engineLua("endActiveGameMode()");
        $state.go("menu.mainmenu");
      }
      else {
        bngApi.engineLua("career_saveSystem.saveCurrent()", () => {
          $scope.exitCareerTo = "mainMenu"
        });
      }
    });
  }

  $scope.saveExitFreeroam = function() {
    if ($scope.tutorialActive) {
      bngApi.engineLua("career_career.deactivateCareerAndReloadLevel()");
      $state.go("play");
      return;
    }
    ConfirmationDialog.open(
      null, "ui.career.exitPrompt",
      [
        { label: "ui.common.yes", key: 1, default: true },
        { label: "ui.common.no", key: 2, isCancel: false },
        { label: "ui.common.cancel", key: 0, isCancel: true }
      ], {lastSave: $scope.lastSave}
    ).then(res => {
      if (!res) {
        $scope.exitingCareer = false
        return;
      }
      else if (res === 2) {
        bngApi.engineLua("career_career.deactivateCareerAndReloadLevel()");
        $state.go("play")
      }
      else {
        bngApi.engineLua("career_saveSystem.saveCurrent()", () => {
          $scope.exitCareerTo = "freeroam"
        });
      }
    });
  }

  $scope.saveExitDesktop = function() {
    if ($scope.tutorialActive) {
      bngApi.engineLua("quit()");
      return;
    }
    ConfirmationDialog.open(
      null, "ui.career.exitPrompt",
      [
        { label: "ui.common.yes", key: 1, default: true },
        { label: "ui.common.no", key: 2, isCancel: false },
        { label: "ui.common.cancel", key: 0, isCancel: true }
      ], {lastSave: $scope.lastSave}
    ).then(res => {
      if (!res) {
        $scope.exitingCareer = false
        return;
      }
      else if (res === 2) {
        bngApi.engineLua("quit()");
      }
      else {
        bngApi.engineLua("career_saveSystem.saveCurrent()", () => {
          $scope.exitCareerTo = "quit"
        });
      }
    });
  }
  // Init
  updateVehicleDetails()

}])

.directive('bngCareerEntryCard', ['$rootScope', function ($rootScope) {
    return {
      template:
      `
      <div class="career-pause-entry-card">
        <div class="entry-image" ng-if="entry.cover" style="background-image:url({{entry.cover}})"></div>
        <div class="entry-image unknown" ng-if=!entry.cover >?</div>
        <div class="entry-description">
          <div layout="row" class="entry-description-header">
            <div class="entry-rating" ng-if="entry.rating.type === 'attempts'">
              <span class="entry-rating-attempts-value">
                {{entry.rating.attempts ? entry.rating.attempts : 0}}
              </span>
              <span>attempts</span>
            </div>

            <div class="entry-type">{{entry.cardTypeLabel | contextTranslate}}</div>
          </div>
          <div layout="row">
            <h4 class="entry-name">{{entry.name || entry.title | contextTranslate}}</h4>
          </div>
          <div ng-transclude>
          </div>
        </div>
      </div>
      `,
      replace: true,
      transclude: true,
      scope: {
        entry: '=data'
      }
    }
  }]);
