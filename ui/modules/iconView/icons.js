(function () {
  'use strict'

  angular.module('beamng.stuff')

.controller('iconViewerCtrl', function ($scope, $filter) {
  var vm = this
    , color = 'white'
    // , list = [{type: 'svg', color: color, src: 'Components/Shapes/arrow.svg'}]
    , list = [
      // [ {type: 'svg', color: 'blue', src: '/ui/assets/logo.svg'}
      // , {type: 'img', color: 'blue', src: '/ui/assets/logo.svg'}
      // , {type: 'sprite', color: 'blue', src: 'automation_logo'}
      // , {type: 'sprite', color: 'blue', src: 'automation_logo_origcolor'}
      // , {type: 'svg', color: 'blue', src: '/ui/assets/beamng_logo.svg'}
      // , {type: 'img', color: 'blue', src: '/ui/assets/beamng_logo.svg'}
      ]

  vm.config = {only: 'all'}

  $scope.$evalAsync(() => {
    if (vm.config.query === undefined) {
      vm.config.query = ''
    }
  })

  vm.list = []

  function getSymbols (cb) {
    list = list.concat(Array.apply(undefined, document.querySelectorAll('.symbols-def symbol')).map(e => ({src: e.id, color: color, type: 'sprite', fill: e.querySelector('[fill], [color]') !== null, base64: e.querySelector('image') !== null})))
    vm.categories = list.map(e => e.src.split('_')[0]).unique()
    (cb || nop)()
  }

  vm.sort = function (val) {
    let filterOptions = {$: vm.config.query}
    // console.log(list)
    switch (vm.config.only) {
      case 'base64':
        filterOptions.base64 = true
        break
      case 'fill':
        filterOptions.fill = true
        break
    }
    vm.list = $filter('filter')(list, filterOptions)
  }
  setTimeout(() => {
    getSymbols(() => $scope.$evalAsync(() => vm.sort(list)))
  }, 500)
})

.directive('bngInputBox', function () {
  return {
    restrict: 'E',
    require: ['?^navItem'],
    scope: {
      placeholder: '@'
    },
    template: `<input nav-item placeholder="{{placeholder}}" bng-font="primary" class="color-white bg-white-light bng-input-box"/>`,
    replace: true
  }
})


}())

