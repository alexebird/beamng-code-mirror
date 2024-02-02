angular.module('beamng.stuff')

.value('Settings', {
  loaded: false, // set to true when settings loaded for the first time
  values: {},
  options: {},
  temporary: {}
})


.constant('SettingsAuxData', {
  uiElements: {
    graphics: {
      checkboxGroup1: [
        { name: 'ui.options.graphics.PostFXBloomGeneralEnabled',  key: 'PostFXBloomGeneralEnabled', requiresLowLighting: true },
        { name: 'ui.options.graphics.PostFXSSAOGeneralEnabled', key: 'PostFXSSAOGeneralEnabled', requiresLowLighting: true },
        { name: 'ui.options.graphics.PostFXLightRaysEnabled',    key: 'PostFXLightRaysEnabled', requiresLowLighting: true },
        { name: 'ui.options.graphics.PostFXDOFGeneralEnabled',  key: 'PostFXDOFGeneralEnabled', requiresLowLighting: true },
        { name: 'ui.options.graphics.PostFXMotionBlurEnabled', key: 'PostFXMotionBlurEnabled', requiresLowLighting: true }
      ],

      checkboxGroup2: [
        { name: 'ui.options.graphics.GraphicMeshQuality',     tooltip: 'ui.options.graphics.GraphicMeshQualityTooltip',     key: 'GraphicMeshQuality'     },
        { name: 'ui.options.graphics.GraphicTextureQuality',  tooltip: 'ui.options.graphics.GraphicTextureQualityTooltip',  key: 'GraphicTextureQuality'  },
        { name: 'ui.options.graphics.GraphicLightingQuality', tooltip: 'ui.options.graphics.GraphicLightingQualityTooltip', key: 'GraphicLightingQuality' },
        { name: 'ui.options.graphics.DisplayShadows',         tooltip: 'ui.options.graphics.GraphicDisableShadowsTooltip',  key: 'GraphicDisableShadows'  },
        { name: 'ui.options.graphics.GraphicShaderQuality',   tooltip: 'ui.options.graphics.GraphicShaderQualityTooltip',   key: 'GraphicShaderQuality'   },
        { name: 'ui.options.graphics.GraphicPostfxQuality',   tooltip: 'ui.options.graphics.GraphicPostfxQualityTooltip',   key: 'GraphicPostfxQuality'   },
        { name: 'ui.options.graphics.GraphicAnisotropic',     tooltip: 'ui.options.graphics.GraphicAnisotropicTooltip',     key: 'GraphicAnisotropic'     }
      ],

      dynReflectionSliders: [
        { name: 'Texture Size', tooltip: 'GraphicDynReflectionTexsizeTooltip',        key: 'GraphicDynReflectionTexsize',        min: 0,  max: 3,    step: 1   },
        { name: 'Update Rate',  tooltip: 'GraphicDynReflectionFacesPerupdateTooltip', key: 'GraphicDynReflectionFacesPerupdate', min: 1,  max: 6,    step: 1   },
        { name: 'Detail',       tooltip: 'GraphicDynReflectionDetailTooltip',         key: 'GraphicDynReflectionDetail',         min: 0,  max: 1,    step: 0.1 },
        { name: 'Distance',     tooltip: 'GraphicDynReflectionDistanceTooltip',       key: 'GraphicDynReflectionDistance',       min: 50, max: 1000, step: 50, unitsTxt: 'm' }
      ],
      dynMirrorsSliders: [
        { name: 'Texture Size', tooltip: 'GraphicDynReflectionTexsizeTooltip',        key: 'GraphicDynMirrorsTexsize',   min: 0,  max: 3,    step: 1   },
        { name: 'Detail',       tooltip: 'GraphicDynReflectionDetailTooltip',         key: 'GraphicDynMirrorsDetail',    min: 0,  max: 1,    step: 0.1 },
        { name: 'Distance',     tooltip: 'GraphicDynReflectionDistanceTooltip',       key: 'GraphicDynMirrorsDistance',  min: 50, max: 1000, step: 50, unitsTxt: 'm' }
      ]
    },

    audio: {
      volumeSliders: [
        { name: 'ui.options.audio.masterVol',           tooltip: 'ui.options.audio.masterVolTooltip',          key: 'AudioMasterVol', min:0, max:1, step:0.01},
        { name: 'ui.options.audio.powerVol',            tooltip: 'ui.options.audio.powerVolTooltip',           key: 'AudioPowerVol', min:0, max:1, step:0.01 },
        { name: 'ui.options.audio.forcedInductionVol',  tooltip: 'ui.options.audio.forcedInductionVolTooltip', key: 'AudioForcedInductionVol', min:0, max:1, step:0.01 },
        { name: 'ui.options.audio.transmissionVol',     tooltip: '',                                           key: 'AudioTransmissionVol', min:0, max:1, step:0.01 },
        { name: 'ui.options.audio.suspensionVol',       tooltip: '',                                           key: 'AudioSuspensionVol', min:0, max:1, step:0.01 },
        { name: 'ui.options.audio.surfaceVol',          tooltip: 'ui.options.audio.surfaceVolTooltip',         key: 'AudioSurfaceVol', min:0, max:1, step:0.01 },
        { name: 'ui.options.audio.collisionVol',        tooltip: 'ui.options.audio.collisionVolTooltip',       key: 'AudioCollisionVol', min:0, max:1, step:0.01},
        { name: 'ui.options.audio.aeroVol',             tooltip: 'ui.options.audio.aeroVolTooltip',            key: 'AudioAeroVol', min:0, max:1, step:0.01},
        { name: 'ui.options.audio.environmentVol',      tooltip: 'ui.options.audio.environmentVolTooltip',     key: 'AudioEnvironmentVol', min:0, max:1, step:0.01 },
        { name: 'ui.options.audio.musicVol',            tooltip: '',                                           key: 'AudioMusicVol', min:0, max:1, step:0.01},
        { name: 'ui.options.audio.uiVol',               tooltip: '',                                           key: 'AudioUiVol', min:0, max:1, step:0.01  },
        { name: 'ui.options.audio.otherVol',            tooltip: 'ui.options.audio.otherVolTooltip',           key: 'AudioOtherVol', min:0, max:1, step:0.01},
        { name: 'ui.options.audio.lfeVol',              tooltip: 'ui.options.audio.lfeVolTooltip',             key: 'AudioLfeVol', min:0, max:1, step:0.01} //min:-0.1, max:0.1, step:0.01 // 10/100 = 0.1, range  = [-10, 10]
      ]
    }
  }
})

.value('UiUnitsOptions', {
  highLvlOpt: {
    'imperial': 'Imperial',
    'metric': 'Metric (SI)',
    'british': 'British',
    'custom': 'Custom',
  },

  settable: [ 'uiUnitLength', 'uiUnitTemperature', 'uiUnitWeight', 'uiUnitVolume', 'uiUnitConsumptionRate', 'uiUnitPower', 'uiUnitTorque', 'uiUnitEnergy',  'uiUnitPressure', 'uiUnitDate'],
  names:    [ 'ui.options.units.length', 'ui.options.units.temperature', 'ui.options.units.weight', 'ui.options.units.volume', 'ui.options.units.fuelConsumption', 'ui.options.units.power', 'ui.options.units.torque', 'ui.options.units.energy', 'ui.options.units.pressure', 'ui.options.units.dateFormat'],

  default: {
    imperial: [ 'imperial', 'f', 'lb', 'gal', 'imperial', 'bhp', 'imperial', 'imperial', 'psi', 'us'  ],
    metric:   [ 'metric', 'c', 'kg', 'l',   'metric',   'hp',  'metric',   'metric', 'bar',   'ger' ],
    british:  [ 'imperial', 'c', 'kg', 'l', 'imperial', 'bhp', 'imperial', 'imperial', 'inHg', 'uk'  ]
  },
  system: 'imperial'
})

.controller('OptionsController', ['$scope', 'SettingsAuxData', 'UiUnitsOptions', '$state', '$timeout', 'RateLimiter', 'mdx',
function($scope, SettingsAuxData, UiUnitsOptions, $state, $timeout, RateLimiter, mdx) {

  var vm = this
  vm.shipping = beamng.shipping
  vm.stateName = $state.current.name
  var uiUnitsOptions = UiUnitsOptions

  $scope.fullscreenOptions = false
  $scope.controlsScreen = false

  bngApi.engineLua('core_gamestate.requestGameState()')   // if this isnt called the gamestate in menu doesnt update correctly...

  $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    vm.stateName = toState.name
  })

  vm.uiElements = SettingsAuxData.uiElements

  vm.data = {values: {}, options: {}}

  $scope.$on('SettingsChanged', function (event, data) {
    $scope.$evalAsync(function () {
      $scope.options.online = data.values.onlineFeatures == 'enable'
      $scope.options.telemetry = data.values.telemetry == 'enable'
      vm.data = data
      vm.checkUiUnitsSystem()
    })
  })

  $scope.$on('externalUIURL', function (event, data) {
    $scope.$eval(function () {
      $scope.options.externalUIURL = data
    })
  })

  $scope.$watch('options.data.values.GraphicDynReflectionTexsize', function(value) {
    if (value == 0) { $scope.GraphicDynReflectionTexsizeText = "128"; }
    if (value == 1) { $scope.GraphicDynReflectionTexsizeText = "256"; }
    if (value == 2) { $scope.GraphicDynReflectionTexsizeText = "512"; }
    if (value == 3) { $scope.GraphicDynReflectionTexsizeText = "1024"; }
  })

  $scope.$watch('options.data.values.GraphicDynMirrorsTexsize', function(value) {
    if (value == 0) { $scope.GraphicDynMirrorsTexsizeText = "128"; }
    if (value == 1) { $scope.GraphicDynMirrorsTexsizeText = "256"; }
    if (value == 2) { $scope.GraphicDynMirrorsTexsizeText = "512"; }
    if (value == 3) { $scope.GraphicDynMirrorsTexsizeText = "1024"; }
  })

  bngApi.engineLua('settings.notifyUI()')

  bngApi.engineLua('if ui_extApp then ui_extApp.requestUIData() end')

  vm.applyLanguage = function () {
    // unload current page, save language, then reload current page
    // this forces re-reading of all one-time data-bindings, to reflect the new language without having to use slow two-time data-bindings
    var currentState = $state.current.name
    $state.go('play')
    bngApi.engineLua(`settings.setState(${bngApi.serializeToLua(vm.data.values)})`,
      function (ret) { $timeout( function(){
        $state.go(currentState)
      }, 500 ); }
    )
  }

  vm.applyFramerateLimit = function(limit) {
    vm.data.values.FPSLimiter = limit
    vm.applyState()
  }

  function applyState (stateObj) {
    var onlineFeatures = 'disable'
    var telemetryFeatures = 'disable'
    if ($scope.options.online) {
      onlineFeatures = 'enable'
      if ($scope.options.telemetry) {
        telemetryFeatures = 'enable'
      }
    } else {
      $scope.options.telemetry = false
    }

    vm.data.values.onlineFeatures = onlineFeatures
    vm.data.values.telemetry = telemetryFeatures


    bngApi.engineLua(`settings.setState(${bngApi.serializeToLua(stateObj || vm.data.values)})`)
  }

  function refreshGraphicsState () {
    bngApi.engineLua(`core_settings_graphic.refreshGraphicsState(${bngApi.serializeToLua(vm.data.values)})`)
  }

  function applyGraphicsState () {
    bngApi.engineLua(`core_settings_graphic.applyGraphicsState()`)
  }

  vm.openXRdisplay = {} // a few variables are stored inside this object (rather than in 'vm' object), so we can feed them to bng-translate as 'context'
  vm.openXRstate = {}
  vm.openXRstate.systemName = "ui.options.graphics.openXRsystemName.unknown"
  function updateOpenXRdisplay() {
    vm.openXRresolutionScaleChanged = false
    vm.openXRdisplay.openXRrenderedWidth = "?"
    vm.openXRdisplay.openXRrenderedHeight = "?"
    vm.openXRdisplay.openXRrefresh = "?"
    vm.openXRdisplay.openXRfullhdEquivalent = "?"
    vm.openXRenabled = false
    let s = vm.data.values.openXRresolutionScale
    if (s === undefined) return // settings not yet available
    if (vm.openXRstate.recommendedWidth === undefined) return // state not yet available
    vm.openXRdisplay.openXRrenderedWidth = parseInt(s*vm.openXRstate.recommendedWidth)
    vm.openXRdisplay.openXRrenderedHeight = parseInt(s*vm.openXRstate.recommendedHeight)
    vm.openXRdisplay.openXRrefresh = parseInt(vm.openXRstate.targetRefreshRate)
    vm.openXRdisplay.openXRfullhdEquivalent = Math.ceil((2 * vm.openXRdisplay.openXRrenderedWidth * vm.openXRdisplay.openXRrenderedHeight * vm.openXRdisplay.openXRrefresh) / (1920 * 1080 * 60))
    vm.openXRenabled = vm.openXRstate.enabled
    vm.openXRresolutionScaleChanged = vm.openXRdisplay.openXRrenderedWidth !== vm.openXRstate.renderedWidth
  }
  $scope.$on('SettingsChanged', function (event, data) {
    $scope.$apply(function() {
      updateOpenXRdisplay()
    })
  })
  $scope.$on('OpenXRStateChanged', function (event, data) {
    $scope.$apply( function() {
      vm.openXRstate = data
      updateOpenXRdisplay()
    })
  })
  function requestOpenXRState() {
    updateOpenXRdisplay()
    bngApi.engineLua(`if render_openxr then render_openxr.updateUI(true) end`)
  }
  function applyOpenXRState() {
    vm.applyState()
    requestOpenXRState()
  }

  vm.openXRtoggle = function() {
    bngApi.engineLua(`extensions.render_openxr.toggle()`)
  }

  vm.openXRcenter = function() {
    bngApi.engineLua(`extensions.render_openxr.center()`)
  }

  requestOpenXRState()

  $scope.monitorWindowAction = "ui.inputActions.large_crusher.open.title"

  function openMonitorConfiguration() {
    bngApi.engineLua(`core_settings_graphic.openMonitorConfiguration()`)
    $scope.$evalAsync(function() {
      if ($scope.monitorWindowAction == "ui.inputActions.large_crusher.open.title")
      {
        $scope.monitorWindowAction = "ui.inputActions.large_crusher.close.title"
      }
      else {
        $scope.monitorWindowAction = "ui.inputActions.large_crusher.open.title"
      }
    })


  }

  vm.applyStateLongDebounce = RateLimiter.debounce(applyState, 1000)
  vm.applyStateDebounce = RateLimiter.debounce(applyState, 100)
  vm.applyStateThrottle = RateLimiter.throttle(applyState, 100)
  vm.applyState = function(options) {
      applyState(options)
  }
  vm.refreshGraphicsState = RateLimiter.debounce(refreshGraphicsState, 100)
  vm.applyGraphicsState = RateLimiter.debounce(applyGraphicsState, 100)
  vm.applyOpenXRState = RateLimiter.debounce(applyOpenXRState, 100)
  vm.openMonitorConfiguration = RateLimiter.debounce(openMonitorConfiguration, 100)


  // checks if UI units correspond to a preset.
  vm.checkUiUnitsSystem = function () {
    var system = 'custom'

    for (var j in uiUnitsOptions.default) {
      var res = true
      uiUnitsOptions.settable.forEach((elem, i) => {
        res = res && (vm.data.values[elem] === uiUnitsOptions.default[j][i])
      })
      if (res) {
        system = j
        break
      }
    }

    uiUnitsOptions.system = system
  }


}])


