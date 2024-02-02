-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
local active = false

local function slowerThan(v) local veh = be:getPlayerVehicle(0) if veh then return veh:getVelocity():len() <= v end return false end

local movingSlowlyThreshold = 10 -- m/s
local stoppedThreshold = 0.5 --m/s
local conditions = {
  outOfPursuit = function(type, vehId)
    if career_modules_playerDriving and career_modules_playerDriving.playerPursuitActive() then
      return false, "Disabled because of police chase."
    end
    return true
  end,
  vehicleSlow = function(type, vehId)
    local veh = scenetree.findObjectById(vehId)
    if veh then
      if veh:getVelocity():len() >= movingSlowlyThreshold then
        return false, "Stop your vehicle."
      end
    end
    return true
  end,
  vehicleStopped = function(type, vehId)
    local veh = scenetree.findObjectById(vehId)
    if veh then
      if veh:getVelocity():len() >= stoppedThreshold then
        return false, "Stop your vehicle completely."
      end
    end
    return true
  end,
  vehicleOwned = function(type, vehId)
    if not (career_modules_inventory and career_modules_inventory.getInventoryIdFromVehicleId(vehId)) then
      return false, "You do not own this vehicle."
    end
    return true
  end,
  favouriteSet = function(type, vehId)
    local favoriteVehicleId = career_modules_inventory.getFavoriteVehicle()
    if not favoriteVehicleId then return false, "No favourite vehicle set." end
    local vehInfo = career_modules_inventory.getVehicles()[favoriteVehicleId]
    if not vehInfo then return false, "No favourite vehicle set." end
    if career_modules_inventory.getVehicleIdFromInventoryId(favoriteVehicleId) then return false, "No favourite vehicle set." end
    if vehInfo.timeToAccess or career_modules_insurance.inventoryVehNeedsRepair(favoriteVehicleId) then return false, "Favourite vehicle still in repair." end
    return true
  end,
  notTestdriving = function(type, vehId)
    if career_modules_testDrive and career_modules_testDrive.isActive() then
      return false, "Disabled during test drive."
    end
    return true
  end,
  duringTestdrive = function(type, vehId)
    if career_modules_testDrive and career_modules_testDrive.isActive() then
      return true
    end
    return false
  end,
  towToRoadAllowedByPermission = function(type, vehId)
    if not career_modules_permissions then return true end
    local status, warning = career_modules_permissions.getStatusForTag("recoveryTowToGarage")
    return status == "allowed" or "warning", warning
  end
}

local flipUpRightCost = 50
local towToRoadCost = 75
local baseTowToGarageCost = 250

local currentMenuTag
local openRecoveryPrompt

