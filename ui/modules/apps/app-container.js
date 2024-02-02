"use strict"

angular.module('beamng.apps')

.directive('appContainer', ['$document', 'RateLimiter', 'UiAppsService', 'Utils', '$state',
function ($document, RateLimiter, UiAppsService, Utils, $state) {
  return {
    restrict: 'E',
    template: '<div style="position: absolute; left: 0; top: 0; right:0, bottom:0">' +
                '<div id="container" ng-transclude style="position:relative; width: 100%; height: 100%"></div>' +
              '</div>',
    transclude: true,
    replace: true,
    controller: ['$element', '$scope', '$window', 'UIAppStorage',
      function ($element, $scope, $window, UIAppStorage) {

      let container = angular.element($element[0].querySelector('#container'))
      let playmode = beamng.ingame ? 'freeroam' : 'externalUI'
      let canvas = null

      // include the parent id in the container name to make it more clear to everything
      container[0].id = $element[0].id + '_apps'

      UIAppStorage.containers[container[0].id] = container[0]
      //console.log('containers: ', UIAppStorage.containers)

      // if you're investigating the issues with UI apps getting offscreen, uncomment console.warn line to test
      // if you see it more than once, then possible causes are:
      //   - angular going to an empty state
      //   - someone or something hid app-container in index.html
      // both things should never happen because it breaks the size detection for apps (this should be investigated and fixed)
      //console.warn("AppContainer test line. You shouldn't see it more than once!");

      function setSize() {
        if (!canvas)
          return;
        const width = container[0].clientWidth,
              height = container[0].clientHeight;
        if (width === 0 || height === 0)
          return;
        canvas.width = width;
        canvas.height = height;
      }
      $element.ready(function () {
        canvas = $element[0].querySelector("canvas");
        setSize();
        $scope.$on("windowResize", setSize);
      });


      $scope.editMode = false
      // $scope.align = 'TL'
      $scope.$on('VehicleReset', function () {
        StreamsManager.resubmit()
      })

      $scope.$on('appContainer:clear', function () { UiAppsService.clearCurrentLayout(container) })
      $scope.$on('appContainer:loadLayoutByType', function (_, data) { UiAppsService.loadLayout({type: data}, container, $scope) })
      $scope.$on('appContainer:loadLayoutByObject', function (_, data) { UiAppsService.loadLayout({object: data}, container, $scope) })
      $scope.$on('appContainer:loadLayoutByFilename', function (_, data) { UiAppsService.loadLayout({filename: data}, container, $scope) })
      $scope.$on('appContainer:loadLayoutByReqData', function (_, data) { UiAppsService.loadLayout(data, container, $scope) })

      $scope.$on('appContainer:ensureAppVisible', function (_, appDataJson) {
        UiAppsService.ensureAppVisible(JSON.parse(appDataJson), container, $scope)
      })
      $scope.$on('appContainer:spawn', function (_, appData) {
        UIAppStorage.layoutDirty = true
        UiAppsService.spawnApp(appData, container, $scope)
        UiAppsService.saveLayout(UIAppStorage.current)
        $scope.$broadcast('appContainer:requestEdit', true)
      })
      $scope.$on('appContainer:save', function () {
        UiAppsService.saveLayout(UIAppStorage.current)
      })
      $scope.$on('appContainer:onUIDataUpdated', function () {
        // execute queued layout changes
        if(UIAppStorage.queuedlayoutChange !== null) {
          //console.log('DEQUEUED LOADLAYOUT')
          UiAppsService.loadLayout(UIAppStorage.queuedlayoutChange, container, $scope)
          UIAppStorage.queuedlayoutChange = null
        }
        // check if the current layout is still valid
        if(UIAppStorage.current.filename) {
          let valid = false
          for(let i = 0; i < UIAppStorage.availableLayouts.length; ++i) {
            if(UIAppStorage.availableLayouts[i].filename === UIAppStorage.current.filename) {
              valid = true
              break
            }
          }
          if(!valid) {
            // the current layout got invalid, switch to the first in list instead
            if(UIAppStorage.availableLayouts.length > 0) {
              UiAppsService.loadLayout({filename: UIAppStorage.availableLayouts[0].filename}, container, $scope)
            } else {
              UiAppsService.clearCurrentLayout(container)
              UIAppStorage.current = { apps: [] }
            }
          } else {
            // reload the layout then
            UiAppsService.loadLayout({filename: UIAppStorage.current.filename}, container, $scope)
          }
        }
      })
      $scope.$on('appContainer:saveAll', function () {
        for(let i = 0; i < UIAppStorage.availableLayouts.length; ++i) {
          let layout = UIAppStorage.availableLayouts[i]
          UIAppStorage.layoutDirty = true
          UiAppsService.saveLayout(layout)
        }
      })
      $scope.$on('appContainer:resetLayout', function () {
        UiAppsService.resetLayout(playmode, container, $scope)
      })
      $scope.$on('appContainer:deleteLayout', function () {
        UiAppsService.deleteLayout(container, $scope)
      })

      $scope.$on('appContainer:createNewLayout', function () {
        UiAppsService.createNewLayout()
      })


      let cameraMode = null
      $scope.$on('onCameraNameChanged', function (_, data) {
        $scope.$applyAsync(() => {
          cameraMode = data.name
          $scope.updateCockpitApps()
        })
      })

      // Change editable state of the apps
      $scope.$on('editApps', function (event, state) {
        $document.triggerHandler('mouseup')
        $scope.editMode = state
        $scope.updateCockpitApps()
        if (!state) {
          UiAppsService.saveLayout(UIAppStorage.current)
          bngApi.engineLua('core_camera.requestConfig()')
        }
      })

      $scope.updateCockpitSetting = function() {
        UIAppStorage.layoutDirty = true
        $scope.updateCockpitApps()
      }
      $scope.updateCockpitApps = function() {
        UiAppsService.handleCameraChange(cameraMode, $scope.editMode)
      }

      $scope.$on('GameStateUpdate', function (event, data) {
        if($state.current.name === 'menu.appedit') {
          //console.log("ignoring gamestate update while inside app edit mode ...")
          return
        }
        //console.log(`GameStateUpdate: ${JSON.stringify(data)}`)
        playmode = data.state
        if($scope.editMode === true) return
        if (typeof data.appLayout == "string") {
          if(data.appLayout == 'freeroam' && !beamng.ingame) data.appLayout = 'externalui'

          UiAppsService.loadLayout({type: data.appLayout}, container, $scope) // uilayout can be either a layout name, or the actual layout json
        } else if (typeof data.appLayout == "object") {
          UiAppsService.loadLayout({object: data.appLayout}, container, $scope) // uilayout can be either a layout name, or the actual layout json
        } else if (playmode !== undefined) {
          UiAppsService.loadLayout({type: playmode}, container, $scope)
        } else {
          console.debug(`Expected AppLayout but didn't get one :-( `, data)
        }
      })
    }]
  }
}])

