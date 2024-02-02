angular.module('beamng.apps')
.directive('simplePitch', [function () {
  return {
    template:
        '<object style="width:100%; height:100%; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/SimplePitch/simple-pitch.svg"></object>',
    replace: true,
    link: function (scope, element, attrs) {
      StreamsManager.add(['sensors'])
      scope.$on('$destroy', function () {
        StreamsManager.remove(['sensors'])
      })

      element.on('load', function () {
        var svg    = element[0].contentDocument
          , circle = svg.getElementById('circle')
          , bbox   = circle.getBBox()
          , rotateOriginStr = ' ' + (bbox.x + bbox.width/2) + ' ' + (bbox.y + bbox.height/2)
          , pitchDegrees    = 0
          , pitchText = svg.getElementById('pitch-text')

        scope.$on('streamsUpdate', function (event, streams) {
          if (!streams.sensors) { return }

          pitchDegrees = Math.asin(streams.sensors.pitch) * (180 / Math.PI)
          circle.setAttribute('transform', 'rotate(' + pitchDegrees + rotateOriginStr + ')')
          pitchText.innerHTML = pitchDegrees.toFixed(1) + ' &#176;'
        })

      })
    }
  }
}]);