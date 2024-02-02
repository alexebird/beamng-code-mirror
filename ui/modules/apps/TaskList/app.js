angular.module("beamng.apps").directive("tasklist", [
  "TasklistService",
  function (TasklistService) {
    return {
      templateUrl: '/ui/modules/apps/TaskList/app.html',
      link: function ($scope, element, attrs) {
        TasklistService.setListeningScope($scope)

        $scope.data = TasklistService.data
        $scope.showTaskList = TasklistService.taskListVisible

        const refreshListData = () => $scope.data = TasklistService.data

        $scope.$on("taskListCleared", () => $scope.$evalAsync(refreshListData))

        $scope.$on("taskListMutated", (ev, chg) => $scope.$evalAsync(() => {
          refreshListData()
          // maybe animate the completed task here?? The details of the list changes are passed in chg above
          const goalId = Object.keys(chg.old).length === 0 ? chg.new.id : chg.old.id
          const goalElement = document.getElementById(goalId)

          if (chg.new.done === true || chg.new.fail === true) {
            goalElement && goalElement.classList.add('animated')
            bngApi.engineLua(`Engine.Audio.playOnce('AudioGui', 'event:>UI>Main>Click_Tonal_02')`)
          }
        }))
        $scope.$on('appContainer:onUIDataUpdated', function () {
          log.warn("Test")
        })

        $scope.$on("taskListHeaderChanged", () => $scope.$evalAsync(refreshListData))


        $scope.$on("taskListVisibilityChanged", (ev, state) => $scope.$evalAsync(() => {
          $scope.showTaskList = state
        }))
      },
    }
  },
]).directive('scrollToBottom', function ($timeout, $window) {
  return {
    scope: {
      scrollToBottom: "="
    },
    restrict: 'A',
    link: function (scope, elem, attr) {
      scope.$watchCollection('scrollToBottom', function (newVal) {
        if (newVal) {
          $timeout(function () {
            elem[0].scrollTop = elem[0].scrollHeight
          }, 0)
        }
      })
    }
  }
})
