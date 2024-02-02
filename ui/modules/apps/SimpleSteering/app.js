angular.module('beamng.apps')
.directive('simpleSteering', [function () {
  return {
    template:
      '<object style="width:100%; height:100%; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/SimpleSteering/simple-steering.svg"></object>',
    replace: true,
    link: function (scope, element, attrs) {
      var streamsList = ['sensors', 'electrics']
      StreamsManager.add(streamsList)
      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList)
      })

      element.on('load', function () {
        var svg    = element[0].contentDocument
          , wheel  = svg.getElementById('wheel')
          , helper = svg.getElementById('bounding-rect')
          , bbox   = wheel.getBBox()
          , rotateOriginStr = ' ' + (bbox.x + bbox.width/2) + ' ' + (bbox.y + bbox.height/2)
          , barSteering = svg.getElementById('barSteering')
          , barSteeringUnassisted = svg.getElementById('barSteeringUnassisted')
          , barFFB = svg.getElementById('barFFB')
          , barFFBclip = svg.getElementById('barFFBclip')
          , textFFB = svg.getElementById('textFFB')
          , hFactor = svg.getElementById('bar-outer').getAttribute('width') / 2
          , label1 = svg.getElementById('label1')
          , label2 = svg.getElementById('label2')
          , label3 = svg.getElementById('label3')
          , label4 = svg.getElementById('label4')
        let center = +barSteering.getAttribute('x')

        scope.$on('streamsUpdate', function (event, streams) {
          if (!streams.electrics) return
          wheel.setAttribute('transform', 'rotate(' + (-streams.electrics.steering) + rotateOriginStr + ')')
          let steering = streams.electrics.steering_input
          let steeringX = steering * hFactor // negative on left steering, positive on right steering
          barSteering.setAttribute('x', center + Math.min(0, steeringX))
          barSteering.setAttribute('width', Math.abs(steeringX))

          steeringX = (steering-streams.electrics.steeringUnassisted) * hFactor

          barSteeringUnassisted.setAttribute('x', center + Math.min(0, steeringX))
          barSteeringUnassisted.setAttribute('width', Math.abs(steeringX))

          let ffbN = streams.sensors.ffbAtDriver / (streams.sensors.maxffb + 1e-10)
          let ffbX = hFactor * ffbN
          let clip = Math.max(0, Math.min(1, (Math.abs(ffbN)-0.9)/0.1))
          barFFB.setAttribute('x', center + Math.min(0, ffbX))
          barFFB.setAttribute('width', Math.abs(ffbX))
          barFFBclip.style.fillOpacity = clip
          textFFB.style.fillOpacity = clip
        })

        scope.$on('SettingsChanged', function (event, data) {
          scope.$evalAsync(function () {
            const v = data.values
            label1.textContent = v.steeringStabilizationEnabled? "." : ""
            label2.textContent = v.steeringUndersteerReductionEnabled? "." : ""
            label3.textContent = v.steeringLimitEnabled? "." : ""
            label4.textContent = v.steeringSlowdownEnabled? "." : ""
          })
        })
        bngApi.engineLua('settings.notifyUI()')

      })
    }
  }
}]);
