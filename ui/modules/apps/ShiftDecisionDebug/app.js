angular.module('beamng.apps')
.directive('shiftDecisionDebug', [function () {
  return {
    template:
    '<div style="height:100%; width:100%;" class="bngApp">' +
      '{{:: "ui.apps.shift_decision_debug.ShiftupRPM" | translate}}: {{ data.shiftUpRPM.toFixed(0) }}<br>' +
      '{{:: "ui.apps.shift_decision_debug.ShiftDownRPM" | translate}}: {{ data.shiftDownRPM.toFixed(0) }}<br>' +
      '{{:: "ui.apps.shift_decision_debug.Aggression" | translate}}: {{ data.aggression.toFixed(2) }} <br>' +
      '{{:: "ui.apps.shift_decision_debug.WheelslipDown" | translate}}: {{ data.wheelSlipDown }} <br>' +
      '{{:: "ui.apps.shift_decision_debug.WheelslipUp" | translate}}: {{ data.wheelSlipUp }} <br>' +
      '{{:: "ui.apps.shift_decision_debug.LockupRatio" | translate}}: {{ data.lockupRatio }} <br>' +
    '</div>',
    replace: true,
    restrict: 'EA',
    scope: true,
    controller: ['$log', '$scope', function ($log, $scope) {
      var streamsList = ['shiftDecisionData']
      StreamsManager.add(streamsList)
      $scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      $scope.$on('streamsUpdate', function (event, data) {
        $scope.$evalAsync(function () {
          $scope.data = data.shiftDecisionData
        })
      })
    }]
  }
}]);