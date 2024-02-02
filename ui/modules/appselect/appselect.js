angular.module('beamng.stuff')

/**
 * @ngdoc controller
 * @name beamng.stuff:AppSelectController
 * @requires $filter
 * @requires $rootScope
 * @requires $scope
 * @requires $state
 */
.controller('AppSelectController', ['$filter', '$rootScope', '$scope', '$state', 'AppSelectFilters', 'UIAppStorage',
function ($filter, $rootScope, $scope, $state, AppSelectFilters, UIAppStorage) {
  var vm = this

  // Extend here or in the resolved phase - no need to keep the stored information updated at all times w/ unnecessary listeners
  vm.list = []
  bngApi.engineLua('ui_apps.getUIAppsData()', function(data) {
    // TODO: HAVE ONE STORAGE UPDATE ONLY
    for(k in data.availableApps) {
      let app = data.availableApps[k]
      app.__displayName__ = $filter('translate')(app.name)
      app.types.forEach(type => {
        if (!(type in AppSelectFilters.types))
          AppSelectFilters.types[type] = true
      })
    }
    UIAppStorage.availableApps = data.availableApps
    $scope.$apply(function(){
      vm.list = UIAppStorage.availableApps
    })
  })
  vm.filters = AppSelectFilters

  vm.openRepo = () => { window.location.href = 'http-external://www.beamng.com/resources/categories/user-interface-apps.10/?ingame=2'; }

  vm.spawn = (appData) => {
    if (appData.isActive) {
      return
    }

    $rootScope.$broadcast('appContainer:spawn', appData); // The 'spawnApp' event is caught by the app-container directive too!
    $state.go(`menu.appedit`, {mode: 'edit'})
  }

  // returns a list of apps
  vm.filterItems = function(items) {
    let result = {}
    // filter by name and the types
    for(appName in items) {
      let app = items[appName]
      if(vm.filters.query != '') {
        let locale = vueI18n.global.locale.replace("_", "-") // libi18n uses dash
        let queryLocaleLowerCase = vm.filters.query.toLocaleLowerCase(locale)
        if(
          app.__displayName__.toLocaleLowerCase(locale).search(queryLocaleLowerCase) == -1
          && ((app.description && app.description.toLocaleLowerCase(locale).search(queryLocaleLowerCase) == -1) || !app.description)
          ) {
          continue
        }
      }
      if(!AppSelectFilters.typesFilter(app)) continue
      result[appName] = app
    }

    // Create items array
    var sortedApps = Object.keys(result).map(function(key) { return result[key]; })
    sortedApps.sort(function(a, b) {
      return a.__displayName__.localeCompare(b.__displayName__)
    })
    return sortedApps
  }
}])
