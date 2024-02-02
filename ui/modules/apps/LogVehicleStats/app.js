angular.module('beamng.apps')
.directive('logvehiclestats', [function () {
  return {
    templateUrl: '/ui/modules/apps/LogVehicleStats/app.html',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      scope.updateTime = 5
      scope.module_general = true
      scope.module_wheels = true
      scope.module_engine = true
      scope.module_inputs = true
      scope.module_powertrain = true
      scope.outputFileName = 'settings.json'
      scope.inputFileName = 'settings.json'
      scope.outputDir = 'VSL'

      scope.applySettings = function() {
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.updateTime = ${scope.updateTime}`)
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["General"] = ${scope.module_general}`)
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["Wheels"] = ${scope.module_wheels}`)
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["Inputs"] = ${scope.module_inputs}`)
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["Engine"] = ${scope.module_engine}`)
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.settings.useModule["Powertrain"] = ${scope.module_powertrain}`)
      }

      scope.useAsOutputDir = function() {
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.settings.outputDir = "${scope.outputDir}"`)
      }

      scope.getNewOutputFilename = function() {
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.suggestOutputFilename()`, function(data) {
          scope.outputFileName = data
        })
      }

      scope.saveSettingsToJson = function() {
        if(scope.outputFileName === '') return
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.writeSettingsToJSON("${scope.outputFileName}")`)
      }

      scope.importSettingsFromFile = function() {
        if(scope.inputFileName === '') return
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.applySettingsFromJSON("${scope.inputFileName}")`)
        scope.module_general = eval(`${extensions.vehicleStatsLogger.settings.useModule["General"]}`)
        scope.module_wheels = eval(`${extensions.vehicleStatsLogger.settings.useModule["Wheels"]}`)
        scope.module_inputs = eval(`${extensions.vehicleStatsLogger.settings.useModule["Inputs"]}`)
        scope.module_engine = eval(`${extensions.vehicleStatsLogger.settings.useModule["Engine"]}`)
        scope.module_powertrain = eval(`${extensions.vehicleStatsLogger.settings.useModule["Powertrain"]}`)
      }

      scope.startLogging = function() {
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.startLogging()`)
      }

      scope.stopLogging = function() {
        bngApi.activeObjectLua(`extensions.vehicleStatsLogger.stopLogging()`)
      }
    }
  }
}]);