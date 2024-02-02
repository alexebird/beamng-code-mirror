angular.module('beamng.stuff')

.controller('fadeScreen', ['$scope', '$state', '$stateParams', 'translateService', function ($scope, $state, $stateParams, translateService) {
  var vm = this
  var data = $stateParams
  const delay = 50 // small delay between states
  const timeouts = ['fadeInTimeout', 'fadeOutTimeout', 'pauseTimeout', 'contentTimeout']

  vm.duration = 0

  //TODO: custom background color or image?
  $scope.screen = {'background-color': data.fadeIn > 0 ? 'transparent' : 'black', 'transition': 'background-color ' + data.fadeIn + 's linear'}
  $scope.content = {'opacity': 0}
  $scope.imagePanel = {'background-image': 'none'}
  $scope.textPanel = {'width': '100%'}
  $scope.contentActive = false

  var clearState = function () {
    timeouts.forEach(function (key){
      if (vm[key]) {
        clearTimeout(vm[key])
      }
    })
  }

  var startFade = function () {
    $scope.screen['background-color'] = 'black'
    vm.duration = data.fadeIn * 1000
    if (Object.keys(data.data).length > 0) { // if there is data
      $scope.image = data.data.image
      $scope.title = data.data.title
      $scope.subtitle = data.data.subtitle
      $scope.text = translateService.contextTranslate(data.data.text)
      $scope.tips = translateService.contextTranslate(data.data.tips)
      $scope.contentActive = true

      if (!$scope.title && !$scope.text) {
        $scope.imagePanel['height'] = '100%' // expands the image on the screen if there is no title and text
        $scope.imagePanel['box-shadow'] = 'none'
        $scope.content['width'] = '100%'
        $scope.content['height'] = '100%'
      }

      if ($scope.image) {
        $scope.imagePanel['background-image'] = 'url("' + $scope.image + '")'
      } else {
        $scope.textPanel['width'] = '50%' // centers the right panel on the screen if there is no image
      }

      vm.contentTimeout = setTimeout(function () {
        $scope.content['opacity'] = 1
      }, Math.max(delay, vm.duration - 200)) // starts transition 200 ms before the end of the startFade transition
    }

    vm.fadeInTimeout = setTimeout(function () {
      pauseFade()
      bngApi.engineLua('extensions.hook("onScreenFadeStateDelayed", 1)')
    }, vm.duration + delay)
  }

  var pauseFade = function () {
    vm.duration = data.pause * 1000

    vm.pauseTimeout = setTimeout(function () {
      stopFade()
      bngApi.engineLua('extensions.hook("onScreenFadeStateDelayed", 2)')
    }, vm.duration + delay)
  }

  var stopFade = function () {
    $scope.screen['transition'] = 'background-color ' + data.fadeOut + 's linear'
    $scope.screen['background-color'] = 'transparent'
    vm.duration = data.fadeOut * 1000

    if ($scope.contentActive) {
      $scope.content['opacity'] = 0
      $scope.contentActive = false
    }

    vm.fadeOutTimeout = setTimeout(function () {
      bngApi.engineLua('extensions.hook("onScreenFadeStateDelayed", 3)')
      $state.go('play')
    }, vm.duration + delay)
  }

  setTimeout(function () { // helps style transition to work properly if fade time is zero
    startFade()
  }, delay)

  $scope.$on('$destroy', function () {
    clearState()
  })
}])