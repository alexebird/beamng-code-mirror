"use strict"

angular.module('beamng.apps')

.directive('bngApp', ['$document', '$q', 'UIAppStorage', 'UiAppsService', function ($document, $q, UIAppStorage, UiAppsService) {
  return {
    restrict: 'EA',
    templateUrl: '/ui/modules/apps/bng-app.html',
    transclude: true,
    replace: true,
    require: '^appContainer',
    scope: false,
    controller: function ($scope, $element, $attrs) {
      let ctrl = this

      let initListener = $scope.$watch('entry', (entry) => {
        if (entry !== undefined) {
          $element.css(entry.css)
          initListener()
        }
      })

      let startX, startY, x, y, maxTop, maxLeft, maxWidth, maxHeight, alignment, ctx, initAspectRatio

      $element.ready(function () {
        if($attrs.appid === undefined) {
          //console.error("appid empty")
          return
        }
        x = $element[0].offsetLeft
        y = $element[0].offsetTop
        ctx = document.getElementById('alignment-canvas').getContext('2d')
        $scope.entry = UIAppStorage.current.apps[$attrs.appid]
        if($scope.entry === undefined) {

          // Moving this report to a debug mode only thing to stop the complaints. We will eventually move this stuff into Vue, and the current errors from this do not seem to cause serious problems
          // We've expended many hours looking into this, and it doesn't really seem worth spending more
          
          // console.error("error with app spawn: " + $attrs.appid + ", " + JSON.stringify(UIAppStorage.current.apps))
          window.BNG_Logger.debug("error with app spawn: " + $attrs.appid + ", " + JSON.stringify(UIAppStorage.current.apps), window.BNG_Logger.STACK_TRACE)
          return
          
        }
        $scope.container = UIAppStorage.containers[$attrs.containerid]
        if(!$scope.container) {
          console.error("app container not found: " + $attrs.containerid)
          return
        }
        UiAppsService.restrictInWindow($scope.container, $element[0])

        $scope.$broadcast('app:resized', {width: $element[0].offsetWidth, height: $element[0].offsetHeight})
        initAspectRatio = $element[0].offsetWidth / $element[0].offsetHeight
      })

      $scope.$on('editApps', (_, mode) => {
        if (mode) $element[0].classList.add('editable')
        else      $element[0].classList.remove('editable')
      })

      $scope.$on('windowResize', function () {
        if ($scope.entry) {
          $element.css($scope.entry.css)
          UiAppsService.restrictInWindow($scope.container, $element[0])
        }
      })

      $scope.translateStart = function (event) {
        event.stopPropagation()
        UiAppsService.resetPositionAttributes($element[0])

        let parentRect = $scope.container.getBoundingClientRect()
        maxTop  = parentRect.height - $element[0].offsetHeight
        maxLeft = parentRect.width - $element[0].offsetWidth

        startX = (event.pageX - parentRect.x) - $element[0].offsetLeft //x
        startY = (event.pageY - parentRect.y) - $element[0].offsetTop //y

        $element[0].classList.add('active')
        $document.on('mousemove', translate)
        $document.on('mouseup', translateEnd)

        translate(event) // It is like moving without moving! just a cheap trick to show lines and such..
      }

      $scope.resizeStart = function (event) {
        event.stopPropagation()
        UiAppsService.resetPositionAttributes($element[0])

        maxWidth = $scope.container.clientWidth - $element[0].offsetLeft
        maxHeight = $scope.container.clientHeight - $element[0].offsetTop

        if ($scope.entry.preserveAspectRatio) {
          if (maxWidth/maxHeight !== initAspectRatio) {
            if (maxWidth/maxHeight > initAspectRatio) {
              maxWidth = maxHeight * initAspectRatio
            } else {
              maxHeight = maxWidth / initAspectRatio
            }
          }
        }

        startX = $element[0].offsetLeft
        startY = $element[0].offsetTop

        $element.addClass('active')
        $document.on('mousemove', resize)
        $document.on('mouseup', resizeEnd)
      }

      $scope.kill = function () {
        UIAppStorage.layoutDirty = true
        delete UIAppStorage.current.apps[$attrs.appid]
        $scope.$destroy()
        $element.remove()
      }

      $scope.cockpitChanged = function () {
        $scope.$parent.updateCockpitSetting()
      }

      $element.on('$destroy', function () {
        $scope.$destroy()
      })

      function translate (event) {
        let parentRect = $scope.container.getBoundingClientRect()
        x = (event.pageX - parentRect.x) - startX
        y = (event.pageY - parentRect.y) - startY

        let top  = Math.ceil(y/5) * 5
        let left = Math.ceil(x/5) * 5

        top = Math.max(0, Math.min(top, maxTop))
        left = Math.max(0, Math.min(left, maxLeft))

        alignment = UiAppsService.alignInContainer($scope.container, $element[0], top, left)
        UiAppsService.drawAlignmentHelpers($scope.container, ctx, $element[0], alignment)
      }

      function resize (event) {
        let parentRect = $scope.container.getBoundingClientRect()
        $scope.showDimensions = true
        let width = Math.max(Math.ceil(((event.pageX - parentRect.x) - startX) / 10) * 10, 50)
        let height = Math.max(Math.ceil(((event.pageY - parentRect.y) - startY) / 10) * 10, 40)


        if ($scope.entry.preserveAspectRatio) {
          if (width > height) {
            height = width / initAspectRatio
          } else {
            width = height * initAspectRatio
          }
        }

        let sizeChanged = (width !== $element[0].offsetWidth || height !== $element[0].offsetHeight)

        $element[0].style.width  = Math.max(0, Math.min(width, maxWidth)) + 'px'
        $element[0].style.height = Math.max(0, Math.min(height, maxHeight)) + 'px'

        if (sizeChanged) {
          $scope.$evalAsync(function () {
            $scope.dimensions = { width: $element[0].offsetWidth, height: $element[0].offsetHeight }
            $scope.$broadcast('app:resized', $scope.dimensions)
          })
        }
      }


      function translateEnd (event) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        let cssObj = UiAppsService.getCssObj($scope.container, $element[0], alignment)
        $scope.entry.css = cssObj
        $element.css(cssObj)

        $element[0].classList.remove('active')

        $document.off('mousemove', translate)
        $document.off('mouseup', translateEnd)
        UIAppStorage.layoutDirty = true
      }

      function resizeEnd (event) {
        let cssObj = UiAppsService.getCssObj($scope.container, $element[0], null)
        $scope.entry.css.width = cssObj.width
        $scope.entry.css.height = cssObj.height

        $element.removeClass('active')

        $scope.$evalAsync(() => { $scope.showDimensions = false })
        $document.off('mousemove', resize)
        $document.off('mouseup', resizeEnd)
        UIAppStorage.layoutDirty = true
      }
    }
  }
}])