.controller('SettingsGraphicsCtrl', ['$scope', 'SettingsAuxData', 'Settings', function ($scope, SettingsAuxData, Settings) {
  var vm = this

  var settings = $scope.$parent.options
  var temporary = Settings.temporary

  $scope.$parent.fullscreenOptions = false

  vm.resetGamma = function () {
    settings.applyState({GraphicGamma: 1.0})
  }

  vm.applyOverallQuality = function () {
    var preset = settings.data.values.GraphicOverallQuality
    settings.applyState({GraphicOverallQuality: preset})
  }

  vm.toggleRenderBoundingBoxes = function() {
    bngApi.engineScript(`$Scene::renderBoundingBoxes=${vm.debug_boundingboxes};`)
  }

  vm.toggleDisableShadows = function() {
    bngApi.engineScript(`$Shadows::disable=${vm.debug_disableShadows};`)
  }

  vm.toggleWireframe = function() {
    bngApi.engineScript(`$gfx::wireframe=${vm.debug_wireframe};`)
  }

  vm.toggleFPS = function() {
    bngApi.engineLua('extensions.core_metrics.toggle()')
  }

  vm.resetPostFX = function() {
    bngApi.engineLua('postFxModule.loadPresetFile("lua/ge/client/postFx/presets/defaultPostfxPreset.postfx"); postFxModule.settingsApplyFromPreset()')
  }

  if (!temporary.last_debug_visualization) {
    temporary.last_debug_visualization = 'None'
  }
  vm.debug_visualization = temporary.last_debug_visualization

  vm.visualizationModes = {
    'None':        () => { },
    'Depth':       () => { bngApi.engineLua('toggleDepthViz("")') },
    'Normal':      () => { bngApi.engineLua('toggleNormalsViz("")') },
    'Light Color': () => { bngApi.engineLua('toggleLightColorViz("")') },
    'Specular':    () => { bngApi.engineLua('toggleLightSpecularViz("")') }
  }

  vm.setVisualizationMode = () => {
    vm.visualizationModes[temporary.last_debug_visualization]() // toggle off old
    vm.visualizationModes[vm.debug_visualization]() // toggle on new
    temporary.last_debug_visualization = vm.debug_visualization
  }
}])

.directive('tripleScreenCanvas', ['Utils', '$timeout', '$rootScope', function (Utils, $timeout, $rootScope) {
  return {
    template: `
      <canvas style="border: 1px gray solid;width:100%"></canvas>
    `,
    replace: true,
    restrict: 'AEC',
    link: function (scope, element, attrs) {
      var canvas = element[0]
      var ctx = canvas.getContext('2d')

      var scale = (canvas.clientWidth / canvas.clientHeight)
      canvas.setAttribute('width', canvas.width * scale)
      canvas.setAttribute('height', canvas.height * scale)

      var hfov = 0
      var aspectRatio = 1

      //var screenSize = 32; // inch
      //var bezelSizes = 2

      function degToRad(deg) {
        return deg * (Math.PI / 180)
      }

      function drawText(x, y, rot, yOffset, text, color) {
        var rotInRad = degToRad(rot)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotInRad)
        ctx.font = "20px monospace"
        ctx.textAlign = "center"
        ctx.fillStyle = color
        ctx.fillText(text, 0, -yOffset)
        ctx.restore()
      }

      function drawArrow(x, y, x2, y2, color) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = color
        ctx.stroke()
      }

      function drawArrowRot(x, y, len, rot, color) {
        var rotInRad = degToRad(rot)
        drawArrow(x, y, x + Math.cos(rotInRad) * len, y + Math.sin(rotInRad) * len, color)
      }

      function drawBoxRot(x, y, w, h, rot, fillStyle, strokeStyle) {
        var rotInRad = degToRad(rot)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotInRad)

        ctx.beginPath()
        ctx.rect(- w * 0.5, - h * 0.5, w, h)
        if(fillStyle) {
          ctx.fillStyle = fillStyle
          ctx.fill()
        }
        if(strokeStyle) {
          ctx.strokeStyle = strokeStyle
          ctx.stroke()
        }

        ctx.restore()
      }

      function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()

        var a = hfov / 3

        var color = 'black'

        var screenDepth = 6


        // middle screen
        var x = canvas.width * 0.5
        var y = canvas.height * 0.4
        drawBoxRot(x, y, 120, screenDepth, 0, '#ff6b00')
        drawArrowRot(x, y, 100, 90, color)
        drawText(x, y, 0, screenDepth, 'screen 2', color)
        drawBoxRot(x, 50, 120, 120 / aspectRatio, 0, null, '#ff6b00')

        // left screen
        var x1 = x - 60 - Math.cos(degToRad(-a)) * 60
        var y1 = y - Math.sin(degToRad(-a)) * 60
        drawBoxRot(x1, y1, 120, screenDepth, -a, '#ff6b00')
        drawArrowRot(x1, y1, 100, -a + 90, color)
        drawText(x1, y1, -a, screenDepth, 'screen 1', color)

        drawBoxRot(x1, 50, 120, 120 / aspectRatio, 0, null, '#ff6b00')

        //drawArrow(x1, y1, x1, canvas.height * 0.7, color)

        // right screen
        var x2 = x + 60 + Math.cos(degToRad(a)) * 60
        var y2 = y + Math.sin(degToRad(a)) * 60
        drawBoxRot(x2, y2, 120, screenDepth, a, '#ff6b00')
        drawArrowRot(x2, y2, 100, a + 90, color)
        drawText(x2, y2, a, screenDepth, 'screen 3', color)
        drawBoxRot(x2, 50, 120, 120 / aspectRatio, 0, null, '#ff6b00')



        ctx.restore()
      }

      scope.$watch('$parent.options.data.values', function(values) {
        var aspectRatioStr = values.GraphicDisplayResolutions.split(' ')
        aspectRatio = parseInt(aspectRatioStr[0]) / parseInt(aspectRatioStr[1])
        hfov = values.GraphicTripleMonitorFov
        redraw()
      })
    }
  }
}])

.controller('SettingsCameraCtrl', ['$scope', function ($scope) {
  $scope.$parent.fullscreenOptions = false
  var vm = this
  vm.cameraConfig = []
  vm.focusedCamName
  vm.lastSlotId = 0
  vm.defaultId = null

  $scope.$on('CameraConfigChanged', function (event, data) {
    $scope.$apply(
      function() {
        vm.cameraConfig = data.cameraConfig
        vm.focusedCamName = data.focusedCamName
        vm.defaultId = null
        for (i in vm.cameraConfig) {
            if (vm.defaultId == null && !vm.cameraConfig[i].hidden && vm.cameraConfig[i].enabled) vm.defaultId = i
            if (vm.cameraConfig[i].slotId) vm.lastSlotId = i
        }
      }
    )
  })
  vm.changeOrder     = function(camId, offset) { bngApi.engineLua(`core_camera.changeOrder      (${camId+1}, ${offset})`) }
  vm.setCameraByName = function(camName) { bngApi.engineLua(`core_camera.setByName(0, '${camName}')`) }
  vm.toggleEnabledCameraById = function(camId) { bngApi.engineLua(`core_camera.toggleEnabledById(${camId+1})`           ) }
  vm.resetConfiguration      = function     () { bngApi.engineLua(`core_camera.resetConfiguration()`                    ) }

  vm.resetSeat = function () {
    bngApi.engineLua(`if core_camera then core_camera.proxy_Player('resetSeat') end`)
  }
  vm.resetSeatAll = function () {
    bngApi.engineLua(`if core_camera then core_camera.proxy_Player('resetSeatAll') end`)
  }

  bngApi.engineLua('if core_camera then core_camera.requestConfig() end')
}])

.controller('SettingsUserInterfaceCtrl', ['$scope', 'UiUnitsOptions', function ($scope, UiUnitsOptions) {
  $scope.$parent.fullscreenOptions = false
  var vm = this
  vm.specialUiUnit = UiUnitsOptions
  vm.specialUiUnit.applyState = function () {
    var uiUnitsObj = {}
    var system = vm.specialUiUnit.system

    if (system != 'custom') {
      uiUnitsObj['uiUnits'] = system
      vm.specialUiUnit.settable.forEach((elem, i) => {
        uiUnitsObj[elem] = vm.specialUiUnit.default[system][i]
      })

      bngApi.engineLua(`settings.setState(${bngApi.serializeToLua(uiUnitsObj)})`)
    }
  }

  vm.openBrowserURL = function(url) {
    bngApi.engineLua('openWebBrowser("' + url + '")')
  }
}])

.controller('SettingsLanguageCtrl', ['$scope', function ($scope) {
  $scope.$parent.fullscreenOptions = false
  var vm = this
  vm.updateTranslations = function () {
    bngApi.engineLua('updateTranslations()')
  }

  vm.enableCommunityTranslations = function() {
    bngApi.engineLua('enableCommunityTranslations()')
  }
}])

.controller('SettingsOtherCtrl', ['$scope', function ($scope) {
  $scope.$parent.fullscreenOptions = false
}])

.controller('SettingsLicensesCtrl', ['$scope', function ($scope) {
  $scope.$parent.fullscreenOptions = false
}])

