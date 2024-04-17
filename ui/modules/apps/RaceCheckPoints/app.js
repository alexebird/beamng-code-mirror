angular.module('beamng.apps')

/**
 * @ngdoc directive
 * @name beamng.apps:raceCheckpoints
 * @description
**/
.directive('raceCheckpoints', function () {
  return {
    template:
      '<div ng-class="{\'bngApp\': data}" style="width: 100%; height: 100%; font-size: 1.4em;" ' +
                  'layout="column" layout-align="center center">' +
        '<span ng-if="data">{{ data.label | translate }} {{ data.current }} / {{ data.count }}</span>' +
      '</div>',
    replace: true,
    link: function (scope, element, attrs) {
      scope.data = null
      scope.$on('WayPointChange', function (event, data) {
        if(data === null) return
        scope.$applyAsync(function () {
          if (!data.label) data.label = "missions.missions.general.checkpoint"
          scope.data = data
        })
      })

      scope.$on('WayPointReset', function () {
        scope.data = null
      })

      scope.$on('ScenarioNotRunning', function () {
        scope.data = null
      })
    }
  }
});