local buttonOptions = {
  -- available durign regular career gameplay
  towToRoad = {
    label = function(options, target)
      if career_modules_insurance.isRoadSideAssistanceFree(career_modules_inventory.getInventoryIdFromVehicleId(target.vehId)) then
        return "ui.career.towToRoad"
      else
        return string.format("Tow to road (%.2f)", towToRoadCost)
      end
    end,
    type = "vehicle",
    includeConditions = {},
    enableConditions = {conditions.outOfPursuit, conditions.vehicleSlow, conditions.notTestdriving, conditions.vehicleOwned},
    atFadeFunction = function(target)
      local veh = scenetree.findObjectById(target.vehId)
      if veh then
        spawn.teleportToLastRoad(veh, false)
        if not career_modules_insurance.isRoadSideAssistanceFree(career_modules_inventory.getInventoryIdFromVehicleId(target.vehId)) then
          career_modules_payment.pay({money = {amount = towToRoadCost, canBeNegative = true}}, {label = string.format("Towed your vehicle to the road")})
        end
      end
    end,
    order = 5,
    active = true,
    enabled = true,
    fadeActive = true,
    fadeStartSound = "event:>UI>Missions>Vehicle_Recover",
  },
  flipUpright = {
    label = function(options, target)
      if career_modules_insurance.isRoadSideAssistanceFree(career_modules_inventory.getInventoryIdFromVehicleId(target.vehId)) then
        return "Flip Upright"
      else
        return string.format("Flip Upright (%.2f)", flipUpRightCost)
      end
    end,
    type = "vehicle",
    includeConditions = {},
    enableConditions = {conditions.outOfPursuit, conditions.vehicleStopped, conditions.vehicleOwned, conditions.notTestdriving},
    atFadeFunction = function(target)
      local veh = scenetree.findObjectById(target.vehId)
      if veh then
        spawn.safeTeleport(veh, veh:getPosition(), quatFromDir(veh:getDirectionVector()), nil, nil, nil, nil, false )
        if not career_modules_insurance.isRoadSideAssistanceFree(career_modules_inventory.getInventoryIdFromVehicleId(target.vehId)) then
          career_modules_payment.pay({money = {amount = flipUpRightCost, canBeNegative = true}}, {label = string.format("Flipped your vehicle upright")})
        end
      end
    end,
    order = 15,
    active = true,
    enabled = true,
    fadeActive = true,
    fadeStartSound = "event:>UI>Missions>Vehicle_Flip",
  },
  towToGarage = {
    type = "vehicle",
    label = function(options, target)
      return "Tow to garage"
    end,
    includeConditions = {},
    enableConditions = {conditions.outOfPursuit, conditions.vehicleSlow, conditions.vehicleOwned, conditions.notTestdriving, conditions.towToRoadAllowedByPermission},
    atFadeFunction = function(target)
      currentMenuTag = "towing"
      openRecoveryPrompt("Select location")
    end,
    order = 25,
    active = true,
    enabled = true,
    fadeActive = false,
    keepMenuOpen = true
  },
  taxi = {
    type = "walk",
    label = function(options)
      return "Taxi"
    end,
    includeConditions = {},
    enableConditions = {conditions.outOfPursuit, conditions.notTestdriving},
    atFadeFunction = function()
      currentMenuTag = "taxi"
      openRecoveryPrompt("Where would you like to taxi to?")
    end,
    order = 5,
    active = false,
    enabled = true,
    fadeActive = false,
    keepMenuOpen = true
  },
  getFavoriteVehicle = {
    type = "walk",
    label = "Retrieve favorite vehicle",
    includeConditions = {},
    enableConditions = {conditions.outOfPursuit, conditions.favouriteSet, conditions.notTestdriving},
    atFadeFunction = function() career_modules_playerDriving.retrieveFavoriteVehicle() end,

    order = 11,
    active = false,
    enabled = true,
    fadeActive = true
  },
  -- only during mission
  flipMission = {
    type = "vehicle",
    label = "Flip Upright",
    --includeCondition = function() return gameplay_missions_missionManager.getForegroundMissionId() ~= nil end,
    includeConditions = {},
    enableConditions = {conditions.vehicleStopped},
    atFadeFunction = nop,
    order = 5,
    active = false,
    enabled = true,
    fadeActive = true,
    fadeStartSound = "event:>UI>Missions>Vehicle_Flip",
  },
  recoverMission = {
    type = "vehicle",
    label = "Recover",
    includeConditions = {},
    enableConditions = {conditions.vehicleSlow},
    atFadeFunction = nop,
    order = 7,
    active = false,
    enabled = true,
    fadeActive = true,
    fadeStartSound = "event:>UI>Missions>Vehicle_Recover",
  },
  submitMission = {
    type = "none",
    label = "Submit Score",
    includeConditions = {},
    enableConditions = {},
    atFadeFunction = nop,
    order = 10,
    active = false,
    enabled = true,
    fadeActive = false
  },
  restartMission = {
    type = "none",
    label = "Restart Mission",
    includeConditions = {},
    enableConditions = {},
    atFadeFunction = nop,
    order = 15,
    active = false,
    enabled = true,
    fadeActive = false
  },
  -- only during tutorial
  repairHere = {
    type = "vehicle",
    label = "Repair",
    --veh, pos, rot, checkOnlyStatics_, visibilityPoint_, removeTraffic_, centeredPosition, resetVehicle
    atFadeFunction = function()
      local veh = be:getPlayerVehicle(0)
      if veh then
        if career_career.isActive() then
          if career_modules_inventory.getCurrentVehicle() then
            career_modules_inventory.updatePartConditions(nil, career_modules_inventory.getCurrentVehicle(), function() career_modules_insurance.startRepair(nil) end)
          end
        else
          spawn.safeTeleport(veh, veh:getPosition(), quatFromDir(veh:getDirectionVector()), nil, nil, nil, nil, true )
        end
      end
    end,
    includeConditions = {},
    enableConditions = {conditions.vehicleSlow},
    order = 10,
    active = true,
    enabled = true,
    fadeActive = true,
    fadeStartSound = "event:>UI>Missions>Vehicle_Recover",
  },
  -- testing for non-career freeroam
  resetVehicle = {
    type = "vehicle",
    label = "Reset Vehicle",
    includeConditions = {},
    enableConditions = {},
    atFadeFunction = function() be:resetVehicle(0) end,
    order = 20,
    active = false,
    enabled = true,
    fadeActive = true
  },
  -- during testdrive
  stopTestdrive = {
    type = "none",
    label = "Stop test drive",
    --veh, pos, rot, checkOnlyStatics_, visibilityPoint_, removeTraffic_, centeredPosition, resetVehicle
    atFadeFunction = function()
      career_modules_testDrive.stop(true)
    end,
    includeConditions = {conditions.duringTestdrive},
    enableConditions = {},
    order = 10,
    active = true,
    enabled = true,
    fadeActive = true,
  },
}

