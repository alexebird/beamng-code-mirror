angular.module('beamng.stuff')

/**
 * @ngdoc controller
 * @name beamng.stuff:ScenarioStartController
 * @description Controller for the view that appears on scenario start
**/
.controller('ComicController', ['Utils', '$scope', '$rootScope', '$stateParams', 'gamepadNav', function (Utils, $scope, $rootScope, $stateParams, gamepadNav) {
  let prevCross = gamepadNav.crossfireEnabled()
  let prevGame = gamepadNav.gamepadNavEnabled()
  let prevSpatial = gamepadNav.gamepadNavEnabled()

  gamepadNav.enableCrossfire(true)
  gamepadNav.enableGamepadNav(false)

  $scope.$on('$destroy', () => {
    gamepadNav.enableCrossfire(prevCross)
    gamepadNav.enableGamepadNav(prevGame)
  })

  $scope.confirmTriggered = function () {
    $rootScope.$broadcast('forceSpineAnimationEnd')
  }

  if($scope.$parent.app.uitest && $stateParams.comiclist.isEmpty()) {
    console.log("Playing demo comic strip....")
    $stateParams.comiclist = {
      'backgroundSound': 'campaigns/chapter2/audio/Intro.ogg',
      'list': [
        'campaigns/chapter2/cutscenes/Intro/panel1/',
        'campaigns/chapter2/cutscenes/Intro/panel2/',
        'campaigns/chapter2/cutscenes/Intro/panel3/',
        'campaigns/chapter2/cutscenes/Intro/panel4/',
      ]
    }
  }

  if (!$stateParams.comiclist.isEmpty()) {
    Utils.waitForCefAndAngular(() => {
      $rootScope.$broadcast('startSpineAnimation', $stateParams.comiclist)
    })
  }
}])