-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.dependencies = {'gameplay_missions_missions','freeroam_bigMapMode', 'gameplay_playmodeMarkers', 'freeroam_bigMapPoiProvider'}

local skipIconFading = false
-- detect player velocity
local lastPosition = vec3(0,0,0)
local lastVel
local tmpVec = vec3()
local garageBorderClr = {1,0.5,0.5}
local forceReevaluateOpenPrompt = true

local vel = vec3()
local function getVelocity(dtSim, position)
  --local veh = be:getPlayerVehicle(0)
  --return veh:getVelocity():length()
  lastPosition = lastPosition or position
  lastVel = lastVel or 10

  if dtSim > 0 then
    vel:setSub2(position, lastPosition)
    lastVel = vel:length() / dtSim
  end
  lastPosition = position
  return lastVel
end

local function inverseLerp(min, max, value)
 if math.abs(max - min) < 1e-30 then return min end
 return (value - min) / (max - min)
end


local atParkingSpeed, atParkingSpeedPrev
local parkingSpeedMin, parkingSpeedMax = 1/3.6, 3/3.6
local function getParkingSpeedFactor(playerVelocity)
  if playerVelocity < parkingSpeedMin then atParkingSpeed =  true end
  if playerVelocity > parkingSpeedMax then atParkingSpeed = false end
  if atParkingSpeed == nil    then atParkingSpeed = playerVelocity < parkingSpeedMin end
  local atParkingSpeedChanged = atParkingSpeed ~= atParkingSpeedPrev
  atParkingSpeedPrev = atParkingSpeed
  return clamp(inverseLerp(parkingSpeedMin*1.25, parkingSpeedMin*0.75, playerVelocity),0,1), atParkingSpeed, atParkingSpeedChanged
end

local atCruisingSpeed, atCruisingSpeedPrev
local CruisingSpeedMin, CruisingSpeedMax = 20/3.6, 30/3.6
local function getCruisingSpeedFactor(playerVelocity)
  if playerVelocity < CruisingSpeedMin then atCruisingSpeed =  false end
  if playerVelocity > CruisingSpeedMax then atCruisingSpeed = true end
  if atCruisingSpeed == nil    then atCruisingSpeed = playerVelocity > CruisingSpeedMin end
  local atCruisingSpeedChanged = atCruisingSpeed ~= atCruisingSpeedPrev
  atCruisingSpeedPrev = atCruisingSpeed
  return (atCruisingSpeed and 1 or 0), atCruisingSpeed, atCruisingSpeedChanged
end


local currentInteractableElements = nil

M.formatMission = function(m)
  local info = {
    id = m.id,
    name = m.name,
    description = m.description,
    preview = m.previewFile,
    missionTypeLabel = m.missionTypeLabel or mission.missionType,
    userSettings = m:getUserSettingsData() or {},
    defaultUserSettings = m.defaultUserSettings or {},
    additionalAttributes = {},
    progress = m.saveData.progress,
    currentProgressKey = m.currentProgressKey or m.defaultProgressKey,
    unlocks = m.unlocks,
    hasUserSettingsUnlocked = gameplay_missions_progress.missionHasUserSettingsUnlocked(m.id),
    devMission = m.devMission,
    tutorialActive = (career_modules_linearTutorial and career_modules_linearTutorial.isLinearTutorialActive()) or nil,
  }

  info.hasUserSettings = #info.userSettings > 0
  local additionalAttributes, additionalAttributesSortedKeys = gameplay_missions_missions.getAdditionalAttributes()

  for _, attKey in ipairs(additionalAttributesSortedKeys) do
    local att = additionalAttributes[attKey]
    local mAttKey = m.additionalAttributes[attKey]
    local val
    if type(mAttKey) == 'string' then
      val = att.valuesByKey[m.additionalAttributes[attKey]]
    elseif type(mAttKey) == 'table' then
      val = m.additionalAttributes[attKey]
    end
    if val then
      table.insert(info.additionalAttributes, {
        icon = att.icon or "",
        labelKey = att.translationKey,
        valueKey = val.translationKey
      })
    end
  end
  for _, customAtt in ipairs(m.customAdditionalAttributes or {}) do
    table.insert(info.additionalAttributes, customAtt)
  end
  info.formattedProgress =  gameplay_missions_progress.formatSaveDataForUi(m.id)
  info.leaderboardKey = m.defaultLeaderboardKey or 'recent'

  --info.gameContextUiButtons = {}
  info.gameContextUiButtons = m.getGameContextUiButtons and m:getGameContextUiButtons()
  return info
