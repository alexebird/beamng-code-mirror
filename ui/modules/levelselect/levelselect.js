angular.module('beamng.stuff')

/**
 * @ngdoc controller
 * @name beamng.stuff:LevelSelectController
 * @description Controller used in level selecting view
**/
.controller('LevelSelectController',  ['$filter', '$scope', '$state', '$rootScope', function($filter, $scope, $state, $rootScope) {
  var vm = this

  vm.showAuxiliary = !beamng.shipping
  vm.levels = []
  vm.filtered = []
  vm.selected = null

  getLevelsDataCached(levels => {
    if (!Array.isArray(levels))
      levels = [];
    // the __displayName__ is for searching below
    for (let level of levels)
      level.__displayName__ = ($filter('translate')(level.title) || level.title).toLowerCase();
    // sort by displayname for the UI
    levels.sort((a, b) => a.__displayName__.localeCompare(b.__displayName__));
    // assign data
    vm.levels = levels;
    vm.filtered = levels;
    vm.selected = levels.length > 0 ? levels[0] : null;
    setTimeout(() => {
      if (!vm.selected)
        return;
      const elm = document.getElementById(`level_${vm.selected.levelName}`);
      if (elm && isNavigatable(elm))
        elm.focus();
    }, 10);
  });

  vm.updateList = function (query) {
    vm.filtered = query ? $filter('filter')(vm.levels, { __displayName__: query }) : vm.levels;
    vm.selected = vm.filtered.length > 0 ? vm.filtered[0] : null;
  };

  vm.openRepo = function () {
    window.location.href = 'http-external://www.beamng.com/resources/categories/terrains-levels-maps.9/?ingame=2'
  }

  vm.select = function (level) {
    vm.selected = level
  }

  vm.launch = function(level) {
    $scope.$emit('CloseMenu')
    bngApi.engineLua(`freeroam_freeroam.startFreeroam(${bngApi.serializeToLua(level)})`)
  }

  vm.showDetails = function (level) {
    $state.go(`menu.levelDetails`, {levelName: level.levelName})
  }
}])

.controller('LevelSelectDetailsController',  ['$stateParams', '$scope', 'InputCapturer', function($stateParams, $scope, InputCapturer) {
  var vm = this

  let elSpawn;
  // register back preventer
  const captureInput = InputCapturer({
    backAction() { // action on Esc/B
      if (!elSpawn)
        return false;
      try {
        // check if we're inside spawn details
        let elm = document.activeElement;
        while (elm.nodeType === Node.ELEMENT_NODE) {
          if (elm.id === "levelspawn-details") {
            elSpawn.focus();
            elSpawn = null;
            return true;
          }
          elm = elm.parentNode;
        }
      } catch (fire) {}
      return false;
    }
  });
  captureInput(true);
  $scope.$on("$destroy", () => captureInput(false));

  let levelName = $stateParams.levelName || 'GridMap'
  vm.level = null
  vm.selected = null

  getLevelsDataCached((levels) => {
    for (const level of levels) {
      if(level.levelName == levelName) {
        vm.level = level
        vm.filtered = level
        vm.selected = null
        if(level.spawnPoints && level.spawnPoints.length > 0) {
          vm.selected = level.spawnPoints[0]
        }
        return
      }
    }
  })

  vm.select = function (spawnPoint, clicked=false) {
    vm.selected = spawnPoint;
    if (clicked) {
      try {
        elSpawn = document.activeElement;
        const btn = document.getElementById("levelspawn-default");
        if (btn)
          btn.focus();
      } catch (fire) {}
    }
  }

  vm.launch = function(spawnPoint = null) {
    $scope.$emit('CloseMenu')
    let spawnPointName = 'nil'
    if(spawnPoint && spawnPoint.objectname) {
      spawnPointName = `'${spawnPoint.objectname}'`
    }
    bngApi.engineLua(`freeroam_freeroam.startFreeroamByName('${levelName}', ${spawnPointName})`)
    // we do not want to have all the level data hanging around all the time
    clearLevelsCache()
  }
}])
