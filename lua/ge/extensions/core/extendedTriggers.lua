-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
local logTag = 'extendedTriggers'

M.active = true
M.debugMode = false

local triggers = {} -- main objects table
local groupedTriggers = {} -- table of triggers that depend on each other
local originalStates = {} -- original states of objects

-- triggers can be BeamNGTriggers or Site Zones
-- triggers can link to SimGroups that should contain statics and lights
-- triggers can also execute commands
-- when trigger state becomes true, flip original state of all linked objects
-- if nested folders, process them all in parallel (useful for statics that go with lights at the same time)

local function setState(id, state) -- updates the state of a single object
  local obj = scenetree.findObjectById(id)
  if not obj then return end

  local field = (obj:getClassName() == 'PointLight' or obj:getClassName() == 'SpotLight') and 'isEnabled' or 'hidden'
  local isLight = field == 'isEnabled'

  if not originalStates[id] then
    if isLight then
      originalStates[id] = obj:getLightEnabled() and 1 or 0
    else
      originalStates[id] = obj.hidden and 1 or 0
    end
  end
  if state == nil then
    if originalStates[id] then
      obj[field] = originalStates[id] == 1 and true or false
    end
  else
    if originalStates[id] == 1 then
      obj[field] = not state
    else
      obj[field] = state
    end
  end
end

local function setTriggerState(key, link, state) -- instantly updates the visible states of linked objects
  if not key or not triggers[key] or not triggers[key].links then return end

  for k, v in pairs(triggers[key].links) do
    if not link or link == k then
      local folder = scenetree.findObject(k)
      if folder then
        for _, o in ipairs(folder:getObjects()) do
          setState(tonumber(o) or scenetree.findObject(o):getID(), state)
        end
      end
    end
  end
end

local function processTriggerObjects(key) -- processes objects and folders for the group
  if not key or not triggers[key] or not triggers[key].links then return end

  for k, v in pairs(triggers[key].links) do
    local folder = scenetree.findObject(k)
    if folder and folder:getClassName() == 'SimGroup' then
      local objects = folder:getObjects()
      v.isNested = true -- if nested folder structure exists, process the children of the folders, in parallel
      for _, o in ipairs(objects) do
        local obj = scenetree.findObjectById(tonumber(o) or scenetree.findObject(o):getID())
        if obj:getGroup():getName() == k and obj:getClassName() ~= 'SimGroup' then
          v.isNested = false
        end
      end

      if v.isNested then -- get the inner folder with the most children, and use that value as the maxIdx
        v.maxIdx = 0
        for _, o in ipairs(objects) do
          local obj = scenetree.findObjectById(tonumber(o) or scenetree.findObject(o):getID())
          if obj:getGroup():getName() == k and obj:getClassName() == 'SimGroup' then
            v.maxIdx = math.max(v.maxIdx, obj:getCount())
          end
        end
      else
        v.maxIdx = folder:getCount()
      end
    else
      v._disabled = true
    end
  end
end

local function addTrigger(key, data) -- creates data for a trigger; "key" should be the trigger name
  data = data or {}
  triggers[key] = {
    type = data.type or 'trigger', -- "trigger", "zone"
    id = data.id,
    enabled = true,
    active = false,
    stack = 0,
    subjectType = data.subjectType or 'player', -- "player", "notPlayer", "all"
    subjectIds = data.subjectIds, -- optional table of valid vehicle ids to check for
    onEnterCommand = data.onEnterCommand, -- GELua
    onExitCommand = data.onExitCommand,
    onEnterVehCommand = data.onEnterVehCommand, -- vLua
    onExitVehCommand = data.onExitVehCommand
  }

  -- table of linked scenetree SimGroup folders; each key (k) should be the folder name
  if type(data.links) == 'table' then
    triggers[key].links = {}
    for k, v in pairs(data.links) do
      triggers[key].links[k] = {
        timer = -1,
        stepTimer = -1,
        currIdx = 0,
        maxIdx = 0,
        randomOrder = v.randomOrder and true or false,
        onEnterDelay = tonumber(v.onEnterDelay) or 0,
        onExitDelay = tonumber(v.onExitDelay) or 0,
        onEnterRandomMin = tonumber(v.onEnterRandomMin) or 0,
        onEnterRandomMax = tonumber(v.onEnterRandomMax) or 0,
        onExitRandomMin = tonumber(v.onExitRandomMin) or 0,
        onExitRandomMax = tonumber(v.onExitRandomMax) or 0
      }
    end
  end

  if data.otherTriggers then
    groupedTriggers[key] = {key}
    for _, v in ipairs(data.otherTriggers) do
      table.insert(groupedTriggers[key], v) -- inserts name of each other trigger
    end
    for _, v in ipairs(data.otherTriggers) do
      groupedTriggers[v] = groupedTriggers[key] -- cross references original table
    end
  end

  processTriggerObjects(key)
