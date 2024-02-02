angular.module('beamng.stuff')

/**
 * @ngdoc controller
 * @name beamng.stuff.controller:EnvironmentController
 * @description Environment controller
 */
.controller('EnvironmentController', ['$scope', 'Environment', 'EnvironmentPresets',
 function($scope, Environment, EnvironmentPresets) {
  var vm = this
  vm.currentWeatherPreset
  vm.weatherPresets
  Environment.update()
  Environment.registerScope($scope, () => { $scope.$evalAsync(); })


  // might be buggy at the limits, be careful
  $scope.timeFromString = function timeFromString(timeStr) {
    let parts = timeStr.split(':')
    if(parts.length < 2) return -1
    let seconds = parts[0] * 3600 + parts[1] * 60
    if(parts.length > 2) {
      seconds += parts[2]
    }
    let res = (seconds / 86400) - 0.5
    if(res <= 0) res += 1
    return res
  }

  // Get time in 24 hours format
  $scope.timeAsString = function timeAsString(timeValue, withSeconds = false) {
    let seconds = ((timeValue + 0.5) % 1) * 86400
    let hours = Math.floor(seconds / 3600)
    let mins = Math.floor(seconds / 60 - (hours * 60))
    let secs = Math.floor(seconds - hours * 3600 - mins * 60)
    let res = String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0')
    if(withSeconds) {
      res += ':' + String(secs).padStart(2, '0')
    }
    return res
  }
  $scope.setTimeFromStr = function(timeStr) {
    vm.service.state.time = $scope.timeFromString(timeStr)
    vm.service.submitState()
  }
  $scope.timeDiffSeconds = function(seconds) {
    vm.service.state.time += seconds / 86400
    vm.service.submitState()
  }


  bngApi.engineLua('core_weather.getPresets()',
    (data) => {
      $scope.$evalAsync(() => {
        vm.weatherPresets = data
      })
    }
  )

  bngApi.engineLua('core_weather.getCurrentWeatherPreset()',
    (data) => {
      $scope.$evalAsync(() => {
        vm.currentWeatherPreset = data
      })
    }
  )

  vm.switchWeather = function(preset){
    bngApi.engineLua('core_weather.switchWeather("'+ preset +'")')
    vm.currentWeatherPreset = preset
  }

  vm.resetTireMarks = function(){
    bngApi.engineLua('be:resetTireMarks()')
  }
  vm.saveTireMarks = function(){
    bngApi.engineLua('be:saveTireMarks("tiremarks.dat")')
  }
  vm.loadTireMarks = function(){
    bngApi.engineLua('be:loadTireMarks("tiremarks.dat")')
  }

  vm.service = Environment
  vm.presets = EnvironmentPresets
  vm.convertTemperature = function (temp) {
    if(!temp) return ''
    return UiUnits.buildString('temperature', temp, 1)
  }
  vm.temperatureC = vm.service
}])
