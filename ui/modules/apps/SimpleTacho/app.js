
angular.module('beamng.apps')
.directive('simpleTacho', [function () {
  return {
    template:
        '<object style="width:100%; height:100%; box-sizing:border-box; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/SimpleTacho/simple-tacho.svg"></object>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
        var streamsList = ['engineInfo']
        StreamsManager.add(streamsList)

        scope.$on('$destroy', function () {
            StreamsManager.remove(streamsList)
        })

        element.on('load', function () {
            let svg = element[0].contentDocument
            let values = []

            scope.$on('streamsUpdate', function (event, streams) {
                if (!streams.engineInfo) { return }

                if (streams.engineInfo[1] !== values[1] || streams.engineInfo[0] !== values[0]) {
                    values[0] = streams.engineInfo[0] //rpm idle
                    values[1] = streams.engineInfo[1] //rpm max
                    svg.getElementById('text0').innerHTML = values[0]
                    svg.getElementById('text1').innerHTML = values[1]
                }
                let rpm = Math.round(Number(streams.engineInfo[4]))
                let rgb = ''

                if(rpm < values[0] * 1.25) { //we are at idle, blue
                    rgb = '(0,0,255)'
                } else if(rpm > values[1] * 0.9) { //we are near redline, red
                    rgb = '(255,0,0)'
                } else { //normal rpm, green
                    rgb = '(0,255,0)'
                }

                svg.getElementById('rpm').innerHTML = rpm
                let rpm_round = Math.abs(Math.round((rpm-values[0])/values[1] * 637))
                if(isNaN(rpm_round)) rpm_round = 0
                svg.getElementById('filler').setAttribute("width", rpm_round)
                svg.getElementById('filler').style.fill = 'rgb' + rgb
            })
        })


    }
  }
}])