.controller('SettingsGameplayCtrl', ['$location', '$scope', 'mdx', 'ControlsUtils', 'UiUnitsOptions', function ($location, $scope, mdx, ControlsUtils, UiUnitsOptions) {
  var settings = $scope.$parent.options
  var vm = this
  vm.unit = function(...args) { return UiUnits.buildString(...args); }
  $scope.$parent.fullscreenOptions = false

  bngApi.engineLua('settings.notifyUI()')
  $scope.$on('SettingsChanged', function (event, data) {
    $scope.$evalAsync(function () {
      vm.data = data
      var v = vm.data.values
      vm.steeringCurveRender("strength", "steeringStabilizationGraph", 100, 0, v["steeringStabilizationEndSpeed"], 0, v["steeringStabilizationMultiplier"])
      vm.steeringCurveRender("max angle", "steeringLimitGraph", 100, v["steeringLimitStartSpeed"], v["steeringLimitEndSpeed"], 1, v["steeringLimitMultiplier"])
      vm.steeringCurveRender("steer speed", "steeringSlowdownGraph", 100, v["steeringSlowdownStartSpeed"], v["steeringSlowdownEndSpeed"], 1, v["steeringSlowdownMultiplier"])
    })
  })

  // limit steering at high speed
  vm.applySteeringLimit = function (sanitizeStart) {
    var v = vm.data.values
    if (sanitizeStart ==  true) v["steeringLimitStartSpeed"] = Math.min(v["steeringLimitStartSpeed"], v["steeringLimitEndSpeed"])
    if (sanitizeStart ==  false) v["steeringLimitEndSpeed"] = Math.max(v["steeringLimitStartSpeed"], v["steeringLimitEndSpeed"])
    vm.steeringCurveRender("max angle", "steeringLimitGraph", 100, v["steeringLimitStartSpeed"], v["steeringLimitEndSpeed"], 1, v["steeringLimitMultiplier"])
    settings.applyState() // save values to settings
  }

  // slower steering at high speed
  vm.applySteeringSlowdown = function (sanitizeStart) {
    var v = vm.data.values
    if (sanitizeStart ==  true) v["steeringSlowdownStartSpeed"] = Math.min(v["steeringSlowdownStartSpeed"], v["steeringSlowdownEndSpeed"])
    if (sanitizeStart ==  false) v["steeringSlowdownEndSpeed"] = Math.max(v["steeringSlowdownStartSpeed"], v["steeringSlowdownEndSpeed"])
    vm.steeringCurveRender("steer speed", "steeringSlowdownGraph", 100, v["steeringSlowdownStartSpeed"], 1, v["steeringSlowdownEndSpeed"], v["steeringSlowdownMultiplier"])
    settings.applyState() // save values to settings
  }

  // oversteer assistant
  vm.applySteeringStabilization = function () {
    var v = vm.data.values
    vm.steeringCurveRender("strength", "steeringStabilizationGraph", 0, 100, v["steeringStabilizationEndSpeed"], 0, v["steeringStabilizationMultiplier"])
    settings.applyState() // save values to settings
  }

  // slower autocenter at low speed
  vm.applySteeringAutocenter = function (sanitizeStart) {
    var v = vm.data.values
    settings.applyState() // save values to settings
  }

  vm.steeringCurveRender = function(legend, canvasId, maxEnd, start, end, startHeight, endHeight) {
    var canvas = document.querySelector("[id=\""+canvasId+"\"]")
    var width = canvas.width
    var height = canvas.height
    var ctx = canvas.getContext("2d")

    var accent     = "rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][600].value.toString()+")"
    var accentLight= "rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][200].value.toString()+")"
    var accentLight2="rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][100].value.toString()+")"
    var primary    = "rgb("+mdx.mdxThemeColors._PALETTES['customPrimary'   ][400].value.toString()+")"
    var primaryLight="rgb("+mdx.mdxThemeColors._PALETTES['customPrimary'   ][100].value.toString()+")"
    var background = "rgb("+mdx.mdxThemeColors._PALETTES['customBackground'][400].value.toString()+")"
    var warn       = "rgb("+mdx.mdxThemeColors._PALETTES['customWarn'      ][400].value.toString()+")"
    var white = "rgb("+mdx.mdxThemeColors._PALETTES['customBackground'][100].value.toString()+")"

    // redraw from scratch
    ctx.clearRect(0, 0, width, height)

    // grid lines
    ctx.strokeStyle=primaryLight
    ctx.lineWidth=0.25
    var vtcells = 4
    var hzcells = 10
    for(i=0; i<vtcells; i++) {
        ctx.beginPath()
        ctx.moveTo(    0, i*height/vtcells)
        ctx.lineTo(width, i*height/vtcells)
        ctx.stroke()
    }
    for(i=0; i<hzcells; i++) {
        ctx.beginPath()
        ctx.moveTo(i*width/hzcells, 0)
        ctx.lineTo(i*width/hzcells, height)
        ctx.stroke()
    }

    // fill the background below main graph line
    ctx.lineWidth=0
    ctx.beginPath()
    ctx.moveTo(0, (1-startHeight)*height-1); // top-left corner
    ctx.lineTo(start/maxEnd*width, (1-startHeight)*height-1); // begin of slope
    ctx.lineTo(end/maxEnd*width, (1-endHeight)*height-1); // end of slope
    ctx.lineTo(width, (1-endHeight)*height-1); // right border
    ctx.lineTo(width,height); // bottom-right corner
    ctx.lineTo(0,height); // bottom-left corner
    ctx.fillStyle = accentLight2
    ctx.closePath()
    ctx.fill()

    // vertical grid line - end
    ctx.lineWidth=2
    ctx.strokeStyle=accentLight
    ctx.beginPath()
      ctx.moveTo(end/maxEnd*width, 0)
      ctx.lineTo(end/maxEnd*width, height)
    ctx.stroke()

    // vertical grid line - start
    ctx.lineWidth=2
    ctx.strokeStyle=accentLight
    ctx.beginPath()
      ctx.moveTo(start/maxEnd*width, 0)
      ctx.lineTo(start/maxEnd*width, height)
    ctx.stroke()

    // draw main graph line
    ctx.strokeStyle=accent; // good for line, leave as is
    ctx.lineWidth=3
    ctx.beginPath()
    ctx.moveTo(0, (1-startHeight)*height-1); // top-left corner
    ctx.lineTo(start/maxEnd*width, (1-startHeight)*height-1); // begin of slope
    ctx.lineTo(end/maxEnd*width, (1-endHeight)*height-1); // end of slope
    ctx.lineTo(width, (1-endHeight)*height-1); // right border
    ctx.stroke()

    // limit text
    ctx.strokeStyle=accent
    var textHeight = 11
    ctx.font = textHeight + "px sans-serif"
    ctx.fillStyle = accent
    ctx.textAlign = "right"
    var textSeparationY = textHeight
    var limitText = legend + ": " + Math.round(100*endHeight) + "%"
    ctx.fillText(limitText, width, ((1-endHeight)*height-1)+(endHeight>=0.75?+1:-0.3)*textSeparationY)
  }
}])


.controller('SettingsAudioCtrl', ['$scope', function ($scope) {
  var vm = this
  var settings = $scope.$parent.options
  $scope.$parent.fullscreenOptions = false

  var lastMasterVol = 0.8
  vm.lastMaxChannels = settings.data.values.AudioMaxVoices

  // toggles Master volume
  vm.toggleMute = function () {
    if (settings.data.values.AudioMasterVol > 1e-3) {
      lastMasterVol = settings.data.values.AudioMasterVol
      settings.data.values.AudioMasterVol = 0
    } else {
      settings.data.values.AudioMasterVol = lastMasterVol
    }

    settings.applyState()
  }

  vm.restoreDefaults = function() {
    bngApi.engineLua('core_settings_audio.restoreDefaults()')
  }
}])

// populated when something changes (bindings, available controllers) with data from "ControllersChanged" and "InputBindingsChanged" events
.value('controlsContents', {
  actions: {},
  actionCategories: {},
  bindingTemplate: {},
  bindings: {},
  controllers: {}
})

.directive('binding', ['controlsContents', 'ControlsUtils', 'Utils', function (controlsContents, ControlsUtils, Utils) {
  return {
    template: `
      <span class="bng-binding" style="display: inline-block; margin: 0 0.125em 0 0.125em; vertical-align: middle;">
        <!-- control uses a generic representation -->
        <kbd ng-class="{light: !dark, dark: dark}" ng-if="viewerObj && !viewerObj.special">
          <span layout="row" layout-align="center center">
            <md-icon class="material-icons bng-binding-icon" style="font-size: 1em; padding-right: 0.14em" ng-style="{color: (dark ? 'white' : 'black')}">{{ viewerObj.icon }}</md-icon>
            <span>{{ viewerObj.control | uppercase | replace:' ':' + ' | replace:'-':' + '}}</span>
          </span>
        </kbd>
        <!-- control uses a dedicated svg -->
        <div class="binding-icon-mask" ng-class="{'icon-light': !dark, 'icon-dark': dark}" style="-webkit-mask-image: url({{viewerObj.url}})" ng-if="viewerObj !== undefined && viewerObj.special"></div>
        <!-- control is not assigned, fallback to generic indicator svg -->
        <!--
        <div ng-style="{'-webkit-filter': (!dark ? 'invert(1) brightness(1.5)' : '')}" ng-if="(viewerObj === undefined) && (showunassigned == 'true')" style="height: 1.4em; width: 1.4em;">
          <object style="max-height: 100%; max-width: 100%; type="image/svg+xml" data="/ui/modules/options/deviceIcons/unknown.svg"></object>
        </div>
        -->
        <!-- control is not assigned, fallback to empty display -->
        <kbd ng-class="{light: !dark, dark: dark}" ng-if="(viewerObj === undefined) && (showunassigned == 'true')">
          <span layout="row" layout-align="center center">
            <span style="font-weight:700;">[N/A]</span>
          </span>
        </kbd>
      </span>
    `,
    replace: true,
    scope: {
      action: '@',
      showunassigned: '@',
      device: '=',
      key: '=',
      dark: '='
    },
    link: function (scope, element, attrs) {

      var icons = {
        xinput:
        { btn_a: 'xbox/x_btn_a'
        , btn_b: 'xbox/x_btn_b'
        , btn_x: 'xbox/x_btn_x'
        , btn_y: 'xbox/x_btn_y'
        , btn_back: 'xbox/x_btn_back'
        , btn_start: 'xbox/x_btn_start'
        , btn_l: 'xbox/x_btn_lb'
        , triggerl: 'xbox/x_btn_lt'
        , btn_r: 'xbox/x_btn_rb'
        , triggerr: 'xbox/x_btn_rt'
        , dpov: 'xbox/x_dpad_down'
        , lpov: 'xbox/x_dpad_left'
        , rpov: 'xbox/x_dpad_right'
        , upov: 'xbox/x_dpad_up'
        , thumblx: 'xbox/x_thumb_left_x'
        , thumbly: 'xbox/x_thumb_left_y'
        , thumbrx: 'xbox/x_thumb_right_x'
        , thumbry: 'xbox/x_thumb_right_y'
        , btn_rt: 'xbox/x_thumb_right'
        , btn_lt: 'xbox/x_thumb_left'
        },
        mouse:
        { button0: 'mouse/button0'
        , button1: 'mouse/button1'
        , button2: 'mouse/button2'
        , xaxis: 'mouse/xaxis'
        , yaxis: 'mouse/yaxis'
        , zaxis: 'mouse/zaxis'
        }
      }

      scope.$on('InputBindingsChanged', () => Utils.waitForCefAndAngular(getBinding))
      scope.$watch(() => scope.action + ' ' + scope.device + ' ' + scope.key, getBinding)

      function getBinding () {
        var helper = {}
        if (scope.key !== undefined) {
          helper = {
            icon: ControlsUtils.deviceIcon(scope.device),
            control: scope.key,
            devname: scope.device
          }
        } else if (scope.action !== undefined) {
          helper = ControlsUtils.findBindingForAction(scope.action, scope.device)
        }
        if (helper !== undefined) {
          // convert from devname to devtype (if there's indeed custom icons for this device type)
          // e.g. "xinput3" --> "xinput"
          var devtype
          if (helper.devname) {
            for (var key in icons) {
              if (helper.devname.indexOf(key) === 0) {
                devtype = key
              }
            }
          }
          // retrieve device-specific icon if available, or generic icon otherwise
          scope.$evalAsync(() => {
            if (devtype && icons[devtype][helper.control]) {
              scope.viewerObj = {
                special: true,
                url: `/ui/modules/options/deviceIcons/${icons[devtype][helper.control]}.svg`
              }
            } else {
              helper.special = false
              scope.viewerObj = helper
            }
          })
        }
      }
    }
  }
}])

// Gives feedback to the user about the input being captured */
.directive('assignControl', function () {
  return {
    template: '<div flex>' +
                '{{ ::name }}' +
                '<div style="position: relative; height: 5px; background-color: white; border: solid grey 1px">' +
                  '<div style="position: absolute; top: 0; left: 0; height: 100%; background-color: darkgrey; width: {{ value }}%"></div>' +
                '</div>' +
              '<div>',
    replace: true,
    scope: {
      name: '@',
      value: '@'
    },
  }
})