end
M.formatDataForUi = function()
  if not M.isStateFreeroam() then return nil end
  local dataToSend = {}
  if not currentInteractableElements then return end
  for _, m in ipairs(currentInteractableElements or {}) do
    if m.missionId then
      table.insert(dataToSend, M.formatMission(gameplay_missions_missions.getMissionById(m.missionId)))
    end
  end
  table.sort(dataToSend, gameplay_missions_unlocks.depthIdSort)
  return dataToSend
end

M.startMissionById = function(id, userSettings, startingOptions)
  local m = gameplay_missions_missions.getMissionById(id)
  if m then
    if m.unlocks.startable then
      gameplay_missions_missionManager.startWithFade(m, userSettings, startingOptions or {})
      return
    else
      log("E","","Trying to start mission that is not startable due to unlocks: " .. dumps(id))
    end
  else
    log("E","","Trying to start mission with invalid id: " .. dumps(id))
  end

end

M.stopMissionById = function(id, force)
  for _, m in ipairs(gameplay_missions_missions.get()) do
    if m.id == id then
      gameplay_missions_missionManager.attemptAbandonMissionWithFade(m, force)
      return
    end
  end
end

M.changeUserSettings = function(id, settings)
  local mission = gameplay_missions_missions.getMissionById(id)
  if not mission then return end
  mission:processUserSettings(settings)
  guihooks.trigger('missionProgressKeyChanged', id, mission.currentProgressKey)
end

local preselectedMissionId = nil
M.setPreselectedMissionId = function(mId)
  preselectedMissionId = mId
end


local function getGameContext(fromMissionMenu)
  if gameplay_missions_missionManager.getForegroundMissionId() ~= nil then
    local activeMission = nil
    for _, m in ipairs(gameplay_missions_missions.get()) do
      if m.id == gameplay_missions_missionManager.getForegroundMissionId() then
        activeMission = m
      end
    end
    if fromMissionMenu then
      preselectedMissionId = nil
    end
    return {context = 'ongoingMission', mission = M.formatMission(activeMission)}
  else

    local missions = M.formatDataForUi()
    if M.isStateFreeroam() and missions and next(missions) then
      if fromMissionMenu then
        extensions.hook("onAvailableMissionsSentToUi", context)
      end
      local ret = {
        context = 'availableMissions',
        missions = missions,
        isWalking = gameplay_walk.isWalking(),
        isCareerActive = career_career.isActive(),
        preselectedMissionId = fromMissionMenu and preselectedMissionId or nil,
      }
      if career_modules_permissions then
        local status, message = career_modules_permissions.getStatusForTag("interactMission")
        if message then
          ret.startWarning = {label = message, title ="Delivery in progress!" }
        end
      end
      --ret.startWarning = {label = "Test Warning some long text", title="Warning"}
      if career_modules_playerAttributes then
        ret.repairOptions = {
          {
            type = "noRepair",
            label = "No",
            available = false,
            notEnoughDisplay = "Repaired vehicle needed"
          },
          {
            type = "bonusStarRepair",
            cost = 1,
            label = "For 1 bonus star",
            available = career_modules_playerAttributes.getAttribute('bonusStars').value >= 1,
            notEnoughDisplay = "Not enough bonus stars for repair"
          },
          {
            type = "moneyRepair",
            cost = 1000,
            label = "For 1000 money",
            available = career_modules_playerAttributes.getAttribute('money').value >= 1000,
            notEnoughDisplay = "Not enough money for repair"
          }
        }
      end
      if fromMissionMenu then
        preselectedMissionId = nil
      end
      return ret
    else
      if fromMissionMenu then
        preselectedMissionId = nil
      end
      return {context = 'empty' }
    end
  end
end
M.getGameContext = getGameContext

local lastValidPlayerPosition
local function getPlayerPosition()
  local playerVehicle = be:getPlayerVehicle(0)
  local pos = playerVehicle and playerVehicle:getPosition() or core_camera.getPosition()
  lastValidPlayerPosition = pos
  return lastValidPlayerPosition
