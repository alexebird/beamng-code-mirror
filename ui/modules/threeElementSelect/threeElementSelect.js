'use strict'

angular.module('beamng.stuff')

.controller('ThreeElementSelectController', ['$rootScope', '$scope', 'toastr', '$state', 'Settings', '$http', '$filter', 'Utils', 'gamepadNav', '$stateParams', 'ConfirmationDialog', 'translateService', 'MessageToasterService', function($rootScope, $scope, toastr, $state, Settings, $http, $filter, Utils, gamepadNav, $stateParams, ConfirmationDialog, translateService, messageToasterService) {

  $scope.data = $stateParams.data
  $scope.$on('$destroy', function() {
    bngApi.engineLua("career_career.requestPause(false)");
  })

  $scope.click = function(cmd) {
    bngApi.engineLua(cmd)
    $scope.$parent.app.stickyPlayState = null
    $state.go('play');
  }

}])