local function addTowingButtons()
  if not getCurrentLevelIdentifier() then return end
  local garages = freeroam_facilities.getFacilitiesByType("garage")

  -- add garage tow buttons
  for _, garage in ipairs(garages) do
    buttonOptions[string.format("towTo%s", garage.id)] =
    {
      type = "vehicle",
      label = function(options, target)
        if career_modules_insurance.isRoadSideAssistanceFree(career_modules_inventory.getInventoryIdFromVehicleId(target.vehId)) then
          return string.format("%s", translateLanguage(garage.name, garage.name, true))
        else
          local price = career_modules_quickTravel.getPriceForQuickTravelToGarage(garage)
          if price > 0 then price = price + baseTowToGarageCost end
          return string.format("%s (%.2f)", translateLanguage(garage.name, garage.name, true), price)
        end
      end,
      includeConditions = {},
      menuTag = "towing",
      enableConditions = {conditions.outOfPursuit, conditions.vehicleSlow, conditions.vehicleOwned, conditions.notTestdriving, conditions.towToRoadAllowedByPermission},
      atFadeFunction = function(target)
        career_modules_playerDriving.teleportToGarage(garage.id, scenetree.findObjectById(target.vehId), false)

        if not career_modules_insurance.isRoadSideAssistanceFree(career_modules_inventory.getInventoryIdFromVehicleId(target.vehId)) then
          local price = career_modules_quickTravel.getPriceForQuickTravelToGarage(garage)
          if price > 0 then price = price + baseTowToGarageCost end
          career_modules_payment.pay({money = {amount = price, canBeNegative = true}}, {label = string.format("Towed your vehicle to your garage")})
        end
      end,
      message = "ui.career.towed",
      order = 25,
      active = true,
      enabled = true,
      fadeActive = true,
      fadeStartSound = "event:>UI>Missions>Vehicle_Recover"
    }
  end
end

local function addTaxiButtons()
  if not getCurrentLevelIdentifier() then return end
  local garages = freeroam_facilities.getFacilitiesByType("garage")

  -- add garage tow buttons
  for _, garage in ipairs(garages) do
    buttonOptions[string.format("taxiTo%s", garage.id)] =
    {
      type = "walk",
      label = function(options)
        local price = career_modules_quickTravel.getPriceForQuickTravelToGarage(garage)
        return string.format("%s (%.2f)", translateLanguage(garage.name, garage.name, true), price)
      end,
      includeConditions = {},
      menuTag = "taxi",
      enableConditions = {},
      atFadeFunction = function()
        career_modules_quickTravel.quickTravelToGarage(garage)
      end,
      order = 25,
      active = true,
      enabled = true,
      fadeActive = true,
      fadeStartSound = "event:>UI>Missions>Vehicle_Recover"
    }
  end

  buttonOptions.taxiToVehicle =
    {
      type = "walk",
      label = function(options)
        local lastVehicleId = career_modules_inventory.getLastVehicle()
        local vehObjId = career_modules_inventory.getVehicleIdFromInventoryId(lastVehicleId)
        if vehObjId then
          local vehObj = be:getObjectByID(vehObjId)
          local pos = vehObj:getPosition()
          local price = career_modules_quickTravel.getPriceForQuickTravel(pos)
          return string.format("Your vehicle (%.2f)", price)
        end
        return "Your vehicle"
      end,
      includeConditions = {},
      menuTag = "taxi",
      enableConditions = {},
      atFadeFunction = function()
        local lastVehicleId = career_modules_inventory.getLastVehicle()
        local vehObjId = career_modules_inventory.getVehicleIdFromInventoryId(lastVehicleId)
        if vehObjId then
          local vehObj = be:getObjectByID(vehObjId)
          local pos = vehObj:getPosition()
          career_modules_quickTravel.quickTravelToPos(pos, true, "Took a taxi to your vehicle")
        end
      end,
      order = 25,
      active = true,
      enabled = true,
      fadeActive = true,
      fadeStartSound = "event:>UI>Missions>Vehicle_Recover"
    }
