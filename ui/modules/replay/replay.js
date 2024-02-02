angular.module('beamng.stuff')
.controller('ReplayController', ['$filter', '$scope', function ($filter, $scope) {
  var vm = this

  vm.stopPropagation = function(event) {
    event.stopPropagation()
  }

  vm.list = {}
  function getReplayList () {
    bngApi.engineLua('core_replay.getRecordings()', (data) => {
      $scope.$apply(() => {
        vm.list = data
      })
    })
  }

  vm.remove = function ($event, filename) {
    bngApi.engineLua(`FS:removeFile("${filename}")`)
    getReplayList()
  }

  vm.play = function ($event, filename) {
    bngApi.engineLua(`core_replay.loadFile("${filename}")`)
    $event.stopPropagation()
  }
  vm.stop = function ($event, filename) {
    bngApi.engineLua('core_replay.stop()')
    $event.stopPropagation()
  }

  vm.openReplayFolderInExplorer = function(){
    bngApi.engineLua('core_replay.openReplayFolderInExplorer()')
  }

  $scope.$on('replayStateChanged', function (event, val) {
    $scope.$evalAsync(function () {
      vm.loadedFile = val.loadedFile
      //vm.positionSeconds = val.positionSeconds; // with interpolation
      vm.positionSeconds = val.framePositionSeconds; // without interpolation
      vm.totalSeconds = val.totalSeconds
      vm.speed = val.speed
      vm.paused = val.paused
      vm.fpsRec = val.fpsRec
      vm.fpsPlay = val.fpsPlay
      vm.state = val.state
      vm.positionPercent = (vm.totalSeconds==0)? 0 : vm.positionSeconds / vm.totalSeconds
    })
  })

  $scope.$on('$destroy', () => {
    //vm.deselectPart(false)
  })

  getReplayList()
  bngApi.engineLua('be:getFileStream():requestState()')
}])

