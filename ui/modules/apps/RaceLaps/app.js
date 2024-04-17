angular.module('beamng.apps')

/**
 * @ngdoc directive
 * @name beamng.apps:raceLaps
 * @description
**/
.directive('raceLaps', function () {
  return {
    template:
      '<div ng-class="{\'bngApp\' : data}" style="width: 100%; height: 100%; font-size: 1.4em;" ' +
                  'layout="column" layout-align="center center">' +
        '<span ng-if="data">{{ data.label | translate }} {{ data.current }} / {{ data.count }}</span>' +
      '</div>',
    replace: true,
    link: function (scope, element, attrs) {
      scope.data = null
      scope.$on('RaceLapChange', function (event, data) {
        if(data === null) return
        scope.$applyAsync(function () {
          if (!data.label) data.label = "missions.missions.general.lap"
          scope.data = data
        })
      })

      scope.$on('RaceLapClear', function () {
        scope.data = null
      })

      scope.$on('ScenarioNotRunning', function () {
        scope.data = null
      })
    }
  }
});