// Gives feedback to the user about the input being captured. Each one refers to a specific control of a specific device, listens to the incoming 'RawInputChanged' events and displays it graphically.
.directive('hardwareControl', function () {
  return {
    template: '<div flex>' +
                '<div style="font-size: 13px; text-align:center;">{{ ::name }}</div>' +
                '<div style="position: relative; height: 12px; background-color: dimgrey; border: solid grey 1px">' +
                  '<div style="position: absolute; top: 0; left: 0; height: 100%; background-color: var(--bng-orange); width: {{ value }}px"></div>' +
                '</div>' +
              '<div>',
    replace: true,
    scope: {
      name: '@'
    },
    link: function (scope, element, attrs) {
      var device = attrs.device
      scope.value = 0
      scope.$on('RawInputChanged', function (event, data) {
        if (data.control == scope.name && data.devName == device) {
          scope.$evalAsync(function () {
            // get the width of the container and subtract the 2px border
            scope.value = (element[0].childNodes[2].offsetWidth -2) * data.value
          })
        }
      })
    }
  }
})


// Give feedback to the user about the keys being pressed in a specified device. Much like hardwareControl but more appropriate for keys.
.directive('hardwareKeyControl', function () {
  return {
    template: `<span ng-repeat="ctrl in activeControls"><binding dark="true" key="ctrl" device="dev" style="margin: 5px;"></binding></span>`,
    replace: true,
    link: function (scope, element, attrs) {
      scope.dev = attrs.device
      scope.activeControls = []
      scope.$on('RawInputChanged', function (event, data) {
        if (data.devName != scope.dev) return

        scope.$evalAsync(function () {
          var ctrlIndex = scope.activeControls.indexOf(data.control)
          if (data.value > 0.1 && ctrlIndex < 0) {
            scope.activeControls.push(data.control)
          } else if (data.value < 0.1) {
            scope.activeControls.splice(ctrlIndex, 1)
          }
        })

      })
    }
  }
})


.directive('ffbOptions', ['mdx', 'Utils', function (mdx, Utils) {
  return {
    replace: true,
    scope: { data: '=' },
    template: `
      <md-list>
        <h3>Force Feedback Configuration</h3>
        <md-list-item md-no-ink bng-tooltip="ui.controls.ffb.isForceEnabled.tooltip">
          <p>{{::"ui.controls.ffb.isForceEnabled"|translate}}</p>
          <md-checkbox ng-model="data.isForceEnabled" bng-sound-class="bng_checkbox_generic"></md-checkbox>
        </md-list-item>

        <md-list-item md-no-ink ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.isForceInverted.tooltip">
          <p>{{::"ui.controls.ffb.isForceInverted"|translate}}</p>
          <md-checkbox ng-model="data.isForceInverted" ng-disabled="!data.isForceEnabled" bng-sound-class="bng_checkbox_generic"></md-checkbox>
        </md-list-item>

        <md-list-item layout ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.strength.tooltip">
          <span flex="35">{{::"ui.controls.ffb.strength"|translate}}</span>
          <md-slider ng-model="data.ffb.forceCoef" flex min="0" max="1000" step="10" ng-disabled="!data.isForceEnabled" aria-label="_"></md-slider>
          <md-input-container class="bng-controls-aux-input">
            <input aria-label="_" type="number" min="0" max="1000" step="10" ng-model="data.ffb.forceCoef" ng-disabled="!data.isForceEnabled">
          </md-input-container>
        </md-list-item>

            <md-list-item layout style="margin-left:32px" ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.softlockForce.tooltip">
              <span flex="35">{{::"ui.controls.ffb.softlockForce"|translate}}</span>
              <md-slider ng-model="uidata.ffb.softlockForce" flex min="0" max="100" step="1" ng-disabled="!data.isForceEnabled" aria-label="_"></md-slider>
              {{ uidata.ffb.softlockForce }} %
            </md-list-item>

            <md-list-item layout style="margin-left:32px" ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.gforceCoef.tooltip">
              <span flex="35">{{::"ui.controls.ffb.gforceCoef"|translate}}</span>
              <md-slider ng-model="uidata.ffb.gforceCoef" flex min="0" max="20" step="1" ng-disabled="!data.isForceEnabled" aria-label="_"></md-slider>
              {{ uidata.ffb.gforceCoef }} %
            </md-list-item>

            <md-list-item md-no-ink style="margin-left:32px" ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.lowspeedCoef.tooltip">
              <p>{{::"ui.controls.ffb.lowspeedCoef"|translate}}</p>
              <md-checkbox ng-model="data.ffb.lowspeedCoef" ng-disabled="!data.isForceEnabled" bng-sound-class="bng_checkbox_generic"></md-checkbox>
            </md-list-item>

            <md-list-item md-no-ink style="margin-left:32px" ng-style="!data.isForceEnabled && {'opacity':'0.4'}">
              <p>{{::"ui.controls.ffb.useLogitechSDK"|translate}}</p>
              <md-checkbox ng-model="data.useLogitechSDK" ng-disabled="!data.isForceEnabled" bng-sound-class="bng_checkbox_generic"></md-checkbox>
            </md-list-item>

            <md-list-item layout style="margin-left:64px" ng-style="(!data.isForceEnabled || !data.useLogitechSDK) && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.logitechVibrotactileCoef.tooltip">
              <span flex="35">{{::"ui.controls.ffb.logitechVibrotactileCoef"|translate}}</span>
              <md-slider ng-model="uidata.logitechVibrotactileCoef" flex min="0" max="9000" step="5" ng-disabled="!data.isForceEnabled || !data.useLogitechSDK" aria-label="_"></md-slider>
              {{ uidata.logitechVibrotactileCoef }} %
            </md-list-item>

            <md-list-item layout style="margin-left:64px" ng-style="(!data.isForceEnabled || !data.useLogitechSDK) && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.logitechVibrotactileFreqMax.tooltip">
              <span flex="35">{{::"ui.controls.ffb.logitechVibrotactileFreqMax"|translate}}</span>
              <md-slider ng-model="uidata.logitechVibrotactileFreqMax" flex min="{{uidata.logitechVibrotactileFreqMinRange}}" max="{{uidata.logitechVibrotactileFreqMaxRange}}" step="0.0000000000001" ng-disabled="!data.isForceEnabled || !data.useLogitechSDK" aria-label="_"></md-slider>
              {{ data.logitechVibrotactileFreqMax | number:0 }} Hz
            </md-list-item>

        <md-list-item layout ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.smoothing.tooltip">
          <span flex="35">{{::"ui.controls.ffb.smoothing"|translate}}</span>
          <md-slider ng-model="data.ffb.smoothing" flex min="0" max="500" step="10" ng-disabled="!data.isForceEnabled" aria-label="_"></md-slider>
          <md-input-container class="bng-controls-aux-input">
            <input aria-label="_" type="number" min="0" max="500" step="10" ng-model="data.ffb.smoothing" ng-disabled="!data.isForceEnabled">
          </md-input-container>
        </md-list-item>

            <md-list-item md-no-ink style="margin-left:32px" ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.smoothing2automatic.tooltip">
              <p>{{::"ui.controls.ffb.smoothing2automatic"|translate}}</p>
              <md-checkbox ng-model="data.ffb.smoothing2automatic" ng-disabled="!data.isForceEnabled" bng-sound-class="bng_checkbox_generic"></md-checkbox>
            </md-list-item>

            <md-list-item layout style="margin-left:32px" ng-show="data.ffb.smoothing2automatic" ng-style="(!data.isForceEnabled || data.ffb.smoothing2automatic) && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.smoothing2.tooltip">
              <span flex="35">{{::"ui.controls.ffb.smoothing2"|translate}}</span>
              <md-slider ng-model="data.ffb.smoothing2autostr" flex min="0" max="500" step="10" ng-disabled="true" aria-label="_"></md-slider>
              <md-input-container class="bng-controls-aux-input">
                <input aria-label="_" type="number" min="0" max="500" step="10" ng-model="data.ffb.smoothing2autostr" ng-disabled="true">
              </md-input-container>
            </md-list-item>

            <md-list-item layout style="margin-left:32px" ng-show="!data.ffb.smoothing2automatic" ng-style="(!data.isForceEnabled || data.ffb.smoothing2automatic) && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.smoothing2.tooltip">
              <span flex="35">{{::"ui.controls.ffb.smoothing2"|translate}}</span>
              <md-slider ng-model="data.ffb.smoothing2" flex min="0" max="500" step="10" ng-disabled="!data.isForceEnabled || data.ffb.smoothing2automatic" aria-label="_"></md-slider>
              <md-input-container class="bng-controls-aux-input">
                <input aria-label="_" type="number" min="0" max="500" step="10" ng-model="data.ffb.smoothing2" ng-disabled="!data.isForceEnabled || data.ffb.smoothing2automatic">
              </md-input-container>
            </md-list-item>

        <md-list-item layout ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.updateRateLimit.tooltip">
          <p>{{:: "ui.controls.ffb.updateRateLimit" | translate}}</p>
          <md-select flex ng-model="data.ffb.frequency" ng-disabled="!data.isForceEnabled" aria-label="_" class="bng-select-fullwidth">
            <md-option value="0" md-no-ink>{{:: 'ui.controls.ffb.updateRateLimit.automatic' | translate}}</md-option>
            <md-option ng-repeat="i in [2000, 1500, 1250, 1000, 750, 600, 500, 400, 333, 250, 200, 150, 100, 75, 60, 50, 30]" value="{{i}}" md-no-ink>{{i}} Hz</md-option>
          </md-select>
        </md-list-item>

        <md-list-item layout ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.updateType.tooltip">
          <p>{{:: "ui.controls.ffb.updateType" | translate}}</p>
          <md-select flex ng-model="data.ffb.updateType" ng-disabled="!data.isForceEnabled" aria-label="_" class="bng-select-fullwidth">
            <md-option value="0" md-no-ink>{{:: "ui.controls.ffb.updateType.fast" | translate}}</md-option>
            <md-option value="1" md-no-ink>{{:: "ui.controls.ffb.updateType.slow" | translate}}</md-option>
          </md-select>
        </md-list-item>

        <md-list-item md-no-ink ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.responseCorrected.tooltip">
          <p>{{:: "ui.controls.ffb.responseCorrected" | translate}}</p>
          <md-checkbox ng-model="data.ffb.responseCorrected" ng-disabled="!data.isForceEnabled" bng-sound-class="bng_checkbox_generic"></md-checkbox>
        </md-list-item>
        <div ng-show="data.ffb.responseCorrected" ng-style="!data.isForceEnabled && {'opacity':'0.4'}" bng-tooltip="ui.controls.ffb.responseCorrected.tooltip">
          <div style="width:310px; height: 150px; position:relative; border: solid grey 2px; margin-left: 20px;">
            <canvas id="ffbResponseCurve" style="position:absolute; top:0px; left:0px; width:100%; height: 100%"></canvas>
          </div>
        </div>
      </md-list>`,
    link: function (scope, element, attrs) {
      scope.ffbResponseCurveRender = function() {
        var canvas = document.querySelector("[id=ffbResponseCurve]")
        var width = canvas.width
        var height = canvas.height
        var ctx = canvas.getContext("2d")

        var curve = scope.data.ffb.responseCurve
        var xrange = 0
        var yrange = 0
        var lastDeadzoneX = 0
        for (i in curve) {
          xrange = Math.max(curve[i][0], xrange)
          yrange = Math.max(curve[i][1], yrange)
          if (curve[i][1] <= 0) lastDeadzoneX = curve[i][0]
        }
        var lastDeadzoneScaledX = width*lastDeadzoneX/xrange

        var accent     = "rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][600].value.toString()+")"
        var accentLight= "rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][200].value.toString()+")"
        var accentLight2="rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][100].value.toString()+")"
        var primary    = "rgb("+mdx.mdxThemeColors._PALETTES['customPrimary'   ][400].value.toString()+")"
        var primaryLight="rgb("+mdx.mdxThemeColors._PALETTES['customPrimary'   ][100].value.toString()+")"
        var background = "rgb("+mdx.mdxThemeColors._PALETTES['customBackground'][400].value.toString()+")"
        var warn       = "rgb("+mdx.mdxThemeColors._PALETTES['customWarn'      ][400].value.toString()+")"

        // deadzone filled rectangle
        ctx.fillStyle = accentLight2
        ctx.fillRect(0,0, lastDeadzoneScaledX,height-1)

        // deadzone vertical line
        ctx.strokeStyle=accent
        ctx.lineWidth=1
        ctx.beginPath()
        ctx.moveTo(lastDeadzoneScaledX,height-1)
        ctx.lineTo(lastDeadzoneScaledX,0)
        ctx.stroke()


        // grid lines
        ctx.strokeStyle=primaryLight
        ctx.lineWidth=0.25
        var vtcells = 4
        var hzcells = 4
        var i
        for(i=0; i<vtcells; i++) {
            ctx.beginPath()
            ctx.moveTo(    0, i*height/vtcells)
            ctx.lineTo(width, i*height/vtcells)
            ctx.stroke()
        }
        for(i=0; i<hzcells; i++) {
            ctx.beginPath()
            ctx.moveTo(i*width/hzcells, 0)
            ctx.lineTo(i*width/hzcells, height)
            ctx.stroke()
        }

        // linear line, starting after deadzone
        ctx.strokeStyle=accentLight
        ctx.lineWidth=1
        ctx.beginPath()
        ctx.moveTo(lastDeadzoneScaledX,height-1)
        ctx.lineTo(width, 0)
        ctx.stroke()

        // deadzone text
        ctx.strokeStyle=accent
        ctx.lineWidth=1
        var textHeight = 11
        ctx.font = textHeight + "px sans-serif"
        var textSeparationY = textHeight
        var textSeparationX = lastDeadzoneScaledX+10
        ctx.beginPath()
        ctx.moveTo(lastDeadzoneScaledX,textSeparationY-textHeight*0.3)
        ctx.lineTo(textSeparationX-1, textSeparationY-textHeight*0.3)
        ctx.stroke()
        ctx.fillStyle = accent
        ctx.fillText("force deadzone: ~"+ Math.round(100*lastDeadzoneX/xrange) + "%", textSeparationX, textSeparationY)

        let lineWidth = 3

        // datapoint crosses
        var pointHeight = 5
        for (i in curve) {
          var x = curve[i][0]
          var y = curve[i][1]
          var scaledx = width*x/xrange
          var scaledy = height-height*y/yrange
          ctx.strokeStyle=primary
          ctx.lineWidth=1
          ctx.beginPath()
              ctx.moveTo(scaledx, scaledy+lineWidth/2+pointHeight/2)
              ctx.lineTo(scaledx, scaledy-lineWidth/2-pointHeight/2)
          ctx.stroke()
        }

        // datapoints curve
        ctx.moveTo(0,height-1)
        ctx.strokeStyle=accent; // good for line, leave as is
        ctx.lineWidth=lineWidth
        ctx.beginPath()
        for (i in curve) {
            var x = curve[i][0]
            var y = curve[i][1]
            var scaledx = width*x/xrange
            var scaledy = height-height*y/yrange
            ctx.lineTo(scaledx, scaledy)
        }
        ctx.stroke()
      }
      scope.ffbResponseCurveRender()

      scope.uidata = {}
      Utils.mapUI(scope.data, scope.uidata, "ffb.gforceCoef", v=>Math.round(v*100), v=>v/100); //0-0.2 => 0-20%
      Utils.mapUI(scope.data, scope.uidata, "ffb.softlockForce", v=>Math.round(v*100), v=>v/100); //0-1 => 0-100%
      Utils.mapUI(scope.data, scope.uidata, "logitechVibrotactileCoef", v=>Math.round(v*100), v=>v/100); //0-2 => 0-200%
      scope.uidata.logitechVibrotactileFreqMinRange = Math.log10(scope.data.logitechVibrotactileFreqMaxUIRangeMin)
      scope.uidata.logitechVibrotactileFreqMaxRange = Math.log10(scope.data.logitechVibrotactileFreqMaxUIRangeMax)
      Utils.mapUI(scope.data, scope.uidata, "logitechVibrotactileFreqMax", v=>Math.log10(v), v=>Math.pow(10, v)); // linear to logarithmic scale, useful when the possible range goes into the thousands (which may or may not be the case here anymore)

      function smoothing2() {
        if (scope.data.ffb.smoothing2automatic) {
          // IMPORTANT: these equation exist in 3 places in hydros.lua, 1 places in options.js, and 1 place in bindings.lua
          //scope.data.ffb.smoothing2 = Math.round((Math.max(5000, (500 - scope.data.ffb.smoothing * 0.7) * 100 + 5000) - 500) / 109 / 10) * 10;
        }
        scope.data.ffb.smoothing2autostr = Math.round((Math.max(5000, (500 - scope.data.ffb.smoothing * 0.7) * 100 + 5000) - 500) / 109 / 10) * 10;
      }
      function smoothingAutoToggle() {
        // things happening when autosmoothing is toggled on/off that go here
        scope.data.ffb.smoothing2autostr = Math.round((Math.max(5000, (500 - scope.data.ffb.smoothing * 0.7) * 100 + 5000) - 500) / 109 / 10) * 10;
      }
      scope.$watch("data.ffb.smoothing2automatic", smoothingAutoToggle);
      scope.$watch("data.ffb.smoothing", smoothing2);
    }
  }
}])

