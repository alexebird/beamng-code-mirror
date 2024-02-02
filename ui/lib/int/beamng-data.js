angular.module('beamng.data', ['beamng.core'])

.constant('EnvironmentPresets', {
  gravity: [
    { title: 'ui.environment.zeroGravity',   value: 0.0    },
    { title: 'ui.environment.earth',         value: -9.81  },
    { title: 'ui.environment.moon',          value: -1.62  },
    { title: 'ui.environment.mars',          value: -3.71  },
    { title: 'ui.environment.sun',           value: -274   },
    { title: 'ui.environment.jupiter',       value: -24.92 },
    { title: 'ui.environment.neptune',       value: -11.15 },
    { title: 'ui.environment.saturn',        value: -10.44 },
    { title: 'ui.environment.uranus',        value: -8.87  },
    { title: 'ui.environment.venus',         value: -8.87  },
    { title: 'ui.environment.mercury',       value: -3.7   },
    { title: 'ui.environment.pluto',         value: -0.58  },
    { title: 'ui.environment.negativeEarth', value: 9.81   }
  ],

  simSpeed: [
    { title: 'ui.environment.realtime', value: 1 },
    { title: '1/2x',    value: 2 },
    { title: '1/4x',    value: 4 },
    { title: '1/10x',   value: 10 },
    { title: '1/25x',   value: 25 },
    { title: '1/50x',   value: 50 },
    { title: '1/100x',  value: 100 },
    { title: '1/500x',  value: 500 },
    { title: '1/1000x', value: 1000 }
  ]
})


.factory('Environment', ['$rootScope', 'RateLimiter', 'Utils', function ($rootScope, RateLimiter, Utils) {

  var _registeredScopes = {}

  var _updateRegisteredScopes = () => {
    Object.keys(_registeredScopes).forEach((x) => {
      _registeredScopes[x].call(null)
    })
  }

  /**
   * @prop time {float} Current time of day in range [0, 1].
   * @prop dayScale {float}  How fast time passes in day
   * @prop nightScale {float} Same as dayScale for night
   * @prop play {boolean} Whether time changes
   * @prop fogDensity {float}
   * @prop cloudCover {float}
   * @prop gravity {float}
   * @prop windSpeed {float}
   *
   * @note Check file game:/lua/ge/extensions/core/environment.lua
   */
  var _state = {}

  // Current simulation speed
  var _bulletTime

  // This triggers an "EnvironmentStateUpdate" event. The calls are
  // debounced since they might occur in a very high rate.
  var _requestEnvironmentState = RateLimiter.debounce(function () {
    bngApi.engineLua('core_environment.requestState()')
  }, 300, false)

  // This triggers a "BullettimeValueChanged" event. The calls are
  // debounced since they might occur in a very high rate.
  var _requestSimulationSpeed = RateLimiter.debounce(function () {
    bngApi.engineLua('simTimeAuthority.requestValue()')
  }, 30, false)

  // Update the stored state and the registered scopes.
  var _updateState = (data) => {
    _state = data
    if (typeof data.time !== 'number') _state.time = -1

    if (data.play && _timeWatcher === null) {
      _timeWatcher = _watchTime()
    } else if (!data.play && _timeWatcher !== null) {
      clearInterval(_timeWatcher)
      _timeWatcher = null
    }

    _updateRegisteredScopes()
    _state.uidata = {}
    _state.uidata.fogDensityMinRange = Math.log10(0.001)
    _state.uidata.fogDensityMaxRange = Math.log10(20000)
    Utils.mapUI(_state, _state.uidata, "fogDensity", v=>Math.log10(v), v=>Math.pow(10, v)); // linear to logarithmic scale
  }

  // Poll to get time changes
  var _watchTime = function () {
    return setInterval(function () {
      bngApi.engineLua('core_environment.getTimeOfDay()', (timeObj) => {
        if (timeObj) {
          _state.time = timeObj.time
        }
        _updateRegisteredScopes()
      })
    }, 200)
  }

  // Interval id for time changes poll
  var _timeWatcher = null

  $rootScope.$on('EnvironmentStateUpdate', (_, data) => { _updateState(data); })

  $rootScope.$on('BullettimeValueChanged', (_, value) => {
    _bulletTime = Math.round(1/value)
    _updateRegisteredScopes()
  })

  var _update = () => {
    bngApi.engineLua('core_environment.requestState()')
    bngApi.engineLua('simTimeAuthority.requestValue()')
  }

  // Get initial state
  _update()


  return {
    update: _update,
    get state() { return _state; },
    get simSpeed() { return _bulletTime; },
    set simSpeed(val) { this.setSimSpeed(1/val); },

    submitState: (stateObj) => {
      bngApi.engineLua(`core_environment.setState(${bngApi.serializeToLua(stateObj || _state)})`)
      _requestEnvironmentState()
    },

    setSimSpeed: (x) => {
      bngApi.engineLua(`simTimeAuthority.set(${x || 1/_bulletTime})`)
      _requestSimulationSpeed()
    },

    registerScope: (scope, updateFn) => {
      _registeredScopes[scope.$id] = updateFn
      scope.$on('$destroy', () => { delete _registeredScopes[scope.$id]; })
    }
  }
}])

// Populated in run phase of beamng.data module
.constant('Hints', [])


.factory('AppSelectFilters', [function () {
  var _types = {}; // The types are filled in each time the app list gets updated

  var service = {
    query: '',

    get types() { return _types; },

    selectAll: () => { for (var key in _types) _types[key] = true; },

    deselectAll: () => {
      for (var key in _types)
        _types[key] = false
      service.query = ''
    },

    typesFilter: (model) => {
      return Object.keys(_types).some(key => _types[key] && model.types.indexOf(key) !== -1)
    }
  }

  return service
}])

.factory('TechLicenseState', ['$rootScope', '$q', function($rootScope, $q) {
  var _state = null
  var _def = null

  $rootScope.$on('TechLicenseState', (ev, data) => {
    _state = data
    if (_def != null) {
      _def.resolve(data)
      _def = null
    }
  })

  return {
    get state() {
      if (_def == null) {
        _def = $q.defer()
      }

      if (_state != null) {
        let ret = _def
        _def.resolve(_state)
        _def = null
        return ret.promise
      } else {
        bngApi.engineLua('extensions.tech_license.requestState()')
      }

      return _def.promise
    }
  }
}])

.run(['$http', '$log', 'Hints', function ($http, $log, Hints) {

  var hintsPath = '/ui/modules/loading/hints.json'

  $http.get(hintsPath)
    .success((data) => { Array.prototype.push.apply(Hints, data); })
    .error((error) => { $log.error(`Could not load hints from ${hintsPath}.`); })

}])
