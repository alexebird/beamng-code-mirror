angular.module('beamng.apps')
.directive('threedexport', [function () {
  return {
    templateUrl: '/ui/modules/apps/threedexport/app.html',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      scope.filename = ''
      scope.embedBuffers = true
      scope.exportNormals = true
      scope.exportTangents = false
      scope.exportTexCoords = true
      scope.exportColors = false
      scope.exportBeams = false
      scope.gltfBinaryFormat = true
      scope.vulkan = false

      scope.getNewFilename = function(enforce) {
        bngApi.engineLua(`extensions.util_export.suggestFilename()`, function(data) {
          if(scope.filename === '' || enforce) {
            scope.filename = data
          }
        })
      }

      bngApi.engineLua(`extensions.util_export.getGeInfo()`, function(data) {
        scope.gltfBinaryFormat = data.gltfBinaryFormat
        if(scope.gltfBinaryFormat === true)
          scope.embedBuffers = true;
        scope.vulkan = data.vulkan
      })

      scope.doExport = function() {
        if(scope.filename === '') return
        bngApi.engineLua(`extensions.util_export.embedBuffers = ${scope.embedBuffers}`)
        bngApi.engineLua(`extensions.util_export.exportNormals = ${scope.exportNormals}`)
        bngApi.engineLua(`extensions.util_export.exportTangents = ${scope.exportTangents}`)
        bngApi.engineLua(`extensions.util_export.exportTexCoords = ${scope.exportTexCoords}`)
        bngApi.engineLua(`extensions.util_export.exportColors = ${scope.exportColors}`)
        bngApi.engineLua(`extensions.util_export.exportBeams = ${scope.exportBeams}`)
        bngApi.engineLua(`extensions.util_export.exportFile("${scope.filename}", true)`)
        scope.exportRunning = true
      }

      scope.$on('$destroy', function () {
        bngApi.engineLua(`extensions.unload('util/export')`)
      })

      scope.$on('ThreeDExported', function () {
        scope.$apply(function () {
          scope.exportRunning = false
          scope.getNewFilename(true)
        })
      })

      scope.$on('VehicleChange', function() { scope.getNewFilename(true); })

      scope.$on('VehicleFocusChanged', function() {
        scope.getNewFilename(true)
      })

      scope.getNewFilename(false)

    }
  }
}])
