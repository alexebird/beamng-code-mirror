angular.module('beamng.apps')
.directive('busLine', ['$q', '$interval', '$sce', function ($q, $interval, $sce) {
  return {
    templateUrl: '/ui/modules/apps/busLine/app.html',
    replace: true,
    link: function ($scope, element, attrs) {
      $scope.route = {
        direction: '',
        routeId: ''
      }

      $scope.updateDisplay = function() {
        bngApi.activeObjectLua(`controller.onGameplayEvent("onRouteChange", ${bngApi.serializeToLua($scope.route)})`)
      }

      // bus display
      $scope.routeId =  $sce.trustAsHtml("00")
      $scope.direction = $sce.trustAsHtml("Not in Service")

      $scope.nextStop = "Not in Service"
      // $scope.stopsList = []

      $interval(() => {
        var date = new Date(),
            hours = date.getHours(),
            minutes = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes(), // prepending 0 if current minute is less than 10
            seconds = date.getSeconds()

        $scope.time = `${hours}:${minutes}`

      }, 1000)

      $scope.$on('BusDisplayUpdate', function (evt, data) {
        updateBusDisplay(data)
      })

      $scope.stopRequested = false

      $scope.$on('SetStopRequest', function (evt, data) {
        $scope.$evalAsync(function() {
          if(data && data.stopRequested != null) {
            $scope.stopRequested = data.stopRequested
          }
        })
      })
      
      function updateBusDisplay(data) {
         $scope.$evalAsync(function() {
          if (data.routeId)
            $scope.routeId = $sce.trustAsHtml(parseTxt(data.routeId.substring(0, 3)))

          if (data.direction)
            $scope.direction = $sce.trustAsHtml(parseTxt(data.direction.substring(0, 20)))

          if (data.routeColor)
            $scope.routeColor = data.routeColor

          if (data.tasklist && data.tasklist.length > 0) {
            // just getting name of stop since lua is sending an object
            $scope.stopsList = data.tasklist.map((stopName) => stopName[1])
            // we only want to show next 3
            $scope.stopsList = $scope.stopsList.length > 4 ? $scope.stopsList.slice(0, 5) : $scope.stopsList
          }
          // if data.tasklist doesnt exist we presume that the stop list just needs to be updated.
          else
            $scope.stopsList = data.length > 4 ? data.slice(0, 5) : data

          if ($scope.stopsList.length > 0) {
            // reversing order of stops so next stop shows up correctly
            $scope.stopsList.reverse()
            $scope.nextStop = $scope.stopsList.splice($scope.stopsList.length-1, 1)[0]
          }
          else {
            $scope.nextStop = "End of Line"
          }
        })
      }

      // TODO: Icon parsing
      function parseTxt(txt){
        var ptxt = txt.toString()
        ptxt = ptxt.replace(/(\[BNG\])/gi, `<svg style="width: 20px" viewBox="0 0 10 10"><use fill="white" width="100%" xlink:href="#general_beamng_logo_bw"></use></svg>`)
        ptxt = ptxt.replace(/(\[BUS\])/gi, `<svg style="width: 20px" viewBox="0 0 10 10"><use fill="white" width="100%" xlink:href="#material_directions_bus"></use></svg>`)
        ptxt = ptxt.replace(/(\[AIR\])/gi, `<svg style="width: 20px" viewBox="0 0 10 10"><use fill="white" width="100%" xlink:href="#material_local_airport"></use></svg>`)
        ptxt = ptxt.replace(/(\[ROTR\])/gi, `<svg style="width: 20px" viewBox="0 0 10 10"><use fill="white" width="100%" xlink:href="#material_rotate_right"></use></svg>`)
        ptxt = ptxt.replace(/(\[ROTL\])/gi, `<svg style="width: 20px" viewBox="0 0 10 10"><use fill="white" width="100%" xlink:href="#material_rotate_left"></use></svg>`)

        return ptxt
      }

      bngApi.engineLua('if scenario_busdriver then scenario_busdriver.requestState() end')
    }
  }
}])