// Options shown when editing an axis-type control.
.directive('axisOptions', ['mdx', function (mdx) {
  return {
    replace: true,
    scope: { data: '=', isCentered: '<iscentered', action: '=' },
    template: `
    <md-list>
      <!-- 1:1 matching angle -->
      <md-list-item layout ng-if="action == 'steering'" bng-tooltip="ui.controls.angle.tooltip">
          <span flex="35">{{:: "ui.controls.angle" | translate}}</span>
          <md-slider ng-model="data.details.angle" flex min="0" max="2520" step="10" aria-label="_"></md-slider>
          <md-input-container class="bng-controls-aux-input">
          <input aria-label="_" type="number" min="0" max="6000" step="10" ng-model="data.details.angle">
        </md-input-container>
      </md-list-item>

      <!-- 1:1 matching behaviour -->
      <md-list-item layout ng-if="action == 'steering'" ng-style="data.details.angle <= 0 && {'opacity':'0.4'}" bng-tooltip="ui.controls.lockTypes.tooltip">
        <span flex="40">{{:: "ui.controls.lockType" | translate}}</span>
        <span style="opacity:0.4;" ng-if="data.details.angle <=0" flex>{{:: "ui.controls.lockTypes.disabled" | translate}}</span>
        <md-select ng-if="data.details.angle > 0" flex ng-model="data.details.lockType" aria-label="_" class="bng-select-fullwidth">
          <md-option value="1" md-no-ink>{{:: "ui.controls.lockTypes.1" | translate}}</md-option>
          <md-option value="2" md-no-ink>{{:: "ui.controls.lockTypes.2" | translate}}</md-option>
          <md-option value="3" md-no-ink>{{:: "ui.controls.lockTypes.3" | translate}}</md-option>
          <md-option value="0" md-no-ink>{{:: "ui.controls.lockTypes.0" | translate}}</md-option>
        </md-select>
      </md-list-item>

      <div style="width:310px; height: 150px; position:relative; border: solid grey 2px; margin-left: 20px;">
        <canvas id="inputResponseCurve" style="position:absolute; top:0px; left:0px; width:100%; height: 100%"></canvas>
      </div>

      <md-list-item md-no-ink bng-tooltip="Use if the binding does the opposite than it should.[br][br]For example, when lifting the throttle pedal accelerates the car, or when turning left moves the car to the right.">
        <p>Inverted Axis</p>
        <md-checkbox ng-model="data.details.isInverted" ng-change="inputResponseCurveRender()" bng-sound-class="bng_checkbox_generic"></md-checkbox>
      </md-list-item>

      <md-list-item layout bng-tooltip="Greater values mean finer grained response in the center, at the expense of a worse response near the limit. Use 1 for steering wheels.">
        <span flex="30">Linearity</span>
        <md-slider ng-change="inputResponseCurveRender()" ng-model="data.details.linearity" flex min="0.1" max="5" step="0.1" aria-label="_"></md-slider>
        <md-input-container class="bng-controls-aux-input">
          <input aria-label="_" type="number" min="0.1" max="5" step="0.1" ng-model="data.details.linearity" ng-change="inputResponseCurveRender()">
        </md-input-container>
      </md-list-item>

      <md-list-item layout bng-tooltip="Use when the resting position is still triggering an action.[list][*]Typical values are 0.1 to 0.25 for gamepad sticks.[*]Use 0 for steering wheels.[*]For pedals and gamepad triggers, you shouldn't normally need any deadzone. If you do, consider calibrating the device axis following the instructions of the manufacturer.[/list]">
        <span flex="30">Deadzone (rest)</span>
        <md-slider ng-model="data.details.deadzoneResting" ng-change="inputResponseCurveRender()" flex min="0" max="1" step="0.025" aria-label="_"></md-slider>
        <md-input-container class="bng-controls-aux-input" >
          <input aria-label="_" type="number" min="0" max="1" step="0.025" ng-model="data.details.deadzoneResting" ng-change="inputResponseCurveRender()">
        </md-input-container>
      </md-list-item>
      <md-list-item layout bng-tooltip="Use when you cannot reach all the axis travel range. For example, flooring the throttle does not reflect as 100% throttle in-game.[br][br]If you need to use a value greater than 0, consider instead calibrating the device axis following the instructions of the manufacturer.">
        <span flex="30">Deadzone (end)</span>
        <md-slider ng-model="data.details.deadzoneEnd" ng-change="inputResponseCurveRender()" flex min="0" max="1" step="0.025" aria-label="_"></md-slider>
        <md-input-container class="bng-controls-aux-input" >
          <input aria-label="_" type="number" min="0" max="1" step="0.025" ng-model="data.details.deadzoneEnd" ng-change="inputResponseCurveRender()">
        </md-input-container>
      </md-list-item>
    </md-list>`,
    link: function (scope, element, attrs) {
      var applyFilters = function(value, filter, isCentered) {
          var deadzoneResting = Math.max(0, filter.deadzoneResting)
          var deadzoneEnd = Math.max(0, filter.deadzoneEnd)
          var x = value
          var linearity = Math.max(0.1, filter.linearity)
          if (filter.isInverted) {
              x = 1.0 - x
              value = 1.0 - value
          }
          if (isCentered) {
              value = value * 2.0 - 1.0; // means converting from [0..+1] to [-1..+1]
          }
          if (value >= -deadzoneResting && value <= deadzoneResting) {
              value = 0.0
          } else {
              if (value >= 0.0) value = (value - deadzoneResting) / (1.0 - deadzoneResting - deadzoneEnd)
              else              value = (value + deadzoneResting) / (1.0 - deadzoneResting - deadzoneEnd)
          }
          value = (value < 0.0 ? -1.0 : 1.0) * Math.min(1, Math.pow(Math.abs(value), linearity))
          return [x, value]
      }
      var lastRawValue = scope.isCentered ? 1/2 : 0
      scope.$on('RawInputChanged', function (event, data) {
        if (scope.data.device == data.devName && scope.data.details.control == data.control) {
            lastRawValue = data.value
            scope.inputResponseCurveRender()
        }
      })
      scope.inputResponseCurveRender = function() {
        var canvas = document.querySelector("[id=inputResponseCurve]")
        var width = canvas.width
        var height = canvas.height
        var ctx = canvas.getContext("2d")

        var curve = []
        var dzRestingRaw = Math.max(0,scope.data.details.deadzoneResting)
        var dzEndRaw = Math.max(0,scope.data.details.deadzoneEnd)
        var deadzoneEnd = dzEndRaw
        var deadzoneResting = dzRestingRaw
        if (scope.isCentered) deadzoneResting = (deadzoneResting + 1) / 2
        if (scope.isCentered) deadzoneEnd /= 2
        var data = scope.data.details
        var i = 0
        var x = 0
        for(x=0; x<=1.0001; x += 0.01) {
            var point = applyFilters(x, data, scope.isCentered)
            curve[i++] = point
        }

        var xrange = 1
        var yrange = 1
        var dzRestingEndScaled = width*deadzoneResting/xrange
        var dzEndEndScaled = width-(width*deadzoneEnd/xrange)
        var dzRestingBeginScaled = -dzRestingEndScaled
        if (scope.isCentered) dzRestingBeginScaled = width - dzRestingEndScaled

        var accent     = "rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][600].value.toString()+")"
        var accentLight= "rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][200].value.toString()+")"
        var accentLight2="rgb("+mdx.mdxThemeColors._PALETTES['customAccent'    ][100].value.toString()+")"
        var primary    = "rgb("+mdx.mdxThemeColors._PALETTES['customPrimary'   ][400].value.toString()+")"
        var primaryLight="rgb("+mdx.mdxThemeColors._PALETTES['customPrimary'   ][100].value.toString()+")"
        var background = "rgb("+mdx.mdxThemeColors._PALETTES['customBackground'][400].value.toString()+")"
        var warn       = "rgb("+mdx.mdxThemeColors._PALETTES['customWarn'      ][400].value.toString()+")"
        var white = "rgb("+mdx.mdxThemeColors._PALETTES['customBackground'][100].value.toString()+")"

        // redraw from scratch
        ctx.clearRect(0, 0, width, height)

        // deadzone filled rectangle
        ctx.fillStyle = accentLight2
        // resting deadzone
        ctx.fillRect(dzRestingBeginScaled,0, dzRestingEndScaled-dzRestingBeginScaled,height-1)
        // end deadzone
        ctx.fillRect(dzEndEndScaled,0, width,height-1)
        if (scope.isCentered) ctx.fillRect(0,0, width-dzEndEndScaled,height-1)

        // deadzone vertical lines
        ctx.strokeStyle=accent
        ctx.lineWidth=1
        ctx.beginPath()
        // resting deadzone
        ctx.moveTo(dzRestingBeginScaled,height-1)
        ctx.lineTo(dzRestingBeginScaled,0)
        ctx.moveTo(dzRestingEndScaled,height-1)
        ctx.lineTo(dzRestingEndScaled,0)
        // end deadzone
        ctx.moveTo(dzEndEndScaled,height-1)
        ctx.lineTo(dzEndEndScaled,0)
        if (scope.isCentered) {
            // resting deadzone
            ctx.moveTo(width/2,height-1)
            ctx.lineTo(width/2,0)
            // end deadzone
            ctx.moveTo(width-dzEndEndScaled,height-1)
            ctx.lineTo(width-dzEndEndScaled,0)
        }
        ctx.stroke()


        // grid lines
        ctx.strokeStyle=primaryLight
        ctx.lineWidth=0.25
        var vtcells = 4
        var hzcells = 4
        for(i=0; i<vtcells; i++) {
            ctx.beginPath()
            ctx.moveTo(    0, i*height/vtcells)
            ctx.lineTo(width, i*height/vtcells)
            ctx.stroke()
        }
        for(i=0; i<hzcells; i++) {
            ctx.beginPath()
            ctx.moveTo(i*width/hzcells, 0)
            ctx.lineTo(i*width/hzcells, height)
            ctx.stroke()
        }

        // linear lines, starting after deadzone
        ctx.strokeStyle=accentLight
        ctx.lineWidth=1
        ctx.beginPath()
        if (scope.isCentered) {
            ctx.moveTo(width-dzEndEndScaled,0)
            ctx.lineTo(dzRestingBeginScaled, height-1)
        }
        ctx.moveTo(dzRestingEndScaled,height-1)
        ctx.lineTo(dzEndEndScaled, 0)
        ctx.stroke()

        // deadzone text
        ctx.strokeStyle=accent
        ctx.lineWidth=1
        var textHeight = 11
        ctx.font = textHeight + "px sans-serif"
        ctx.fillStyle = accent
        var textSeparationY = textHeight
        var textSeparationX = dzRestingEndScaled+10
        // resting deadzone
        if (dzRestingRaw != 0) {
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(dzRestingEndScaled,textSeparationY*2-textHeight*0.3)
            ctx.lineTo(textSeparationX-1, textSeparationY*2-textHeight*0.3)
            ctx.stroke()
            var dzRestingText = "deadzone: " + Math.round(100*dzRestingRaw/xrange) + "%"
            ctx.fillText(dzRestingText, textSeparationX, textSeparationY*2)
            ctx.restore()
        }
        // end deadzone
        if (dzEndRaw != 0) {
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(dzEndEndScaled,textSeparationY-textHeight*0.3)
            ctx.lineTo(dzEndEndScaled-10, textSeparationY-textHeight*0.3)
            ctx.stroke()
            ctx.textAlign = "right"
            var dzEndText = "deadzone: " + Math.round(100*dzEndRaw/xrange) + "%"
            ctx.fillText(dzEndText, dzEndEndScaled-10, textSeparationY)
            ctx.restore()
        }

        // legend text
        ctx.save()
        ctx.strokeStyle=accentLight
        ctx.translate(0, 0)
        ctx.textAlign = "right"
        var outputLabel = "output"
        var point = applyFilters(lastRawValue, data, scope.isCentered)
        var x = point[0], y = point[1]
        outputLabel += ": " + Math.round(y*100) + "%"
        ctx.fillText(outputLabel, width-8, height-textHeight*0.3)
        ctx.restore()

        // datapoints curve
        if (scope.isCentered) ctx.moveTo(0,0)
        else ctx.moveTo(0,height-1)
        ctx.strokeStyle=accent; // good for line, leave as is
        ctx.lineWidth=3
        ctx.beginPath()
        for (i in curve) {
            var x = curve[i][0]
            var y = curve[i][1]
            if (y < 0) y *= -1
            var scaledx = width*x/xrange
            var scaledy = height-height*y/yrange
            ctx.lineTo(scaledx, scaledy)
        }
        ctx.stroke()

        // current output, highlighted with a cross
        var point = applyFilters(lastRawValue, data, scope.isCentered)
        var x = point[0], y = point[1]
        var ox = 0
        if (scope.isCentered) ox = 1 / 2
        var oy = 0
        ctx.lineTo(width/2,0)
        if (y < 0) y *= -1
        var scaledx = width*x/xrange
        var scaledy = height-height*y/yrange
        var scaledox = width*ox/xrange
        var scaledoy = height-height*oy/yrange

        // overall cross
        ctx.lineWidth=1
        ctx.strokeStyle=accentLight
        ctx.beginPath()
          ctx.moveTo(scaledx, 0)
          ctx.lineTo(scaledx, height)
          ctx.moveTo(0,      scaledy)
          ctx.lineTo(width,  scaledy)
        ctx.stroke()

        // trunk line
        ctx.strokeStyle=accent
        ctx.lineWidth=3
        ctx.beginPath()
          ctx.moveTo(scaledx, scaledoy)
          ctx.lineTo(scaledx, scaledy)
        ctx.stroke()

        // circle perimeter
        ctx.lineWidth=2
        ctx.beginPath()
          ctx.fillStyle = white
          ctx.arc(scaledx, scaledy, 4, 0, 2 * Math.PI)
          ctx.fill()
        ctx.stroke()

      }
      scope.inputResponseCurveRender()
    }
  }
}])


