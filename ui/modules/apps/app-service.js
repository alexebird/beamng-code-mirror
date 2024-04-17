"use strict"

angular.module('beamng.apps', ['oc.lazyLoad'])

.value('UIAppStorage', {
  // global, between all app containers:
  availableLayouts: {},
  availableApps: {},
  containers: {},

  // per app container: move this - TODO FIXME
  current: { apps: [] },
  dataAvailable: false,
  layoutDirty: false,
  queuedlayoutChange: null,
})

.factory('UiAppsService', ['$compile', '$filter', '$http', '$injector', '$q', '$rootScope', '$ocLazyLoad', 'UIAppStorage', 'RateLimiter',
function ($compile, $filter, $http, $injector, $q, $rootScope, $ocLazyLoad, UIAppStorage, RateLimiter) {

  let service = {}

  function _appLoaded(container, $scope) {
    UIAppStorage.current.appsToLoad--
    if(UIAppStorage.current.appsToLoad <= 0) {
      //console.info("    >>>> Layout loading done. ALL APPS LOADED:", UIAppStorage.current)
      // UIAppStorage.current.appsToLoad = 0;

      bngApi.engineLua(`extensions.hook('onUILayoutLoaded', '${UIAppStorage.current.type}')`)

      if(UIAppStorage.queuedlayoutChange !== null) {
        //console.log('DEQUEUED LOADLAYOUT')
        service.loadLayout(UIAppStorage.queuedlayoutChange, container, $scope)
        UIAppStorage.queuedlayoutChange = null
      }

    }
  }




  let _loadLayoutFinal = function(layoutTemplate, container, parentScope) {
    service.clearCurrentLayout(container)
    UIAppStorage.current = JSON.parse(JSON.stringify(layoutTemplate)) // very hacky way to clone the data
    UIAppStorage.current.layoutTemplateFilename = layoutTemplate.filename
    UIAppStorage.current.appsToLoad = UIAppStorage.current.apps.length
    for(let j = 0; j < UIAppStorage.current.apps.length; ++j) {
      service.spawnApp(UIAppStorage.current.apps[j], container, parentScope, j)
    }
    $rootScope.$broadcast('onLayoutsChanged')
    //console.log("layout loaded. Apps delay load: ", UIAppStorage.current, container[0].children) // layoutTemplate
  }

  function _lazyLoadAppJSSource(appData) {
    if (!$injector.has(appData.directive + 'Directive')) {
      // if app has vue version (app.json's vue property is set to true)
      if (appData.vue === true) {
        // console.log(`App ${appData.directive} contains vue version. skipping lazy loading of angular component.`)
        return $q.resolve()
      }

      if (appData.jsSource) {
        // should use absolute path: "/ui/..."
        // console.log(`lazy loading ${appData.jsSource} ...`)
        return $ocLazyLoad.load(appData.jsSource)
      } else {
        return $q.reject(`ERROR: No jsSource field for ${appData.directive}`)
      }
    } else {
      return $q.when()
    }
  }

  service = {
    // Fake window resize events are a handy way to forcilly recheck apps' status. However,
    // style changing causes reflows and is in general expensive, so we just wrap it inside a debounce
    // function to avoid checking as many times as the amount of used apps.
    spawnApp: function (appData, container, parentScope, appId) {
      //console.info('UIA| spawnApp | ', appData, container, parentScope, appId)

      if(!(appData.appName in UIAppStorage.availableApps)) {
        console.error(`app not found: ${appData.appName}`)
        _appLoaded(container, parentScope)
        return
      }
      let appTemplate = UIAppStorage.availableApps[appData.appName]

      let appTemplateInstance = JSON.parse(JSON.stringify(appTemplate)) // very hacky way to clonethe data
      appData = Object.assign(appData, appTemplateInstance)

      if(!('apps' in UIAppStorage.current) || !Array.isArray(UIAppStorage.current.apps)) {
        UIAppStorage.current.apps = []
      }
      if(appId === undefined) {
        appId = UIAppStorage.current.apps.length.toString()
        //console.warn("# NEW APP: ", appId, appData)
      }

      // fixup / defaults for cockpit
      if(!('settings' in appData)) {
        appData.settings = {}
      }
      if(!('noCockpit' in appData.settings)) {
        appData.settings.noCockpit = false
      }

      _lazyLoadAppJSSource(appData).then(function () {
        let appScope = parentScope.$new(true)
        appScope.name = appData.name

        let tmpl
        const isVue = appData.vue === true

        if (isVue) {
        //   console.log(`app ${appData.domElement} has vue version`)
          tmpl = `<bng-app appid="${appId}" containerid="${container[0].id}"><div id="${appData.directive + appId}"
            style="width: 100%;height: 100%;"></bng-app>`
        } else {
          tmpl = `<bng-app appid="${appId}" containerid="${container[0].id}">${appData.domElement}</bng-app>`
        }

        let el = $compile(tmpl)(appScope)

        appData.css = appData.css || {}

        if('placement' in appData) {
          appData.css = appData['placement']
        }

        appData.element = el

        UIAppStorage.current.apps[appId] = appData

        container.append(el)

        el.ready(function () {
          if (bngVue.spawnApp && isVue) {
            // console.log('before spawn', appData.vueParams)
            bngVue.spawnApp(appData.directive, appId, appData.vueParams)
          }
          el.css(appData.css)
          $rootScope.$broadcast('windowResize')
          // _appLoaded should be here because app.js's own el.ready logic depends on current layout.
          // when layout is switched before app.js finishes loading, errors and conflicts may occur.
          // and if _appLoaded is outside of el.ready, layout change is allowed instead of being queued.
          _appLoaded(container, parentScope)
        })

      }, function () {
        console.error(`Failed to load ${appData.directive} directive`)
        _appLoaded(container, parentScope)
      })
    },

    clearCurrentLayout: function (container) {
      //console.info('UIA| clearCurrentLayout')
      if (Array.isArray(UIAppStorage.current.apps)) {
        for (let app of UIAppStorage.current.apps) {
          if(app !== undefined && app.element !== undefined) {
            app.element.remove()

            // try delete in vue if existing
            if(bngVue.destroyApp)
              bngVue.destroyApp(app.appName)
          }
        }
        UIAppStorage.current.apps = []
      }
      for (let e of container[0].children) {
        if(e.className === 'bng-app' || e.localName === 'bng-app') {
          e.remove()

          // try delete in vue if existing
          // how exactly with no reference to the app name?
        }
      }
    },

    saveLayout: function (layout, luaCallbackFunction = 'ui_apps.saveLayout') {
      //console.info('UIA| saveLayout | ', layout)
      UIAppStorage.wasSaving = true
      if(!UIAppStorage.layoutDirty) {
        //console.log('not saving layout, not changed.')
        return
      }
      //console.log('saveLayout ... ')
      // skip if layout has no type, but only if default savefunction is used.
      if(!('type' in layout) && luaCallbackFunction === 'ui_apps.saveLayout') return
      // the save format is a very slim version with default values not being written out
      let res = {}
      res.type = layout.type
      res.filename = layout.filename
      if(layout.title) res.title = layout.title
      if(layout.description) res.description = layout.description
      if(layout.devonly) res.devonly = layout.devonly
      res.apps = []
      for(let i = 0; i < layout.apps.length; ++i) {
        let app = layout.apps[i]
        if(app === undefined) continue

        let appSimple = {}
        appSimple.appName = app.appName
        if(app.element !== undefined) {
          // use the actual css
          appSimple.placement = app.css
        } else {
          // use the config
          appSimple.placement = app.placement
        }
        if('settings' in app) {
          let settings = JSON.parse(JSON.stringify(app['settings'])) // very hacky way to clone the data
          // remove default settings
          if('noCockpit' in settings && settings['noCockpit'] === false) delete settings['noCockpit']
          if(Object.keys(settings).length > 0) {
            appSimple.settings = settings
          }
        }

        res.apps.push(appSimple)
      }
      //console.log('saveLayout', layout, res)
      bngApi.engineLua(`${luaCallbackFunction}(${bngApi.serializeToLua(res)})`)
      UIAppStorage.dataAvailable = false // force data refresh
    },

    // reqData can contain a filename, a type string or an object with the layout itself
    loadLayout: function (reqData, container, parentScope) {
      //console.info('UIA| >>>>>> loadLayout | ', reqData, container, parentScope)
      //console.trace()

      if(UIAppStorage.dataAvailable === false || (UIAppStorage.current && UIAppStorage.current.appsToLoad > 0)) {
        UIAppStorage.queuedlayoutChange = reqData
        //console.log(`loadLayout QUEUED. UIAppStorage.dataAvailable = ${UIAppStorage.dataAvailable}, current = ${UIAppStorage.current},  appsToLoad = ${UIAppStorage.current.appsToLoad}`)
        return
      }

      let layout = null
      // look for a layout that fits the spec defined in reqData
      if (reqData.filename !== undefined) {
        for(let i = 0; i < UIAppStorage.availableLayouts.length; ++i) {
          let layoutTemplate = UIAppStorage.availableLayouts[i]
          if(layoutTemplate.filename === reqData.filename) {
            layout = layoutTemplate
            break
          }
        }

      } else if (reqData.type !== undefined) {
        for(let i = 0; i < UIAppStorage.availableLayouts.length; ++i) {
          let layoutTemplate = UIAppStorage.availableLayouts[i]
          if(layoutTemplate.type === reqData.type) {
            if((layout && 'default' in layout && layout['default'] === true) || layout === null) {
              layout = layoutTemplate
            }
          }
        }

      } else if (reqData.object !== undefined && reqData.object.apps !== null) {
        layout = reqData.object
      }

      if(layout === null) {
        console.error('unable to load layout. Not found: ', reqData)
        return
      }
      //console.log(' ... loading layout: ', layout)
      UIAppStorage.currentLayout = reqData
      _loadLayoutFinal(layout, container, parentScope)
    },

    getLayout: function () {
      return UIAppStorage.currentLayout
    },

    resetLayout: function (playmode, container, parentScope) {
      //console.info('UIA| resetLayout | ', playmode, container, parentScope)
      if(UIAppStorage.current.type !== undefined) {
        service.loadLayout({type: UIAppStorage.current.type}, container, parentScope)
      } else if (playmode !== '') {
        service.loadLayout({type: playmode}, container, parentScope)
      }
      UIAppStorage.layoutDirty = true
    },

    deleteLayout: function (container, parentScope) {
      //console.info('UIA| deleteLayout | ', container, parentScope)
      //if(UIAppStorage.current.default !== undefined && UIAppStorage.current.default == true) return; // do not delete defaults
      bngApi.engineLua(`ui_apps.deleteLayout('${UIAppStorage.current.filename}')`)
    },

    createNewLayout: function() {
      //console.info('UIA| createNewLayout')
      service.clearCurrentLayout()
      UIAppStorage.current = {
        apps: [],
        type: 'custom',
        title: 'My Layout',
        filename: 'settings/ui_apps/layouts/custom.uilayout.json'
      }
      UIAppStorage.availableLayouts.push(UIAppStorage.current)
      service.saveLayout(UIAppStorage.current)
      bngApi.engineLua('ui_apps.requestUIAppsData()')
      UIAppStorage.layoutDirty = true
    },

    ensureAppVisible: function(appData, container, parentScope) {
      for(let i = 0; i < UIAppStorage.current.apps.length; ++i) {
        let app = UIAppStorage.current.apps[i]
        if(app === undefined) continue
        if(app.appName === appData.appName) {
          // app there, all good
          // TODO: check if on screen and not hidden?
          return true
        }
      }
      // otherwise add the app
      service.spawnApp(appData, container, parentScope)
      UIAppStorage.layoutDirty = true
    },

    resetPositionAttributes: function (element) {
      let top  = element.offsetTop
      let left = element.offsetLeft

      element.style.bottom = element.style.right = element.style.margin = ''
      element.style.top  = `${top}px`
      element.style.left = `${left}px`
    },

    alignInContainer: function (container, element, top, left) {
      let alignment = ''

      // Check if we are really close to the center
      let centerRadius = 40
      let parentRect = container.getBoundingClientRect()
      let rect = element.getBoundingClientRect()
      let cx = left + 0.5 * rect.width
      let cy = top + 0.5 * rect.height
      let pageCenterX = parentRect.width / 2
      let pageCenterY = parentRect.height / 2

      if (Math.abs(cy - pageCenterY) < centerRadius) {
        element.style.top = `${pageCenterY - rect.height / 2}px`
        alignment += 'C'
      } else {
        // element.style.top = top + 'px'
        // alignment += cy < pageCenterY ? 'T' : 'B'
        if (cy < pageCenterY) {
          element.style.top = `${top}px`
          alignment += 'T'
        } else {
          let pxFromBottom = parentRect.height - top - rect.height
          pxFromBottom = Math.ceil(pxFromBottom / 5) * 5 // WARNING: HARDCODED GRID (matches the one in the bngApp controller?)
          element.style.top = `${parentRect.height - pxFromBottom - rect.height}px`
          alignment += 'B'
        }
      }

      if (Math.abs(cx - pageCenterX) < centerRadius) {
        element.style.left = `${pageCenterX - rect.width/2}px`
        alignment += 'C'
      } else {
        // element.style.left = left + 'px'
        // alignment += cx < pageCenterX ? 'L' : 'R'
        if (cx < pageCenterX) {
          element.style.left = `${left}px`
          alignment += 'L'
        } else {
          let pxFromRight = parentRect.width - left - rect.width
          pxFromRight = Math.ceil(pxFromRight / 5) * 5 // WARNING: HARDCODED GRID (matches the one in the bngApp controller?)
          element.style.left = `${parentRect.width - pxFromRight - rect.width}px`
          alignment += 'R'
        }
      }

      return alignment
    },

    drawAlignmentHelpers: function (container, ctx, element, alignment) {
      let parentRect = container.getBoundingClientRect()
      let rect = element.getBoundingClientRect()
      rect.x -= parentRect.x
      rect.y -= parentRect.y

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.font = 'bold 20px Roboto'
      // ctx.fillStyle = "rgba(252, 107, 3, 0.9)"

      ctx.lineWidth = 3
      ctx.strokeStyle = 'black'
      // ctx.shadowBlur = 10
      // ctx.shadowColor = 'white'
      ctx.setLineDash([3, 8])

      if (alignment === 'CC') {
        ctx.save()
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.clearRect(rect.left-15, rect.top-15, rect.width+30, rect.height+30)
        ctx.restore()
        return
      }

      switch (alignment.charAt(0)) {
        case 'C':
          ctx.save()
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
          ctx.fillRect(0, 0, ctx.canvas.width, rect.top)
          ctx.fillRect(0, rect.bottom, ctx.canvas.width, ctx.canvas.height)
          ctx.restore()
          break
        case 'T':
          ctx.beginPath()
          ctx.moveTo(rect.left + rect.width/2, rect.top)
          ctx.lineTo(rect.left + rect.width/2, 0)
          ctx.stroke()

          ctx.textBaseline = 'bottom'
          ctx.textAlign    = 'left'
          ctx.fillText(rect.top, rect.left + rect.width/2 + 8, rect.top - 2)
          ctx.closePath()
          break
        case 'B':
          ctx.beginPath()
          ctx.moveTo(rect.left + rect.width/2, rect.bottom)
          ctx.lineTo(rect.left + rect.width/2, ctx.canvas.height)
          ctx.stroke()

          ctx.textBaseline = 'top'
          ctx.textAlign    = 'left'
          ctx.fillText(Math.ceil(container.clientHeight - rect.bottom), rect.left + rect.width/2 + 8, rect.bottom + 2)
          ctx.closePath()
      }


      switch (alignment.charAt(1)) {
        case 'C':
          ctx.save()
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
          ctx.fillRect(0, 0, rect.left, ctx.canvas.height)
          ctx.fillRect(rect.right, 0, ctx.canvas.width, ctx.canvas.height)
          ctx.restore()
          break
        case 'L':
          ctx.beginPath()
          ctx.moveTo(rect.left, rect.top + rect.height/2)
          ctx.lineTo(0, rect.top + rect.height/2)
          ctx.stroke()

          ctx.textBaseline = 'bottom'
          ctx.textAlign = 'right'
          ctx.fillText(rect.left, rect.left - 8, rect.top + rect.height/2 - 2)
          ctx.closePath()
          break
        case 'R':
          ctx.beginPath()
          ctx.moveTo(rect.right, rect.top + rect.height/2)
          ctx.lineTo(ctx.canvas.width, rect.top + rect.height/2)
          ctx.stroke()

          ctx.textBaseline = 'bottom'
          ctx.textAlign = 'left'
          ctx.fillText(Math.floor(container.clientWidth - rect.right), rect.right + 8, rect.top + rect.height/2 - 2)
          ctx.closePath()
      }
    },

    getCssObj: function (container, element, alignment) {
      let parentRect = container.getBoundingClientRect()
      let rect = element.getBoundingClientRect()
      let obj = {position: 'absolute', width: `${rect.width}px`, height: `${rect.height}px`}

      if (!alignment) return obj

      switch (alignment.charAt(0)) {
        case 'C':
          obj['top'] = 0
          obj['bottom'] = 0
          obj['margin'] = 'auto'
          break

        case 'T':
          obj['top'] = `${rect.top - parentRect.top}px`
          obj['bottom'] = ''
          break

        case 'B':
          obj['top'] = ''
          obj['bottom'] = `${parentRect.bottom - rect.bottom}px`
      }

      switch (alignment.charAt(1)) {
        case 'C':
          obj['left'] = 0
          obj['right'] = 0
          obj['margin'] = 'auto'
          break
        case 'L':
          obj['left'] = `${rect.left - parentRect.left}px`
          obj['right'] = ''
          break
        case 'R':
          obj['left'] = ''
          obj['right'] = `${parentRect.right - rect.right}px`
      }
      return obj
    },

    restrictInWindow: function (container, element) {
      // let rect = element.getBoundingClientRect()
      // console.log('rect', rect)
      // console.log(element.offsetTop, element.offsetLeft, element.offsetLeft + element.offsetWidth, element.offsetTop + element.offsetHeight)
      if (element.offsetTop < 0) {
        element.style.top = 0
        element.style.bottom = undefined
        // element.style.margin = undefined
      }

      if (element.offsetLeft < 0) {
        element.style.left = 0
        element.style.right = undefined
        // element.style.margin = undefined
      }

      if ((element.offsetTop + element.offsetHeight) > container.clientHeight) {
        element.style.top = undefined
        element.style.bottom = 0
        // element.style.margin = undefined
      }

      if ((element.offsetLeft + element.offsetWidth) > container.clientWidth) {
        element.style.left = undefined
        element.style.right = 0
        // element.style.margin = undefined
      }

      // Resize as last resort!
      // rect = element.getBoundingClientRect()

      if (element.offsetTop < 0 || element.offsetTop + element.offsetHeight > container.clientHeight) {
        element.style.margin = undefined
        element.style.height = `${container.clientHeight}px`
      }
      if (element.offsetLeft < 0 || element.offsetLeft + element.offsetWidth > container.clientWidth) {
        element.style.margin = undefined
        element.style.width = `${container.clientWidth}px`
      }
    },

    handleCameraChange: function (cameraMode, editMode) {
      let visibleOpacity = 1 // always fully visible
      let hiddenOpacity = 1 // fully visible in non-driver cameras
      if (cameraMode === 'driver') {
        if (editMode) hiddenOpacity = 0.7 // partially transparent while editing apps
        else hiddenOpacity = 0 // fully transparent while playing
      }

      //console.log("handleCameraChange", UIAppStorage.current)
      if('apps' in UIAppStorage.current) {
        for(let i = 0; i < UIAppStorage.current.apps.length; ++i) {
          let app = UIAppStorage.current.apps[i]
          if(app === undefined || app.element === undefined) continue
          app.element[0].style.opacity = app.settings.noCockpit ? hiddenOpacity : visibleOpacity
        }
      }
    }
  }

  $rootScope.$on('getCurrentLayoutToLua', function(evt, callback) {
    service.saveLayout(UIAppStorage.current, callback)
  })

  $rootScope.$on('onUIAppsData', function(evt, data) {
    //console.log('onUIAppsData', data)
    if(UIAppStorage.wasSaving) {
      // this is a hack to prevent reloading the layout upon saving it.
      UIAppStorage.wasSaving = null
      return
    }
    UIAppStorage.availableLayouts = data.availableLayouts
    UIAppStorage.availableApps = data.availableApps
    UIAppStorage.dataAvailable = true
    UIAppStorage.layoutDirty = false

    $rootScope.$broadcast('appContainer:onUIDataUpdated')
  })

  return service
}])

