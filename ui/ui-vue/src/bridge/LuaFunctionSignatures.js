import { Any, Integer, run, runRaw } from "./libs/Lua.js"
import { getMockedData } from "../../devutils/mock.js"

const withMocked = (sig, getData) => ((sig.mocked = getData), sig)

// Define Lua function signatures, and normal functions here
//
// Signatures are transformed to proper 'run' calls at runtime, other functions are left untouched -
// this allows for the addition of more complex functions should they be needed
//
// If an arrow function is used, it is expected to return a signature:
//    undefined/falsey - all parameter types will be as passed in arguments
//    String/Number/etc. - all params will be converted to correct type
//    [String, Number, ...] - params will convert according that specified for each one
//
// If a normal function is used, it will not be transformed.
//
// The run & runRaw functions both return Promises, so that you may utilise any return value from the Lua call,
// this is much the same to passing a callback to engineLua in the Angular code
//
// If you want an alternative function to be used if the bngAPI is unavailable, you can build such using 'withMocked'.
// Simply pass your normal function/signature as the first parameter, and the mock function as the second one. The
// mock function will always be treated as a mock function - regardless of whether it is an arrow function. It should
// accept the same paramaeters as the non-mock version. If a mock function does not return a promise, its return value
// will automatically be wrapped in one
//