end

local detailPromptOpen = false
local promptData = {}
local function openViewDetailPrompt(elemData)
  --[[
  table.clear(promptData)
  extensions.hook("onPoiDetailPromptOpening", elemData, promptData)
  if next(promptData) then
    local label = "Prompt"
    local buttons = {}
    if #promptData == 1 then
      label = promptData[1].label
      table.insert(buttons, {
          action = "accept",
          text = promptData[1].buttonText,
          cmd = "gameplay_markerInteraction.onSelectDetailPromptClicked(1)"
        })
      table.insert(buttons, {
        action = "decline",
        text = "missions.missions.general.accept.close",
        cmd = "gameplay_markerInteraction.onCloseDetailPropmptClicked()"
      })
    else
      -- todo: design proper solution for overlapping pois...
      log("E","","Multipe Prompts are currently not supported :D")
    end
    local content = {title = label, typeName = "", altMode = false, actionMap = true, buttons = buttons }
    ui_missionInfo.openDialogue(content)
    -- TODO: fix this :)
    local missionCount = 0
    for _, elem in ipairs(elemData) do
      if elem.type == "mission" then
        missionCount = missionCount + 1
      end
    end
    guihooks.trigger("onMissionAvailabilityChanged", {missionCount = missionCount})
    extensions.hook("onOpenViewDetailPrompt", {missionCount = missionCount, elemData = elemData, promptData = promptData})
    detailPromptOpen = true
  else
    log("E","","There is no prompt data to open the prompt!")
  end
  ]]
  local activityData = {}
  extensions.hook("onActivityAcceptGatherData", elemData, activityData)
  ui_missionInfo.openActivityAcceptDialogue(activityData)
  --guihooks.trigger('ActivityAcceptUpdate', activityData)
end

local function onSelectDetailPromptClicked(idx)
  detailPromptOpen = false
  ui_missionInfo.closeDialogue()
  guihooks.trigger('ActivityAcceptUpdate', nil)
  local prompt = promptData[idx]
  if prompt and prompt.buttonFun then
    prompt.buttonFun()
  end
  table.clear(promptData)
end
M.onSelectDetailPromptClicked = onSelectDetailPromptClicked




local function closeViewDetailPrompt(force)
  if detailPromptOpen or force then
    ui_missionInfo.closeDialogue()
    guihooks.trigger("onMissionAvailabilityChanged", {missionCount = 0})
    guihooks.trigger('ActivityAcceptUpdate', nil)
    detailPromptOpen = false
  end
end
M.onCloseDetailPropmptClicked = function()
  closeViewDetailPrompt()
end

local function onUiChangedState(newUIState, prevUIState)
  if newUIState:sub(1, 4) == 'menu' then
    closeViewDetailPrompt()
  end
end