end

local function onCareerModulesActivated(alreadyInLevel)
  if alreadyInLevel then
    addTowingButtons()
    addTaxiButtons()
  end
end

local function onClientStartMission(levelPath)
  if career_career.isActive() then
    addTowingButtons()
    addTaxiButtons()
  end
end

local function isActive() return active end
local function setActive(a) active = a end
local function setDefaultsForFreeroam()
  active = false
  for _, o in pairs(buttonOptions) do o.active = false end
end

local function setDefaultsForCareer()
  active = true
  for _, o in pairs(buttonOptions) do o.active = false end
  buttonOptions.towToRoad.active = true
  buttonOptions.towToGarage.active = true
  buttonOptions.flipUpright.active = true
  buttonOptions.taxi.active = true
  buttonOptions.getFavoriteVehicle.active = true
  buttonOptions.stopTestdrive.active = true
  addTowingButtons()
  addTaxiButtons()
end

local function setDefaultsForTutorial()
  active = true
  for _, o in pairs(buttonOptions) do o.active = false end
  buttonOptions.towToRoad.active = true
  buttonOptions.repairHere.active = true
  buttonOptions.flipUpright.active = true
  buttonOptions.getFavoriteVehicle.active = false
end

local function setEverythingActive()
  active = true
  for _, o in pairs(buttonOptions) do o.active = true end
end

local function deactivateAllButtons() for _, o in pairs(buttonOptions) do o.active = false end end

local function setButtonActiveById(id, a)
  if not buttonOptions[id] then log("W","","Tried to set active for button, but the id couldnt be found: " .. dumps(id)) return end
  buttonOptions[id].active = a
end

local function getButtonActiveById(id)
  if not buttonOptions[id] then log("W","","Tried to get enable for button, but the id couldnt be found: " .. dumps(id)) return end
  return buttonOptions[id].active
end

local function setButtonEnabledById(id, e)
  --dump("enabling " .. dumps(id) .. " -> " .. dumps(e))
  --print(debug.tracesimple())
  if not buttonOptions[id] then log("W","","Tried to set enable for button, but the id couldnt be found: " .. dumps(id)) return end
  buttonOptions[id].enabled = e
  if e then
    buttonOptions[id].active = e
  end
end

local function highestOrderPlusOne()
  local highest = 0
  for _, o in pairs(buttonOptions) do
    highest = math.max(highest, o.order)
  end
  return highest + 1
end

local function addButton(id, label, atFadeFunction, order, message, active, enabled, fadeActive)
  if not id then log("E","","Tried creating button without ID!" ) return end
  if buttonOptions[id] and not buttonOptions[id].customButton then log("E","Tried to add a button, but it already exists and it's not a custom button, so it's not allowed! " .. dumps(id)) return end
  -- fill some defaults for the button if it doesnt have them
  if active == nil then active = true end
  if fadeActive == nil then fadeActive = true end
  local btn = {
    label = label or "No Label!",
    atFadeFunction = atFadeFunction or function() log("E","","No Function set for " .. dumps(id) ) end,
    order = order or highestOrderPlusOne(),
    message = message,
    active = active,
    enabled = enabled,
    customButton = true,
    fadeActive = fadeActive,
  }
  if buttonOptions[id] then
    log("E","","Button for Id already exists and will be overwritten: " .. dumps(id) .. ": " .. dumps(buttonOptions[btn.id]))
  end
  buttonOptions[id] = btn
  -- check if there's any collision for the orders
  local orders = {}
  for _, o in pairs(buttonOptions) do
    if orders[o.order] then log("E","Order Collision for buttons: " .. orders[o.order] .. "/"..o.id) end
    orders[o.order] = o.id
  end