end

local function removeTrigger(key, useOrigState) -- removes extended data of a trigger
  if not key or not triggers[key] then return end
  if useOrigState then
    setTriggerState(key)
  end
  triggers[key] = nil
end

local function reset(useOrigState) -- resets everything
  if useOrigState then
    for k, v in pairs(triggers) do
      setTriggerState(k)
    end
  end

  if next(triggers) then
    log('I', logTag, 'Extended triggers resetted')
  end

  table.clear(triggers)
  table.clear(groupedTriggers)
  table.clear(originalStates)
end

local function setupTriggers(data) -- setup for the triggers table
  if not be or not data then return end
  reset(true) -- clears tables and resets states

  local triggerCount = 0
  local zoneCount = 0
  for k, v in pairs(data) do
    if not v.type or v.type == 'trigger' then
      local obj = scenetree.findObject(k)
      if obj and obj:getClassName() == 'BeamNGTrigger' then
        v.id = obj:getID()
        addTrigger(k, v)
        triggerCount = triggerCount + 1
      end
    elseif v.type == 'zone' then
      local sites = gameplay_city.getSites()
      if false then -- TODO
        addTrigger(k, v)
        zoneCount = zoneCount + 1
      end
    end
  end

  log('I', logTag, 'Added '..triggerCount..' BeamNGTriggers to triggers data')
  log('I', logTag, 'Added '..zoneCount..' site zones to triggers data')
end

local function loadTriggers(filePath) -- loads triggers data from a file path
  if not filePath then
    local levelDir = path.split(getMissionFilename())
    if levelDir then filePath = levelDir..'triggers.json' end
  end

  if filePath then
    setupTriggers(jsonReadFile(filePath))
  end
end

local function getTriggers() -- returns table of extended triggers
  return triggers
end

local function onTick() -- tick to check for zones, if applicable

end

local function onVehicleSwitched() -- temporarily sets all active states to false
  for k, v in pairs(triggers) do
    v.active = false
    v.stack = 0

    if M.debugMode then
      log('D', logTag, 'Updated state of '..k..': false')
    end

    if v.links then
      for l, data in pairs(v.links) do
        data.timer = 0
        data.stepTimer = -1
        v.stack = v.stack + 1
      end
    end
  end
end

local function onClientStartMission()
  loadTriggers()
end

local function onClientEndMission()
  reset(true)
end

local function onUpdate(dt, dtSim)
  if not next(triggers) then return end

  for k, v in pairs(triggers) do
    if v.links then
      for l, data in pairs(v.links) do
        if v.stack > 0 then
          local delay = v.active and data.onEnterDelay or data.onExitDelay
          local delayRandomMin = v.active and data.onEnterRandomMin or data.onExitRandomMin
          local delayRandomMax = v.active and data.onEnterRandomMax or data.onExitRandomMax

          if data.timer >= 0 then
            if data.timer >= delay then
              if delayRandomMax == 0 or data.maxIdx < 1 then
                setTriggerState(k, l, v.active)
                v.stack = v.stack - 1
              else
                data.currIdx = 0
                data.stepTimer = 0
                if not data.idxList then
                  data.idxList = {}
                  for i = 1, data.maxIdx do
                    table.insert(data.idxList, i)
                  end
                end
                if data.randomOrder then
                  data.idxList = arrayShuffle(data.idxList) -- random index order to use for target scenetree group
                end
              end

              if M.debugMode then
                log('D', logTag, '['..k..']['..l..']: delay done ('..delay..' s)')
              end

              data.timer = -1
            else
              data.timer = data.timer + dtSim
            end
          else
            if data.stepTimer >= 0 then
              if not data.delayRandom then
                data.delayRandom = lerp(delayRandomMin, delayRandomMax, math.random()) -- random delay until next index step
              end
              if data.stepTimer >= data.delayRandom then
                data.currIdx = data.currIdx + 1

                local idx = data.idxList[data.currIdx]
                local folder = scenetree.findObject(l)
                if folder then
                  local objects = folder:getObjects()

                  if data.isNested then
                    for _, o in ipairs(objects) do
                      local obj = scenetree.findObjectById(tonumber(o) or scenetree.findObject(o):getID())
                      if obj and obj:getGroup():getName() == l and obj:getClassName() == 'SimGroup' then
                        local o2 = obj:getObjects()[idx]
                        if o2 then
                          setState(tonumber(o2) or scenetree.findObject(o2):getID(), v.active)
                        end
                      end
                    end
                  else
                    if objects[idx] then
                      setState(tonumber(objects[idx]) or scenetree.findObject(objects[idx]):getID(), v.active)
                    end
                  end
                end

                if M.debugMode then
                  log('D', logTag, '['..k..']['..l..']: step delay done ('..data.delayRandom..' s)')
                end

                data.stepTimer = 0
                data.delayRandom = nil -- reset random delay

                if not data.idxList[data.currIdx + 1] then
                  v.stack = v.stack - 1
                  data.stepTimer = -1
                end
              else
                data.stepTimer = data.stepTimer + dtSim
              end
            end
          end
        else
          data.timer = -1
          data.stepTimer = -1
        end
      end
    end
  end
