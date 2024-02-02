angular.module('beamng.stuff')

.value('showPhotomodeGrid', {
  show:false
})

.controller('PhotoModeController', ['$scope', 'Utils', 'showPhotomodeGrid', 'Environment', '$translate', function($scope, Utils, showPhotomodeGrid, Environment, $translate)  {

  //console.debug('Entering photomode')
  bngApi.engineLua("photoModeOpen = true"); // yes, this is horrible
  bngApi.engineLua("if core_camera.getActiveCamName() ~= 'path' then commands.setFreeCamera() end")
  bngApi.engineLua("MoveManager.rollRelative = 0; core_camera.savedCameraFov = core_camera.getFovDeg()")
  bngApi.engineLua('Engine.NodeGrabber_setFixedNodesVisible(false)')
 // bngApi.engineLua('campaign_exploration.activemode()')
  // disable pillars autohide if in garage mode
  bngApi.engineLua("if gameplay_garageMode and gameplay_garageMode.isActive() then gameplay_garageMode.setObjectsAutohide(false) end");

  var vm = this

  vm.environment = Environment
  Environment.update()

  window.bridge.uiNavEvents.setFilteredEvents('focus_lr')

  $scope.$on('SettingsChanged', function (event, data) {
    vm.dynReflectionEnabled = data.values.GraphicDynReflectionEnabled
    vm.PostFXDOFGeneralEnabled = data.values.PostFXDOFGeneralEnabled
    vm.PostFXSSAOGeneralEnabled = data.values.PostFXSSAOGeneralEnabled
    vm.cameraFreeSmoothMovement = data.values.cameraFreeSmoothMovement
  })

  vm.toggleDynReflection = function () {
    var changeObj = {GraphicDynReflectionEnabled: vm.dynReflectionEnabled}
    bngApi.engineLua(`settings.setState( ${bngApi.serializeToLua(changeObj)} )`)
  }

  vm.toggleDOFPostFX = function () {
    var changeObj = {PostFXDOFGeneralEnabled: vm.PostFXDOFGeneralEnabled}
    bngApi.engineLua(`settings.setState( ${bngApi.serializeToLua(changeObj)} )`)
  }

  vm.toggleSSAOPostFX = function () {
    var changeObj = {PostFXSSAOGeneralEnabled: vm.PostFXSSAOGeneralEnabled}
    bngApi.engineLua(`settings.setState( ${bngApi.serializeToLua(changeObj)} )`)
  }

  vm.toggleCameraFreeSmoothMovement = function () {
    var changeObj = {cameraFreeSmoothMovement: vm.cameraFreeSmoothMovement}
    bngApi.engineLua(`settings.setState( ${bngApi.serializeToLua(changeObj)} )`)
  }

 // bngApi.engineLua('campaign_exploration.activephotomission()')
  bngApi.engineLua('settings.notifyUI()')
  bngApi.engineLua('Steam.isWorking', function (steamStatus) {
    $scope.$evalAsync(function () {
      vm.steamAvailable = steamStatus
    })
  })
  bngApi.engineLua('campaign_exploration and campaign_photoSafari.photomodeOpen',function(isCampaign){
    $scope.$evalAsync(function () {
      vm.campaingexp = isCampaign
    })
   })
  bngApi.engineLua('scenario_scenarios and scenario_scenarios.getScenario()', function(data) {
    $scope.$evalAsync(function () {
      vm.currentScenario = data
    })
  })

  vm.settings = {
    fov: 60,
    roll: 0,
    speed: 15,
    visible: true,
    showGrid: showPhotomodeGrid.show,
    colorCorrectionStrength: 1,

    // Bloom
    bloomThreshold: 4,

    // DoF
    autofocus: false,
    dofMaxBlurNear: 0,
    dofMaxBlurFar: 0.15,
    dofFocusRange: 100,
    dofAperture: 100,

    // SSAO
    SSAOContrast: 2,
    SSAORadius: 1.5,
    SSAOQuality: 1,

    // Rendering
    // Shadows
    shadowSize: 10,
    shadowDistance: 1600,
    logWeight: 0.98,

    // LOD
    detailAdjust: 1.5,
    lodScale: 0.75,
    GroundCoverScale: 1,

  }

  // Get PostFX values
  var mapKeyToSettings= [
    // ["PostEffectCombinePassObject.colorCorrectionRampPath","colorCorrectionStrength"],
    ["$DOFPostFx::BlurMax","dofMaxBlurFar"],
    ["$DOFPostFx::BlurMin","dofMaxBlurNear"],
    ["$DOFPostFx::FocusRangeMax","dofFocusRange"],
    ["$DOFPostFx::BlurCurveFar","dofAperture"],
    // ["$SSAOPostFx::overallStrength","SSAOContrast"],
    ["$PostFXManager::PostFX::EnableDOF","dofEnabled"],
    ["$PostFXManager::PostFX::EnableSSAO","ssaoEnabled"],
  ]
  bngApi.engineLua('require("util/renderComponentsAPI").getCurrentSettings()',
    (data) => {
      $scope.$evalAsync(() => {
        vm.originalPostSettings = {}
        for(var i = 0; i<mapKeyToSettings.length; i++) {
          vm.settings[mapKeyToSettings[i][1]] = Number(data[mapKeyToSettings[i][0]])
          vm.originalPostSettings[mapKeyToSettings[i][0]] = data[mapKeyToSettings[i][0]]
        }
        vm.enableWatchers()
      })
    }
  )

  // quick fix for reseting the values on enter, but actually that should be doable just by setting the default values after the watchers, so setting them would trigger the watchers...
  bngApi.engineLua( 'core_camera.setFOV(0, ' + vm.settings.fov + ');' )
  bngApi.engineLua( 'core_camera.rollAbs(' + vm.settings.roll + ')' )
  bngApi.engineLua( 'core_camera.setSpeed(' + vm.settings.speed + ')' )
  vm.settings.cameraSpeed = vm.settings.speed

  vm.showSettings   = true
  vm.advancedSettings = false
  vm.showControls = true
  vm.storedTime = 0

  vm.takePic = function() {
    vm.doScreenshot()
  }

  vm.takeBigPic = function() {
    vm.doBigScreenShot()
  }

  vm.takeHugePic = function() {
    vm.doHugeScreenShot()
  }

  function uiEnabled(enable, ts=false, callback=null) {
    enable = !!enable;
    bngApi.engineLua(`extensions.ui_visibility.set(${enable})`, () => {
      function next() {
        Utils.waitForCefAndAngular(() => {
          vm.showControls = enable;
          if (enable)
            $scope.$apply();
          if (callback) {
            Utils.waitForCefAndAngular(() => {
              callback();
            });
          }
        });
      }
      const cursor = enable ? "showCursor" : "hideCursor";
      if (ts)
        bngApi.engineScript(`${cursor}();`, next);
      else
        next();
    });
  }

  // async would be nicer
  function timedCall(call, ts=false) {
    uiEnabled(false, ts, () => {
      call(() => {
        Utils.waitForCefAndAngular(() => {
          uiEnabled(true, ts);
        });
      });
    });
  }

  /// afaik photo-safari mode was deprecated long time ago
  // vm.doScreenshot = function() {
  //   timedCall(next => {
  //     let countNext = 0;
  //     function callNext() {
  //       countNext--;
  //       if (countNext <= 0)
  //         next();
  //     }
  //     if (vm.campaingexp) {
  //       countNext++;
  //       bngApi.engineLua('campaign_photoSafari.takepiccheck()', (val) => {
  //         vm.objContained = val
  //         if(vm.objContained){
  //           console.log("horrieh")
  //         }
  //         else{
  //           console.log("wrong objContained")
  //          // break
  //         }
  //         callNext();
  //       })
  //     }
  //     if (vm.currentScenario && vm.currentScenario.scenarioName == 'bussafari') {
  //       countNext++;
  //       bngApi.engineLua('scenario_scenarios.takephoto()', callNext)
  //     }
  //     countNext++;
  //     bngApi.engineLua('require("screenshot").takeScreenShot()', callNext)
  //   })
  // }

  vm.doScreenshot = function() {
    timedCall(next => {
      bngApi.engineLua('require("screenshot").takeScreenShot()', next)
    })
  }

  vm.doBigScreenShot = function() {
    timedCall(next => {
      bngApi.engineLua('require("screenshot").takeBigScreenShot()', next)
    })
  }

  vm.doHugeScreenShot = function() {
    timedCall(next => {
      bngApi.engineLua('require("screenshot").takeHugeScreenShot()', next)
    })
  }

  vm.sharePic = function() {
    timedCall(next => {
      bngApi.engineLua('screenshot.publish()', next)
    })
  }

  vm.steamPic = function () {
    /// note: leaving this as a commented code because it looked different
    // vm.showControls = false
    // //$scope.$emit callback system not working, so moved the UI hide before cursor hide in TS
    // bngApi.engineLua("extensions.ui_visibility.set(false)")
    // //Waiting to make sure hide has executed
    // Utils.waitForCefAndAngular(() => {
    //     bngApi.engineScript('hideCursor();', () => {
    //       bngApi.engineLua('screenshot.doSteamScreenshot()', () => {
    //         bngApi.engineLua("extensions.ui_visibility.set(true)")
    //         vm.showControls = true
    //         bngApi.engineScript('showCursor();')
    //         $scope.$apply()
    //       })
    //     })
    // })
    timedCall(next => {
      bngApi.engineLua('screenshot.doSteamScreenshot()', next)
    })
  }

  vm.openScreenshotsFolderInExplorer = function(){
    bngApi.engineLua('screenshot.openScreenshotsFolderInExplorer()')
  }

  vm.toggleSettings = function () {
    vm.settings.visible = !vm.settings.visible
  }

  vm.enableWatchers = function() {

    // Controls
    $scope.$watch('photo.settings.fov', function(value) {
      bngApi.engineLua('core_camera.setFOV(0, ' + value + ')')
    })

    $scope.$watch('photo.settings.cameraSpeed', function(value) {
      bngApi.engineLua( 'core_camera.setSpeed(' + value + ')' )
    })

    $scope.$watch('photo.settings.roll', function (value) {
      bngApi.engineLua('core_camera.rollAbs(' + (value * 1000) + ')' ); // in rads
    })

    $scope.$watch('photo.settings.colorCorrectionStrength', function(value) {
      bngApi.engineScript('PostEffectCombinePassObject.colorCorrectionStrength = ' + value + ';')
    })

    // Bloom
    $scope.$watch('photo.settings.bloomThreshold', function(value) {
      bngApi.engineLua('scenetree.PostEffectBloomObject.threshHold = (' + value + ');')
    })

    // DOF
    // Autofocus is disabled as we cannot raycast on vehicles
    // $scope.$watch('photo.settings.dofAutofocus', function(value) {
    //   bngApi.engineScript('DOFPostEffect.setAutoFocus( ' + value + ');')
    //   if (value) {
    //     $scope.photo.settings.dofFocusRange = 0
    //   }
    // })

    $scope.$watch('photo.settings.dofMaxBlurNear', function(value) {
      bngApi.engineScript('$DOFPostFx::BlurMin = ' + value + ';')
      bngApi.engineLua('require("client/postFx/dof").updateDOFSettings()')
    })

    $scope.$watch('photo.settings.dofMaxBlurFar', function(value) {
      bngApi.engineScript('$DOFPostFx::BlurMax = ' + value + ';')
      bngApi.engineLua('require("client/postFx/dof").updateDOFSettings()')
    })

    $scope.$watch('photo.settings.dofFocusRange', function(value) {
      bngApi.engineScript('$DOFPostFx::FocusRangeMax = ' + value + ';')
      bngApi.engineLua('require("client/postFx/dof").updateDOFSettings()')
    })

    $scope.$watch('photo.settings.dofAperture', function(value) {
      bngApi.engineScript('$DOFPostFx::BlurCurveFar = ' + value + ';')
      bngApi.engineLua('require("client/postFx/dof").updateDOFSettings()')
    })

    // SSAO
    $scope.$watch('photo.settings.SSAOContrast', function(value) {
      bngApi.engineLua('scenetree.SSAOPostFx:setContrast(' + value + ');')
    })

    $scope.$watch('photo.settings.SSAORadius', function(value) {
      bngApi.engineLua('scenetree.SSAOPostFx:setRadius(' + value + ');')
    })

    $scope.$watch('photo.settings.SSAOQuality', function(value) {
      if (value == 1) {
        $scope.photo.settings.SSAOQualityText = $translate.instant("ui.photomode.SSAOQualityNormal")
        bngApi.engineLua('scenetree.SSAOPostFx:setSamples(16);')
      }
      if (value == 2) {
        $scope.photo.settings.SSAOQualityText = $translate.instant("ui.photomode.SSAOQualityHigh")
        bngApi.engineLua('scenetree.SSAOPostFx:setSamples(64);')
      }
    })

    // Rendering, use with caution
    //console.log(vm.advancedSettings)
    if (!vm.shipping) {
      // Shadows
      $scope.$watch('photo.settings.shadowSize', function(value) {
        $scope.shadowSizeLabel = 1024; // Default slider text value
        if (vm.advancedSettings) { // This ensures shadow is not modified until the slider is operated
          shadowRes = Math.pow(2, value)
          bngApi.engineScript('sunsky.texSize = ' + shadowRes + ';')
          $scope.shadowSizeLabel = shadowRes
        }
      })

      $scope.$watch('photo.settings.shadowDistance', function(value) {
        bngApi.engineScript('sunsky.shadowDistance =' + value + ';')
      })

      $scope.$watch('photo.settings.logWeight', function(value) {
        bngApi.engineScript('sunsky.logWeight =' + value + ';')
      })

      // Level of Details
      $scope.$watch('photo.settings.detailAdjust', function(value) {
        bngApi.engineScript('$pref::TS::detailAdjust =' + value + ';')
      })

      $scope.$watch('photo.settings.lodScale', function(value) {
        bngApi.engineScript('$pref::Terrain::lodScale =' + value + ';')
      })

      $scope.$watch('photo.settings.GroundCoverScale', function(value) {
        bngApi.engineScript('setGroundCoverScale(' + value + ');')
      })
    }
  }

  vm.openPostFXManager = function() {
    console.log("openPostFXManager")
    bngApi.engineScript('Canvas.pushDialog(PostFXManager);')
  }

  bngApi.engineLua('core_environment.getTimeOfDay()',
    (data) => {
      $scope.$evalAsync(() => {
        vm.storedTime = data
      })
    }
  )

  // Get time in 24 hours format
  $scope.$watch('photo.environment.state.time', function(value) {
    bngApi.engineLua('getTimeOfDay(true)',
    (data) => {
      $scope.$evalAsync(() => {
        $scope.timeAsString = data
      })
    })
  })

  // Get azimuthOverride
  $scope.$watch('photo.environment.state.azimuthOverride', function(value) {
    bngApi.engineLua('core_environment.getTimeOfDay(true)',
    (data) => {
      $scope.$evalAsync(() => {
        $scope.azimuthOverride = data.azimuthOverride
        $scope.azimuthOverrideAsDegrees = (data.azimuthOverride/Math.PI) * 180
      })
    })
  })
  

  // Color Correction
  vm.colorCorrectionRamps = {}
  bngApi.engineLua('require("util/renderComponentsAPI").getColorCorrections()',
  (data) => {
    $scope.$evalAsync(() => {
      vm.colorCorrectionRamps = data
    })
  })

  vm.setColorCorrectionRamp = function ($event, filename) {
    if (filename == -1) {
      // Reset to default
      resetColorCorrectionRamp()
      $scope.showFilterStrength = "1"
    }
    else {
      bngApi.engineScript(`PostEffectCombinePassObject.colorCorrectionRampPath = "${filename}";`)
    }
  }

  function resetColorCorrectionRamp() {
    bngApi.engineScript(`PostEffectCombinePassObject.colorCorrectionRampPath = "";`)
  }
  resetColorCorrectionRamp(); //Make sure default is loaded when opening photomode

  vm.nodeGrabberVisible = false;
  vm.toggleNodeGrabberVisibility = function () {
    bngApi.engineLua(`Engine.NodeGrabber_setFixedNodesVisible(${!!vm.nodeGrabberVisible})`);
  }

  $scope.$on('$destroy', function() {
    window.bridge.uiNavEvents.clearFilteredEvents()
    //console.debug('Exiting photomode')
    bngApi.engineLua("photoModeOpen = false"); // yes, this is horrible
    bngApi.engineLua("if core_camera.getActiveCamName() ~= 'path' then commands.setGameCamera() end"); // camera change if the editor was not loaded before
    bngApi.engineLua("MoveManager.rollRelative = 0; if core_camera.savedCameraFov then core_camera.setFOV(0, core_camera.savedCameraFov) end")
    showPhotomodeGrid.show = vm.settings.showGrid

    // Reset time
    bngApi.engineLua(`core_environment.setTimeOfDay( ${bngApi.serializeToLua(vm.storedTime)} )`)
    vm.environment.state.time = vm.storedTime.time 
    vm.environment.state.azimuthOverride = vm.storedTime.azimuthOverride 

    // Make UI visible
    bngApi.engineLua("ui_visibility.set(true)")

    // Reset PostFX
    // bngApi.engineScript('DOFPostEffect.setAutoFocus(false);')
    bngApi.engineLua('scenetree.PostEffectBloomObject.threshHold = 4;')
    bngApi.engineLua('scenetree.SSAOPostFx:setContrast(2)')
    bngApi.engineLua('scenetree.SSAOPostFx:setRadius(1.5)')
    bngApi.engineLua('scenetree.SSAOPostFx:setSamples(16)')
    bngApi.engineLua(`require('util/renderComponentsAPI').setMultiSettings( ${bngApi.serializeToLua(vm.originalPostSettings)} )`)
    resetColorCorrectionRamp()

    bngApi.engineLua('Engine:NodeGrabber_setFixedNodesVisible(true)')
  })

}])

