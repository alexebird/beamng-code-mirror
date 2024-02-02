(function () {
'use strict'

angular.module('beamng.stuff')

.controller('OnlineFeaturesController', ['$scope', '$state', '$timeout', '$document', function($scope, $state, $timeout, $document) {
  'use strict'

  // The lua setting need to be functional before we redirect, otherwise we'll land here again.
  // for that reason, we listen for the settings changed event that will ensure that the main menu will not get back here again

  var selectedAnswer = false
  $scope.online = null
  $scope.telemetry = null

  $scope.storeAnswer = function () {
    if ($scope.online == null) {
      return
    }

    if ($scope.online != 'enable') {
      $scope.telemetry = 'disable'
    }


    var newState = {
      onlineFeatures: $scope.online,
      telemetry : $scope.telemetry
    }

    bngApi.engineLua(`settings.setState(${bngApi.serializeToLua(newState)})`)

    selectedAnswer = true
  }

  $scope.onlineChanged = function() {
    if ($scope.online == 'disable') {
      $scope.telemetry = null
    }
  }

  $scope.$on('SettingsChanged', (ev, data) => {
    if(selectedAnswer) {
      $state.go('menu.mainmenu')
      if ($scope.telemetry == 'enable') {
        bngApi.engineLua('extensions.telemetry_gameTelemetry.startTelemetry()')
      } else {
        bngApi.engineLua('extensions.unload("telemetry_gameTelemetry")')
      }
    }
  })

}])

})();