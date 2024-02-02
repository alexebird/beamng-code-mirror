"use strict"

angular.module("beamng.stuff")
.controller("GarageController", ["$scope", "$state", "GarageVehicleState", "ConfirmationDialog", "InputCapturer", function ($scope, $state, GarageVehicleState, ConfirmationDialog, InputCapturer) {
  // see also play.js
  $scope.$watch("$parent.app.gameState", gameState => {
    // this is to make garage disappear when garage was opened inside freeroam or else
    if (gameState !== "garage")
      $state.go("play");
  });

  const streamsList = ["electrics"];
  StreamsManager.add(streamsList);
  const captureInput = InputCapturer({
    backAction() { // action on Esc/B
      if (!$scope.vehctl)
        return false; // allow default
      $scope.vehctl = "";
      return true; // prevent default
    }
  });
  captureInput(true);
  $scope.$on("$destroy", () => {
    StreamsManager.remove(streamsList);
    captureInput(false);
  });

  $scope.loaded = {
    init: false,
    vehicle: false,
    status: false,
  };
  let tmrInit = setTimeout(() => {
    console.log("Unable to get vehicle details in time. Forcing to init...");
    $scope.loaded.init = true;
    tmrInit = null;
  }, 3000);

  // handles vehicle change
  function vehChange() { // this function init is at bottom of garage controller
    // reset menus // don't! if you do, check if it's not conflicting with parts change
    //$scope.vehctl = "";
    //sideToggle("side_vehicle", false);
    // lock status
    $scope.loaded.vehicle = false;
    $scope.loaded.status = false;
    // reset vehicle
    $scope.vehicle = {
      name: "Unknown",
      vehicle: null,
      electrics: {},
    };
    // request info
    bngApi.engineLua("core_vehicles.getCurrentVehicleDetails()", data => {
      if (tmrInit) {
        $scope.loaded.init = true; // to release controls even on a wrong data
        clearTimeout(tmrInit);
        tmrInit = null;
      }
      // console.log("VEHICLE", data);
      if (!data)
        return;
      $scope.loaded.vehicle = true;
      $scope.vehicle.vehicle = data;
      if (data.model.Brand)
        $scope.vehicle.name = `${data.model.Brand} ${data.model.Name}`;
      else
        $scope.vehicle.name = data.configs.Name;
      if (data.configs.Configuration) {
        if (data.configs.Source === "BeamNG - Official")
          $scope.vehicle.name += ` - ${data.configs.Configuration}`;
        else
          $scope.vehicle.name += " - Custom"; // ?
      }
    });
    bngApi.activeObjectLua("electrics.setIgnitionLevel(1)"); // enable electrics w/o ignition
  }
  $scope.$on("VehicleChange", vehChange);
  bngApi.activeObjectLua("electrics.setIgnitionLevel(1)"); // enable electrics w/o ignition

  // electric switches
  const switches = {
    lowbeam:  { func: "setLightsState",      value: "lights_state",   on: 1, off: 0 },
    highbeam: { func: "setLightsState",      value: "lights_state",   on: 2, off: 0 },
    fog:      { func: "set_fog_lights",      value: "fog",            on: 1, off: 0 },
    lightbar: { func: "set_lightbar_signal", value: "lightbar",       on: 1, off: 0 },
    hazard:   { func: "set_warn_signal",     value: "hazard_enabled", on: 1, off: 0 },
  };
  for (let key in switches)
    switches[key].state = false;
  function vehSwitch(part, on) {
    if (!switches.hasOwnProperty(part))
      return;
    const svc = switches[part];
    if (typeof on === "undefined") // toggle if undefined
      on = !svc.state;
    else if (on === svc.state)
      return;
    bngApi.activeObjectLua(`electrics.${svc.func}(${on ? svc.on : svc.off})`);
  }

  // track electrics state
  $scope.$on("streamsUpdate", (evt, streams) => {
    if (!streams.electrics)
      return;
    const data = streams.electrics;
    $scope.loaded.status = data.ignitionLevel > 0; // check if electrics is on
    // console.log("ELECTRICS", data);
    for (let key in switches) {
      const svc = switches[key];
      svc.state = data.hasOwnProperty(svc.value) && data[svc.value] === svc.on;
      $scope.vehicle.electrics[key] = svc.state;
    }
  });

  $scope.inCareer = false;
  bngApi.engineLua("career_career.isActive()", data => {
    $scope.inCareer = !!data;
    // menu switcher
    menuGo("bottom", $scope.inCareer ? "bottom_career" : "bottom_garage");
  });

  const menuEntries = {
    /// specifications
    // root - means that this is the top-most menu entry
    //     note: root icon is used for breadcrumbs
    // contclass - (optional) will set this class on a container
    // class - (optional) will set this class on an item
    // icon - path to an icon file
    // items - list of ids of items inside this menu
    // buttonText & titleText - translation id for button and title
    // action(menu) - (optional) the code to run on click.
    //     menu argument is set to the root.
    //     it can return boolean variable, if false - click
    //     will be ignored after action() to prevent navigation
    //     if it has items inside. default - true, navigation will occur.
    //
    // note: everything is mutable to have the ability to change values
    //       from every part of the code
    //
    // $scope.menu[rootid] = {
    //   ...same as any menu entry, plus:
    //   current     - current menu entry
    //   breadcrumbs - array of menu ids
    //   path        - array of respective menu entries as in breadcrumbs
    // }

    // main menu
    main: {
      root: true,
      contclass: "garage-menu-main",
      icon: "/ui/assets/SVG/24/garage.svg",
      items: [
        "main_parts", "main_tuning", "main_paint", "main_decals"
      ]
    },
    main_paint: {
      buttontext: "ui.garage.tabs.paint",
      titletext: "ui.garage.tabs.paint",
      icon: "/ui/assets/SVG/24/spray-can.svg",
      get class() { return $scope.inCareer ? "garage-menu-hide" : $scope.vehctl === "colour" ? "garage-button-active" : ""; },
      action(menu) {
        bngApi.engineLua(`gameplay_garageMode.setGarageMenuState("paint")`);
        $scope.vehctl = $scope.vehctl === "colour" ? "" : "colour";
        // $state.go("menu.vehicleconfig.color");
      },
    },
    main_decals: {
      buttontext: "ui.garage.tabs.decals",
      titletext: "ui.garage.tabs.decals",
      icon: "/ui/assets/SVG/24/star.svg",
      get class() { return false; },
      action(menu) {
        $state.go("decals-loader");
      },
    },
    main_parts: {
      buttontext: "ui.garage.tabs.parts",
      titletext: "ui.garage.tabs.parts",
      icon: "/ui/assets/SVG/24/engine.svg",
      get class() { return $scope.inCareer ? "garage-menu-hide" : $scope.vehctl === "parts" ? "garage-button-active" : ""; },
      action(menu) {
        bngApi.engineLua(`gameplay_garageMode.setGarageMenuState("parts")`);
        $scope.vehctl = $scope.vehctl === "parts" ? "" : "parts";
        // $state.go("menu.vehicleconfig.parts");
      },
    },
    main_tuning: {
      buttontext: "ui.garage.tabs.tune",
      titletext: "ui.garage.tune.tuning",
      icon: "/ui/assets/SVG/24/gauge.svg",
      get class() { return $scope.vehctl === "tuning" ? "garage-button-active" : ""; },
      action(menu) {
        if($scope.inCareer) {
          bngApi.engineLua(`career_modules_tuning.start()`);
        } else {
          bngApi.engineLua(`gameplay_garageMode.setGarageMenuState("tuning")`);
          $scope.vehctl = $scope.vehctl === "tuning" ? "" : "tuning";
          // $state.go("menu.vehicleconfig.tuning");
        }
      },
    },

    // main menu 2
    main2: {
      root: true,
      icon: "/ui/assets/SVG/24/camera.svg",
      get class() { return $scope.vehctl ? "garage-menu-hide" : ""; },
      items: ["main_vehicles", "main_mycars", "main_photomode"]
    },
    main_vehicles: {
      buttontext: "ui.garage.tabs.vehicles",
      titletext: "",
      icon: "/ui/assets/SVG/24/vehicle.svg",
      get class() { return $scope.inCareer ? "garage-menu-hide" : ""; },
      action(menu) {
        bngApi.engineLua(`gameplay_garageMode.setGarageMenuState("vehicles")`);
        $state.go("menu.vehicles", { mode: "garageMode", garage: "all" });
      },
    },
    main_mycars: {
      buttontext: "ui.garage.tabs.load",
      titletext: "ui.garage.load.loadCar",
      icon: "/ui/assets/SVG/24/keys.svg",
      action(menu) {
        if($scope.inCareer) {
          bngApi.engineLua(`career_modules_inventory.openMenuInsideGarage()`);
        } else {
          bngApi.engineLua(`gameplay_garageMode.setGarageMenuState("myCars")`);
          $state.go("menu.vehicles", { mode: "garageMode", garage: $scope.inCareer ? "own-career" : "own" });
        }
      },
    },
    main_photomode: {
      buttontext: "ui.garage.tabs.photo",
      titletext: "ui.garage.tabs.photo",
      icon: "/ui/assets/SVG/24/camera.svg",
      action(menu) {
        $state.go("menu.photomode");
      },
    },

    // bottom left menu wrapper
    // this menu is switched on init, see menuGo call above
    bottom: {
      root: true,
      // contclass: "garage-menu-main",
      icon: "/ui/assets/SVG/24/garage.svg",
      items: [
        "bottom_garage", "bottom_career"
      ]
    },
    // bottom left menu
    bottom_garage: {
      root: true,
      // contclass: "garage-menu-main",
      icon: "/ui/assets/SVG/24/garage.svg",
      items: [
        /*"bottom_garage_savedefault",*/ "bottom_garage_test", "bottom_garage_save", "bottom_garage_exit"
      ]
    },
    bottom_garage_save: {
      buttontext: "ui.vehicleconfig.save",
      icon: "/ui/assets/SVG/24/save-as.svg",
      get class() { return $scope.vehctl === "save" ? "garage-button-active" : ""; },
      action(menu) {
        $scope.vehctl = $scope.vehctl === "save" ? "" : "save";
      },
    },
    // bottom_garage_savedefault: {
    //   buttontext: "[save def]",
    //   icon: "/ui/assets/SVG/24/vehicle-favorite.svg",
    //   action(menu) {
    //     console.log("TODO: save as default");
    //   },
    // },
    bottom_garage_test: {
      buttontext: "ui.common.test",
      icon: "/ui/assets/SVG/24/test-cone.svg",
      get class() { return !$scope.isFreeroam ? "" : "garage-menu-hide"; },
      action(menu) {
        $scope.vehctl = "";
        bngApi.engineLua(`gameplay_garageMode.testVehicle()`);
      },
    },
    bottom_garage_exit: {
      buttontext: "ui.common.exit",
      icon: "/ui/assets/SVG/24/exit.svg",
      get class() { return $scope.isFreeroam ? "" : "garage-menu-hide"; },
      action(menu) {
        bngApi.engineLua("gameplay_garageMode.stop()");
      },
    },

    // bottom left menu in career mode
    bottom_career: {
      root: true,
      // contclass: "garage-menu-main",
      icon: "/ui/assets/SVG/24/garage.svg",
      items: [
        "bottom_career_exit"
      ]
    },
    bottom_career_exit: {
      buttontext: "ui.common.exit",
      icon: "/ui/assets/SVG/24/exit.svg",
      action(menu) {
        if (GarageVehicleState.vehicleDirty || GarageVehicleState.switchedToNewVehicle) {
          ConfirmationDialog.open(
            null, "ui.career.garage.exitPrompt",
            [
              { label: "ui.common.yes", key: true },
              { label: "ui.common.no", key: false, default: true, isCancel: true }
            ]
          ).then(res => {
            if (res)
              bngApi.engineLua("gameplay_garageMode.stop()");
          });
        } else {
          bngApi.engineLua("gameplay_garageMode.stop()");
        }
      },
    },

    // side panels
    side: {
      root: true,
      items: [
        "side_camera", "side_vehicle", "side_garage"
      ]
    },
    side_vehicle: {
      // ui.options.controls.bindings.Vehicle
      buttontext: "ui.radialmenu2.electrics",
      titletext: "",
      icon: "/ui/assets/SVG/24/vehicle-features-1.svg",
      action: menu => sideToggle("side_vehicle"),
      items: [
        "veh_light_low", "veh_light_high", "veh_light_fog",
        "veh_light_hazard", "veh_light_bar"
      ]
    },
    side_camera: {
      buttontext: "engine.editor.menu.camera",
      titletext: "",
      icon: "/ui/assets/SVG/24/movie-cam.svg",
      action: menu => sideToggle("side_camera"),
      items: [
        "camera_default",
        "camera_front", "camera_back",
        "camera_side", "camera_top"
      ]
    },
    side_garage: {
      buttontext: "ui.garage2.features",
      titletext: "",
      icon: "/ui/assets/SVG/24/garage-features-3.svg",
      get class() { return $scope.inCareer || $scope.isFreeroam ? "garage-menu-hide" : ""; },
      action: menu => sideToggle("side_garage"),
      items: [
        "garage_light_west", "garage_light_middle", "garage_light_east"
      ]
    },

    // vehicle features
    veh_light_low: {
      buttontext: "ui.radialmenu2.electrics.headlights.low",
      icon: "/ui/assets/SVG/24/lo-beam.svg",
      get class() { return $scope.vehicle.electrics.lowbeam ? "garage-sidemenu-item-active" : "" },
      action(menu) {
        vehSwitch("lowbeam");
      },
    },
    veh_light_high: {
      // ui.inputActions.vehicle.toggle_headlights.title
      // ui.radialmenu2.electrics.headlights
      buttontext: "ui.radialmenu2.electrics.headlights.high",
      icon: "/ui/assets/SVG/24/hi-beam.svg",
      get class() { return $scope.vehicle.electrics.highbeam ? "garage-sidemenu-item-active" : "" },
      action(menu) {
        vehSwitch("highbeam");
      },
    },
    veh_light_fog: {
      // ui.inputActions.vehicle.toggle_foglights.title
      buttontext: "ui.radialmenu2.electrics.fog_lights",
      icon: "/ui/assets/SVG/24/foglight.svg",
      get class() { return $scope.vehicle.electrics.fog ? "garage-sidemenu-item-active" : "" },
      action(menu) {
        vehSwitch("fog");
      },
    },
    veh_light_hazard: {
      // ui.inputActions.vehicle.toggle_hazard_signal.title
      buttontext: "ui.radialmenu2.electrics.hazard_lights",
      icon: "/ui/assets/SVG/24/haz-lights.svg",
      get class() { return $scope.vehicle.electrics.hazard ? "garage-sidemenu-item-active" : "" },
      action(menu) {
        vehSwitch("hazard");
      },
    },
    veh_light_bar: {
      buttontext: "ui.radialmenu2.electrics.lightbar",
      icon: "/ui/assets/SVG/24/strobe-lights.svg",
      get class() { return $scope.vehicle.electrics.lightbar ? "garage-sidemenu-item-active" : "" },
      action(menu) {
        vehSwitch("lightbar");
      },
    },
    // camera presets
    camera_default: {
      // engine.editor.menu.camera.perspective
      // ui.options.camera.defaultMode
      buttontext: "engine.editor.menu.standartCamera",
      icon: "/ui/assets/SVG/24/camera-3fourth-1.svg",
      action(menu) {
        bngApi.engineLua("gameplay_garageMode.setCamera('default')");
      },
    },
    camera_front: {
      buttontext: "engine.editor.menu.camera.front",
      icon: "/ui/assets/SVG/24/camera-front-1.svg",
      action(menu) {
        bngApi.engineLua("gameplay_garageMode.setCamera('front')");
      },
    },
    camera_back: {
      buttontext: "engine.editor.menu.camera.back",
      icon: "/ui/assets/SVG/24/camera-back-1.svg",
      action(menu) {
        bngApi.engineLua("gameplay_garageMode.setCamera('back')");
      },
    },
    camera_side: {
      buttontext: "engine.editor.menu.camera.right",
      icon: "/ui/assets/SVG/24/camera-side-1.svg",
      action(menu) {
        bngApi.engineLua("gameplay_garageMode.setCamera('side')");
      },
    },
    camera_top: {
      buttontext: "engine.editor.menu.camera.top",
      icon: "/ui/assets/SVG/24/camera-top-1.svg",
      action(menu) {
        bngApi.engineLua("gameplay_garageMode.setCamera('top')");
      },
    },

    garage_light_west: {
      buttontext: "ui.garage2.lights.west",
      icon: "/ui/assets/SVG/24/garagelight-left.svg",
      get class() { return grgLightState[0] ? "garage-sidemenu-item-active" : "" },
      action(menu) {
        grgLightState[0] = !grgLightState[0];
        bngApi.engineLua(`gameplay_garageMode.setLighting({${grgLightState.join(",")}})`);
      },
    },
    garage_light_middle: {
      buttontext: "ui.garage2.lights.middle",
      icon: "/ui/assets/SVG/24/garagelight-middle.svg",
      get class() { return grgLightState[1] ? "garage-sidemenu-item-active" : "" },
      action(menu) {
        grgLightState[1] = !grgLightState[1];
        bngApi.engineLua(`gameplay_garageMode.setLighting({${grgLightState.join(",")}})`);
      },
    },
    garage_light_east: {
      buttontext: "ui.garage2.lights.east",
      icon: "/ui/assets/SVG/24/garagelight-right.svg",
      get class() { return grgLightState[2] ? "garage-sidemenu-item-active" : "" },
      action(menu) {
        grgLightState[2] = !grgLightState[2];
        bngApi.engineLua(`gameplay_garageMode.setLighting({${grgLightState.join(",")}})`);
      },
    },

  };

  function sideToggle(id, visForce) {
    const vis = typeof visForce !== "undefined" ? visForce : !menuEntries[id].contclass;
    menuEntries[id].contclass = vis ? "garage-sidemenu-show" : "";
    menuEntries[id].sideButtonsVisible = vis;
    return false;
  }

  // garage lighting
  let grgLightState = [false, false, false];
  bngApi.engineLua("gameplay_garageMode.getLighting()", data => grgLightState = data);

  /// menu navigation
  // this allows to navigate even to foreign items, still preserving the correct breadcrumbs
  function menuGo(rootid, id=null) {
    if (!id)
      id = rootid;
    if (!$scope.menu.hasOwnProperty(rootid) || $scope.menu[rootid].current.id === id)
      return;
    const root = $scope.menu[rootid];
    root.breadcrumbs.push(root.current.id);
    root.breadcrumbs.splice(
      root.breadcrumbs.indexOf(root.current.id) + 1,
      root.breadcrumbs.length
    );
    root.path = root.breadcrumbs.map(id => menuEntries[id]);
    root.current = menuEntries[id];
  }

  /// prepare the menus
  {
    const menuUsed = []; // used only for checking on load
    $scope.menu = {};
    for (let id in menuEntries) {
      const itm = menuEntries[id];
      itm.id = id;
      if (!itm.hasOwnProperty("contclass"))
        itm.contclass = "";
      if (!itm.hasOwnProperty("class"))
        itm.class = "";
      if (itm.root) {
        $scope.menu[id] = itm;
        menuUsed.push(id);
      }
      if (!itm.items || itm.items.length === 0) {
        if (itm.root)
          throw new Error(`Garage menu: Menu root ${id} must contain items`);
        delete itm.items;
      }
      if (itm.items) {
        menuUsed.push(...itm.items);
        itm.items = itm.items.map(id => menuEntries[id]);
        for (let sub of itm.items) {
          if (!sub)
            throw new Error(`Garage menu: Menu entry not found (in ${itm.id})`);
        }
        // extend or define action
        if (itm.action) {
          const func = itm.action;
          itm.action = menu => {
            const res = func(menu);
            if (typeof res === "boolean" && !res)
              return;
            menuGo(menu.id, itm.id);
          };
        } else {
          itm.action = menu => menuGo(menu.id, itm.id);
        }
      }
    }
    for (let id in $scope.menu) {
      const root = $scope.menu[id];
      root.breadcrumbs = [];
      root.path = [];
      root.current = root;
      menuGo(id);
    }
    if (!beamng.shipping) {
      for (let id in menuEntries) {
        if (!menuUsed.includes(id))
          console.warn(`Garage menu: Unused menu entry: ${id}`);
      }
    }
  }

  $scope.isFreeroam = $scope.$parent.app.playmodeState && $scope.$parent.app.playmodeState.options && $scope.$parent.app.playmodeState.options.isFreeroam;
  $scope.$watch("$parent.app.playmodeState.options", options => {
    $scope.isFreeroam = options && options.isFreeroam;
  })

  $scope.blackscreen = false;
  $scope.$on("GarageModeBlackscreen", (evt, data) => $scope.blackscreen = data.active);

  vehChange(); // init
}])

.service("GarageVehicleState", ["$rootScope", function ($rootScope) {
  let state = {};
  $rootScope.$on("garageVehicleDirtied", function (event, data) {
    if (typeof data !== "object")
      return;
    state.vehicleDirty = data.vehicleDirty;
    state.switchedToNewVehicle = data.switchedToNewVehicle;
  });
  return state;
}])
