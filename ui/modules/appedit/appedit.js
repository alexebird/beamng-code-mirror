angular.module('beamng.stuff')

.controller('AppEditController', ['$rootScope', '$scope', 'UIAppStorage', '$mdDialog', '$stateParams', 'InputCapturer', function ($rootScope, $scope, UIAppStorage, $mdDialog, $stateParams, InputCapturer) {
  let vm = this

  // The 'editApps' event is caught by the app-container directive
  //$rootScope.$broadcast('editApps', true)
  const captureInput = InputCapturer({
    backAction() { // action on Esc/B
      $scope.save();
    }
  });
  captureInput(true);
  $scope.$on('$destroy', function () {
    $rootScope.$broadcast('editApps', false)
    captureInput(false);
  })

  $scope.activeLayoutId = ''

  // Updated to use layout filename instead of index because of issue in displayed
  // select not updating to current selected layout.
  function updateactiveLayoutId() {
    $scope.activeLayoutId = ''
    for(let i = 0; i < UIAppStorage.availableLayouts.length; ++i) {
      let layout = UIAppStorage.availableLayouts[i]
      if(layout.filename == UIAppStorage.current.filename) {
        $scope.activeLayoutId = layout.filename
        break
      }
    }
  }
  updateactiveLayoutId()

  $scope.$on('onLayoutsChanged', function (event) {
    updateactiveLayoutId()
  })

  vm.editingLayout = $stateParams.mode === 'edit'
  if(vm.editingLayout) {
    $rootScope.$broadcast('editApps', true)
  }

  $scope.$on('appContainer:requestEdit', function (event, editing) {
    editing = editing == true
    vm.editingLayout = editing
    if (!editing) $scope.save()
    $rootScope.$broadcast('editApps', editing)
  })
  vm.editLayout = function() {
    $rootScope.$broadcast('appContainer:requestEdit', true)
  }
  vm.doneEditLayout = function() {
    $rootScope.$broadcast('appContainer:requestEdit', false)
  }

  $scope.activeLayoutNameGame = ''
  $scope.UIAppStorage = UIAppStorage

  $scope.$on('GameStateUpdate', function (event, data) {
    $scope.$apply(function() {
      $scope.activeLayoutNameGame = data.state
    })
  })
  bngApi.engineLua('core_gamestate.requestGameState()')

  $scope.reset = () => $rootScope.$broadcast('appContainer:resetLayout')
  $scope.delete = () => $rootScope.$broadcast('appContainer:deleteLayout')
  $scope.clear = () => $rootScope.$broadcast('appContainer:clear')
  $scope.save = () => $rootScope.$broadcast('appContainer:save')
  $scope.saveAll = () => $rootScope.$broadcast('appContainer:saveAll')

  $scope.createNew = () => $rootScope.$broadcast('appContainer:createNewLayout')



  $scope.createLayout = function($event) {
    var parentEl = angular.element(document.body)
    $mdDialog.show({
      parent: parentEl,
      targetEvent: $event,
      template:
        '<md-dialog aria-label="List dialog">' +
        '  <md-dialog-content>'+
        '    <md-list>'+
        '      <md-list-item ng-repeat="item in items">'+
        '       <p>Number {{item}}</p>' +
        '      '+
        '    </md-list-item></md-list>'+
        '  </md-dialog-content>' +
        '  <md-dialog-actions>' +
        '    <md-button ng-click="closeDialog()" class="md-primary">' +
        '      Close Dialog' +
        '    </md-button>' +
        '  </md-dialog-actions>' +
        '</md-dialog>',
      locals: {
        items: $scope.items
      },
      controller: DialogController
   })
   function DialogController($scope, $mdDialog, items) {
     $scope.items = items
     $scope.closeDialog = function() {
       $mdDialog.hide()
     }
   }
  }

  $scope.changeLayout = function(layoutId) {
    $rootScope.$broadcast('appContainer:save')
    $rootScope.$broadcast('appContainer:loadLayoutByFilename', layoutId)
    if (UIAppStorage.current.type) { // if updated layout type exists, update game state to keep the app layout active 
      bngApi.engineLua('core_gamestate.setGameState(nil, "' + UIAppStorage.current.type + '")')
    }
  }

  $scope.titleSort = function(layout1, layout2) {
    const layout1Value = layout1.value;
    const layout2Value = layout2.value;
    const layout1DisplayedValue = layout1Value.title !== undefined ? layout1Value.title : layout1Value.type
    const layout2DisplayedValue = layout2Value.title !== undefined ? layout2Value.title : layout2Value.type

    if (layout1DisplayedValue === undefined)
      return 1;
    
    if (layout2DisplayedValue === undefined)
      return -1;

    return layout1DisplayedValue.localeCompare(layout2DisplayedValue)
  }
}])