end

local function removeButtonById(id)
  if not buttonOptions[id] then log("W","","Tried removing button, but it doesnt exist: " .. dumps(id)) return end
  if not buttonOptions[id].customButton then log("E","Tried to remove a button, but it's not a custom button, so it's not allowed! " .. dumps(id)) return end
  buttonOptions[id] = nil
end

M.isActive = isActive
M.setActive = setActive
M.setDefaultsForFreeroam = setDefaultsForFreeroam
M.setDefaultsForCareer = setDefaultsForCareer
M.setDefaultsForTutorial = setDefaultsForTutorial
M.setEverythingActive = setEverythingActive
M.deactivateAllButtons = deactivateAllButtons
M.addButton = addButton
M.removeButtonById = removeButtonById
M.getButtonActiveById = getButtonActiveById
M.setButtonActiveById = setButtonActiveById
M.setButtonEnabledById = setButtonEnabledById


-- counter utility

local function setButtonLimits(limits)
  for _, o in pairs(buttonOptions) do o.limit = nil end
  for id, limit in pairs(limits or {}) do
    if limit == -1 then
      buttonOptions[id].limit = nil
    else
      buttonOptions[id].limit = limit
    end
  end
end

local function resetButtonLimitCounters(onlyFor)
  for id, o in pairs(buttonOptions) do
    if not onlyFor or onlyFor[id] then
      o.count = 0
    end
  end
end

local function getButtonLimitsAndCounts()
  local ret = {}
  for id, o in pairs(buttonOptions) do
    ret[id] = {limit = o.limit, count = o.count}
  end
  return ret
end

M.setButtonLimits = setButtonLimits
M.resetButtonLimitCounters = resetButtonLimitCounters
M.getButtonLimitsAndCounts = getButtonLimitsAndCounts

-- serialization
local function serializeState()
  local ret = {
    active = active,
    buttons = {}
  }
  for id, btn in pairs(buttonOptions) do
    ret.buttons[id] = btn.active or false
  end
  return ret
end
local function deserializeState(data)
  active = data.active
  for id, btnActive in pairs(data.buttons or {}) do
    setButtonActiveById(id, btnActive)
  end
end
M.serializeState = serializeState
M.deserializeState = deserializeState

-- this is the actual recovery process. create a snapshot before the fadeing starts
local currentRecoveryOptionId = nil
local currentRecoveryOptionTarget = nil
local fadeDuration = 0.3
local function buttonPressed(buttonId, target)
  if career_career and career_career.isActive() and not gameplay_walk.isWalking() then
    core_vehicleBridge.executeAction(be:getPlayerVehicle(0), 'createPartConditionSnapshot', "beforeTeleport")
    core_vehicleBridge.executeAction(be:getPlayerVehicle(0), 'setPartConditionResetSnapshotKey', "beforeTeleport")
  end

  currentRecoveryOptionId = buttonId
  currentRecoveryOptionTarget = target
  if buttonOptions[buttonId].fadeActive then
    core_vehicleBridge.requestValue(be:getPlayerVehicle(0), function()
      if buttonOptions[buttonId].fadeStartSound then
        Engine.Audio.playOnce('AudioGui',buttonOptions[buttonId].fadeStartSound)
      end
      ui_fadeScreen.start(fadeDuration)
    end , 'ping')
  else
    M.handleCurrRecoveryOption()
  end
end

local function cancelPressed()
  currentRecoveryOptionId = nil
  simTimeAuthority.pause(false)
end

