angular.module('beamng.apps')
.directive('cruiseControl', ['$log', function ($log) {
  return {
    template:
      '<object style="width:100%; height:100%;" type="image/svg+xml" data="/ui/modules/apps/CruiseControl/cruise_control_t01.svg"></object>',
    replace: true,
    restrict: 'EA',
    scope: true,
    link: function (scope, element, attrs) {
      var unitMultiplier = {
        'metric': 3.6,
        'imperial': 2.23694
      }

      element.on('load', function () {
        let svg = element[0].contentDocument
        let setBtn = angular.element(svg.getElementById('set_btn'))
        let resBtn = angular.element(svg.getElementById('res_btn'))
        let ccBtn = angular.element(svg.getElementById('cc_btn'))
        let ccIcon = svg.getElementById('cc_icon')
        let upBtn = angular.element(svg.getElementById('up_btn'))
        let downBtn = angular.element(svg.getElementById('down_btn'))
        let speedTxt = svg.getElementById('target_speed_txt')
        let state = null
        let speedStep = 1 / 3.6
        let speedMult = 1
        let offColor = '#949494'
        let onColor = '#FF6600'
        let incSpeed = 1
        let speedChangeDir = 1
        let changeValueIncreaseId

        scope.$on('SettingsChanged', function (event, data) {
          speedStep = 1 / unitMultiplier[data.values.uiUnitLength]
          bngApi.activeObjectLua('extensions.cruiseControl.requestState()')
        })

        setBtn.on('click', function () {
          bngApi.activeObjectLua('extensions.cruiseControl.holdCurrentSpeed()')
        })

        resBtn.on('click', function () {
          if (!state.isEnabled && state.targetSpeed > 0.1) {
            bngApi.activeObjectLua('extensions.cruiseControl.setEnabled(true)')
          }
        })

        ccBtn.on('click', function () {
          bngApi.activeObjectLua(`extensions.cruiseControl.setEnabled(${!state.isEnabled})`)
          bngApi.activeObjectLua('extensions.cruiseControl.requestState()')
        })

        function setNewSpeed(newVal) {
          bngApi.activeObjectLua(`extensions.cruiseControl.setSpeed(${newVal})`)
          bngApi.activeObjectLua('extensions.cruiseControl.requestState()')
        }

        function changeSpeedInc() {
          if(incSpeed === 0) return
          setNewSpeed(state.targetSpeed + (speedStep * incSpeed * speedMult * speedChangeDir))
          incSpeed *= 1.1
        }

        downBtn.on('mousedown', function () {
          incSpeed = 1
          speedChangeDir = -1
          changeSpeedInc()
          changeValueIncreaseId = setInterval(changeSpeedInc, 150)
        })
        downBtn.on('mouseup', function () {
          incSpeed = 0
          clearTimeout(changeValueIncreaseId)
        })
        downBtn.on('mouseout', function () {
          incSpeed = 0
          clearTimeout(changeValueIncreaseId)
        })

        upBtn.on('mousedown', function () {
          incSpeed = 1
          speedChangeDir = 1
          changeSpeedInc()
          changeValueIncreaseId = setInterval(changeSpeedInc, 150)
        })
        upBtn.on('mouseup', function () {
          incSpeed = 0
          clearTimeout(changeValueIncreaseId)
        })
        upBtn.on('mouseout', function () {
          incSpeed = 0
          clearTimeout(changeValueIncreaseId)
        })


        scope.$on('CruiseControlState', function (event, data) {
          scope.$evalAsync(function() {
            //console.log(TAG, 'state:', data)
            state = data
            speedTxt.innerHTML = Math.round(state.targetSpeed / speedStep)
            if (state.isEnabled) {
              speedTxt.style.fill = onColor
              ccIcon.style.fill = onColor
            } else {
              speedTxt.style.fill = offColor
              ccIcon.style.fill = offColor
            }
          })
        })

        scope.$on('VehicleFocusChanged', function () {
          bngApi.activeObjectLua('extensions.cruiseControl.requestState()')
        })

        scope.$on('AIStateChange', function (event, data) {
          // bngApi.activeObjectLua(`extensions.cruiseControl.setEnabled(${!state.isEnabled})`)
          // Some sort of AI control if need in the future!
          bngApi.activeObjectLua('extensions.cruiseControl.requestState()')
        })

        bngApi.engineLua('settings.notifyUI()')
      })
    }
  }
}])
