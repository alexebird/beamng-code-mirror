angular.module('beamng.apps')

.directive('raceCountdown', [function () {
  return {
    template:
    '<div style="height:100%; width:100%; background:transparent; text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.43); font-weight: bold; color: white;" layout="row" layout-align="center center" class="RaceCountdown">' +
      '<link type="text/css" rel="stylesheet" href="/ui/modules/apps/RaceCountdown/app.css">' +
      '<div ng-bind-html="txt"></div>' +
    '</div>',
    replace: true,
    restrict: 'EA',
    scope: true,
    controller: ['$element', '$filter', '$scope', '$timeout', '$sce', 'translateService', function ($element, $filter, $scope, $timeout, $sce, translateService) {
      let msgIndex = 0
      let paused = false
      let raceStarted = false
      let msgElement = angular.element($element[0].childNodes[1])

      let messages = []
      let stepTimeout = undefined

      $scope.$on('RaceStart', function (event) {
        raceStarted = true
      })

      $scope.$emit('requestPhysicsState')

      // The message to be displayed
      $scope.txt = ''

      function resetCountdown() {
        msgIndex = 0
        messages = []
        $scope.txt = ''
        try {
          if(stepTimeout !== undefined) {
            $timeout.cancel(stepTimeout)
          }
          stepTimeout = undefined
        } catch (e) {
          console.error(e)
        }
      }

      $scope.$on('ScenarioFlashMessageReset', function (event, data) {
        $element.css({'font-size': '2em'})
        resetCountdown()
      })

      $scope.$on('ScenarioFlashMessageClear', function (event, data) {
        appExists = false
        if(!$scope.$$phase) $scope.$digest()
        resetCountdown()
      })

      $scope.$on('ScenarioNotRunning', function () {
        resetCountdown()
      })

      function playMessagesAnimation() {
        msgElement.removeClass('fadeOut')

        if (messages.length === 0) {
          //console.error("MESSAGES DONE")
          resetCountdown()
          return
        }

        msgElement.addClass('fadeIn')
        $element.css({'font-size': '2em'})

        let msg = messages[0]
        $scope.txt = typeof(msg[0]) == 'object' ? $filter('translate')(msg[0].txt, msg[0].context) : $filter('translate')(msg[0])
        $scope.txt = $sce.trustAsHtml($scope.txt)
        if(!$scope.$$phase) $scope.$digest()

        if (msg.length > 2) {
          // if the last parameter is the boolean true use large font otherwise use small one
          if ((msg.length > 3 && msg[3]) || (typeof msg[2] === 'boolean' && msg[2])) {
            $element.css({'font-size': '8em'})
          } else {
            $element.css({'font-size': '2em'})
          }
          // if a string is passed execute it
          if (typeof msg[2] === 'string') {
            bngApi.engineLua(msg[2])
          }

          // if a function is passed execute it as well
          if (typeof msg[2] === 'function') {
            msg[2]()
          }
        }
        messages.shift()

        // we need to wait for the animations to be done, rese the system in the next round

        setTimeout(() => {
          msgElement.removeClass('fadeIn')
        }, 200)

        setTimeout(() => {
          msgElement.addClass('fadeOut')
        }, (parseFloat(msg[1]) * 1000 - 200))

        stepTimeout = $timeout(playMessagesAnimation, parseFloat(msg[1]) * 1000)
      }


      // This event a group of messages to be displayed, in the form of an array of arrays.
      // Each array element has 2 or 3 elements of its own:
      // 0: The actual message to be displayed
      // 1: Time (in seconds) to show that message
      // 2 (optional):
      //  call to the Lua engine
      //  or a js callback
      //  or if none of the above two is provided but 3 is -> 3
      // 3 (optional): If the font should be big or not (mostly used for countdown)
      $scope.$on('ScenarioFlashMessage', function (event, data) {
        //console.log(`ScenarioFlashMessage,  ${JSON.stringify(data)}`)

        // never use for in loop on an array that's invented for objects while for with a counter is designed for arrays
        // otherwise protoyiping and other stuff can break loops unexpectedly from everywhere in js, so for instance 3rd party apps otherwise
        for(let i=0; i < data.length; i += 1) {
          messages.push(data[i])
        }

        if((!paused || raceStarted) && stepTimeout === undefined) {
          //console.log("starting animation")
          playMessagesAnimation()
        }
      })

      $scope.$on('physicsStateChanged', function (event, state) {
        paused = !state
        if (paused) {
          $timeout.cancel(stepTimeout)
          stepTimeout = undefined
        } else if (state) {
          playMessagesAnimation()
        }
      })

      // just in case...
      $scope.$on('$destroy', function () {
        resetCountdown()
        appExists = false
      })
    }]
  }
}])
