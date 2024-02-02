angular.module('beamng.components', [])
.directive('bngAccordion', function () {
  return {
    scope: true,
    controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
      var config = {
        allowMultiple: ('multiple' in $attrs) && ($scope.$eval($attrs.multiple) !== false),
        children: []
      }

      var ctrl = this

      ctrl.addPane = function (paneScope) {
        config.children.push(paneScope)
      }

      ctrl.paneOpened = function (paneId) {
        if (config.allowMultiple) return

        config.children.forEach(function (child) {
          if (child.$id != paneId) child.bngPane.closeBody()
        })
      }

    }],
    controllerAs: 'bngAccordion'
  }
})

.directive('bngAccordionPane', [function () {
  return {
    // replace: false,
    transclude: true,
    scope: {
      defaultOpen: '=?',
      isOpen: '=?'
    },
    require: '^bngAccordion',
    controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
      var ctrl = this

      ctrl.openBody = function () {
        $scope.isOpen = true
        $scope.$parent.bngAccordion.paneOpened($scope.$id)
        $element.removeClass('bng-pane-closed')
        $element.addClass('bng-pane-open')
      }

      ctrl.isOpen = function () {
        return $scope.isOpen
      }

      ctrl.closeBody = function () {
        $scope.isOpen = false
        $element.removeClass('bng-pane-open')
        $element.addClass('bng-pane-closed')
      }

      ctrl.toggleBody = function () {
        if ($scope.isOpen) ctrl.closeBody()
        else ctrl.openBody()
      }

      if ($scope.defaultOpen) {
          ctrl.openBody()
      }
    }],
    link: function (scope, element, attrs, bngAccordion, transclude) {
      transclude(clone => {element.append(clone);})
      bngAccordion.addPane(scope)
      element.addClass(scope.isOpen ? 'bng-pane-open' : 'bng-pane-closed')
    },

    controllerAs: 'bngPane'
  }
}])

.directive('bngPaneHeader', [function () {
  return {
    transclude: true,
    replace: false,
    require: '^bngAccordionPane',
    template:
     `<div class="_root" ng-click="pane.toggleBody()">
        <span class="paneOpener" style="position:absolute; margin-left: -0.8em; font-size:1.5em">{{ pane.isOpen() ? '−' : '+' }}</span>
        <span style="flex-grow:1" ng-transclude></span>
      </div>`,
    scope: false,
    link: function (scope, element, attrs, bngAccordionPane, transclude) {
      scope.pane = bngAccordionPane
    }
  }

}])


// This can be used instead: icons can be prepended by ::before selectors
//
// .directive('bngPaneHeader', [function () {
//   return {
//     transclude: true,
//     // replace: false,
//     require: '^bngAccordionPane',
//     scope: false,
//     link: function (scope, element, attrs, bngAccordionPane, transclude) {
//       transclude(clone => {element.append(clone);})
//       scope.pane = bngAccordionPane
//       element.on('click', function () {
//         bngAccordionPane.toggleBody()
//         scope.$digest()
//       })
//     }
//   }

// }])




.directive('bngPaneBody', [function () {
  return {
    // replace: false,
    require: '^bngAccordionPane',
    transclude: true,
    scope: false,
    template: `<div ng-show="pane.isOpen()"></div>`,
    link: function (scope, element, attrs, bngAccordionPane, transclude) {
      setTimeout(() => {
        transclude(clone => {element.find('div').append(clone); })
      })
      scope.pane = bngAccordionPane
    }
  }
}]);