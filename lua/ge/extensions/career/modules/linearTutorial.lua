-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
local im = ui_imgui

M.dependencies = {'career_career'}
M.tutorialEnabled = -1
M.bounceBigmapIcons = false
local tutorialsFolder ='/gameplay/tutorials/'
local saveFile = "/career/tutorialData.json"
local saveData
local globalSaveFile = "/settings/careerIntroPopups.json"
local globalSaveData

M.clearGlobalSaveData = function() globalSaveData = {} jsonWriteFile(globalSaveFile, globalSaveData, false) end
M.debugMenu = function()

  if im.Button("Dump Save Data") then
    dump(saveData)
  end
  im.Text("Linear Step: " .. dumps(saveData.linearStep))

  im.Text("Flags")
  if im.BeginCombo("Flags","...") then
    for _, flag in ipairs(tableKeysSorted(saveData.flags)) do
      if im.Checkbox(flag, im.BoolPtr(saveData.flags[flag] or false)) then
        M.setTutorialFlag(flag, not (saveData.flags[flag] or false))
      end
    end
    im.EndCombo()
  end
  if im.Button("Show All Splashscreens and Logbok Entries") then

  end
  im.TextWrapped("Playing these out of order or individually might break!")
  im.TextWrapped("Action Restrictions will probably break too!")
  if im.Button("Set UI Layout to 'Career Freeroam'") then
    core_gamestate.setGameState("career","career", nil)
  end
  if im.Button("Tutorial 01 Movement Basics") then
    saveData.flags = {}
    saveData.linearStep = 1
    core_flowgraphManager.loadManager("gameplay/tutorials/01-movementBasics.flow.json"):setRunning(true)
  end
  if im.Button("Tutorial 02 Car Basics") then
    saveData.flags = {}
    saveData.linearStep = 2
    core_flowgraphManager.loadManager("gameplay/tutorials/02-carBasics.flow.json"):setRunning(true)
  end
  if im.Button("Tutorial 03 Bigmap Basics") then
    saveData.flags = {towToRoadEnabled=true}
    saveData.linearStep = 3
    core_flowgraphManager.loadManager("gameplay/tutorials/03-bigmapBasics.flow.json"):setRunning(true)
  end
  if im.Button("Tutorial 04 Refueling and Mission") then
    saveData.flags = {towToRoadEnabled=true}
    saveData.linearStep = 4
    core_flowgraphManager.loadManager("gameplay/tutorials/04-refueling.flow.json"):setRunning(true)
  end
  if im.Button("Tutorial 05 Dealership") then
    saveData.flags = {towToRoadEnabled=true,arrivedAtGarage=true,arrivedAtFuelstation=true,completedTutorialMission=true}
    saveData.linearStep = 5
    core_flowgraphManager.loadManager("gameplay/tutorials/05-dealership.flow.json"):setRunning(true)
  end
  if im.Button("Tutorial 06 Garage") then
    saveData.flags = {towToRoadEnabled=true,arrivedAtGarage=true,arrivedAtFuelstation=true,completedTutorialMission=true,purchasedFirstCar=true}
    saveData.linearStep = 6
    core_flowgraphManager.loadManager("gameplay/tutorials/06-garage.flow.json"):setRunning(true)
  end
  if im.Button("Tutorial 07 Garage") then
    saveData.flags = {towToRoadEnabled=true,arrivedAtGarage=true,arrivedAtFuelstation=true,completedTutorialMission=true,purchasedFirstCar=true, partShoppingComplete=true, tuningComplete=true,modifiedFirstCar=true}
    saveData.linearStep = 7
    core_flowgraphManager.loadManager("gameplay/tutorials/07-finishing.flow.json"):setRunning(true)
  end
end

