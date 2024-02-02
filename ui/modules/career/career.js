"use strict"

angular.module("beamng.stuff")

.controller("CareerController", ["$scope", "$state", "$filter", "ConfirmationDialog", "toastr", "translateService", "MessageToasterService", "InputCapturer", "$timeout", "TasklistService", function($scope, $state, $filter, ConfirmationDialog, toastr, translateService, messageToasterService, InputCapturer, $timeout, TasklistService) {

  $scope.$on("allCareerSaveSlots", (scope, profiles) => {
    // console.log("CAREER", profiles);
    if (!Array.isArray(profiles)) {
      buildCards([]);
      return;
    }
    for (let prf of profiles) {
      if (!prf.preview) // FIXME: remove when previews will be available
        prf.preview = "/ui/modules/career/profilePreview_WCUSA.jpg";
    }
    profiles.sort((a, b) => ("" + a.date).localeCompare(b.date)); // to make sure everything's sorted
    buildCards(profiles);
    // find active career
    $scope.inCareer = false;
    bngApi.engineLua("career_career.isActive()", data => {
      $scope.inCareer = !!data;
      if (!data)
        return;
      bngApi.engineLua("career_career.sendCurrentSaveSlotData()", data => {
        if (!data)
          return;
        for (let prf of profiles) {
          if (prf.id === data.id) {
            prf.active = true;
            break;
          }
        }
        // re-order cards so active is at front
        if ($scope.cards.length > 2) {
          const activeCard = $scope.cards.find(c => c.data && c.data.active);
          if (activeCard) {
            const newCards = $scope.cards.filter(c => !c.data || !c.data.active);
            newCards.splice(1, 0, activeCard);
            $scope.cards = newCards;
          }
        }
      });
    });
  });

  function notifyLoadState(state) {
    toastr['info'](translateService.contextTranslate(`ui.career.notification.${state}`, true), "", messageToasterService.toastOptions)
  }

  const inputCapture = InputCapturer({
    backAction() {
      if (manage.mode) {
        manage.go();
        return true;
      }
      return false;
    }
  });
  inputCapture(true);
  $scope.$on("$destroy", () => inputCapture(false));

  const manage = {
    id: null,
    mode: null,
    modes: { // just an enum for modes
      manage: "manage",
      name: "name",
    },
    newid: "*new*", // special id to identify the card
    newname: "",
    loadCalled: false,
    select(id) {
      if (manage.id !== id)
        manage.mode = null;
      manage.id = id || null;
    },
    checkid() {
      if (!manage.id || $scope.cards.find(card => card.id === manage.id))
        return true;
      if (manage.id !== manage.newid)
        manage.id = null;
      return false;
    },
    go(mode) {
      $scope.manage.tutorialToggleEnabled = true;
      $scope.$applyAsync(() => {
        // console.log(`manage "${manage.id}": ${manage.mode} > ${mode}`);
        if (!manage.checkid())
          return;
        // already here
        if (mode === manage.mode)
          return;
        // back/exit
        if (!mode || !manage.modes.hasOwnProperty(mode)) {
          if (mode !== manage.modes.name && manage.mode === manage.modes.name)
            manage.lockOn(false);
          if (manage.id && manage.id !== manage.newid && manage.mode && manage.mode !== manage.modes.manage) {
            // back to manage, if not creating new
            manage.mode = manage.modes.manage;
          } else {
            // exit manage
            manage.id = null;
            manage.mode = null;
          }
          return;
        }
        // set name in case of rename
        if (manage.id && manage.id !== manage.newid) { // existing
          manage.newname = manage.id;
        } else { // new
          let id, pname = $filter("translate")("ui.career.profile");
          for (let i = 1; i < 1e3; i++) {
            // id = `Profile ${Math.trunc(Math.random() * 899) + 100}`; // random name
            id = `${pname} ${i}`; // sequental name
            if (!$scope.cards.find(card => card.id === id))
              break;
          }
          manage.newname = id;
        }
        if (mode === manage.modes.name)
          manage.lockOn(true);
        manage.mode = mode;
      });
    },
    lockOn(lock) {
      setTimeout(() => {
        $scope.$applyAsync(() => {
          for (let card of $scope.cards) {
            if (!lock)
              delete card.disabled;
            else if (card.id !== manage.id)
              card.disabled = true;
          }
        });
      }, 10);
    },
    isNewNameOk() {
      if (!manage.newname || /[<>:"/\\|?*]/.test(manage.newname))
        return false;
      if (/^ +| +$/.test(manage.newname))
        manage.newname = manage.newname.replace(/^ +| +$/g, "");
      if (!manage.newname)
        return false;
      const namelc = manage.newname.toLowerCase();
      if ($scope.cards.find(card => card.id.toLowerCase() === namelc))
        return false;
      return true;
    },
    name() {
      $scope.manage.tutorialToggleEnabled = true;
      if (!manage.isNewNameOk())
        return false;
      $scope.$applyAsync(() => {
        if (manage.id === manage.newid) {
          manage.id = manage.newname;
          manage.mode = null;
          manage.load({isAdd: true, tutorialOn: $scope.manage.tutorialEnabledCheck});
        } else {
          bngApi.engineLua(
            `career_saveSystem.renameSaveSlot("${manage.id}", "${manage.newname}")`,
            () => {manage.lockOn(false); bngApi.engineLua("career_career.sendAllCareerSaveSlotsData()")}
          );
        }
      });
      return true;
    },
    rename() {
      manage.go('name');
      $scope.manage.tutorialToggleEnabled = false;
    },
    load(options={isAdd:false, tutorialOn:false}) {
      // must load even if id does not exist, so we only check if it's defined
      if (!manage.id)
        return false;
      const active = $scope.cards.find(card => card.data && card.data.active);
      if (active && active.id === manage.id)
        return false;
      //prevent mutli-load crash
      if (manage.loadCalled)  {
        return false;
      } else {
        manage.loadCalled = true;
      }
      inputCapture(false);
      let inStartMenu = $scope.$parent.app.mainmenu;
      let timeoutWindow = 0;

      //Use tutorialOn param to set tutorial skip
      function doLoad() {
        if ((!inStartMenu && $scope.inCareer) || (!inStartMenu && !$scope.inCareer && $state.current.name === "menu.career")) {
          $scope.$emit('ChangeState', {state: 'fadeScreen',params: {fadeIn: 0.5, fadeOut: 2, pause: 5}});
          timeoutWindow = 1000;
        }

        $timeout( () => bngApi.engineLua(`career_career.enableTutorial(${options.tutorialOn}), career_career.createOrLoadCareerAndStart("${manage.id}")`, () => {
            notifyLoadState(options.isAdd ? "added" : "loaded");
          }), timeoutWindow)
      }
      if ($scope.$parent.app.gameState === "garage") {
        // gently prevent loading from garage
        bngApi.engineLua("gameplay_garageMode.stop()", () => doLoad());
      } else {
        doLoad();
      }
      return true;
    },
    delete() {
      if (!manage.checkid())
        return false;
      ConfirmationDialog.open(
        null, "ui.career.deletePrompt",
        [
          { label: "ui.common.yes", key: true, class: "md-warn" },
          { label: "ui.common.no", key: false, default: true, isCancel: true }
        ]
      ).then(res => {
        if (!res)
          return;
        bngApi.engineLua(
          `career_saveSystem.removeSaveSlot("${manage.id}")`,
          () => bngApi.engineLua("career_career.sendAllCareerSaveSlotsData()")
        );
      });
      return true;
    },
    deleteShowHide($event) {
      if (!manage.checkid())
        return false;
      //show hidden delete options and hide currently visible options - hacky
      let siblings = angular.element($event.target).parent().children();
      for(let index = 0; index < siblings.length; index++) {
        let currentElement = angular.element(siblings[index]);
        if(currentElement.hasClass("ng-hide")) {
          currentElement.removeClass("ng-hide");
        } else {
          currentElement.addClass("ng-hide");
        }
      }
    },
    deleteConfirm($event) {
      //do actual delete
      if (!manage.checkid())
        return false;
      bngApi.engineLua(
        `career_saveSystem.removeSaveSlot("${manage.id}")`,
        () => bngApi.engineLua("career_career.sendAllCareerSaveSlotsData()")
      );
    },
    mods() {
      console.log("TODO: enabled mods");
    },
    backup() {
      console.log("TODO: backup");
    },
  };
  $scope.manage = manage;
  //for tutorial on/off toggle
  $scope.manage.tutorialEnabledCheck = true;
  $scope.manage.tutorialToggleEnabled = true;

  const cardNew = {
    class: "career-card-create",
    title: "+",
    id: manage.newid,
    action: (e) => {
      if (manage.id !== manage.newid || manage.mode !== manage.modes.name) {
        manage.go(manage.modes.name);
      } else if (manage.isNewNameOk()) {
        if (e.key === " ") return false; // prevent 'space' from firing the 'name'
        bngApi.engineLua("ui_audio.playEventSound('event:>UI>Main>Click_Tonal_01', '')");
        setTimeout(() => { manage.name() }, 100);
      }
    },
  };

  $scope.cards = [];
  function buildCards(slots=[]) {
    const len = $scope.cards.length;
    if (len === 0)
      $scope.cards.push(cardNew);
    else if (len > 1)
      $scope.cards.splice(1, len - 1);
    for (let itm of slots) {
      $scope.cards.splice(1, 0, {
        id: itm.id,
        title: itm.id,
        data: itm,
        action: () => {
          if (manage.id === itm.id && !(manage.id === itm.id && !manage.mode))
            return;
          if (itm.outdatedVersion)
            return;
          bngApi.engineLua("ui_audio.playEventSound('event:>UI>Main>Click_Tonal_01', '')");
          setTimeout(() => { manage.load() }, 100);
        },
      });
    }
    setTimeout(fancySync, 100);
  }

  bngApi.engineLua("career_career.sendAllCareerSaveSlotsData()");


  $scope.fancyblur = false;
  function fancySync() {
    // find fancy bg
    const fancybg = document.querySelector("fancy-background > .img-carousel");
    if (!fancybg) {
      $scope.fancyblur = false;
      return;
    }
    $scope.fancyblur = true;
    $scope.$evalAsync(() => {
      // get all target blur elements
      const blurs = Array.from(document.querySelectorAll(".fancy-blur > .img-carousel"));
      // and connect them to master so they will work in sync
      fancybg.__connect(
        blurs,
        // function to modify images list for targets - function (orig_list) { return orig_list }
        // here, we change images from "image.jpg" to "image_blur.jpg"
        images => images.map(img => img.replace(/\.(.{3,4})$/, "_blur.$1"))
        // note: blurred images are 1280x720 with gaussian blur 6.0 (resize, then blur)
      );
    });
  }
  fancySync();

}])

.service("CareerStyles", function () {
  const styles = {
    // icon path must have no single quotes
    // all names should be in lower case
    _default: {
      icon: "",
      color: "",
    },
    adventurer: {
      alias: "adventurerxp",
      icon: "/ui/assets/SVG/24/branchXP-adventurer.svg",
      bg: true,
      color: "#D515DC",
    },
    motorsport: {
      alias: "motorsportsxp",
      icon: "/ui/assets/SVG/24/branchXP-race.svg",
      bg: true,
      color: "#DD1C15",
    },
    labourer: {
      alias: "labourerxp",
      icon: "/ui/assets/SVG/24/branchXP-delivery.svg",
      bg: true,
      color: "#12B944",
    },
    specialized: {
      alias: "specializedxp",
      icon: "/ui/assets/SVG/24/branchXP-special.svg",
      bg: true,
      color: "#0068C8",
    },
    beamxp: {
      icon: "/ui/assets/SVG/24/beamXP-small.svg",
    },
    beambucks: {
      alias: "money",
      icon: "/ui/assets/SVG/24/beambucks.svg",
    },
    bonusstars: {
      icon: "/ui/assets/SVG/24/star-secondary.svg",
    },
  };
  for (let name in styles) {
    if (styles[name].hasOwnProperty("alias") && !styles.hasOwnProperty(styles[name].alias)) {
      styles[styles[name].alias] = styles[name];
      delete styles[name].alias; // not necessary, just a cleanup that will make a bit less cycles
    }
  }

  // store list of style names except private
  const list = Object.keys(styles).filter(name => !name.startsWith("_"));

  const funcs = {

    // get style by name
    style(name) {
      let style;
      if (name)
        name = name.toLowerCase();
      if (list.includes(name))
        style = styles[name];
      else
        style = styles._default;
      let res = {
        // avoid double-quotes here - these styles get embed in html attributes
        // style rules must end with semicolon for compatability
        name,
        icon: style.icon ? `-webkit-mask-image: url('${style.icon}');` : "",
        color: style.color ? `background-color: ${style.color};` : "",
        bg: !!style.bg,
      };
      if (style.bg)
        res.icon += "top: 0.25em; bottom: -0.25em; left: 0.25em; right: -0.25em;";
      return res;
    },

    // get all styles
    styles() {
      return list.reduce((res, name) => ({ ...res, [name]: funcs.style(name) }), {});
    },

    // get style values
    values() {
      return list.reduce((res, name) => ({ ...res, [name]: styles[name] }), {});
    },

    // list available styles
    names() {
      return list;
    },

    // list branches in a defined sequence
    //TODO: This list needs to come from lua (or read from files. Needs to have all foldernames from /gameplay/branches/*, or lua:career_branches.getSortedBranches() data)
    branches() {
      return [
        "motorsport",
        "labourer",
        "specialized",
        "adventurer",
      ];
    },

  };

  return funcs;
})

.directive("bngCareerStatus", ["CareerStyles", function (CareerStyles) {
  return {
    replace: true,
    templateUrl: '/ui/modules/career/careerStatus-template.html',
    scope: {
      profile: "=",
      expanded: "=",
      showxp: "=",
      showdate: "=",
    },
    link($scope) {
      $scope.branchStyles = CareerStyles.styles();
      $scope.branches = CareerStyles.branches();
    },
  }
}])

.directive("bngBranchIcon", ["CareerStyles", function (CareerStyles) {
  return {
    replace: true,
    templateUrl: '/ui/modules/career/careerBranchIcon-template.html',
    scope: true,
    link($scope, elems, attrs) {
      $scope.branchStyle = CareerStyles.style(attrs.bngBranchIcon);
    },
  }
}])

.directive("bngCareerBanner", function () {
  return {
    template: `
    <div ng-if="show" style="
      display: inline-block;
      position: absolute; top: 0; left: 0; right: 0px;
      width: 20%;
      min-width: 30em;
      margin: 0 auto;
      padding: 0.1em 1em 0.1em 1em;
      background-image: -webkit-linear-gradient(-23deg, rgba(180,0,0, 0.8) 0em 0.9em,  rgba(220,0,0, 0.8) 1em 1.9em, rgba(180,0,0, 0.8) 2em 2.9em);
      /*background-image: repeating-linear-gradient(50deg, rgba(255, 0, 0, 0.3), rgba(255, 0, 0, 0.3), 10px, red 10px, red 20px);*/
      /*background-color: rgba(250,0,0,0.7);*/
      background-size: 2.1em 100%;
      color: #ffffff;
      font-size: 0.8rem;
      font-style: italic;
      font-weight: 700;
      text-shadow: 0em 0em 0.2em black;
      text-align:center;
      pointer-events: none;
      z-index: 2022;
    ">
      {{:: "ui.career.experimentalWarning" | translate }}
    </div>
    `,
    scope: true,
    link($scope, elems, attrs) {
      $scope.$on("$stateChangeSuccess",
        () => bngApi.engineLua("career_career.isActive()", data => $scope.show = !!data)
      );
    },
  }
})