.factory('ControlsUtils', ['$filter', '$log', '$q', '$rootScope', 'controlsContents', '$translate', '$timeout', '$sanitize', '$sce', 'Utils', function ($filter, $log, $q, $rootScope, controlsContents, $translate, $timeout, $sanitize, $sce, Utils) {
  var _captureHelper = {
    devName: null,
    stopListening: null
  }

  // [ Listeners ]
  // This is done here, so other modules can use the service and cache object, whithout having to
  // The service listens constantly for 2 events:
  //  1. ControllersChanged in order to list all the currently available devices in the Hardware tab
  //  2. InputBindingsChanged in order to populate the bindings listings in Bindings tab


  let updateDeviceNotes = function() {
    $rootScope.$evalAsync(function () {
      for (var i in controlsContents.bindings) {
        let v = controlsContents.bindings[i].contents
        for (var j in controlsContents.controllers) {
          let w = controlsContents.controllers[j]
          if (v.vidpid == w.vidpid) {
            w.notes = v.notes
            break
          }
        }
      }
    })
  }

  $rootScope.$on('ControllersChanged', function (event, data) {
    $rootScope.$evalAsync(function () {
      controlsContents.controllers = data
      updateDeviceNotes()
    })
  })
  $rootScope.$on('AssignedPlayersChanged', function (event, data) {
    $rootScope.$evalAsync(function () {
      controlsContents.players = data
    })
  })

  let lastBindingsData = null

  $rootScope.$on('InputBindingsChanged', function (event, data) {
    $rootScope.$evalAsync(function () {

      let newBindingsData = JSON.stringify(data)
      if (lastBindingsData == newBindingsData) return
      lastBindingsData = newBindingsData

      // relates to issue GE-1903 - where the scroll position is lost on the reload
      let
        bindings_list = document.getElementById('binding_list'),
        bindings_list_parent = bindings_list ? bindings_list.parentElement : {},
        bindings_scroll_top = bindings_list_parent.scrollTop || 0

      // sometimes bindings[deviceIndex].contents.bindings is an object instead of an array!
      // should be fixed, but let's cover this up until then.
      // NOTE: This is really REALLY bad.
      for (var _device in data.bindings) {
        if (!Array.isArray(data.bindings[_device].contents.bindings)) {
          var backup = angular.copy(data.bindings[_device].contents.bindings)
          data.bindings[_device].contents.bindings = []
          for (var key in backup) {
            data.bindings[_device].contents.bindings.push(backup[key])
          }
        }
      }

      controlsContents.categories = data.actionCategories

      controlsContents.bindingTemplate = data.bindingTemplate
      controlsContents.bindings   = data.bindings
      // remove bindings from same-type devices. this avoids displaying an XBOX gamepad binding 4 times when you connect 4 gamepads
      controlsContents.bindingsUniqueDevices =  {}
      controlsContents.bindingsFilled =  {}
      for (var i in data.bindings) {
        let v = data.bindings[i].contents
        let type = (v.devicetype == "mouse" || v.devicetype == "keyboard") ? v.devicetype : v.vidpid.toLowerCase()
        controlsContents.bindingsUniqueDevices[type] = data.bindings[i]
        for (var j in v.bindings) {
          var b = v.bindings[j]
          controlsContents.bindingsFilled[b.action] = true
        }
      }

      // order the devices, so we display e.g. gamepad bindings rather than keyboard bindings, if both kinds of devices are plugged
      const orderedDevtypes = [ "wheel", "joystick", "xinput", "gamepad", "mouse", "keyboard" ]
      controlsContents.bindings.sort(
        function(a,b) {
          // first get devicetype from device name (remove trailing numbers, xinput4 --> xinput)
          let dt1 = a.devname.replace(/\d+$/, '')
          let dt2 = b.devname.replace(/\d+$/, '')
          return orderedDevtypes.indexOf(dt1) - orderedDevtypes.indexOf(dt2)
        }
      )


      // Normally, the key in data actions is the action name. However, in vehicle specific
      // bindings, the key is of the form {vehicle}__actionName, so get the actionName field
      // from the object to be sure.
      controlsContents.actions = {}
      for (var x in data.actions) {
        controlsContents.actions[x] = angular.merge({actionName: x}, data.actions[x])
      }


      for (var device in data.bindings) {
        controlsContents.bindings[device].icon = service.deviceIcon(data.bindings[device].devname)
      }
      for (var device in data.bindingsUniqueDevices) {
        controlsContents.bindingsUniqueDevices[device].icon = service.deviceIcon(data.bindingsUniqueDevices[device].devname)
      }

      // Refactor categories & actions
      for (var c in controlsContents.categories) {
        controlsContents.categories[c].actions = []
      }

      for (var action in controlsContents.actions) {
        var obj = angular.merge({key: action}, controlsContents.actions[action])
        if (! (controlsContents.actions[action].cat in controlsContents.categories)) {
            controlsContents.categories[controlsContents.actions[action].cat] = { "order":99, "icon":"symbol_exclamation", "title":"UNDEFINED CATEGORY: "+controlsContents.actions[action].cat, "desc":"", "actions":[] }
        }
        controlsContents.categories[ controlsContents.actions[action].cat ].actions.push(obj)
      }


      controlsContents.categoriesList = []
      Object.keys(controlsContents.categories).map(function (category) {
        controlsContents.categoriesList.push(angular.merge({key: category}, controlsContents.categories[category]))
      })


      for (var x in controlsContents.categoriesList) {
        for (var y in controlsContents.categoriesList[x].actions) {
          controlsContents.categoriesList[x].actions[y].titleTranslated = $translate.instant(controlsContents.categoriesList[x].actions[y].title)
          controlsContents.categoriesList[x].actions[y].descTranslated = $translate.instant(controlsContents.categoriesList[x].actions[y].desc)
        }
      }

      // GE-1903 - restore bindings list scroll position to what it was before the refresh
      setTimeout(()=>bindings_list_parent.scrollTop = bindings_scroll_top, 0)

      updateDeviceNotes()
    })
  })

  bngApi.engineLua('extensions.core_input_bindings.notifyUI("controls utils service needs the data")')


  var service = {
    findBindingForAction: function (action, devname) {
      // controlsContents.bindings has been pre-ordered already by device type priority (e.g. display xinput bindings before keyboard bindings, if both device are connected)
      const len = controlsContents.bindings.length
      for (var i = 0; i < len; i++) {
        let b = controlsContents.bindings[i]
        if (devname !== undefined && devname !== b.devname) break

        let toSearch = b.contents.bindings.map((x) => x.action)
        let index = toSearch.indexOf(action)
        if (index !== -1) {
          let help = this.getBindingDetails(b.devname, b.contents.bindings[index].control, action)
          help.devname = b.devname
          return help
        }
      }
      return undefined
    },

    getBindingDetails: function (device, control, action) {
      var deviceBindings = $filter('filter')(controlsContents.bindings, {devname: device}, true)[0].contents.bindings
        , details = $filter('filter')(deviceBindings, {control: control, action: action}, true)[0] || service.defaultBindingEntry(action, control)
        , common =
        //TODO
          { icon: this.deviceIcon(device)
          , title: controlsContents.actions[action].title
          , desc: controlsContents.actions[action].desc
          }

      return angular.merge({}, controlsContents.bindingTemplate, details, common)
    },

    // A template object for use when editing a binding
    defaultBindingEntry: function (action, control) {
      var tmpl = angular.copy(controlsContents.bindingTemplate)
      tmpl.action  = action
      tmpl.control = control
      return tmpl
    },

    isAxis: function (device, control) {
      if (controlsContents.controllers[device].controls[control])
        return controlsContents.controllers[device].controls[control]['control_type'] === 'axis'
      return false
    },

    deviceIcon: function (devName) {
      devName = devName || ''
      switch (devName.slice(0, 3)) {
        case 'key': return 'keyboard' //keyboard
        case 'mou': return 'mouse'  //mouse
        case 'vin': return 'phone_android' // vinput
        case 'whe': return 'radio_button_on' //wheel
        case 'gam': return 'videogame_asset' //gamepad
        case 'xin': return 'videogame_asset' //xinput
        default:    return 'gamepad'   // joystick and others
      }
    },

    deviceNames: function () {
      return controlsContents.bindings.map((elem) => elem.devname)
    },

    // A conflicting binding refers to the same control of the same device, and the two actions belong to the same actionMap.
    // returns an array of the conflicting bindings
    bindingConflicts: function (device, control, action) {
      var device = $filter('filter')(controlsContents.bindings, {devname: device})[0]
        , others = $filter('filter')(device.contents.bindings, {control: control}, true)
        , conflicts = []


      for (var i in others) {
        if (others[i].action != action)
          conflicts.push({ binding: others[i], resolved: false })
      }

      return conflicts
    },

    // Captures user input.
    captureBinding: function (devName) {
      var controlCaptured = false
        , eventsRegister = {}
        , d = $q.defer()


      var capturingBinding = true
      bngApi.engineLua("ActionMap.enableInputCommands(false)") // prevent keypresses from running their bound actions (such as ESC keypress closing the entire menu when you attempt to rebind it)

      _captureHelper.stopListening = $rootScope.$on('RawInputChanged', function (event, data) {
        if (!capturingBinding) return; // Not trying to capture bindings, ignore
        if (controlCaptured) return; // No business listening to incoming events.

        var devName = data.devName
        if (! eventsRegister[devName]) {
          eventsRegister[devName] = { axis: {}, button: {}, key: [null, null] }
        }

        d.notify(eventsRegister)
        var valid = false

        // Register the received input. The control types are handled
        // separately, because different criteria apply to each one of them.
        switch(data['controlType']) {
          case 'axis':
            var detectionThreshold = data.devName.startsWith('mouse')? 1 : 0.5
            if (! eventsRegister[devName].axis[data.control]) {
              eventsRegister[devName].axis[data.control] = { first: data.value, last: data.value, accumulated: 0 }
            } else {
              eventsRegister[devName].axis[data.control].accumulated += Math.abs(eventsRegister[devName].axis[data.control].last - data.value)/detectionThreshold
              eventsRegister[devName].axis[data.control].last = data.value
            }

            // If we are working with axes (i.e. the axis property has been populated) we
            // should be a little strict because there will probably be noise (mouse movements
            // are a perfect example). The criterion is if there is *enough* accumulated motion
            valid = eventsRegister[devName].axis[data.control].accumulated >= 1
            break

          case 'button':
          case 'pov':
            if (!eventsRegister[devName].button[data.control])
              eventsRegister[devName].button[data.control] = 1
            else
              eventsRegister[devName].button[data.control] += 1

            // Buttons are the easiest, we just have to listen to 2 events of
            // the same button (i.e. an on-off event cycle).
            valid = eventsRegister[devName].button[data.control] > 1
            break

          case 'key':
            eventsRegister[devName].key.push(data.control)
            eventsRegister[devName].key = eventsRegister[devName].key.slice(-2)

            // Keys are easy too but not as trivial as buttons, because there can be
            // key combinations. We keep track of the last two key events, if they
            // coincide (again an on-off event cycle, like the case with buttons), we
            // can assign the control.
            valid = eventsRegister[devName].key[0] == eventsRegister[devName].key[1]
            break
          default:
            $log.error("Unrecognized raw input controlType: %o", data)
        }

        // Want to blacklist something? Put it here!
        if (valid) {
          // No right mouse click
          if(data.devName.startsWith('mouse') && data.control == 'button1')
            valid = false
        }

        if (valid) {
          controlCaptured = true
          capturingBinding = false
          bngApi.engineLua("ActionMap.enableInputCommands(true)")
          data.direction = data['controlType'] == 'axis' ? Math.sign(eventsRegister[devName].axis[data.control].last - eventsRegister[devName].axis[data.control].first) : 0
          d.resolve(data)
          _captureHelper.stopListening()
        }
      })

      return d.promise
    },

    removeBinding: function (device, control, action, mockSave) {
      var deviceContents = angular.copy($filter('filter')(controlsContents.bindings, {devname: device}, true)[0].contents)
      var entry = $filter('filter')(deviceContents.bindings, {control: control, action: action}, true)[0] || null
      if (!entry) return


      var index = deviceContents.bindings.indexOf(entry)
      deviceContents.bindings.splice(index, 1)

      if (mockSave) {
        var deviceIndex
        for (deviceIndex = 0; deviceIndex < controlsContents.bindings.length; deviceIndex++) {
          if (controlsContents.bindings[deviceIndex].devname === device)
            break
        }

        controlsContents.bindings[deviceIndex].contents = deviceContents

      } else {
        bngApi.serializeToLuaCheck(deviceContents.name) // log potential errors in computers set to non-english language
        bngApi.engineLua(`extensions.core_input_bindings.saveBindingsToDisk(${bngApi.serializeToLua(deviceContents)})`)
      }
    },

    addBinding: function (device, bindingData, replace, mockSave) {
      var deviceContents = angular.copy($filter('filter')(controlsContents.bindings, {devname: device}, true)[0].contents)
      if (replace) {
        var deprecated = $filter('filter')(deviceContents.bindings, {control: bindingData.details.control, action: bindingData.details.action}, true)[0]
        var index = deviceContents.bindings.indexOf(deprecated)
        deviceContents.bindings[index] = bindingData
      } else {
        deviceContents.bindings.push(bindingData)
      }
      bngApi.serializeToLuaCheck(deviceContents.name) // log potential errors in computers set to non-english language
      bngApi.engineLua(`extensions.core_input_bindings.saveBindingsToDisk(${bngApi.serializeToLua(deviceContents)})`)
    },

    isFfbBound: function () {
      for (var i = 0; i<controlsContents.bindings.length; i++) {
        let b = controlsContents.bindings[i]
        if (b.devname.slice(0, 3) === 'key') continue
        if (b.devname.slice(0, 3) === 'mou') continue

        let bs = b.contents.bindings
        for (var j = 0; j<bs.length; j++) {
          if (bs[j].action === 'steering') return true
        }
      }
      return false
    },

    isFfbEnabled: function () {
      for (var i = 0; i<controlsContents.bindings.length; i++) {
        let b = controlsContents.bindings[i]
        if (b.devname.slice(0, 3) === 'xin') continue // skip xinput vibration gamepads
        let bs = b.contents.bindings
        for (var j = 0; j<bs.length; j++) {
          let c = bs[j]
          if (c.action === 'steering' && c.isForceEnabled) return true
        }
      }
      return false
    },

    isFfbCapable: function () {
      for (var device in controlsContents.controllers) {
        if (controlsContents.controllers[device].ffbAxes && Object.keys(controlsContents.controllers[device].ffbAxes).length > 0)
          return true
      }

      return false
    },

    isWheelFound: function(vendorId) {
      for (var i = 0; i<controlsContents.bindings.length; i++) {
        let b = controlsContents.bindings[i]
        if (b.devname.slice(0, 3) === 'whe') {
          const vid = b.contents.vidpid.slice(4,8)
          if (vid == vendorId) return true
        }
      }
      return false
    },

    isPidVidFound: function(desiredVid, desiredPid) {
      for (var i = 0; i<controlsContents.bindings.length; i++) {
        const vid = desiredVid === undefined ? desiredVid : controlsContents.bindings[i].contents.vidpid.slice(4,8)
        const pid = desiredPid === undefined ? desiredPid : controlsContents.bindings[i].contents.vidpid.slice(0,4)
        const vidFound = vid == desiredVid
        const pidFound = pid == desiredPid
        if (vidFound && pidFound) return true
      }
      return false
    },
  }

  return service
}])


