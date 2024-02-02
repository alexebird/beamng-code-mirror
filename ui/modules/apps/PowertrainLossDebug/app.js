angular.module('beamng.apps')
.directive('powertrainLossDebug', [function () {
  return {
    template:
    '<div style="height:100%; width:100%;" class="bngApp">' +
      `Engine Power: {{ engineP }} <br>` +
      `Wheel Power: {{ wheelP }} <br>` +
      `Power Ratio: {{ powerRatio }}` +
    '</div>',
    replace: true,
    restrict: 'EA',
    scope: true,
    controller: ['$log', '$scope', function ($log, $scope) {
      var streamsList = ['engineInfo']
      StreamsManager.add(streamsList)
      $scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      $scope.gearText = ''

      $scope.$on('streamsUpdate', function (event, data) {
        $scope.$evalAsync(function () {
          if (data.engineInfo != null) {
            $scope.data = data

            $scope.engineP = UiUnits.buildString('power', data.engineInfo[21], 0)
            $scope.wheelP = UiUnits.buildString('power', data.engineInfo[20], 0)
            $scope.powerRatio = (data.engineInfo[20] / data.engineInfo[21]).toFixed(3)



          }
          else {
            return
          }
        })
      })
    }]
  }
}]);