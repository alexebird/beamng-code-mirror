"use strict"

//// original controller section

angular.module('beamng.stuff')
.controller('StatsController',  ['$filter', '$scope', '$state', '$stateParams', '$rootScope',
function($filter, $scope, $state, $stateParams, $rootScope) {
  var vm = this

  $scope.$parent.fullscreenOptions = true

  vm.rawData = []
  vm.processStats = { "test1": {"crepe":{"v":42},"top text":{"v":69420}}, "test2":{"foo":{"v":42},"bar":{"v":42}} }
  vm.category = "general"
  vm.career = false
  vm.careerAvailable = false

  const re = /(?<cat>\w+)\/(?<subcat>[\w@]+)\/?(?<name>[\w@]+)?\.?(?<unit>\w+)?#?(?<attribute>[\w;]+)?/

  $scope.getCategories = () => Object.keys(vm.processStats).sort(cat=>cat=='general' ? -1 : 1)

  function processData(){
    let input = vm.career ? vm.rawData.career : vm.rawData.general;
    vm.processStats = {}
    for(var k in input) {
      let split = re.exec(k)
      let name
      if(split.groups.unit == undefined)
        input[k].unit = ""
      else
        input[k].unit = split.groups.unit
      if(split.groups.name == undefined){
        name = split.groups.subcat
        split.groups.subcat = 0
      }
      else
        name = split.groups.name
      if(split.groups.attribute)
        input[k].attribute = split.groups.attribute.split(";")
      else
        input[k].attribute = []
      input[k].hidden = input[k].attribute.includes('hideAll') || (vm.career && input[k].attribute.includes('hideCareer')) || (!vm.career && input[k].attribute.includes('hideGeneral'))
      input[k].cssClasses = []
      for(var attrib in input[k].attribute){
        if( input[k].attribute[attrib].startsWith('cssClass'))
          input[k].cssClasses.push(  input[k].attribute[attrib].slice(8) )
      }
      if( !(split.groups.cat in vm.processStats))
        vm.processStats[split.groups.cat] = {}
      if( !(split.groups.subcat in vm.processStats[split.groups.cat]))
        vm.processStats[split.groups.cat][split.groups.subcat] = {}
      vm.processStats[split.groups.cat][split.groups.subcat][name] = input[k]
    }
  }

  $scope.$on('StatisticData', function (evt, data) {
    // console.log('StatisticData', data)
    $scope.$applyAsync(function () {
      vm.rawData = data

      vm.careerAvailable = true;
      if(data["career"] === undefined){
        vm.career = false;
        vm.careerAvailable = false;
      } else {
        vm.modes = [
          { label: 'General stats', value: false, },
          { label: 'Career stats', value: true, }
        ]
      }

      processData();

      vm.category = "general"
      // console.log('processStats', vm.processStats)
    })
  })

  bngApi.engineLua(`if gameplay_statistic then gameplay_statistic.sendGUIState() end`)

  $scope.switchCategory = function(newCategory) {
    // console.log("switchCategory = "+newCategory)
    // $state.go('menu.stat', {category: newCategory})
    vm.category = newCategory;
  }

  $scope.switchMode = function(newCategory) {
    vm.career = ! vm.career;
    $scope.$applyAsync(function () {
      processData();
    });
  }

}])

//// portion that used to be in a modModule

.config(["$stateProvider", function($stateProvider) {

  $stateProvider
  .state('menu.stat', {
    url: '/stat:category',
    templateUrl: '/ui/modules/stat/Stats.html',
    controller: 'StatsController as statCtrl',
    backState: 'menu.mainmenu',
  })

}])

.run(["$rootScope", "$state", function ($rootScope, $state) {
  const targetState = "menu.options.stats";
  $rootScope.$on("MainMenuButtons", function (event, addButton) {
    addButton({
      translateid: "Stats",
      icon: "/ui/modules/mainmenu/drive/icons/stat.svg",
      targetState
    });
  });

}])

.filter('statCategoryTranslate', ["$filter", function($filter)  {
  return function (input) {
    let defaultLookup = "ui.dashboard."+input+"s"
    let testDashboard = $filter("translate")(defaultLookup)
    if(testDashboard != defaultLookup)
      return testDashboard;
    defaultLookup = "ui.playmodes."+input
    testDashboard = $filter("translate")(defaultLookup)
    if(testDashboard != defaultLookup)
      return testDashboard;
    defaultLookup = "ui.stat."+input
    testDashboard = $filter("translate")(defaultLookup)
    if(testDashboard != defaultLookup)
      return testDashboard;
    switch(input){
      case "general":
        return $filter("translate")("ui.options.general")
      default:
        return input.replace("_", " ") //should be using replaceAll
    }
  }
}])

.filter('statTranslate', ["$filter", function($filter)  {
  function getLevelName(path){
    let defaultLookup = "levels."+path+".info.title"
    let testTranslate = $filter("translate")(defaultLookup)
    if(testTranslate != defaultLookup)
      return testTranslate;
    return undefined
  }

  return function (input,category,subcategory) {
    let defaultLookup = "ui.dashboard."+input+"s"
    let testTranslate = $filter("translate")(defaultLookup)
    if(testTranslate != defaultLookup)
      return testTranslate;
    testTranslate = getLevelName(input)
    if(testTranslate)
      return testTranslate;
    defaultLookup = "ui.stat."+category+"."+(subcategory && subcategory!="0"? subcategory+".":"")+input
    testTranslate = $filter("translate")(defaultLookup)
    if(testTranslate != defaultLookup)
      return testTranslate;
    switch(category){
      case "general":
        switch(subcategory){
          case "mode":
            return $filter("statCategoryTranslate")(input)
        }
      case "scenario":
        if(input.startsWith("fg@"))
          return input.split("@")[1]
    }
    return input.replace("_", " ") //should be using replaceAll
  }
}]);