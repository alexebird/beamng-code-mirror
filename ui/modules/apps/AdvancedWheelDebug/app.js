angular.module('beamng.apps')
.directive('advancedWheelsDebug', [function () {
  return {
    template:
    `<div style="height:100%; width:100%;" class="bngApp md-padding">
      <table style="width:100%">
        <thead>
          <tr style="text-align: left;">
            <th style="width: 20%; text-align: center;">Name</th>
            <th style="width: 20%">Camber</th>
            <th style="width: 20%">Toe</th>
            <th style="width: 20%">Caster</th>
            <th style="width: 20%">SAI</th>
          </tr>
        </thead>
        <tbody ng-if="data && data.length > 0">
          <tr ng-repeat="w in data | orderBy: 'name' track by $index">
            <td class="md-body-2" style="text-align: center;">{{ w.name }}</td>
            <td class="md-body-1">{{ w.camber | number: 3 }}</td>
            <td class="md-body-1">{{ w.toe | number: 3 }}</td>
            <td class="md-body-1">{{ w.caster | number: 3 }}</td>
            <td class="md-body-1">{{ w.sai | number: 3 }}</td>
          </tr>
        </tbody>
      </table>
    </div>`,
    replace: true,
    restrict: 'EA',
    scope: true,
    controller: ['$log', '$scope', function ($log, $scope) {
      var streamsList = ['advancedWheelDebugData']
      StreamsManager.add(streamsList)

      function register() {
        bngApi.activeObjectLua('extensions.advancedwheeldebug.registerDebugUser("advancedWheelDebugApp", true)')
      }

      register()

      $scope.$on('streamsUpdate', function (event, data) {
        $scope.$evalAsync(function () {
          $scope.data = data.advancedWheelDebugData || null
        })
      })

      $scope.$on('VehicleReset', register)
      $scope.$on('VehicleChange', register)

      $scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
        bngApi.activeObjectLua('extensions.advancedwheeldebug.registerDebugUser("advancedWheelDebugApp", false)')
      })

    }]
  }
}]);