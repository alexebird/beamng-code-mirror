"use strict"

angular.module("beamng.stuff")

.service("IntroPopup", ["$rootScope", "$state", "$timeout", "Utils", "RateLimiter", "InputCapturer", "translateService", function ($rootScope, $state, $timeout, Utils, RateLimiter, InputCapturer, translateService) {

  const debug = false; // set to true to show debug messages
  // hint: when debug enabled, you can spawn example popup from a console with introtest()
  function dbgMsg(...args) {
    if (!debug)
      return;
    if (typeof args[0] === "string")
      args[0] = "IntroPopup: " + args[0];
    else
      args.splice(0, 0, "IntroPopup:");
    console.log(...args);
  }

  // might be a handy warning in future
  if (!HTMLDialogElement) {
    const err = () => console.warn("IntroPopup: <dialog> is not supported by this engine. Upgrade, rework or add a dialog polyfill https://github.com/GoogleChrome/dialog-polyfill");
    err();
    return {
      options: {},
      flags: {},
      open: err,
      close: err
    };
  }

  ///////////
  /// presets

  // note: preset shortcuts are also exposed as IntroPopup.preset_name(popup_name, arguments)
  const presets = {

    default: {
      template: "/ui/modules/introPopup/default.html",
    },

    tutorial: {
      template: "/ui/modules/introPopup/tutorial.html",
      grouped: true, // if template supports grouped entries
      beforeShow(options) {
        // beforeShow() evaluates before showing, with prefilled options variable
        // optionally, it may return a boolean that will allow or disallow showing
        // 
        return new Promise((resolve, reject) => {
          // TODO - fix this properly?
          // Slightly hacky fix to solve the issue of not being able to get out of 'end of tutorial' intro popups with the controller
          if (window.bridge) {
            window.bridge.uiNavEvents.activate()
            window.bridge.uiNavEvents.clearFilteredEvents()
          }
          const buttons = {
            ok: {
              pos: "right",
              default: true, // button to focus on
              cancel: true, // button that will be "clicked" on when pressing Esc/B
              label: "ui.introPopup.ok",
              class: "main",
              click() { close(true); }
            },
            logbook: {
              pos: "left",
              label: "ui.introPopup.viewInLogbook",
              click() {
                close(true);
                // Angular Logbook Launch
                // $state.go("menu.careerLogbook", { entryId: options.arguments.id[options.arguments.groupIndex] });
                const entryId = options.arguments.logbookId[options.arguments.groupIndex]
                $state.go("logbook",{id: (''+entryId).replace(/\//g, '%')})  // forward slashes breaking routing (angular?) - a bit of a hack to fix it
              }
            },
            logbookEsc: {
              pos: "right",
              label: "ui.introPopup.viewInLogbook",
              default: true, // button to focus on
              cancel: true, // button that will be "clicked" on when pressing Esc/B
              click() {
                close(true);
                // Angular Logbook Launch
                // $state.go("menu.careerLogbook", { entryId: options.arguments.id[options.arguments.groupIndex] });
                const entryId = options.arguments.logbookId[options.arguments.groupIndex]
                $state.go("logbook",{id: (''+entryId).replace(/\//g, '%')})  // forward slashes breaking routing (angular?) - a bit of a hack to fix it
              }
            },
          };
          const flavours = {
            "withLogbook": {
              title: null,
              content: null,
              buttons: [buttons.logbook, buttons.ok]
            },
            "onlyOk": {
              title: null,
              content: null,
              buttons: [buttons.ok]
            },
            "onlyLogbook": {
              title: null,
              content: null,
              buttons: [buttons.logbookEsc]
            },
            "noButtons": {
              title: null,
              content: null,
              buttons: []
            },
          };
          let cur;
          // find the appropriate flavour preset
          if (flavours.hasOwnProperty(options.name)) {
            cur = flavours[options.name];
          } else {
            cur = flavours.default;
            if (!options.arguments.content)
              options.arguments.content = `No content for "${options.name}" :(`;
          }
          // fill missing fields with defaults
          for (let key in cur) {
            if (!options.arguments.hasOwnProperty(key))
              options.arguments[key] = cur[key];
          }
          for (let i in options.arguments.buttons) {
            let btn = options.arguments.buttons[i];
            if (typeof btn === "string") {
              if (buttons.hasOwnProperty(btn))
                options.arguments.buttons[i] = buttons[btn];
              else
                options.arguments.buttons[i] = { label: `[${btn}]`, click() { } };
            }
          }
          options.viewedName = options.arguments.hasOwnProperty("id") ? options.arguments.id : options.name;
          resolve(true);
        });
      }
    },

    career: {
      template: "/ui/modules/introPopup/career.html",
      grouped: true, // if template supports grouped entries
      beforeShow(options) {
        // beforeShow() evaluates before showing, with prefilled options variable
        // optionally, it may return a boolean that will allow or disallow showing
        return new Promise((resolve, reject) => {
          const buttons = {
            ok: {
              pos: "right",
              default: true, // button to focus on
              cancel: true, // button that will be "clicked" on when pressing Esc/B
              label: "ui.introPopup.ok",
              class: "main",
              click() { close(true); }
            },
            later: {
              pos: "left",
              cancel: true, // button that will be "clicked" on when pressing Esc/B
              label: "ui.introPopup.later",
              // class: "link", // "link" is the default class for them now
              click() { close(false); }
            },
            logbook: {
              pos: "left",
              label: "ui.introPopup.viewInLogbook",
              click() {
                close(true);
                // Angular Logbook Launch
                // $state.go("menu.careerLogbook", { entryId: options.arguments.id[options.arguments.groupIndex] });
                const entryId = options.arguments.logbookId[options.arguments.groupIndex]
                $state.go("logbook",{id: (''+entryId).replace(/\//g, '%')})  // forward slashes breaking routing (angular?) - a bit of a hack to fix it
              }
            },
          };
          const flavours = {
            "default": {
              title: null,
              text: null,
              image: null,
              ratio: "16x9",
              buttons: [buttons.later, buttons.ok]
            },
            "welcome": {
              title: null,
              text: null,
              image: null,
              ratio: "16x9",
              buttons: [buttons.logbook, buttons.ok]
            },
            "branch-info": {
              title: null,
              text: null,
              image: null,
              ratio: "16x9",
              // buttons: [buttons.later, buttons.ok]
              buttons: [buttons.later]
            },
            "garage": {
              title: null,
              text: null,
              image: null,
              ratio: null,
              buttons: [buttons.later, buttons.ok]
            },
          };
          let cur;
          // find the appropriate flavour preset
          if (flavours.hasOwnProperty(options.name)) {
            cur = flavours[options.name];
          } else {
            cur = flavours.default;
            if (!options.arguments.text)
              options.arguments.text = `No text for "${options.name}" :(`;
          }
          // fill missing fields with defaults
          for (let key in cur) {
            if (!options.arguments.hasOwnProperty(key))
              options.arguments[key] = cur[key];
          }
          for (let i in options.arguments.buttons) {
            let btn = options.arguments.buttons[i];
            if (typeof btn === "string") {
              if (buttons.hasOwnProperty(btn))
                options.arguments.buttons[i] = buttons[btn];
              else
                options.arguments.buttons[i] = { label: `[${btn}]`, click() { } };
            }
          }
          options.viewedName = options.arguments.hasOwnProperty("id") ? options.arguments.id : options.name;
          resolve(true);
        });
      }
    },

    mission: {
      template: "/ui/modules/introPopup/mission.html",
      beforeShow(options) {
        return new Promise((resolve, reject) => {
          const btn = {
            default: true, // button to focus on
            class: "main",
            label: "ui.introPopup.ok",
          };
          const cur = {
            title: "Mission title",
            text: "Mission text",
            image: null,
            ratio: null,
            buttons: [btn]
          };
          for (let key in cur) {
            if (!options.arguments.hasOwnProperty(key))
              options.arguments[key] = cur[key];
          }
          for (let i in options.arguments.buttons) {
            const btn = options.arguments.buttons[i];
            if(typeof btn.clickLua === "string") {
              btn.click = () => { bngApi.engineLua(btn.clickLua); close(true); };
            } else if (typeof btn.click !== "function") {
              btn.click = () => close(true);
            } else {
              const click = btn.click;
              btn.click = () => { click(); close(true); };
            }
          }
          options.viewedName = options.arguments.hasOwnProperty("id") ? options.arguments.id : options.name;
          resolve(true);
        });
      }
    },

  };
  for (let name in presets)
    presets[name].name = name;


  /////////////
  /// listeners

  const careerKnownIds = []; // FIXME: temp solution for custom messages in career
  const careerFlavourToName = { // converts flavours to names when needed (otherwise will use "default" flavour)
    // "garage": "welcome",
    "branch-info": "welcome",
  };

  $rootScope.$on("introPopupCareer", (evt, data) => careerDataIn(data));
  function careerDataIn(data) {
    dbgMsg("Received new career data", data);
    if (typeof data === "object" && data.type && data.time)
      data = [data];
    if (!Array.isArray(data))
      return;
    for (let nfo of data) {
      if (!nfo.hasOwnProperty("entryId"))
        dbgMsg("No entryId in data, saving as read might not work.", JSON.parse(JSON.stringify(nfo)));
      const flv = careerFlavourToName[nfo.flavour] || nfo.flavour || "custom";
      const args = { id: nfo.entryId, logbookId: nfo.logbookId !== null ? nfo.logbookId : nfo.entryId };
      setArgs(args, nfo, ["title", "text", "image", "ratio"]);
      enqueue("career", flv, args);
    }
  }

  $rootScope.$on("introPopupTutorial", (evt, data) => tutorialDataIn(data));
  function tutorialDataIn(data) {
    dbgMsg("Received new career data", data);
    if (typeof data === "object" && data.type && data.time)
      data = [data];
    if (!Array.isArray(data))
      return;
    for (let nfo of data) {
      if (!nfo.hasOwnProperty("entryId"))
        dbgMsg("No entryId in data, saving as read might not work.", JSON.parse(JSON.stringify(nfo)));
      const flv = careerFlavourToName[nfo.flavour] || nfo.flavour || "custom";
      const args = { id: nfo.entryId, logbookId: nfo.logbookId !== null ? nfo.logbookId : nfo.entryId };
      setArgs(args, nfo, ["title", "content"]);
      enqueue("tutorial", flv, args);
    }
  }

  // you can add more, just change "mission" to a preset name
  $rootScope.$on("introPopupMission", (evt, data) => customDataIn("mission", data));
  function customDataIn(presetName, data) {
    dbgMsg("Received new custom data", data);
    if (typeof data !== "object" || Array.isArray(data)) {
      console.error("IntroPopup: Received invalid custom data", data);
      return;
    }
    const args = { id: -1 };
    setArgs(args, data, ["title", "text", "image", "ratio", "buttons"]);
    enqueue(presetName, data.name || "custom", args);
  }

  // see docs for externalClose below
  $rootScope.$on("introPopupClose", (evt, ...args) => externalClose(...args));

  function setArgs(args, nfo, list) {
    if (!nfo.image && nfo.cover)
      nfo.image = nfo.cover;
    const translate = ["title", "text"];
    const bbcode = ["text"];
    for (let key of list) {
      if (nfo[key]) {
        let val = nfo[key];
        if (translate.includes(key))
          val = translateService.contextTranslate(val);
        if (bbcode.includes(key))
          val = Utils.parseBBCode(val);
        args[key] = val;
      }
    }
  }


  ////////////////////////
  /// viewed state storage

  const keyPrefix = "intro:"; // change this for versioning only; used for non-career popups
  const viewed = {};
  function viewId(id) {
    if (flags.career)
      return flags.careerName + ":" + id;
    else
      return id;
  }
  function setViewed(id, value=true) {
    if (id < 0) // custom popups always shown
      return;
    let vid = viewId(id);
    // if (viewed[vid] && viewed[vid] === value)
    //   return;
    // viewed[vid] = value;
    if (flags.career && careerKnownIds.includes(vid))
      bngApi.engineLua(`career_modules_logbook.setLogbookEntryRead(${bngApi.serializeToLua(id)}, ${value})`);
    //else
      //localStorage.setItem(keyPrefix + vid, JSON.stringify(value));
  }
  function wasViewed(id, defValue=false) {
    if (id < 0) // custom popups always shown
      return false;
    let vid = viewId(id);
    return viewed.hasOwnProperty(vid) ? viewed[vid] : defValue;
  }
  // preloader
  /**
  for (let key in localStorage) {
    if (!key.startsWith(keyPrefix))
      continue;
    let value = localStorage.getItem(key);
    if (!value)
      continue;
    try {
      value = JSON.parse(value);
    } catch (fire) {
      continue;
    }
    const name = key.substring(keyPrefix.length);
    if (!viewed[name] && value)
      viewed[name] = value;
  }**/
  // dbgMsg(viewed);


  /////////////////////////////
  /// flags, options, internals

  const statesBlackList = ["loading", "fadeScreen"];
  const flags = {
    // // inMenu: false,
    currentState: "",
    // // lastState: "", // before entering the menu
    career: false,
    careerName: null,
    // FIXME: temp solution for garage mode welcome
    specialNames: [],
    showFlavours: { all: true },
  };
  $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    // dbgMsg(`State changed to "${toState.name}" from "${fromState.name}"`);
    // const isMenu = name => name === "menu" || name.startsWith("menu.");
    // flags.inMenu = isMenu(toState.name);
    flags.currentState = toState.name;
    // if (fromState && fromState.name && !isMenu(fromState.name))
    //   flags.lastState = fromState.name;
    if (statesBlackList.includes(fromState.name))
      attemptShow();
    else
      updateShown();
  });

  const options = {};
  function resetOptions() {
    options.shown = false;            // if it's really shown (don't set manually)
    options.show = false;             // show popup toggle
    options.locked = false;           // if popup is temporary locked out from interaction
    options.name = null;              // provided popup name
    options.viewedName = null;        // name of a setting to track viewed state (if not in career)
    options.preset = presets.default; // preset (template, functions) defined above
    options.arguments = {};           // provided popup arguments (they go to the template)
    options.stateName = "";           // UI state where popup was called in
  }
  resetOptions();

  function setCareerMode(isCareer) {
    // if (flags.career !== isCareer) { // do a reset if mode has been changed (FIXME: it conflicts with career popups on profile creation)
    if (flags.career && !isCareer) { // do a reset when we're going out of career
      flags.specialNames = [];
      resetQueue();
      close();
    }
    flags.career = isCareer; // supportive set, so viewed ids won't be messed up at the fist load
  }

  let showRetry = 0;
  function updateShown() {
    // this function sometimes considered out of angular scope for some reason (e.g.transition between vehicle and bigmap)
    // so $timeout here waits for $digest cycle to finish
    $timeout(() => {
      function dbg() {
        if (!debug)
          return;
        if (options.shown)
          dbgMsg(`Display allowed: Correct state ${flags.career ? "in" : "out of"} career mode.`);
        else if (options.show)
          dbgMsg(`Not allowed to display: Incorrect state ${flags.career ? "in" : "or out of"} career mode. Current state "${flags.currentState}", expected "${options.stateName}".`);
      }

      let prev = options.shown;
      options.shown = options.show && options.stateName === flags.currentState;

      if (options.shown) {
        bngApi.engineLua("career_career.isActive()", data => {
          setCareerMode(!!data);
          if (options.shown !== prev) {
            $timeout(() => {
              const elm = document.getElementById("bng-intro-popup");
              if (elm) {
                showRetry = 0;
                options.locked = true;
                $timeout(() => options.locked = false, 1000);
                elm.showModal();
              } else {
                showRetry++;
                if (showRetry < 20)
                  $timeout(updateShown, 50);
                else
                  throw new Error("Unable to show intro popup");
              }
            }, 10);
            captureInput(options.shown);
            forwardInput(options.shown);
          }
          dbg();
        });
      } else {
        if (options.shown !== prev) {
          captureInput(options.shown);
          forwardInput(options.shown);
        }
        dbg();
      }
    });
  }

  const captureInput = InputCapturer({
    backAction() {
      if (options.locked)
        return true;
      if (Array.isArray(options.arguments.buttons)) {
        for (let btn of options.arguments.buttons) {
          if (btn.cancel) {
            btn.click();
            break;
          }
        }
      }
      return true;
    }
  });
  function forwardInput(doforward) {
    // FIXME: not sure if this is required to enable UI focus when it was in game before showing the popup
    // doforward = doforward ? "true" : "false";
    // bngApi.engineLua(`WinInput.setForwardRawEvents(${doforward});`);
    // bngApi.engineLua(`WinInput.setForwardFilteredEvents(${doforward});`);
  }


  /////////////////
  /// message queue

  const queue = [], openNextDebounce = RateLimiter.debounce(openNext, 10);

  function resetQueue() {
    queue.splice(0);
  }

  function enqueue(...args) {
    const str = JSON.stringify(args);
    let isNew = true;
    for (let itm of queue) {
      if (itm.str === str) {
        isNew = false;
        break;
      }
    }
    if (isNew)
      queue.push({ args, str });
    openNextDebounce();
  }

  async function openNext() {
    if (statesBlackList.includes($state.current.name)) {
      dbgMsg("Prevented showing the popup on loading screen");
      return;
    }
    dbgMsg(`${queue.length} left in queue`);
    if (options.show) {
      dbgMsg("Already showing a popup");
      return;
    }
    if (queue.length === 0) {
      resetOptions();
      return;
    }
    // check if items can be grouped
    const cur = queue.shift().args;
    dbgMsg("Now showing:", cur);
    const presetName = fixPresetName(cur[0]);
    const presetGrouped = presetName && presets.hasOwnProperty(presetName) && presets[presetName].grouped;
    dbgMsg(`Preset "${presetName}" ${presetGrouped ? "supports" : "does not support"} groupped messages.`);
    // if not grouped, just show one
    if (!presetGrouped) {
      open(...cur);
      return;
    }
    // if it's a group, check and merge
    // TODO: if new items have been just added during the view, find and add to it
    const optKeys = ["text", "title", "image", "ratio", "id", "logbookId", "content"]; // text should go first because it is most likely to be defined
    const curopts = {};
    await prepareOptions(curopts, ...cur);
    curopts.viewedName = curopts.show ? [curopts.viewedName] : [];
    for (let key of optKeys) // set initial options
      curopts.arguments[key] = curopts.show ? [curopts.arguments[key]] : [];
    // find queued items to group in
    for (let i = queue.length - 1; i > -1; i--) {
      if (!queue[i])
        continue;
      let [qPresetName, qName] = queue[i].args;
      if (fixPresetName(qPresetName) !== presetName || qName !== cur[1])
        continue;
      let opts = {};
      await prepareOptions(opts, ...queue[i].args);
      if (!opts.show)
        continue;
      queue.splice(i, 1);
      for (let key of optKeys)
        curopts.arguments[key].splice(1, 0, opts.arguments[key]);
      curopts.viewedName.push(opts.viewedName);
    }
    curopts.arguments.groupIndex = 0;
    resetOptions();
    applyOptions(curopts);
    // dbgMsg(options);
    attemptShow();
  }


  /////////////
  /// utilities

  function fixPresetName(presetName) {
    if (!presetName)
      presetName = "default";
    else if (!presets.hasOwnProperty(presetName))
      presetName = null;
    return presetName;
  }

  async function prepareOptions(optionsOut, presetName, name, args={}, force=false) {
    // prevent showing again on caller reload
    // if (presetName === options.preset.name && name === options.name) {
    //   if (force) {
    //     options.show = true;
    //     setViewed(options.viewedName, false);
    //   }
    //   return;
    // }

    presetName = fixPresetName(presetName);
    if (!presetName) {
      console.error(`IntroPopup: Preset "${presetName}" must be defined`);
      return false;
    }

    if (!name) {
      console.error("IntroPopup: Popup name must be defined");
      return false;
    }

    if (!args) {
      // return console.error("IntroPopup: Arguments must be defined");
      args = {};
    } else if (typeof args !== "object" && !Array.isArray(args)) {
      console.error("IntroPopup: Arguments must be Object");
      return false;
    }

    await new Promise((resolve, reject) => {
      bngApi.engineLua("career_career.isActive()", data => {
        setCareerMode(!!data);
        resolve();
      });
    });

    optionsOut.name = name;
    optionsOut.viewedName = name;
    optionsOut.preset = presets[presetName];
    optionsOut.arguments = args;
    optionsOut.stateName = $state.current.name;

    let showing = true;

    if (optionsOut.preset.beforeShow) {
      let show = await optionsOut.preset.beforeShow(optionsOut);
      showing = typeof show === "boolean" ? show : true;
    }

    if (showing) {
      // split buttons by position
      if (optionsOut.arguments.buttons) {
        optionsOut.arguments.leftButtons = optionsOut.arguments.buttons.filter(({ pos }) => pos === "left");
        optionsOut.arguments.rightButtons = optionsOut.arguments.buttons.filter(({ pos }) => pos === "right");
        if (optionsOut.arguments.leftButtons.length === 0 && optionsOut.arguments.rightButtons.length === 0)
          optionsOut.arguments.rightButtons = optionsOut.arguments.buttons;
      }
      showing = force || !wasViewed(optionsOut.viewedName);
      if (force)
        setViewed(optionsOut.viewedName, false);
    }

    optionsOut.show = showing;

    // dbgMsg("showing?", showing);
    // dbgMsg({ options, flags, state: $state });
    return true;
  }

  function applyOptions(from) {
    for (let key in options) {
      if (from.hasOwnProperty(key))
        options[key] = from[key];
    }
  }

  function attemptShow() {
    if (!options.show)
      openNextDebounce();
    updateShown();
  }

  //////////////////
  /// main procedure
  // not to be ran directly because it will replace any active popup
  // please queue it instead
  async function open(presetName, name, args, force) {
    resetOptions();
    await prepareOptions(options, presetName, name, args, force);
    attemptShow();
  }

  function close(remember=false) {
    options.show = false;
    bngApi.engineLua("extensions.hook('onIntroPopupCareerClosed')")
    updateShown();
    if (remember) {
      if (options.preset.grouped) {
        for (let id of options.viewedName)
          setViewed(id, true);
      } else {
        setViewed(options.viewedName, true);
      }
    }
    openNextDebounce();
  }

  // externalClose overloads:
  //  (), (true), ("name"), ("name", true)
  // note: true will save it as a read message if applicable
  //       "name" comes from the .name param, passed to introPopupMission, or flavour in career-related calls
  //       if "name" is not specified in data of introPopupMission, you can use "custom" as a name here
  function externalClose(...args) {
    let name = null,
        save = false;
    if (args.length > 1) {
      [name, save] = args;
    } else if (args.length === 1) {
      if (typeof args[0] === "string")
        name = args[0];
      else if (typeof args[0] === "boolean")
        save = args[0];
    }
    if (!name)
      close(!!save);
    else if (options.name === name)
      close(!!save);
  }

  if (debug) {
    window.introtest = () => {
      const args = { text: "Press [action=toggle_minimap] to show things" };
      setArgs(args, args, ["text"]);
      enqueue("career", "test", args);
    };
  }

  /////////////////
  /// exposed stuff
  return {
    ...Object.keys(presets).reduce((cur, preset) => (
      { ...cur, [preset]: (name, args, force) => enqueue(preset, name, args, force) }
    )),
    options,
    flags,
    open: enqueue, // (presetName, name, args, force)
    close: externalClose, // overloads: (), (true), ("name"), ("name", true)
    releaseInput: () => {
      captureInput(false);
      forwardInput(false);
    },
  };
}])


// template controller
.controller("IntroPopupCtl", ["$scope", "IntroPopup", function ($scope, IntroPopup) {
  if (IntroPopup.options.preset.grouped) {
    $scope._options = IntroPopup.options;
    $scope.$watch("_options.arguments.groupIndex", idx => {
      for (let key in IntroPopup.options.arguments) {
        if (Array.isArray(IntroPopup.options.arguments[key]))
          $scope[key] = IntroPopup.options.arguments[key][idx];
      }
    });
  } else {
    for (let key in IntroPopup.options.arguments)
      $scope[key] = IntroPopup.options.arguments[key];
  }
}])


// main directive (should be one)
.directive("bngIntroPopup", ["IntroPopup", function (IntroPopup) {
  return {
    restrict: "E",
    replace: true,
    template: `
    <dialog id="bng-intro-popup" class="intro-popup" ng-class="{ 'intro-popup-lock': IntroPopup_options.locked }" ng-if="IntroPopup_options.shown" bng-blur="true">
      <style ng-if="!app.mainmenu">
        body > * { opacity: 0; }
        .intro-popup { opacity: 1 !important; }
      </style>
      <!-- single -->
      <bng-card-dark ng-if="!IntroPopup_options.preset.grouped" class="intro-popup-container">
        <card-title ng-if="IntroPopup_options.arguments.title != null">
          <bng-title title="{{ IntroPopup_options.arguments.title | translate }}" animate="true"></bng-title>
        </card-title>
        <card-body>
          <ng-include src="IntroPopup_options.preset.template" ng-controller="IntroPopupCtl"></ng-include>
        </card-body>
        <card-footer>
          <button ng-repeat="button in IntroPopup_options.arguments.buttons"
            class="bng-button-{{button.class}}"
            ng-click="button.click()"
            focus-if="button.default"
            bng-sound-class="bng_click_generic"
          >
            {{ button.label | translate }}
          </button>
        </card-footer>
      </bng-card-dark>
      <!-- grouped -->
      <bng-card-dark ng-if="IntroPopup_options.preset.grouped" class="intro-popup-container">
        <card-title ng-if="IntroPopup_options.arguments.title[IntroPopup_options.arguments.groupIndex] != null">
          <bng-title title="{{ IntroPopup_options.arguments.title[IntroPopup_options.arguments.groupIndex] | translate }}" animate="true"></bng-title>
        </card-title>
        <card-body>
          <ng-include src="IntroPopup_options.preset.template" ng-controller="IntroPopupCtl"></ng-include>
        </card-body>
        <card-footer>
          <button ng-repeat="button in IntroPopup_options.arguments.leftButtons"
            class="bng-button-{{ !button.class ? 'link' : button.class }}"
            ng-click="button.click()"
            focus-if="!IntroPopup_options.locked && button.default && !(IntroPopup_options.preset.grouped && IntroPopup_options.arguments.groupIndex < IntroPopup_options.arguments.title.length - 1)"
            bng-sound-class="bng_click_generic"
          >
            {{ button.label | translate }}
          </button>
          <button ng-if="IntroPopup_options.preset.grouped && IntroPopup_options.arguments.title.length > 1"
            ng-disabled="IntroPopup_options.arguments.groupIndex === 0"
            class="bng-button-link"
            ng-click="IntroPopup_prev()"
            _focus-if="!IntroPopup_options.locked && IntroPopup_options.arguments.groupIndex > 0 && IntroPopup_options.arguments.groupIndex === IntroPopup_options.arguments.title.length - 1"
            bng-sound-class="bng_click_generic"
          >
            &larr;
            {{:: "ui.introPopup.prev" | translate }}
          </button>
          <button ng-if="IntroPopup_options.preset.grouped && IntroPopup_options.arguments.title.length > 1"
            ng-disabled="IntroPopup_options.arguments.groupIndex === IntroPopup_options.arguments.title.length - 1"
            class="bng-button-link"
            ng-click="IntroPopup_next()"
            focus-if="!IntroPopup_options.locked && IntroPopup_options.arguments.groupIndex === 0 && IntroPopup_options.arguments.title.length > 1"
            bng-sound-class="bng_click_generic"
          >
            {{:: "ui.introPopup.next" | translate }}
            &rarr;
          </button>
          <button ng-repeat="button in IntroPopup_options.arguments.rightButtons"
            class="bng-button-{{ !button.class ? 'link' : button.class }}"
            ng-click="button.click()"
            ng-disabled="IntroPopup_options.arguments.groupIndex !== IntroPopup_options.arguments.title.length - 1"
            focus-if="!IntroPopup_options.locked && button.default && !(IntroPopup_options.preset.grouped && IntroPopup_options.arguments.groupIndex < IntroPopup_options.arguments.title.length - 1)"
            bng-sound-class="bng_click_generic"
          >
            {{ button.label | translate }}
          </button>
        </card-footer>
      </bng-card-dark>
    </dialog>
    `,
    link($scope) {
      $scope.IntroPopup_options = IntroPopup.options;
      $scope.IntroPopup_prev = () => page(-1);
      $scope.IntroPopup_next = () => page( 1);
      function page(shift) {
        IntroPopup.options.arguments.groupIndex += shift;
        // this is stupid...
        let elem = document.getElementsByClassName("intro-popup");
        if (elem.length === 0)
          return;
        elem = elem[0].getElementsByTagName("ng-include");
        if (elem.length === 0)
          return;
        elem = elem[0].parentNode.parentNode;
        elem.scrollTo(0, 0);
      }
      $scope.$on("$destroy", () => IntroPopup.releaseInput()); // just in case
    },
  }
}])
