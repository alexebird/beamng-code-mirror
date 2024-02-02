angular.module('beamng.stuff')

.directive('missionPopups', ['$rootScope', function ($rootScope) {
  return {
    template: '<div class="mission-popups" ng-show="missionPopupsVisible" ng-transclude></div>',
    replace: true,
    transclude: true,
    scope: false,
    link: function (scope, element, attrs) {
      scope.missionPopupsVisible = true

      scope.$on('ToggleMissionPopups', (_, state) => {
        if (typeof (state) === 'boolean')
          scope.missionPopupsVisible = state
        else
          scope.missionPopupsVisible = !scope.missionPopupsVisible

        scope.$evalAsync()
      })

      $rootScope.$on('$stateChangeStart', (_, state) => {
        scope.missionPopupsVisible = state.name === 'play'
      })
    }
  }
}])


.directive('missionInfo', ['Settings', '$sce', 'Utils', '$filter', 'translateService', function (Settings, $sce, Utils, $filter, translateService) {
  return {
    template:
      `
        <div>
         <div class="mission-info" ng-show="data" ng-if="data.altMode == false || data.altMode == null">
           <div class="header">

             <div style="position: relative">
               <svg class="header-icon"><use xlink:href="" ng-href="{{ '#' + data.type }}"></svg>
               <div class="header-title">{{data.title}}</div>
               <div class="header-subtitle" compile="data.typeName"></div>
             </div>
           </div>

           <div class="body" ng-if="data.data">
             <div class="data-table">
               <div class="row" ng-repeat="entry in data.data">
                 <span class="cell entry-label">{{entry.label | translate}}</span>
                 <span class="cell entry-val">{{entry.value | translate}}</span>
               </div>
             </div>
           </div>

           <div class="buttons">
             <div class="button" ng-repeat="btn in data.buttons" ng-click="run(btn)" bng-sound-class="{{ btn.action=='decline' ? 'bng_back_hover_generic' : 'bng_click_hover_generic'}}">
               <binding action="{{ ::btn.action }}"></binding> <span style="padding: 0 8px">{{btn.text | translate}}</span>
             </div>
           </div>
         </div>

         <!-- Alternate mode -->
         <div class="mission-info-alt" ng-show="data" ng-if="data.altMode">
           <div class="header">

             <div style="position: relative">
               <svg class="header-icon"><use xlink:href="" ng-href="{{ '#' + data.type }}"></svg>
               <div class="header-title">{{data.title | translate}}</div>
               <div class="header-subtitle" compile="data.typeName"></div>
             </div>
           </div>

           <div class="body" ng-if="data.data">
             <div class="data-table">
               <div class="row" ng-repeat="entry in data.data">
                 <span class="cell entry-label">{{entry.label | translate}}</span>
                 <span class="cell entry-val">{{entry.value | translate}}</span>
               </div>
             </div>
           </div>

           <div class="buttons">
             <div class="button" ng-repeat="btn in data.buttons" ng-click="run(btn)" bng-sound-class="{{ btn.action=='decline' ? 'bng_back_hover_generic' : 'bng_click_hover_generic'}}">
               <binding action="{{ ::btn.action }}"></binding> <span style="padding: 0 8px">{{btn.text | translate}}</span>
             </div>
           </div>
         </div>
        </div>
      `,

    replace: true,
    link: function (scope, element, attrs) {
      scope.data = null

      scope.BBToHtml = function (code) {
        return $sce.trustAsHtml(Utils.parseBBCode(code))
      }


      scope.$on('MissionInfoUpdate', (_, data) => {
        //console.log('got mission:', data)
        scope.data = data
        if (data) {
          if (data.typeName) {
            if (typeof data.typeName == "string") {
              data.description = translateService.contextTranslate(data.typeName)
            } else {
              data.description = ""
              for (var i = 0; i < data.typeName.length; i++) {
                data.description = data.description + translateService.contextTranslate(data.typeName[i])
              }
            }
            scope.data.typeName = scope.BBToHtml(data.description)
          }
          else {
            scope.data.typeName = ""
          }

          scope.data.title = translateService.contextTranslate(data.title)

          if (data.data) {
            var distObj = data.data.find(x => x.label == 'distance')
            if (distObj) {
              var converted = UiUnits.length(distObj.value, Settings.values.uiUnitLength)
              if (converted !== null) {
                distObj.value = `${converted.val.toFixed(2)} ${converted.unit}`
              }
            }
          }
        }
        scope.$evalAsync()
      })

      scope.run = function(btn) {
        bngApi.engineLua('ui_missionInfo.performAction("' + btn.action + '")')
      }
    }
  }
}]);