local updateData = {}
local decals = {}
local nearbyIds = {}
local quadTreeSettings = {}
local clustersById = {}
local function displayMissionMarkers(level, dtSim, dtReal)
  profilerPushEvent("MissionMarker precalc")
  local activeMission = gameplay_missions_missionManager.getForegroundMissionId()
  local globalAlpha = 1
  if activeMission then
    globalAlpha = 0
  end
  local camPos = core_camera.getPosition()
  local playerPosition = getPlayerPosition()
  local playerVelocity = getVelocity(dtSim, playerPosition)
  local isWalking = gameplay_walk and gameplay_walk.isWalking()
  profilerPushEvent("MissionEnter parkingSpeedFactor")
  local parkingSpeedFactor, isAtParkingSpeed, parkingSpeedChanged = getParkingSpeedFactor(playerVelocity)
  local cruisingSpeedFactor, isAtcruisingSpeed, cruisingSpeedChanged = getCruisingSpeedFactor(playerVelocity)

  profilerPopEvent("MissionEnter parkingSpeedFactor")

  -- put reference for icon manager in
  updateData.playerPosition = playerPosition
  updateData.parkingSpeedFactor = parkingSpeedFactor
  updateData.cruisingSpeedFactor = cruisingSpeedFactor
  updateData.dt = dtReal
  updateData.globalAlpha = globalAlpha
  updateData.camPos = camPos
  updateData.camRot = core_camera.getQuat()
  updateData.bigMapActive = freeroam_bigMapMode.bigMapActive()
  updateData.bigmapTransitionActive = freeroam_bigMapMode.isTransitionActive()
  updateData.isWalking = isWalking
  updateData.isFreeCam = commands.isFreeCamera()
  local vm = GFXDevice.getVideoMode()
  local w, h = vm.width, vm.height
  updateData.windowAspectRatio = w/h
  updateData.screenHeight = GFXDevice.getVideoMode().height
  -- TODO: Clean this up
  local veh = be:getPlayerVehicle(0)
  if veh then
    local oobb = veh:getSpawnWorldOOBB()
    updateData.veh = veh
    updateData.vehPos = veh:getPosition()
    updateData.vehPos2d = veh:getPosition():z0()
    updateData.vehVelocity = veh:getVelocity()
    updateData.oobb = oobb
    for i = 0, 7 do
      updateData['bbp'..i] = oobb:getPoint(i)
    end

  end

  table.clear(nearbyIds)
  -- hide all the markers behind the camera
  local maxRadius = 100
  profilerPushEvent("MissionEnter QTStuff")
      -- transitioning or normal play mode
  if   (not freeroam_bigMapMode.bigMapActive())
    or (freeroam_bigMapMode.bigMapActive() and freeroam_bigMapMode.isTransitionActive()) then
    local clusterQt = gameplay_playmodeMarkers.getPlaymodeClustersAsQuadtree()
    for id in clusterQt:queryNotNested(playerPosition.x-maxRadius, playerPosition.y-maxRadius, playerPosition.x+maxRadius, playerPosition.y + maxRadius) do
      nearbyIds[id] = true
    end
  end

  if freeroam_bigMapMode.navigationPoiId  then
    nearbyIds[freeroam_bigMapMode.navigationPoiId] = true
  end

  profilerPopEvent("MissionEnter QTStuff")
  --table.clear(visibleIdsSorted)
  --tableKeys(visibleIds, visibleIdsSorted)
  --table.sort(visibleIdsSorted)
  profilerPopEvent("MissionEnter precalc")
  if not isAtParkingSpeed then
    currentInteractableElements = nil
  end
  table.clear(decals)

  local decalCount = 0
  local careerActive = (career_career and career_career.isActive())
  local interactableElements = {}
  local showMissionMarkers = settings.getValue("showMissionMarkers")

  -- draw/show all visible markers.
  for i, cluster in ipairs(gameplay_playmodeMarkers.getPlaymodeClusters()) do
    local marker = gameplay_playmodeMarkers.getMarkerForCluster(cluster)
    if nearbyIds[cluster.id] or marker.focus then
      -- Check if the marker should be visible
      local showMarker = not photoModeOpen and not editor.active
      if marker.type == "missionMarker" then
        showMarker = (showMissionMarkers or cluster.focus)
      end
      if showMarker then
        -- debug drawing for testing
        --debugDrawer:drawTextAdvanced(cluster.pos, String(tostring(id)), ColorF(1,1,1,1), true, false, ColorI(0,0,0,192))
        --debugDrawer:drawSphere(cluster.pos, cluster.radius, ColorF(0.91,0.05,0.48,0.2))
        marker:show()
        marker:update(updateData)
        -- post-marker decals, so they can be all drawn at once
        if marker.groundDecalData then
          decalCount = decalCount + 1
          decals[decalCount] = marker.groundDecalData
        end

        if not freeroam_bigMapMode.bigMapActive() and not activeMission then
          if marker.interactInPlayMode then
            -- todo: optimize this
            local veh = be:getPlayerVehicle(0)
            if veh then
              local canInteract = isAtParkingSpeed and (forceReevaluateOpenPrompt or parkingSpeedChanged)

              updateData.canInteract = canInteract
              if updateData.canInteract then
                marker:interactInPlayMode(updateData, interactableElements)
              end
              --simpleDebugText3d(dumps(marker.cluster.clusterId), marker.cluster.pos, 0.25)
            end
          end
        end
      else
        marker:hide()
      end
    else
      marker:hide()
    end
  end
  --print("Force forceReevaluateOpenPrompt " .. dumps(forceReevaluateOpenPrompt))
  forceReevaluateOpenPrompt = false
  if next(interactableElements) then
    currentInteractableElements = interactableElements
    openViewDetailPrompt(interactableElements)
  end
  if not activeMission and not next(interactableElements) then
    if not isAtParkingSpeed or parkingSpeedChanged then
      closeViewDetailPrompt(parkingSpeedChanged)
    end
  end
  skipIconFading = false
  Engine.Render.DynamicDecalMgr.addDecals(decals, decalCount)
