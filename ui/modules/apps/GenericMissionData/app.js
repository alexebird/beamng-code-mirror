angular.module("beamng.apps").directive("genericMissionData", [
  "GenericMissionDataDisplayService",
  function (GenericMissionDataDisplayService) {
    return {
    template:`
    <div>
      <link type="text/css" rel="stylesheet" href="/ui/modules/apps/genericmissiondata/app.css">

      <div id="gmd-container" class="gmd-container">
        <div ng-repeat="key in data.sortedKeys" class="bngApp mission-data flexFont" >
          <div>{{ data.elements[key].title | translate}}</div>
          <div ng-if="data.elements[key].style === 'text' || data.elements[key].style === undefined " style="font-weight:400">{{ data.elements[key].txt | translate }}</div>
          <div ng-if="data.elements[key].style === 'time'" >{{ (data.elements[key].txt*1000 | date: "mm:ss") || "--:--" }}</div>
          <div ng-if="data.elements[key].style === 'timemillis'" >{{ (data.elements[key].txt*1000 | date: "mm:ss:sss") || "--:--:--" }}</div>
          <div ng-if="data.elements[key].style === 'progressbar'" >{{ (data.elements[key].txt*1000 | date: "mm:ss:sss") || "--:--" }}</div>
        </div>
      </div>
    <div>
    `,
    replace: true,
    link: function ($scope, element, attrs) {
      GenericMissionDataDisplayService.setListeningScope($scope)
      $scope.data = GenericMissionDataDisplayService.data

      const refreshData = () => $scope.data = GenericMissionDataDisplayService.data

      $scope.$on("genericMissionDataChanged", () => $scope.$evalAsync(refreshData))
    }
  }
}])