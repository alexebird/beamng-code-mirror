angular.module('beamng.apps')
.directive('cameraDistance', [function () {
  return {
    template:
      '<div class="bngApp" style="width: 100%; height: 100%; font-size: 1.4em;" layout="column" layout-align="center center">' +
        '<span>{{ cameraDistance }}</span>' +
      '</div>',
    replace: true,
    link: function (scope, element, attrs) {
      'use strict'

      scope.cameraDistance = null

      scope.$on('cameraDistance', function (event, distance, errMsg) {
        scope.$evalAsync(function () {
          if(distance < 0) {
            scope.cameraDistance = errMsg
          } else {
            scope.cameraDistance = UiUnits.buildString('length', distance, 2)
          }
        })
      })

      bngApi.engineLua('extensions.load("ui_cameraDistanceApp")')
      scope.$on('$destroy', function () {
        bngApi.engineLua('extensions.unload("ui_cameraDistanceApp")')
      })

    }
  }
}]);