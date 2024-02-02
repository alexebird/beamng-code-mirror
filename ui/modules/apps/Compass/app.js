angular.module('beamng.apps')
.directive('compass', [function () {
  return {
    template:
        '<object style="width:100%; height:100%; box-sizing:border-box; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/Compass/compass.svg"></object>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      StreamsManager.add(['sensors'])

      element.on('load', function () {
        var svg    = angular.element(element[0].contentDocument)
          , arrow  = svg[0].getElementById('compass-needle')
          , circle = svg[0].getElementById('compass-outer')
          , bbox = arrow.getBBox()
          , rotateOriginStr = ' ' + (bbox.x + bbox.width/2) + ' ' + (bbox.y + bbox.height/2)
          , yawDegrees = 0


        scope.$on('streamsUpdate', function (event, streams) {
          if (!streams.sensors) { return }

          yawDegrees = streams.sensors.yaw * 180 / Math.PI + 180
          circle.setAttribute('transform', 'rotate(' + yawDegrees + rotateOriginStr + ')')
        })
      })

      scope.$on('$destroy', function () {
        StreamsManager.remove(['sensors'])
      })
    }
  }
}]);