local function onExtensionLoaded()
  if not career_career.isActive() then return false end
  -- load from saveslot
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  saveData = (savePath and jsonReadFile(savePath .. saveFile)) or {}
  if not next(saveData) then
    saveData = {
      linearStep = career_career.tutorialEnabled and 1 or -1,
      flags = {
        towToRoadEnabled = false,
        towToGarageEnabled = false,
        customTowHookEnabled = false,
        completedTutorialMission = false,
        arrivedAtFuelstation = false,
        arrivedAtGarage = false,
        purchasedFirstCar = false,
        partShoppingComplete = false,
        tuningComplete = false,
        modifiedFirstCar = false,
        spawnPointDiscoveryEnabled = false,
        earnedFirstStar = false,
      }
    }
    if career_career.vehSelectEnabled then

    end
  end
  if saveData.linearStep == -1 then
    for key, _ in pairs(saveData.flags) do
      saveData.flags[key] = true
    end
  end
  globalSaveData = jsonReadFile(globalSaveFile) or {}
end



M.endTutorial = function()
  saveData.linearStep = -1
  career_career.setAutosaveEnabled(true)
  career_saveSystem.saveCurrent()
  gameplay_rawPois.clear()
  core_recoveryPrompt.setDefaultsForCareer()
  career_modules_playerDriving.resetPlayerState()
  --core_gamestate.setGameState('freeroam', 'freeroam', 'freeroam') --  going into freeroam for now, until we unify gamestate across career to be "career"
  core_gamestate.setGameState("career","career", nil)
end

M.getCustomTowHookLabel = function() return "Custom Tow WIP" end

M.onClientStartMission = function()
  M.beginLinearStep(saveData.linearStep)
end
M.onCareerModulesActivated = function(alreadyInLevel)
  if alreadyInLevel then
    M.beginLinearStep(saveData.linearStep)
  end
end



local function beginLinearStep(step)
  if step == -1 then return end
  log("I","","Loading Linear Step " .. step)
  saveData.linearStep = step
  -- if tutorialData[step] then
  --   local fgPath = tutorialsFolder .. tutorialData[step].fgPath
  --   local mgr = core_flowgraphManager.loadManager(fgPath)
  --   mgr.transient = true
  --   mgr.name = "Step " .. step .. " Linear Tutorial"
  --   tutorialData[step].mgr = mgr
  --   mgr:setRunning(true)
  -- end
end

local function completeLinearStep(nextStep)
  if saveData.linearStep == -1 then return end
  nextStep = nextStep or (saveData.linearStep+1)
  saveData.linearStep = nextStep
  extensions.hook("onLinearTutorialStepCompleted", step)
  beginLinearStep(nextStep)
end
local function getLinearStep()
  return saveData.linearStep
end
local function isLinearTutorialActive()
  return saveData.linearStep > 0
end
local function getTutorialFlag(key)
  return saveData.flags[key]
end
local function setTutorialFlag(key, value)
  saveData.flags[key] = value
end

-- dump(career_modules_linearTutorial.getTutorialData())
M.getTutorialData = function() return saveData end

-- this should only be loaded when the career is active
local function onSaveCurrentSaveSlot(currentSavePath)
  jsonWriteFile(currentSavePath .. saveFile, saveData, true)
end


-- TODO: make sure this doesnt break in the future :D
M.setTrafficForTutorial = function()
  gameplay_parking.scatterParkedCars()
  gameplay_parking.setActiveAmount(0)
  gameplay_traffic.scatterTraffic()
  gameplay_traffic.setActiveAmount(career_modules_playerDriving.getPlayerData().trafficActive)

  for k, v in pairs(gameplay_traffic.getTrafficData()) do
    if v.role.name == "police" then
      local veh = be:getObjectByID(k)
      if veh then
        veh:setActive(0)
      end
      v.activeProbability = 0
    end
  end
end

M.setTrafficAfterTutorial = function()
  gameplay_parking.scatterParkedCars()
  gameplay_traffic.scatterTraffic()

  for k, v in pairs(gameplay_traffic.getTrafficData()) do
    if v.role.name == "police" then
      v.activeProbability = 0.15
    end
  end
end