end

local pos2Offset = vec3(0, 0, 1000)
local columnColor = ColorF(1,1,1,1)
local function drawDistanceColumn(targetPos)
  local camPos = core_camera.getPosition()
  local dist = camPos:distance(targetPos)
  local radius = math.max(dist/400, 0.1)
  local targetPos2 = targetPos + pos2Offset
  local alpha = clamp((dist-50)/200, 0, 0.6)
  columnColor.alpha = alpha
  debugDrawer:drawCylinder(targetPos, targetPos2, radius, columnColor)
end

-- gets called only while career mode is enabled
local function onPreRender(dtReal, dtSim)
  if not M.isStateFreeroam() then
    gameplay_playmodeMarkers.clear()
    closeViewDetailPrompt()
    return
  end
  profilerPushEvent("MissionEnter onPreRender")
  profilerPushEvent("MissionEnter groundMarkers")
  -- Disable navigation when player is close to the goal
  if gameplay_missions_missionManager.getForegroundMissionId() == nil and core_groundMarkers.currentlyHasTarget() then
    if freeroam_bigMapMode and not freeroam_bigMapMode.bigMapActive() and type(core_groundMarkers.endWP[1]) == "cdata" then -- is vec3
      drawDistanceColumn(core_groundMarkers.endWP[1])
      if core_groundMarkers.getPathLength() < 10 then
        freeroam_bigMapMode.reachedTarget()
      end
    end
  end
  if freeroam_bigMapMode and freeroam_bigMapMode.reachedTargetPos then
    local veh = be:getPlayerVehicle(0)
    if veh then
      local vehPos = veh:getPosition()
      if vehPos:distance(freeroam_bigMapMode.reachedTargetPos) > 50 then
        freeroam_bigMapMode.resetForceVisible()
      end
    end
  end

  profilerPopEvent("MissionEnter groundMarkers")

  -- check if we've switched level
  local level = getCurrentLevelIdentifier()
  if level then
    profilerPushEvent("DisplayMissionMarkers")
    displayMissionMarkers(level, dtSim, dtReal)
    profilerPopEvent("DisplayMissionMarkers")
  end

  profilerPopEvent("MissionEnter onPreRender")
end


local function clearCache()
  M.setForceReevaluateOpenPrompt()
end


local function skipNextIconFading()
  skipIconFading = true
end

local function showMissionMarkersToggled(active)
  gameplay_rawPois.clear()
  freeroam_bigMapPoiProvider.forceSend()

  closeViewDetailPrompt()
end


local function onAnyMissionChanged(state)
  freeroam_bigMapPoiProvider.forceSend()
  if state == "started" then
    freeroam_bigMapMode.deselect()
    freeroam_bigMapMode.resetForceVisible()
  end
end

M.isStateFreeroam = function()
  if core_gamestate.state and (core_gamestate.state.state == "freeroam" or core_gamestate.state.state == 'career') then
    return true
  end
  return false
end

M.closeViewDetailPrompt = closeViewDetailPrompt
M.showMissionMarkersToggled = showMissionMarkersToggled

M.restartCurrent = restartCurrent
M.abandonCurrent = abandonCurrent

M.skipNextIconFading = skipNextIconFading
M.onPreRender = onPreRender

M.getClusterMarker = getClusterMarker

M.onUiChangedState = onUiChangedState
M.onAnyMissionChanged = onAnyMissionChanged
M.clearCache = clearCache
M.setForceReevaluateOpenPrompt = function()
  forceReevaluateOpenPrompt = true
end

M.onUIPlayStateChanged = function(enteredPlay)
  if enteredPlay then
    M.setForceReevaluateOpenPrompt()
  end
end
return M