.controller('ControlsController', ['$scope',  '$rootScope', 'controlsContents', 'ControlsUtils', '$translate',
function ($scope, $rootScope, controlsContents, ControlsUtils, $translate) {
  var vm = this
  vm.data = controlsContents
  $scope.$parent.fullscreenOptions = true
  $scope.$parent.controlsScreen = true

  $rootScope.$on("bngTooltipValue", function (event, data, inside) {
    let value = ""
    let key = ""
    try {
      let parsed = JSON.parse(data)
      value = parsed.value
      key = parsed.key
    } catch (err) {
      value = data
      key = "bngTooltipValue"
    }

    $scope.$evalAsync(function () {
      vm[key] = inside ? value : ""
    })
  })

  $scope.$evalAsync(function () {
    for (let x in vm.data.categoriesList) {
      for (let y in vm.data.categoriesList[x].actions) {
        const act = vm.data.categoriesList[x].actions[y];
        act.titleTranslated = $translate.instant(controlsContents.categoriesList[x].actions[y].title)
        act.descTranslated = $translate.instant(controlsContents.categoriesList[x].actions[y].desc)
      }
    }
  })

  $scope.$on('$destroy', () => {
    $scope.$parent.controlsScreen = false
  })

}])


.controller('ControlsBindingsCtrl', ['$state', 'ControlsUtils', 'ConfirmationDialog', function ($state, ControlsUtils, ConfirmationDialog) {
  var _bindingData = { device: '', deviceIcon: '', details: {}, isAxis: false }

  var vm = this
  vm.fActions = {}; // Placeholder for filtered actions (populated by ng-repeat directive in the controls-bindings.html template)

  vm.select = function (action, device, control) {
    $state.go('menu.options.controls.bindings.edit', { action: action, oldBinding: {device: device, control: control, sel: angular.copy(_bindingData)} })
  }

  vm.resetBindings = function (deviceName, productName) {
    let additionalText = "<br>" + productName
    ConfirmationDialog.open(
      'ui.controls.bindings.resetTitle', 'ui.controls.bindings.resetBody',
      [
        { label: "ui.common.continue", key: true, default: false },
        { label: "ui.common.cancel", key: false, default:true, isCancel: true }
      ], {class:'brokenModPrompt'}, additionalText
    ).then((res) => {
      if (res === false) return
      if (deviceName === undefined) bngApi.engineLua(`extensions.core_input_bindings.resetBindings()`)
      else                          bngApi.engineLua(`extensions.core_input_bindings.resetBindings("${deviceName}")`)
    })
  }

}])

