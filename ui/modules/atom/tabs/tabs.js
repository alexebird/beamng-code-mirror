angular.module('beamng.stuff')

.directive("bngTabList", ["RateLimiter", function(RateLimiter) {
  return {
    restrict: "EA",
    replace: true,
    transclude: true,
    templateUrl: "/ui/modules/atom/tabs/tabs.html",
    bindToController: true,
    controllerAs: "bngTabList",
    scope: {
      // this function will be called only when tab was changed
      // it also gets called on startup, with prevTab=-1
      onchange: "&",
      nonavscroll: "@",
    },
    controller() {
      const ctx = this;
      ctx.tabs = [];
      ctx.addTab = bngTab => {
        bngTab.index = ctx.tabs.length;
        ctx.tabs.push(bngTab);
        if (bngTab.index === 0 || bngTab.active)
          preselect(bngTab);
        if (typeof bngTab.nonavscroll !== "true")
          bngTab.nonavscroll = ctx.nonavscroll;
        // console.log(bngTab.nonavscroll, ctx.nonavscroll);
      };
      ctx.selectTab = function (selectedTab) {
        let prevTab = { index: -1 };
        ctx.tabs.forEach(bngTab => {
          if (bngTab.active)
            prevTab = bngTab;
          bngTab.active = bngTab === selectedTab;
        });
        if (selectedTab.index !== prevTab.index && typeof ctx.onchange === "function")
          ctx.onchange({ newTab: selectedTab.index, prevTab: prevTab.index });
      };
      const preselect = RateLimiter.debounce(ctx.selectTab, 50);
    },
  }
}])

.directive("bngTab", function() {
  return {
    restrict: "EA",
    template: '<div role="tabpanel" ng-class="{active: active}" ng-show="active" bng-nav-scroll="{{!nonavscroll}}" ng-transclude></div>',
    transclude: true,
    require:"^bngTabList",
    scope: {
      heading: "@",
      iconpath: "@",
      active: "@", // use to preselect a tab (default: first tab)
      flagged: "<",
      nonavscroll: "@",
    },
    link(scope, element, attrs, bngTabListCtrl) {
      scope.active = typeof scope.active === "string" ? scope.active === "true" : !!scope.active;
      bngTabListCtrl.addTab(scope);
    },
    replace: true,
  }
})