end

local function onBeamNGTrigger(data)
  if not data.triggerName then return end

  local name = data.triggerName
  local origName = name
  if not triggers[name] then
    if groupedTriggers[name] then
      name = groupedTriggers[name][1] or 0
    end
  end

  if not triggers[name] or not triggers[name].enabled then return end
  local trigger = triggers[name]
  local active = data.event == 'enter' or data.event == 'tick'
  local valid = false

  if trigger.subjectIds and arrayFindValueIndex(trigger.subjectIds, data.subjectID) then
    valid = true
  else
    if (not trigger.subjectType or trigger.subjectType == 'all') or
    (trigger.subjectType == 'player' and data.subjectID == be:getPlayerVehicleID(0)) or
    (trigger.subjectType == 'notPlayer' and data.subjectID ~= be:getPlayerVehicleID(0)) then
      valid = true
    end
  end

  if valid then -- checks the latest active trigger; may need improvement, it is a bit convoluted
    if active then
      trigger.lastTrigger = origName
    elseif trigger.lastTrigger and trigger.lastTrigger ~= origName then
      valid = false
    end
  end

  if valid then
    if trigger.active ~= active then
      trigger.active = active
      trigger.stack = 0

      if not active then
        trigger.lastTrigger = nil
      end

      if M.debugMode then
        log('D', logTag, 'Updated state of '..name..': '..tostring(active))
      end

      if trigger.links then
        for l, data in pairs(trigger.links) do
          data.timer = 0
          data.stepTimer = -1
          trigger.stack = trigger.stack + 1
        end
      end

      -- TODO: maybe vehicles should be handled outside of the valid branch
      if data.event == 'enter' then
        if trigger.onEnterCommand then
          local fx = load(trigger.onEnterCommand)
          if fx then pcall(fx) end
        end
        if trigger.onEnterVehCommand then
          be:getObjectByID(data.subjectID):queueLuaCommand(trigger.onEnterVehCommand)
        end
      elseif data.event == 'exit' then
        if trigger.onExitCommand then
          local fx = load(trigger.onExitCommand)
          if fx then pcall(fx) end
        end
        if trigger.onExitVehCommand then
          be:getObjectByID(data.subjectID):queueLuaCommand(trigger.onExitVehCommand)
        end
      end
    end
  end
end

local function onSerialize()
  reset(true)
  return {}
end

local function onDeserialized()
  loadTriggers()
end

M.reset = reset
M.loadTriggers = loadTriggers
M.setupTriggers = setupTriggers
M.addTrigger = addTrigger
M.removeTrigger = removeTrigger
M.getTriggers = getTriggers

M.onVehicleSwitched = onVehicleSwitched
M.onClientStartMission = onClientStartMission
M.onClientEndMission = onClientEndMission
M.onUpdate = onUpdate
M.onBeamNGTrigger = onBeamNGTrigger
M.onSerialize = onSerialize
M.onDeserialized = onDeserialized

return M