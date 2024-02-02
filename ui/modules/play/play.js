"use strict"

angular.module("beamng.stuff")

.controller("PlayController", ["$scope", "UiAppsService", "$state", function ($scope, UiAppsService, $state) {
  // FIXME: this should be handled by states probably
  $scope.$watch("$parent.app.gameState", gameState => {
    if (gameState === "garage") {
      // bngApi.engineLua("career_career.isActive()", data => {
      //   $state.go(data ? "garage" : "garagemode");
      // });
      $state.go("garagemode");
    } else if (["freeroam", "mission", "scenario"].includes(gameState)) {
      bngApi.engineLua('extensions.hook("onUIPlayStateChanged", true)')
      setTimeout(function () {
        bngApi.engineLua('core_camera.notifyUI()')
      }, 150);
    }
  });

  $scope.$on('$destroy', function() {
    bngApi.engineLua('extensions.hook("onUIPlayStateChanged", false)')
  })
}])
