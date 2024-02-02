angular.module('beamng.stuff')


.controller('startScreenController', ['$scope', '$state', '$timeout', function($scope, $state, $timeout) {

  // see comment in main.js about the process
  if($state.current.name === 'menu.start') {
    // 1) after the start screen is loaded, start loading the main menu
    setTimeout(() => { $state.go('menu.start_loadmainmenu') }, 300)
  } else if($state.current.name === 'menu.start_loadmainmenu') {
    // 2) after the main menu is loaded, switch to it
    setTimeout(() => { $state.go('menu.mainmenu') }, 2700)
  }

}]);