local function handleCurrRecoveryOption()
  if not currentRecoveryOptionId then return end
  local option = buttonOptions[currentRecoveryOptionId]
  extensions.hook("onRecoveryPromptButtonPressed", currentRecoveryOptionId)
  if option then
    option.atFadeFunction(currentRecoveryOptionTarget)
    if option.count then
      option.count = option.count + 1
    end
    if option.message then
      ui_message(option.message, 5, "recoveryPromptMessage")
    end
  else
    log("E","","Couldnt use recovery option. none was found for ID " .. currentRecoveryOptionId)
  end

  if option.fadeActive then
    ui_fadeScreen.stop(fadeDuration)
  end

  currentRecoveryOptionId = nil
  currentRecoveryOptionTarget = nil
  if not option.keepMenuOpen then
    simTimeAuthority.pause(false)
  end
  gameplay_markerInteraction.setForceReevaluateOpenPrompt()
    --extensions.hook("onCareerCustomTowHook")
end

local function onScreenFadeState(state)
  -- only proceed if we actually have a recovery request.
  handleCurrRecoveryOption()
end

local function getRecoveryTargets()
  if not gameplay_walk.isWalking() then
    return {{type = "vehicle", vehId = be:getPlayerVehicleID(0)}}
  end
  local vehInFront = gameplay_walk.getVehicleInFront()
  if vehInFront then
    return {
      {type = "vehicle", vehId = vehInFront:getId()},
      {type = "walk"}
    }
  else
    return {{type = "walk"}}
  end
end

local function sortByOrder(a,b) return a.order < b.order end
local function getButtonsForTarget(target)
  local buttons = {}
  for id, option in pairs(buttonOptions) do
    if (option.type or "none") == target.type and option.active then
      local add = true
      for key, cond in ipairs(option.includeConditions or {}) do
        add = cond(target.type, target.vehId)
      end
      add = add and (option.menuTag == currentMenuTag)
      if add then
        local enabled = option.enabled
        local reason = nil
        for key, cond in ipairs(option.enableConditions or {}) do
          local en, rs = cond(target.type, target.vehId)
          enabled = en and enabled
          reason = reason or rs
        end
        local label = type(option.label) == "function" and option.label(option, target) or option.label
        if option.limit then
          label = {txt = 'missions.missions.recoveryPrompt.remainingUses', context = {label = label, count = option.limit - option.count}}
          enabled = enabled and option.count < option.limit
        end
        local disableReason = reason or (not enabled and "Disabled")
        local btn = {
          label = label,
          luaCallback = "core_recoveryPrompt.buttonPressed('"..id.."',"..serialize(target)..")",
          order = option.order,
          enabled = enabled,
          disableReason = disableReason,
          soundClass = (option.fadeStartSound and "bng_click_empty" or nil)
        }
        table.insert(buttons, btn)
      end
    end
  end
  table.sort(buttons, sortByOrder)
  return buttons
end

openRecoveryPrompt = function(title)
  if not active then return end
  local buttons = {}
  local targets = getRecoveryTargets()
  for i, target in ipairs(targets) do
    for _, btn in ipairs(getButtonsForTarget(target)) do
      table.insert(buttons, btn)
    end
  end
  for _, btn in ipairs(getButtonsForTarget({type="none"})) do
    table.insert(buttons, btn)
  end
  if not next(buttons) then
    log("W","","Tried to open recovery prompt, but no buttons were active. Not opening prompt.")
    return
  end
  if currentMenuTag then
    table.insert(buttons, { label = "Back",  isCancel = true, luaCallback = "core_recoveryPrompt.onResetGameplay()"})
  else
    table.insert(buttons, { label = "Cancel",  isCancel = true, luaCallback = "core_recoveryPrompt.cancelPressed()"})
  end
  if next(buttons) then
    buttons[1].default = true
  end

  local data = {text = title or "Recovery Menu", buttons = buttons, class = "recoveryPrompt"}
  guihooks.trigger('showConfirmationDialog', data)
  simTimeAuthority.pause(true)
  gameplay_markerInteraction.closeViewDetailPrompt(true)
end

-- this creates the list of buttons to be sent to the UI.
local function onResetGameplay(playerID)
  currentMenuTag = nil
  openRecoveryPrompt()
end

M.buttonPressed = buttonPressed
M.cancelPressed = cancelPressed
M.onResetGameplay = onResetGameplay
M.onScreenFadeState = onScreenFadeState
M.handleCurrRecoveryOption = handleCurrRecoveryOption

M.onCareerModulesActivated = onCareerModulesActivated
M.onClientStartMission = onClientStartMission
return M