.factory('CanvasShortcuts', function () {
  return {
    filledArc: function (ctx, x, y, r, w, v, c) {
      if(v > 1) v = 1
      else if(v < -1) v = -1
      ctx.beginPath()
      let rads = v * 2 * Math.PI
      let reverse = (v < 0)
      ctx.arc(x,y,r-(w/2)  , 1.5 * Math.PI, 1.5 * Math.PI + rads, reverse)
      ctx.lineWidth = w
      ctx.strokeStyle = c
      ctx.stroke()
      ctx.closePath()
    },
    circle: function (ctx, x, y, r, lineWidth, strokeStyle, fillStyle) {
      ctx.beginPath()
      ctx.arc(x,y,r-(lineWidth/2), 0, 2 * Math.PI, false)
      let prevFillStyle = ctx.fillStyle
      if (fillStyle !== undefined) {
        ctx.fillStyle = fillStyle
        ctx.fill()
      }
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = strokeStyle
      ctx.stroke()
      ctx.closePath()
      if (fillStyle !== undefined) {
        ctx.fillStyle = prevFillStyle
      }
    },

    subsample: function (outLength, inputArray) {

      let winLength = Math.floor(inputArray.length / outLength)
      let outArray = new Array(outLength)

      for (let i=0; i<outLength; i+=1) {
        let val = 0.0
        for (let j=0; j<winLength; j+=1)
          val += inputArray[i*winLength + j]

        outArray[i] = val / winLength
      }

      return outArray
    },

    plotAxis: function (ctx, side, range, ticks, _margin, grid, txtColor) {
      let margin = angular.extend({top: 0, bottom: 0, left: 0, right: 0}, _margin)
      let width  = ctx.canvas.clientWidth
      let height = ctx.canvas.clientHeight

      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 1
      let yFactor = 1
      let xFactor = 1

      switch (side) {
        case 'left':
          ctx.moveTo(margin.left, margin.top)
          ctx.lineTo(margin.left, height - margin.bottom)
          ctx.stroke()

          if (range.length > 0) {
            yFactor = (range[1] - range[0]) / (height - margin.top - margin.bottom)
          }
          // Draw ticks
          if (ticks.length > 0) {
            ctx.textAlign = 'end'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = txtColor || 'black'

            ticks.map(function (t) {
              let y = height - margin.bottom - ((t - range[0]) / yFactor)
              ctx.fillText(t, margin.left - 3, y)
            })
          }

          if (grid) {
            let gridParams = angular.extend({color: 'black', width: 1}, grid)
            ctx.setLineDash(gridParams.dashArray || [])

            if (gridParams.values) { // Gridlines at specified values
              if (!range)
                console.error('left axis: Grid values without range')

              gridParams.values.map(function (v) {
                let y = height - margin.bottom - (v / yFactor)
                ctx.beginPath()
                ctx.strokeStyle = gridParams.color
                ctx.lineWidth = gridParams.width
                ctx.moveTo(width - margin.right, y)
                ctx.lineTo(margin.left, y)
                ctx.stroke()
              })

            } else if (gridParams.numLines) {
              let gmin = (!range || !gridParams.min) ? (height - margin.bottom) : (height - margin.bottom - (gridParams.min || range[0]) / yFactor)
              let gmax = (!range || !gridParams.max) ? margin.top : (height - margin.bottom - (gridParams.max || range[1]) / yFactor)
              let tickSpacing = (gmax - gmin) / (grid.numLines - 1)

              for (let i=0; i<gridParams.numLines; i++) {
                let y = gmin + i*tickSpacing
                ctx.beginPath()
                ctx.strokeStyle = gridParams.color
                ctx.lineWidth = gridParams.width
                ctx.moveTo(margin.left, y)
                ctx.lineTo(width - margin.right, y)
                ctx.stroke()
              }
            } else {
              console.warn('left axis: Must provide values or number of lines for grid')
            }
          }

          break

        case 'right':
          ctx.moveTo(width - margin.right, margin.top)
          ctx.lineTo(width - margin.right , height - margin.bottom)
          ctx.stroke()

          if (range.length > 0) {
            yFactor = (range[1] - range[0]) / (height - margin.top - margin.bottom)
          }

          // Draw ticks
          if (ticks.length > 0) {
            ctx.textAlign = 'start'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = txtColor || 'black'

            ticks.map(function (t) {
              let y = height - margin.bottom - ((t-range[0]) / yFactor)
              ctx.fillText(t, width - margin.right + 3, y)
            })
          }

          // Draw gridlines
          if (grid) {
            let gridParams = angular.extend({color: 'black', width: 1}, grid)
            ctx.setLineDash(gridParams.dashArray || [])

            if (gridParams.values) { // Gridlines at specified values
              if (!range)
                console.error('right axis: Grid values without range')

              gridParams.values.map(function (v) {
                let y = height - margin.bottom - (v / yFactor)
                ctx.beginPath()
                ctx.strokeStyle = gridParams.color
                ctx.lineWidth = gridParams.width
                ctx.moveTo(width - margin.right, y)
                ctx.lineTo(margin.left, y)
                ctx.stroke()
              })

            } else if (gridParams.numLines) {
              let gmin = (!range || !gridParams.min) ? (height - margin.bottom) : (height - margin.bottom - (gridParams.min || range[0]) / yFactor)
              let gmax = (!range || !gridParams.max) ? margin.top : (height - margin.bottom - (gridParams.max || range[1]) / yFactor)
              let tickSpacing = (gmax - gmin) / (grid.numLines - 1)

              for (let i=0; i<gridParams.numLines; i++) {
                let y = gmin + i*tickSpacing
                ctx.beginPath()
                ctx.strokeStyle = gridParams.color
                ctx.lineWidth = gridParams.width
                ctx.moveTo(width - margin.right, y)
                ctx.lineTo(margin.left, y)
                ctx.stroke()
              }
            } else {
              console.warn('right axis: Must provide values or number of lines for grid')
            }
          }
          break

        case 'top':
          ctx.moveTo(margin.left, margin.top)
          ctx.lineTo(width - margin.right, margin.top)
          ctx.stroke()

          if (range.length > 0) {
            xFactor = (range[1] - range[0]) / (width - margin.left - margin.right)
          }

          // Draw ticks
          if (ticks.length > 0) {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillStyle = txtColor || 'black'

            ticks.map(function (t) {
              let x = margin.left + (t / xFactor)
              ctx.fillText(t, x, margin.top - 3)
            })
          }

          // Draw gridlines
          if (grid) {
            let gridParams = angular.extend({color: 'black', width: 1}, grid)
            ctx.setLineDash(gridParams.dashArray || [])

            if (gridParams.values) { // Gridlines at specified values
              if (!range)
                console.error('top axis: Grid values without range')

              gridParams.values.map(function (v) {
                let x = margin.left + (v / xFactor)
                ctx.beginPath()
                ctx.strokeStyle = gridParams.color
                ctx.lineWidth = gridParams.width
                ctx.moveTo(x, margin.top)
                ctx.lineTo(x, height - margin.bottom)
                ctx.stroke()
              })

            } else if (gridParams.numLines) {
              let gmin = (!range || !gridParams.min) ? margin.left            : (margin.left + (gridParams.min || range[0]) / xFactor)
              let gmax = (!range || !gridParams.max) ? (width - margin.right) : (margin.left + (gridParams.max || range[1]) / xFactor)
              let tickSpacing = (gmax - gmin) / (grid.numLines - 1)

              for (let i=0; i<gridParams.numLines; i++) {
                let x = gmin + i*tickSpacing
                ctx.beginPath()
                ctx.strokeStyle = gridParams.color
                ctx.lineWidth = gridParams.width
                ctx.moveTo(x, margin.top)
                ctx.lineTo(x, height - margin.bottom)
                ctx.stroke()
              }
            } else {
              console.warn('top axis: Must provide values or number of lines for grid')
            }
          }

          break

        case 'bottom':
          // Draw axis
          ctx.moveTo(margin.left, height - margin.bottom)
          ctx.lineTo(width - margin.right, height - margin.bottom)
          ctx.stroke()

          if (range.length > 0) {
            xFactor = (range[1] - range[0]) / (width - margin.left - margin.right)
          }

          // Draw ticks
          if (ticks.length > 0) {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = txtColor || 'black'

            ticks.map(function (t) {
              let x = margin.left + (t / xFactor)
              ctx.fillText(t, x, height - margin.bottom + 3)
            })
          }

          // Draw gridlines
          if (grid) {
            let gridParams = angular.extend({color: 'black', width: 1}, grid)
            ctx.setLineDash(gridParams.dashArray || [])

            if (gridParams.values) { // Gridlines at specified values
              if (!range)
                console.error('bottom axis: Grid values without range')

              gridParams.values.map(function (v) {
                let x = margin.left + (v / xFactor)
                ctx.beginPath()
                ctx.strokeStyle = gridParams.color
                ctx.lineWidth = gridParams.width
                ctx.moveTo(x, height - margin.bottom)
                ctx.lineTo(x, margin.top)
                ctx.stroke()
              })

            } else if (gridParams.numLines) {
              let gmin = (!range || !gridParams.min) ? margin.left            : (margin.left + (gridParams.min || range[0]) / xFactor)
              let gmax = (!range || !gridParams.max) ? (width - margin.right) : (margin.left + (gridParams.max || range[1]) / xFactor)
              let tickSpacing = (gmax - gmin) / (grid.numLines - 1)

              for (let i=0; i<gridParams.numLines; i++) {
                let x = gmin + i*tickSpacing
                ctx.beginPath()
                ctx.strokeStyle = gridParams.color
                ctx.lineWidth = gridParams.width
                ctx.moveTo(x, height - margin.bottom)
                ctx.lineTo(x, margin.top)
                ctx.stroke()
              }
            } else {
              console.warn('bottom axis: Must provide values or number of lines for grid')
            }
          }

          break

        default:
          log.warn(`Unknown side ${side}`)
      }

      ctx.restore()
    },

    plotData: function (ctx, data, miny, maxy, inputParams) {
      let defaultParams = {
        margin: {
          top: 15, bottom: 15, left: 25, right: 25
        },
        lineWidth: 2,
        lineColor: 'black',
        minIndex: 0,
        maxIndex: data.length - 1,
        lineType: null
      }

      let params = angular.extend({}, defaultParams, inputParams)
      let width = ctx.canvas.clientWidth - params.margin.left - params.margin.right
      let height = ctx.canvas.clientHeight
      let yFactor = (height - params.margin.bottom - params.margin.top) / (maxy - miny)
      let dx = width / (data.length - 1)

      ctx.save()
      ctx.beginPath()
      ctx.lineWidth = params.lineWidth
      ctx.strokeStyle = params.lineColor

      if (params.dashArray) {
        // user-defined dash array
        ctx.setLineDash(params.dashArray)
      } else {
        // or one of the presets (solid line as default)
        switch (params.lineType) {
          case 'dashed':
            ctx.setLineDash([4*params.lineWidth, 3*params.lineWidth])
            break
          case 'dotted':
            ctx.setLineDash([params.lineWidth, 2*params.lineWidth])
            break
          default:
            // console.log('back to default:', params.lineType)
            ctx.setLineDash([])
        }
      }


      ctx.moveTo(params.margin.left + params.minIndex * dx, height - params.margin.bottom - data[params.minIndex]*yFactor)

      for (let i=params.minIndex + 1; i<=params.maxIndex; i++)
        ctx.lineTo(params.margin.left + i*dx, height - data[i]*yFactor - params.margin.bottom)

      ctx.stroke()
      ctx.restore()

    }


  }
})

