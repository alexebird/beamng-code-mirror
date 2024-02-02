
angular.module('beamng.apps')
.directive('simpleSpeedo', [function () {
  return {
    template:
        '<object style="width:100%; height:100%; box-sizing:border-box; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/SimpleSpeedo/simple-speedo.svg"></object>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
        'use strict'
        var streams = ['electrics']
        StreamsManager.add(streams)
        scope.$on('$destroy', function () {
            StreamsManager.remove(streams)
        })


        function updateLabels(svg, maxNode, max) {
            var ar = [0,1,2,3,4,5,6,7]
            var interval = (max / 8)
            for (var i = 0; i < ar.length; i++) {
                svg.getElementById('text' + i).innerHTML = Math.round(i * interval)
            }
            maxNode.innerHTML = Math.round(max)
        }



      element.on('load', function () {

        var svg = element[0].contentDocument

        scope.$on('SettingsChanged', function (event, data) {
            svg.getElementById('speed').innerHTML = 'Speed (' + UiUnits.speed().unit + ")"
        })

        bngApi.engineLua('settings.notifyUI()')

        scope.$on('streamsUpdate', function (event, streams) {
            if (!streams.electrics) { return }

            var speedMs = streams.electrics.wheelspeed
            if (isNaN(speedMs)) speedMs = streams.electrics.airspeed
            var speedConverted = UiUnits.speed(speedMs)
            if(speedConverted === null) return
            var speedUnits = Math.round(speedConverted.val)

            var maxNode = svg.getElementById('text8')
            var max = Number(maxNode.innerHTML)
            var changeFlag = false

            if (speedUnits > max * 0.9) {
                max = (Math.ceil(speedUnits / max)+1) * max
                updateLabels(svg, maxNode, max)
            } else if (speedUnits < max * 0.3  && speedUnits > 0 && max > 160) {
                var help = (Math.ceil(speedUnits / max)-1) * max
                max = (help === 0 ? 160: help)
                updateLabels(svg, maxNode, max)
            }

            svg.getElementById('drivenspeed').innerHTML = speedUnits
            svg.getElementById('filler').setAttribute("width", Math.round(speedUnits/max * 637))
        })
      })


    }
  }
}])
