angular.module('beamng.apps')

.directive('traffic', [function () {
  return {
    templateUrl: '/ui/modules/apps/traffic/app.html',
    replace: false,
    restrict: 'E',
    scope: false,
    controller: function ($scope, $element, $attrs) {
      $scope.unit = 'km/h'
      $scope.conversions = [2.2369, 3.6]
      $scope.metric = true
      $scope.legalSpeed = true
      $scope.amount = 1
      $scope.speedLimit = 70
      $scope.spawnValue = 1
      $scope.aggression = 0.3

      $scope.aiModeOptions = ['Traffic', 'Random', 'Flee', 'Chase', 'Follow', 'Stop']
      $scope.debugOptions = ['Off', 'Traffic', 'Target', 'Speeds', 'Trajectory', 'Route']
      $scope.awareOptions = ['Auto', 'Off', 'On']
      this.aiModeOptions = $scope.aiModeOptions[0]
      this.debugOptions = $scope.debugOptions[0]
      this.awareOptions = $scope.awareOptions[0]

      this.amount = $scope.amount

      this.setAiMode = function () {
        bngApi.engineLua(`extensions.gameplay_traffic.setTrafficVars( ${bngApi.serializeToLua({aiMode: this.aiModeOptions})} )`)
        bngApi.engineLua(`extensions.hook("trackAIAllVeh", ${bngApi.serializeToLua(this.aiModeOptions)} )`)
      }

      this.setDebugMode = function () {
        bngApi.engineLua(`extensions.gameplay_traffic.setTrafficVars( ${bngApi.serializeToLua({aiDebug: this.debugOptions})} )`)
      }

      this.setAwareMode = function () {
        bngApi.engineLua(`extensions.gameplay_traffic.setTrafficVars( ${bngApi.serializeToLua({aiAware: this.awareOptions})} )`)
      }

      this.setSpeedLimit = function () {
        var value = !$scope.legalSpeed ? this.speedLimit / $scope.conversions[Number($scope.metric)] : -1
        bngApi.engineLua(`extensions.gameplay_traffic.setTrafficVars( ${bngApi.serializeToLua({speedLimit: value})} )`)
      }

      this.toggleUnits = function () {
        $scope.metric = !$scope.metric
        $scope.unit = $scope.metric ? 'km/h' : 'mph'
        this.setSpeedLimit()
      }

      this.setSpawnValue = function () {
        bngApi.engineLua(`extensions.gameplay_traffic.setTrafficVars( ${bngApi.serializeToLua({spawnValue: this.spawnValue})} )`)
      }

      this.setAggression = function () {
        bngApi.engineLua(`extensions.gameplay_traffic.setTrafficVars( ${bngApi.serializeToLua({baseAggression: this.aggression})} )`)
      }

      this.spawn = function () {
        bngApi.engineLua(`extensions.core_multiSpawn.spawnGroup(extensions.gameplay_traffic.createTrafficGroup(20), ${bngApi.serializeToLua(this.amount)})`)
      }

      this.delete = function () {
        bngApi.engineLua(`extensions.core_multiSpawn.deleteVehicles( ${bngApi.serializeToLua(this.amount)} )`)
        bngApi.engineLua(`extensions.hook("stopTracking", {Name = "TrafficEnabled"})`)
      }

      this.activate = function () {
        bngApi.engineLua(`extensions.gameplay_traffic.activate()`)
        bngApi.engineLua(`extensions.gameplay_traffic.setTrafficVars({enableRandomEvents = true})`)
        if (bngApi.engineLua(`gameplay_traffic.getNumOfTraffic()`) > 0) {
          bngApi.engineLua(`extensions.hook("startTracking", {Name = "TrafficEnabled"})`)
        }
      }

      this.deactivate = function () {
        bngApi.engineLua(`extensions.gameplay_traffic.deactivate(true)`)
        bngApi.engineLua(`extensions.hook("stopTracking", {Name = "TrafficEnabled"})`)
      }

      this.refresh = function () {
        bngApi.engineLua(`core_vehicle_manager.reloadAllVehicles()`)
        bngApi.engineLua(`be:queueAllObjectLua("recovery.loadHome()")`)
      }
    },
    controllerAs: 'ctrl'
  }
}])