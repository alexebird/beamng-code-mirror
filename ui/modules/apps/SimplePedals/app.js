angular.module('beamng.apps')
.directive('simplePedals', [function () {
  return {
    template:
        '<object class="bngApp" style="width:100%; height:100%; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/SimplePedals/simple-pedals.svg"></object>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      StreamsManager.add(['electrics'])

      scope.$on('$destroy', function () {
        StreamsManager.remove(['electrics'])
      })

      // used to debug controller deadzones: any input that is not exactly 0 or exactly <max> will get rounded to a different number than those
      // e.g. if we use a max of 100 (to display percentages)
      // 0 rounds to 0%
      // 0.01 rounds to 1%
      // 0.99 rounds to 1%
      // ...
      // 99.01 rounds to 99%
      // 99.99 rounds to 99%
      // 100 rounds to 100%
      let smartRound = function(max, v) {
        return v>=max? max : Math.floor(v+(1-1e-7-v/max))
      }
      element.on('load', function () {
        var svg    = element[0].contentDocument
          , clutch   = { bar: svg.getElementById('filler0'), txt: svg.getElementById('txt0'), val: svg.getElementById('val0'), container:svg.getElementById('container0'), factor: svg.getElementById('container0').getAttribute('height') / 100.0 }
          , brake    = { bar: svg.getElementById('filler1'), txt: svg.getElementById('txt1'), val: svg.getElementById('val1'), container:svg.getElementById('container1'), factor: svg.getElementById('container1').getAttribute('height') / 100.0 }
          , throttle = { bar: svg.getElementById('filler2'), txt: svg.getElementById('txt2'), val: svg.getElementById('val2'), container:svg.getElementById('container2'), factor: svg.getElementById('container2').getAttribute('height') / 100.0 }
          , parking  = { bar: svg.getElementById('filler3'), txt: svg.getElementById('txt3'), val: svg.getElementById('val3'), container:svg.getElementById('container3'), factor: svg.getElementById('container3').getAttribute('height') / 100.0 }


        scope.$on('streamsUpdate', function (event, streams) {
          if (streams != null && streams.electrics != null) {
              var clutchVal   = smartRound(100, 100*streams.electrics.clutch)
                , brakeVal    = smartRound(100, 100*streams.electrics.brake)
                , throttleVal = smartRound(100, 100*streams.electrics.throttle)
                , parkingVal  = smartRound(100, 100*streams.electrics.parkingbrake)


              clutch.val.innerHTML = clutchVal
              brake.val.innerHTML = brakeVal
              throttle.val.innerHTML = throttleVal
              parking.val.innerHTML = parkingVal

              clutch.txt.innerHTML = "clutch"
              brake.txt.innerHTML = "brake"
              throttle.txt.innerHTML = "throt"
              parking.txt.innerHTML = "p-brk"

              clutch.txt.style.opacity   =   clutchVal==0 ? 0.75 : 1
              clutch.val.style.opacity   =   clutchVal==0 ? 0.75 : 1
              brake.txt.style.opacity    =    brakeVal==0 ? 0.75 : 1
              brake.val.style.opacity    =    brakeVal==0 ? 0.75 : 1
              throttle.txt.style.opacity = throttleVal==0 ? 0.75 : 1
              throttle.val.style.opacity = throttleVal==0 ? 0.75 : 1
              parking.txt.style.opacity  =  parkingVal==0 ? 0.75 : 1
              parking.val.style.opacity  =  parkingVal==0 ? 0.75 : 1

              clutch.bar.setAttribute('height',   isNaN(clutchVal)   ? 0 : clutchVal * clutch.factor)
              brake.bar.setAttribute('height',    isNaN(brakeVal)    ? 0 : brakeVal * brake.factor)
              throttle.bar.setAttribute('height', isNaN(throttleVal) ? 0 : throttleVal * throttle.factor)
              parking.bar.setAttribute('height',  isNaN(parkingVal)  ? 0 : parkingVal * parking.factor)
          }
        })
      })
    }
  }
}])
