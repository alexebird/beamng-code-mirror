angular.module('beamng.stuff')

.directive("bngCardDark", function() {
  return {
    restrict: "EA",
    replace: true,
    templateUrl: "/ui/modules/atom/card/card.html",
    transclude: {
      'header': '?cardTitle',
      'body': 'cardBody',
      'footer': '?cardFooter',
    },
  }
})