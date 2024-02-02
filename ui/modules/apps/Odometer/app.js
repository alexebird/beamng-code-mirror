angular.module("beamng.apps").directive("odometer", [
  function () {
    return {
      template:
        '<div class="bngApp" style="width: 100%; height: 100%; font-size: 1.4em;" ' +
        'layout="column" layout-align="center center">' +
        '<span style="font-size: 90%">{{:: "ui.apps.odometer.TargetDistance" | translate}}: {{ (odometerTargetDistance) || "-------" }}</span>' +
        '<span style="font-size: 90%">{{:: "ui.apps.odometer.CurrentDistance" | translate}}: {{ (odometerDistance) || "-------" }}</span>' +
        "</div>",
      replace: true,
      link: function (scope, element, attrs) {
        "use strict"
        var streamsList = ["electrics"]
        StreamsManager.add(streamsList)
        scope.$on("$destroy", function () {
          StreamsManager.remove(streamsList)
        })
        scope.odometerDistance = null

        function resetValues() {
          scope.$evalAsync(function () {
            scope.odometerDistance = null
            scope.odometerTargetDistance = null
          })
        }
        // scope.$on("streamsUpdate", function (event, streams) {
        //   scope.$evalAsync(function () {
        //     scope.odometerDistance = UiUnits.buildString("length", streams.electrics.odometer, 2)
        //     // scope.odometerTargetDistance = UiUnits.buildString("length", streams.electrics.trip, 2)
        //   })
        // })
        scope.$on("odometerDistance", function (event, data) {
          scope.$evalAsync(function () {
            scope.odometerDistance = UiUnits.buildString("length", data.distance, data.decimalPlaces)
            scope.odometerTargetDistance = UiUnits.buildString("length", data.targetDistance, data.decimalPlaces)
          })
        })
        scope.$on("ScenarioResetTimer", resetValues)
        scope.$on("RaceLapChange", function (event, data) {})
      },
    }
  },
])
