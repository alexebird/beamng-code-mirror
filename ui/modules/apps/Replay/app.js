angular.module('beamng.apps')
.directive('replay', ['$filter', '$log', '$state', '$rootScope', function ($filter, $log, $state, $rootScope) {
  return {
    templateUrl: '/ui/modules/apps/Replay/app.html',
    replace: true,
    restrict: 'EA',
    scope: true,
    link: function (scope, element, attrs) {
      // upstream state:
      scope.state = 'idle'
      scope.speed = 1
      // local state
      scope.renaming = false
      scope.isSeeking = false
      var lastSeek = 0

      bngApi.engineLua('be:getFileStream():requestState()')
      var originalFilename = ''

      scope.hoverRenaming = function () {
        scope.$evalAsync(function () {
            if (!scope.renaming) return
            bngApi.engineLua('setCEFFocus(true)')
        })
      }
      scope.startRenaming = function () {
        scope.$evalAsync(function () {
            //console.log('Starting rename')
            bngApi.engineLua('setCEFFocus(true)')
            scope.renaming = true
            originalFilename = scope.loadedFile
        })
      }

      scope.listRecordings = function () {
          $state.go('menu.replay')
      }

      scope.cancelRename = function () {
        scope.$evalAsync(function () {
            scope.renaming = false
            $log.debug('Cancelled rename')
            scope.loadedFile = originalFilename
        })
      }

      scope.acceptRename = function () {
        scope.$evalAsync(function () {
            $log.debug(`Renaming ${originalFilename} to ${scope.loadedFile}`)
            scope.renaming = false
            if (scope.loadedFile == originalFilename) return
            bngApi.engineLua('be:getFileStream():stop()')
            bngApi.engineLua(`FS:renameFile("${originalFilename}", "${scope.loadedFile}")`)
            bngApi.engineLua(`FS:removeFile("${originalFilename}")`)
            scope.loadFile(scope.loadedFile)
        })
      }

      scope.toggleSpeed = function (val) { bngApi.engineLua('core_replay.toggleSpeed('+val+')'); }
      scope.togglePlay  = function ()    { bngApi.engineLua('core_replay.togglePlay()'); }
      scope.toggleRecording = function() { bngApi.engineLua('core_replay.toggleRecording(true)'); }
      scope.cancelRecording = function() { bngApi.engineLua('core_replay.cancelRecording()'); }
      scope.loadFile = function (filename){bngApi.engineLua(`core_replay.loadFile("${filename}")`); }
      scope.stop = function ()           { bngApi.engineLua('core_replay.stop()'); }

      scope.$on('replayStateChanged', function (event, val) {
        scope.$evalAsync(function () {
          //TODO stop copying each shit standalone, copy it all??
          if (!scope.renaming) // don't re-set filename if user is modifying it
            scope.loadedFile = val.loadedFile
          scope.positionSeconds = val.positionSeconds; // interpolated frame times
          //scope.positionSeconds = val.framePositionSeconds; // disk frame times
          scope.totalSeconds = val.totalSeconds
          scope.speed = val.speed
          scope.paused = val.paused
          scope.fpsRec = val.fpsRec
          scope.fpsPlay = val.fpsPlay
          scope.state = val.state
          scope.isSeeking = val.jumpOffset != 0

          var msSinceSeek = Date.now() - lastSeek; // do not update if user is moving the seeking bar around (seeking manually)
          if (msSinceSeek > 500) {
            scope.positionPercent = (scope.totalSeconds==0)? 0 : scope.positionSeconds / scope.totalSeconds
          } else {
            scope.isSeeking = true
          }
        })
      })

      scope.seek = function (val) {
        if (scope.state !== 'playing') return
        lastSeek = Date.now()
        // pause replay while seeking, to prevent high I/O from replay on disk if user drags the timeline slider
        bngApi.engineLua("core_replay.pause(true)")
        bngApi.engineLua(`core_replay.seek(${bngApi.serializeToLua(val)})`)
      }
    }
  }
}])
