angular.module('beamng.apps')
.directive('raceRealtimeDisplay', [function () {
  return {
    template: '<div style="height:100%; width:100%; background:transparent; text-shadow: 2px 2px 4px orange; font-weight: bold; font-size: 3em; color: white;" layout="row" layout-align="center center" bng-translate="{{translate | json}}"></div>',
    replace: true,
    restrict: 'EA',
    scope: true,
    controller: ['$element', '$scope', '$timeout', function ($element, $scope, $timeout) {

      var clearMessage = function () {
        $scope.translate = {fallback: '', txt: ''}
      }
      $scope.$on('ScenarioNotRunning', function () {
        clearMessage()
      })

      $scope.$on('ScenarioRealtimeDisplay', function (event, data) {
        // because lua sometimes is not able to send strings...
        $scope.$evalAsync(function() {
          if (data.big === undefined || data.big == true) {
            $element.css({'font-size': '3em'})
          } else {
            $element.css({'font-size': '1.75em'})
          }
          if (!data.msg || data.msg.length == 0) {
            clearMessage()
          } else {
            $scope.translate = {fallback: `${data.msg || ''}`, txt: `${data.msg}`, context: data.context}
          }
        })
      })
    }]
  }
}])
