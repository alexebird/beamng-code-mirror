angular.module('beamng.apps')
.directive('pneumaticsDebug', [function () {
  return {
    template:
    '<div style="height:100%; width:100%;" class="bngApp">' +
      '{{:: "ui.apps.pneumatics_debug.TankPressure" | translate}}: {{ tankPressure || "--------" }}<br>' +
      '{{:: "ui.apps.pneumatics_debug.CompressorState" | translate}}: {{ compressorState | translate }}<br>' +
    '</div>',
    replace: true,
    restrict: 'EA',
    scope: true,
    controller: ['$log', '$scope', function ($log, $scope) {
      $scope.tankPressure = null;

      var streamsList = ['pneumaticsData']
      StreamsManager.add(streamsList)
      $scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      $scope.$on('streamsUpdate', function (event, data) {
        $scope.$evalAsync(function () {
          $scope.data = data.pneumaticsData || {}
          $scope.compressorState = $scope.data.compressorState ? ("ui.apps.pneumatics_debug.Compressor" + $scope.data.compressorState) : "";
          $scope.tankPressure = UiUnits.buildString("pressure", $scope.data.tankPressure || 0, 1);
        })
      })
    }]
  }
}]);