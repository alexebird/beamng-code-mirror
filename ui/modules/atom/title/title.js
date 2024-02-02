angular.module('beamng.stuff')

.directive("bngTitle", function() {
  return {
    restrict: "EA",
    replace: true,
    templateUrl: "/ui/modules/atom/title/title.html",
    scope: {
      title: "@",
      subtitle: "@",
      animate: "=",
    }
  }
})