.controller('ControlsEditCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'controlsContents', 'ControlsUtils', 'InputCapturer',
 function ($scope, $rootScope, $state, $stateParams, controlsContents, ControlsUtils, InputCapturer) {
  var vm = this
  var listeningTimeout
  vm.hardcodedAutoselectFilter = 2

  vm.action = controlsContents.actions[$stateParams.action]

  vm.oldBinding = $stateParams.oldBinding.sel || {}
  if ($stateParams.oldBinding.device && $stateParams.oldBinding.control) {
    vm.oldBinding.device = $stateParams.oldBinding.device,
    vm.oldBinding.deviceIcon = ControlsUtils.deviceIcon($stateParams.oldBinding.device),
    vm.oldBinding.details = ControlsUtils.getBindingDetails($stateParams.oldBinding.device, $stateParams.oldBinding.control, $stateParams.action),
    vm.oldBinding.isAxis = ControlsUtils.isAxis($stateParams.oldBinding.device, $stateParams.oldBinding.control)
  }

  vm.newBinding = angular.copy(vm.oldBinding)

  vm.conflicts = []
  vm.listening = {data: '', status: 0}

  var getConflicts = function () {
    vm.conflicts = ControlsUtils.bindingConflicts(vm.newBinding.device, vm.newBinding.details.control, vm.action.actionName).map(function (x) {
      return {device: vm.newBinding.device, control: vm.newBinding.details.control, action: x.binding.action, description: controlsContents.actions[x.binding.action].desc, title: controlsContents.actions[x.binding.action].title, resolved: false }
    })
  }

  vm.captureBinding = function () {
    $scope.$evalAsync(function () { vm.listening.status = -1; })

    listeningTimeout = setTimeout(function () {
      $scope.$evalAsync(function () { vm.listening.status = 1; })

      ControlsUtils.captureBinding().then(
      function (result) {
        $scope.$evalAsync(function () {
          vm.listening.status = 0

          vm.newBinding.device = result.devName
          vm.newBinding.deviceIcon = ControlsUtils.deviceIcon(result.devName)
          vm.newBinding.details = angular.merge({control: result.control}, controlsContents.bindingTemplate)
          vm.newBinding.isAxis = ControlsUtils.isAxis(result.devName, result.control)

          getConflicts()
        })
      }, function (error) {
        // EMPTY CALLBACK (no rejection)
      }, function (eventsRegister) {
        $scope.$evalAsync(function () {
          vm.listening.data = eventsRegister
        })
      })
    }, 300)
  }

  vm.deleteBinding = function () {
    ControlsUtils.removeBinding(vm.newBinding.device, vm.newBinding.details.control, vm.action.actionName)
    $state.go('^')
  }

  vm.cancel = function () {
    // $state.go('menu.options.controls.bindings')
  }

  vm.apply = function () {
    if (vm.oldBinding.device) {
      ControlsUtils.removeBinding(vm.oldBinding.device, vm.oldBinding.details.control, vm.action.actionName, vm.oldBinding.device == vm.newBinding.device)
    }

    vm.conflicts.map(function (x) {
      if (x.resolved) ControlsUtils.removeBinding(x.device, x.control, x.action, true)
    })

    ControlsUtils.addBinding(vm.newBinding.device, angular.merge({action: vm.action.actionName}, vm.newBinding.details))
  }

  // ON START
  bngApi.engineLua('WinInput.setForwardRawEvents(true)')
  getConflicts()

  if (!vm.oldBinding.device) { vm.captureBinding(); }

  // register preventer
  const captureInput = InputCapturer({
    backAction() { // action on Esc/B
      // find active tab in bindings
      const target = document.querySelector("[ui-view] .md-tab.md-active");
      const btncancel = document.getElementById("binding_edit_cancel");
      if (!target || !btncancel)
        return false;
      try {
        // check if we're inside config details
        let elm = document.activeElement;
        while (elm.nodeType === Node.ELEMENT_NODE) {
          if (elm.getAttribute("ui-view") === "edit") {
            btncancel.dispatchEvent(new CustomEvent("click"));
            target.focus();
            return true;
          }
          elm = elm.parentNode;
        }
      } catch (fire) {}
      return false;
    }
  });
  captureInput(true);

  // ON END
  $scope.$on('$destroy', function () {
    bngApi.engineLua('WinInput.setForwardRawEvents(false)')
    clearTimeout(listeningTimeout)
    captureInput(false)
    $rootScope.$emit("bngTooltipValue", "", false) // clear any possibly active tooltips when closing this menu
  })
}])

.controller('ControlsFfbCtrl', ['$scope', '$state', 'ControlsUtils', function ($scope, $state, ControlsUtils) {
  var vm = this
  var _bindingData = { device: '', deviceIcon: '', details: {}, isAxis: false }

  vm.updateFlags = function() {
    const vidThrustmaster = "044F"
    const vidLogitech= "046D"
    const pidLogitechF710 = "C219"
    const pidLogitechF310 = "C216"
    const pidLogitechProXbox = "C272"
    const pidLogitechProPlaystation = "C268"
    vm.ffbCapable = ControlsUtils.isFfbCapable()
    vm.ffbBound = ControlsUtils.isFfbBound()
    vm.ffbEnabled = ControlsUtils.isFfbEnabled()
    //vm.wheelLogitechFound = vm.ffbCapable && ControlsUtils.isWheelFound(vidLogitech)
    //vm.wheelThrustmasterFound = vm.ffbCapable && ControlsUtils.isWheelFound(vidThrustmaster)
    vm.padLogitechIncorrect = ControlsUtils.isPidVidFound(vidLogitech, pidLogitechF710) || ControlsUtils.isPidVidFound(vidLogitech, pidLogitechF310)
    vm.proLogitechFound = ControlsUtils.isPidVidFound(vidLogitech, pidLogitechProXbox) || ControlsUtils.isPidVidFound(vidLogitech, pidLogitechProPlaystation)
  }
  $scope.$on('InputBindingsChanged', function (event, data) {
    $scope.$evalAsync(function () {
      vm.updateFlags()
    })
  })
  $scope.$on('ControllersChanged', function (event, data) {
    $scope.$evalAsync(function () {
      vm.updateFlags()
    })
  })
  vm.updateFlags()

  vm.select = function (action, device, control) {
    $state.go('menu.options.controls.ffb.edit', { action: action, oldBinding: {device: device, control: control, sel: angular.copy(_bindingData)} })
  }
  $scope.$on('onFFBSafetyData', function (event, FFBSafetyData) {
    $scope.$evalAsync(function() {
      vm.FFBSafetyData = FFBSafetyData
    })
  })
  bngApi.engineLua('core_input_bindings.FFBSafetyDataRequest()')
}])

.controller('ControlsHardwareCtrl', ['$scope', 'controlsContents', 'ControlsUtils',
  function ($scope, controlsContents, ControlsUtils) {
    var vm = this
    vm.utils = ControlsUtils

    vm.showAndroid = false
    vm.qrPass = null
    vm.qrData = null
    vm.qrData2 = null
    vm.remoteBlocked = false

    bngApi.engineLua('core_remoteController.devicesConnected()', (bool) => {
      $scope.$evalAsync(() => {
        vm.showAndroid = bool
      })
    })

    var firewallPollInterval

    var pollFirewall = function () {
      bngApi.engineLua('be:isBlockedByFirewall()', function (blocked) {
        $scope.$evalAsync(function () { vm.remoteBlocked = blocked; })
      })
    }

    vm.androidToggled = function () {
      if (!vm.showAndroid) {
        clearInterval(firewallPollInterval)
        return
      }
      firewallPollInterval = setInterval(pollFirewall, 1000)
      // todo: disable the controlers
    }

    bngApi.engineLua('core_remoteController.getQRCode()', function (data) {
      $scope.$evalAsync(function () {
        vm.qrPass = data
      })
    })

    vm.generateQrCode = function(){
      //need to generate everytime it is ticked. ng-if remove the elements
      // vm.qrData = new QRCode(document.getElementById("QRremoteiOS"), {
      //   text: "https://itunes.apple.com/ca/app/beamng.drive-remote-control/id1163096150#"+vm.qrPass,
      //   correctLevel : QRCode.CorrectLevel.L
      // })
      vm.qrData2 = new QRCode(document.getElementById("QRremoteAndroid"), {
        text: "https://play.google.com/store/apps/details?id=com.beamng.remotecontrol#"+vm.qrPass,
        correctLevel : QRCode.CorrectLevel.L,
          width : 180,
          height : 180
      })
    }

    vm.addFirewallException = function () {

    }

    bngApi.engineLua('WinInput.setForwardRawEvents(true)')

    $scope.$on('$destroy', function () {
      bngApi.engineLua('WinInput.setForwardRawEvents(false)')
      clearInterval(firewallPollInterval)
    })
}])


// http://home/redmine/issues/1338

.constant('ControlsWizardActions', {
  singleActions: [
    {action: 'accelerate',    direction: 1},
    {action: 'brake',         direction: -1},
    {action: 'steer_left',    direction: -1},
    {action: 'steer_right',   direction: 1},
    {action: 'recover_vehicle', direction: 0},
    {action: 'toggleMenues', direction: 0},
    {action: 'center_camera', direction: 0},
    {action: 'reset_physics', direction: 0}
    // {action: restart scenario, recover vehicle, reset camera, show dashboard
  ],

  combos: [
    {action: 'steering',         parts: ['steer_left', 'steer_right']},
    {action: 'accelerate_brake', parts: ['accelerate', 'brake']}
  ]
})


.directive('compile', ['$compile', function ($compile) {
  return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
           // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile)
        },
        function(value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value)

      // compile the new DOM and link it to the current scope.
      // NOTE: we only compile .childNodes so that we don't get into infinite loop compiling ourselves
      $compile(element.contents())(scope)
    }
)
}
}])


.controller('SettingsHelpCtrl', ['$scope', function ($scope) {
  $scope.$parent.fullscreenOptions = true
}])

.controller('SettingsPerformanceCtrl', ['$scope', '$timeout', '$sce', 'Utils', '$sanitize', '$filter', function ($scope, $timeout, $sce, Utils, $sanitize, $filter) {
  $scope.$parent.fullscreenOptions = true
  var vm = this

  // performance tab
  $scope.requestHardwareInfo = function() {
    bngApi.engineLua('core_hardwareinfo.requestInfo()')
  }
  $scope.$on('HardwareInfo', function (event, data) {
    $scope.$apply(function() {
      $scope.hwinfo = data
      $scope.hstxt = $sce.trustAsHtml(Utils.parseBBCode($sanitize($filter('translate')('ui.performance.highsea.txt'))))
    })
  })


  $scope.bananabenchRunning = false

  $scope.runPhysicsBenchmark = function() {
    $scope.bananabenchRunning = true
    bngApi.engineLua('core_hardwareinfo.runPhysicsBenchmark()')
  }

  $scope.openPerformanceGraph = function() {
    bngApi.engineLua("togglePerformanceGraph()")
  }

  $scope.$on('BananaBenchReady', function (event, data) {
    console.log(data)
    $scope.$evalAsync(() => {
      $scope.bananabenchRunning = false
      $scope.bananabench = data
      $scope.bananabench.testVehicle = Object.keys(data.tests)[0]
      $scope.bananabench.test = data.tests[$scope.bananabench.testVehicle]
    })
  })
  bngApi.engineLua('core_hardwareinfo.latestBenchmarkExists()', function(res) {
    if (res) {
      bngApi.engineLua('core_hardwareinfo.latestBananbench()', function(data) {
        $scope.$evalAsync(() => {
          $scope.bananabench = data
          $scope.bananabench.testVehicle = Object.keys(data.tests)[0]
          $scope.bananabench.test = data.tests[$scope.bananabench.testVehicle]
        })
      })
    }
  })

  $scope.acknowledgeWarning = function(msg) {
    bngApi.engineLua(`core_hardwareinfo.acknowledgeWarning(${bngApi.serializeToLua(msg)})`)
  }

  $scope.runDiskUsage = function() {
    bngApi.engineLua('core_hardwareinfo.runDiskUsage()')
  }
  $scope.openUserFolder = function() {
    bngApi.engineLua('log("I", "options.js", "Opening user folder...") Engine.Platform.exploreFolder("")')
  }
  $scope.$on('diskInfoCallback', function (event, data) {
    $scope.$evalAsync(() => {
      if($scope.disk == undefined)
        $scope.disk= {}
      if($scope.disk.usage == undefined)
        $scope.disk.usage= {}
      $scope.disk.usage[data.name] = {running: data.running, size: data.size}
    })
  })

  $scope.bytes = function(bytes, precision) {
    precision = precision || 1
    var number = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, number)).toFixed(precision)
  }

  var recRefHWPromise = {}
  function recRefHW() {
    recRefHWPromise = $timeout(
      function() {
        $scope.requestHardwareInfo()
        recRefHW()
      },
      5000
    )
  }

  $scope.requestHardwareInfo()
  $scope.$watch(
    function(scope) {return scope.currentView; },
    function() {
      if ($scope.currentView === 3) {
        recRefHW()
      } else if (recRefHWPromise !== {}) {
        $timeout.cancel(recRefHWPromise)
      }
    }
  )
  $scope.$on('$destroy', function() {
    if (recRefHWPromise !== {}) {
      $timeout.cancel(recRefHWPromise)
    }
  })
}])