export default {
  // -- Dev -----------------------------------------------------------------------
  dev: {
    getMockedData: key => String,
  },

  // -- Real ----------------------------------------------------------------------

  // TODO - incomplete, add as neeeded

  getVehicleColor: () => {},
  getVehicleColorPalette: index => Integer,
  resetGamePlay: playerID => Integer,

  simTimeAuthority: {
    togglePause: () => {},
  },

  commands: {
    toggleCamera: () => {},
  },

  ui_audio: {
    playEventSound: (soundClass, type) => [String, String],
  },

  career_career: {
    closeAllMenus: () => {},
    isActive: () => {},
  },

  career_modules_uiUtils: {
    getCareerStatusData: withMocked(
      () => {},
      () => getMockedData("career.status")
    ),
  },

  career_modules_fuel: {
    requestRefuelingTransactionData: () => {},
    sendUpdateDataToUI: () => {},
    uiButtonStartFueling: energyType => String,
    uiButtonStopFueling: energyType => String,
    changeFlowRate: flowRate => Number,
    payPrice: () => {},
    uiCancelTransaction: () => {},
  },

  career_modules_logbook: {
    getLogbook: withMocked(
      () => {},
      () => getMockedData("logbook.sample")
    ),
    setLogbookEntryRead: (id, state) => [String, Boolean],
  },

  career_modules_partShopping: {
    cancelShopping: () => {},
    applyShopping: () => {},
    installPartByPartShopId: id => Number,
    removePartBySlot: slot => String,
    sendShoppingDataToUI: () => {},
  },

  career_modules_vehicleShopping: {
    showVehicle: id => Number,
    navigateToPos: pos => Object,
    openShop: (seller, computerId) => [Any, Any], // i think this needs to be Any instead of String to also allow nil
    cancelShopping: () => {},
    quickTravelToVehicle: id => Number,
    openPurchaseMenu: (purchaseType, shopId) => [String, Number],
    openInventoryMenuForTradeIn: () => {},
    buyFromPurchaseMenu: (purchaseType, makeDelivery) => [String, Any],
    cancelPurchase: purchaseType => String,
    getShoppingData: () => {},
    sendPurchaseDataToUi: () => {},
    removeTradeInVehicle: () => {},
    onShoppingMenuClosed: () => {},
  },

  career_modules_inspectVehicle: {
    startTestDrive: () => {},
    endTestDrive: () => {},
    sendUIData: () => {},
    onInspectScreenChanged: enabled => Boolean,
    repairVehicle: () => {},
    leaveInspectVehicle: needsRepair => Boolean,
  },

  career_modules_inventory: {
    sellVehicle: id => Number,
    sellVehicleFromInventory: id => Number,
    enterVehicle: id => Number,
    openMenuFromComputer: computerId => String,
    closeMenu: () => {},
    chooseVehicleFromMenu: (vehId, buttonId, repairPrevVeh) => [Number, Number, Boolean],
    setFavoriteVehicle: id => Number,
    sendDataToUi: () => {},
    removeVehicleObject: id => Number,
  },

  career_modules_partInventory: {
    openMenu: computerId => Any,
    closeMenu: () => {},
    sendUIData: () => {},
    movePart: (location, partId) => [Number, Number],
    sellPart: id => Number,
    partInventoryClosed: () => {},
  },

  career_modules_insurance: {
    getProposablePoliciesForVehInv: invVehId => Number,
    changeVehPolicy: (invVehId, policyId) => [Number, Number],
    payBonusReset: policyId => Number,
    purchasePolicy: id => Number,
    calculatePremiumDetails: (policyId, tempPerks) => [Number, Any],
    changePolicyPerks: (policyId, changedPerks) => [Number, Object],
    startRepairInGarage: (vehicleInfo, repairOptionData) => [Object, Object],
    openRepairMenu: (vehicleInfo, originComputerId) => [Object, Any],
    getRepairData: () => {},
    closeMenu: () => {},
    sendUIData: () => {},
  },

  career_modules_tuning: {
    apply: tuningValues => Object,
    start: (vehId, origin) => [Any, Any],
    initVehicle: vehId => Any,
    onMenuClosed: () => {},
    getTuningData: () => {},
    close: () => {},
  },

  career_modules_painting: {
    apply: () => {},
    start: (vehId, origin) => [Any, Any],
    getPaintData: () => {},
    close: () => {},
    setPaints: paint => Object,
    getFactoryPaint: () => {},
  },

  career_modules_questManager: {
    setQuestAsNotNew: id => String,
    claimRewardsById: id => String,
  },

  career_modules_computer: {
    onMenuClosed: () => {},
    getComputerUIData: () => {},
    computerButtonCallback: (buttonId, inventoryId) => [String, Any],
  },

  career_modules_delivery_deliveryManager: {
    requestCargoDataForUi: (facilityId, parkingSpotPath, updateMaxTimeStamp) => [Any, Any, Any],
    moveCargoFromUi: (cargoId, targetLocation) => [Number, Object],
    commitDeliveryConfiguration: () => {},
    cancelDeliveryConfiguration: () => {},
    exitDeliveryMode: () => {},
    exitCargoOverviewScreen: () => {},
    showCargoRoutePreview: cargoId => Any,
    setCargoRoute: (cargoId, origin) => [Number, Boolean],
    showCargoContainerHelpPopup: () => {},
  },

  core_gamestate: {
    requestGameState: () => {},
  },

  core_gameContext: {
    getGameContext: withMocked(
      params => {},
      params => getMockedData("activityStart.gameContextData")
    ),
  },

  gameplay_statistic: {
    sendGUIState: () => {},
  },

  extensions: {
    load: extensionName => String,
    unload: extensionName => String,
    hook: hook => String,

    core_input_actionFilter: {
      addAction: (filter, actionName, filtered) => [Number, String, Boolean],
      setGroup: (name, actioNames) => [String, Any],
    },

    core_input_bindings: {
      setMenuActionMapEnabled: state => Boolean,
      notifyUI: reason => String,
      saveBindingsToDisk: deviceContents => Object,
    },

    core_vehicle_partmgmt: {
      getConfigList: () => {},
      highlightParts: parts => Object,
      loadLocal: filename => String,
      openConfigFolderInExplorer: () => {},
      removeLocal: configName => String,
      savedefault: () => {},
      saveLocal: filename => String,
      sendDataToUI: () => {},
      selectPart: (part, subparts) => [String, Boolean],
      selectParts: parts => Object,
      selectReset: () => {},
      setConfigVars: vars => Object,
      setPartsConfig: config => Object,
      showHighlightedParts: () => {},
      setDynamicTextureMaterials: () => {},
    },

    gameplay_garageMode: {
      setCamera: view => String,
      setLighting: lights => Array,
    },

    ui_dynamicDecals: {
      initialize: () => {},
      exit: () => {},
      requestUpdatedData: () => {},
      setupEditor: () => {},
      loadSaveFile: path => String,
      createSaveFile: () => {},
      saveChanges: (filename) => {},
      cancelChanges: () => {},
      exportSkin: skinName => String,
      moveSelectedLayer: order => Number,
      setDecalTexture: filePath => String,
      setDecalColor: colorData => Object,
      setDecalScale: decalData => Object,
      setDecalRotation: decalRotation => Number,
      setDecalSkew: decalSkew => Object,
      setDecalApplyMultiple: applyMultiple => Boolean,
      setDecalResetOnApply: resetOnApply => Boolean,
      toggleApplyingDecal: enable => Boolean,
      toggleActionMap: enable => Boolean,
      toggleDecalVisibility: enable => Boolean,
      redo: () => {},
      undo: () => {},
      createLayer: layerData => Object,
      createFillLayer: fillLayerData => Object,
      createGroupLayer: layerData => Object,
      updateLayer: layerData => Object,
      deleteSelectedLayer: () => {},
      selectLayer: layerUid => String,
      toggleLayerHighlight: uid => String,
      toggleLayerVisibility: uid => String,
    },

    ui_gameBlur: {
      replaceGroup: (groupName, list) => [String, Object],
    },

    editor_api_dynamicDecals: {
      setup: () => {},
      getLayerStack: () => {},
      setLayerNameBuildString: buildString => String,
      onUpdate_: () => {},

      pushDynamicDecalsActionMap: () => {},
      popDynamicDecalsActionMap: () => {},

      addBrushStrokeLayer: () => {},
      highlightLayer: layerTable => {},
      highlightLayerByUid: layerUidString => {},
      disableDecalHighlighting: () => {},
      getHighlightedLayer: () => {},
      setLayerVisibility: (layerUidString, visibilityBool) => [String, Boolean],
      toggleLayerVisibility: layerUidString => String,
      changeDecalSize: (increaseBool, stepNumber) => {},
      changeDecalRotation: (clockwiseBool, stepRadianNumber) => {},
    },
  },

  ActionMap: {
    enableInputCommands: state => Boolean,
  },

  gameplay_markerInteraction: {
    startMissionById: (missionId, userSettings) => [Any, Object],
    closeViewDetailPrompt: force => Boolean,
  },

  ui_missionInfo: {
    performActivityAction: id => {},
    closeDialogue: () => {},
  },

  scenetree: {
    "maincef:setMaxFPSLimit": fps => Integer, // This name is problematic and need to use [] syntax to call - intellisense should pick it up
  },

  settings: {
    notifyUI: () => {},
    setState: state => Object,
    getValue: value => String,
  },

  core_camera: {
    setFOV: (playerId, fovDeg) => [Integer, Number],
  },

  core_vehicles: {
    cloneCurrent: () => {},
    getModel: model => String,
    getCurrentVehicleDetails: withMocked(
      () => {},
      () => getMockedData("vehicle.details")
    ),
    getVehicleLicenseText: id => Number, // TODO - not sure if this will be used - may need to send some Lua code directly - consider how to do this
    loadDefault: () => {},
    removeAll: () => {},
    removeAllExceptCurrent: () => {},
    removeCurrent: () => {},
    requestList: () => {},
    requestListEnd: () => {},
    setPlateText: plateText => String,
    setMeshVisibility: state => Boolean,
    spawnDefault: () => {},
    spawnNewVehicle: (model, args) => [String, Object],
    replaceVehicle: (model, args) => [String, Object],
  },

  core_vehicle_manager: {
    reloadAllVehicles: () => {},
  },

  core_vehicle_colors: {
    setVehicleColor: (index, value) => [Integer, Object],
  },

  util_CreateThumbnails: {
    startWork: configName => String,
  },

  util_groundModelDebug: {
    openWindow: () => {},
  },

  scenario_scenariosLoader: {
    getList: () => {},
    start: scenario => Object,
  },

  WinInput: {
    setForwardRawEvents: state => Boolean,
  },

  Engine: {
    Audio: {
      playOnce: (channel, sound) => [String, String],
    },
  },

  // -- Testing -------------------------------------------------------------------

  // noParams: () => {},
  // oneParam: firstParam => {},
  // manyParams: (first, second, third) => {},
  // singleStringParam: myString => String,
  // multiStringParams: (str1, str2) => [String, String],
  // mixedParamTypes: (int1, str1, int2) => [Number, String, Number],

  // noTransform: function(str) { run('myFunction', [str]) },

  // namespace: {
  //  noParams: () => {},
  //  oneParam: firstParam => {},
  //  manyParams: (first, second, third) => {},
  //  singleStringParam: myString => String,
  //  multiStringParams: (str1, str2) => [String, String],
  //  mixedParamTypes: (int1, str1, int2) => [Number, String, Number],

  //  inner: {
  //    test1: () => {},
  //    test2: param => {},
  //    test3: strParam => String,
  //    test4: (multi1, multi2) => [String, Boolean]
  //  }
  // }
}
