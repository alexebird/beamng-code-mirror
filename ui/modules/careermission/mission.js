"use strict"

angular.module("beamng.stuff")

.controller("CareerMissionController", ["$scope", function($scope) {
    // $scope.fn = function() {
    //     console.log("Yo!")
    // }

}])

.directive('bngCard', ['$rootScope', function ($rootScope) {
    return {
      template:
      `<div class="card">
        <div class="card-title" ng-if="title">
            {{title}}
        </div>
        <div class="card-content-slot" ng-transclude>
        </div>
        <button ng-click="action" ng-if="(actionName === 'button')">
            {{actionName}}
        </button>
      </div>`,
      replace: true,
      transclude: true,
      scope: {
        title: "@",
        action: "=",
        actionName: "@",
        actionStyle: "="
      },

      link: function (scope, element, attrs) {

      }
    }
  }]);