-- creates a new intro popup from the content of the folder in ui/modules/introPopup/tutorial/ID/content.html
M.introPopup = function(id, force)
  if not force then
    if M.isLinearTutorialActive() then
      if M.getTutorialFlag(id) then return end
    else
      if globalSaveData[id] then return end
    end
  end

  M.setTutorialFlag(id, true)

  if not globalSaveData[id] then
    -- save global data manually
    globalSaveData[id] = true
    jsonWriteFile(globalSaveFile, globalSaveData, false)
  end

  local content = readFile("ui/modules/introPopup/tutorial/"..id.."/content.html"):gsub("\r\n","")
  local entry = {
    type = "info",
    content = content,
    flavour = "onlyOk",
    isPopup = true,
  }
  guihooks.trigger("introPopupTutorial", {entry})
end

local introPopupTable = {
  -- triggered from 01 tutorial, when starting the tutorial

  showWelcomeSplashscreen = {"welcome"},

  addWalkingModeLogbookEntry = {},  -- No parameter for this function

  addCamerasLogbookEntry = {},  -- No parameter for this function

  -- triggered from 02 tutorial, right before driving the first time
  showBeforeDrivingSplashscreen = {"driving"},

  -- shown from 02 tutorial when crashing into the wall
  showCrashRecoverSplashScreen = {"crashRecover"},

  -- shown when opening bigmap the first time (part of 03 tutorial)
  onActivateBigMapCallback = {"bigmap"},

  -- shown when opening the refueling UI the first time (part of 04 tutorial)
  onRefuelingStartTransaction = {"refueling"},

  -- showne when opening the mission UI the first time (part of 04 tutorial)
  onAvailableMissionsSentToUi = {"missions"},

  -- shown after completing the mission in the tutorial
  showPostMissionSplash = {"postMission"},

  showTraversalSplashScreen = {},  -- No parameter for this function

  showBasicTutorialComplete = {},  -- No parameter for this function

  -- shown when dealership is opened the first time, or directly after the post-mission intropopup during tutorial
  onVehicleShoppingMenuOpened = {"dealership"},

  onVehicleBought = {},  -- No parameter for this function

  -- shown when interacting with the computer the first time, or when parking in the garage during tutorial.
  onComputerMenuOpened = {"computer"},

  -- shown when opening partshopping the first time
  onPartShoppingStarted = {"partShopping"},

  -- shown when opening parts tuning the first time
  onCareerTuningStarted = {"tuning"},

  -- shown when opening the garage the first time
  garageModeStartStep = {"garage"},

  -- shown at the end of the tutorial
  showLogbookSplash = {"logbook"},
  showTutorialOverSplash = {"finishing"},

  -- shown when opening the cargo screen for the first time
  onEnterCargoOverviewScreen = {"cargoScreen"},

  -- shown when delivering cargo for the first time
  onCargoDelivered = {"cargoDelivered"},
}

-- this function is custom, because it needs to clear flags to make sure it always shows
M.showNonTutorialWelcomeSplashscreen = function()
  globalSaveData.welcomeNoTutorial = nil
  globalSaveData.logbookNoTutorial = nil
  M.introPopup("welcomeNoTutorial")
  M.introPopup("logbookNoTutorial")
end

for key, values in pairs(introPopupTable) do
  M[key] = function()
    for _, v in ipairs(values) do
      M.introPopup(v)
    end
  end
end

M.showAllSplashscreensAndLogbookEntries = function()
  for _, key in ipairs(M.allTutorialFlags) do saveData.flags[key] = false end
  globalSaveData = {}

  M.showNonTutorialWelcomeSplashscreen()
  for key, values in pairs(introPopupTable) do
    M[key]()
  end
end

M.allTutorialFlags = {insuranceFlag, bigmapFlag, refuelFlag, missionFlag, dealershipFlag, inventoryFlag, computerFlag, partShoppingFlag, tuningFlag, garageFlag}

M.onSaveCurrentSaveSlot = onSaveCurrentSaveSlot
M.onExtensionLoaded = onExtensionLoaded
M.beginLinearStep = beginLinearStep
M.completeLinearStep = completeLinearStep
M.getLinearStep = getLinearStep
M.isLinearTutorialActive = isLinearTutorialActive
M.getTutorialFlag = getTutorialFlag
M.setTutorialFlag = setTutorialFlag
return M