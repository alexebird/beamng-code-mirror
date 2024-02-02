angular.module('beamng.apps')
.directive('escStiffness', [function () {
  return {
    template:
    '<div style="max-height:100%; width:100%; background:transparent;" layout="row" layout-align="center center" layout-wrap>' +
      `<md-button flex style="margin: 2px; min-width: 198px" md-no-ink class="md-raised" ng-click="startTest()">{{:: 'ui.apps.escstiffness.start' | translate}}</md-button>` +
      `<md-button flex style="margin: 2px; min-width: 122px" md-no-ink class="md-raised" ng-click="stopTest()">{{:: 'ui.apps.escstiffness.stop' | translate}}</md-button>` +
    '<div style="height:100%; width:100%; background-color: rgba(255,255,255,0.9)">' +
        `{{:: 'ui.apps.escstiffness.state' | translate}}: {{ data.state }}<br>` +
        `{{:: 'ui.apps.escstiffness.progress' | translate}}: {{ data.progress.toFixed(2) }}%<br>` +
        `{{:: 'ui.apps.escstiffness.targetAngle' | translate}}: {{ data.currentAngle }}<br>` +
        `{{:: 'ui.apps.escstiffness.targetSpeed' | translate}}: {{ data.currentSpeed.toFixed() }}<br>` +
        `{{:: 'ui.apps.escstiffness.maxStiffnessFront' | translate}}: {{ data.stiffnessFront.toFixed() }}<br>` +
        `{{:: 'ui.apps.escstiffness.maxStiffnessRear' | translate}}: {{ data.stiffnessRear.toFixed() }}<br>` +
      '</div>'+
    '</div>',
    replace: true,
    restrict: 'EA',
    scope: true,
    controller: ['$log', '$scope', function ($log, $scope) {

        $scope.startTest = function () {
            bngApi.activeObjectLua('extensions.escCalibration.startSkewStiffnessTest()')
        }

        $scope.stopTest = function () {
            bngApi.activeObjectLua('extensions.escCalibration.stopSkewStiffnessTest()')
        }

    $scope.$on('ESCSkewStiffnessChange', function (event, data) {
      $scope.$evalAsync(function () {
        $scope.data = data
      })
        })

    //$scope.$on('VehicleChange', function () {
        //    bngApi.activeObjectLua('extensions.load("escCalibration");')
        //  })

    $scope.data = {state : "", progress : 0, currentAngle : 0, currentSpeed : 0, stiffnessFront : 0, stiffnessRear : 0}
    //bngApi.activeObjectLua('extensions.load("escCalibration");')
    }]
  }
}]);