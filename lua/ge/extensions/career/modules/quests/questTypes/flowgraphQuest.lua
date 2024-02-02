local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)


local function onUpdateProgress()
  for _, quest in ipairs(gameplay_quests_questManager.getActiveQuestsByType(questType)) do
    quest.tempData.title = {txt = quest.title}
    quest.tempData.goalReached = "NoText"
    --quest.description = quest.description
    quest.tempData.progress = {       {
        type = "checkbox",
        done = quest.userData.status == "completed",
        label = quest.checkboxLabel,
      },
    }
  end
end

local function addOrSetVariable(quest, mgr, name, value)
  log("D","","Setting Mission Variable: " .. name .. " --> " .. dumps(value))
  local t = type(value)
  if     t == "boolean"               then t = "bool"
  elseif t == "string"                then -- it's ok already
  elseif t == "number"                then -- it's ok already
  elseif t == "table" and #value == 3 then t = "vec3"
  elseif t == "table" and #value == 4 then t = "quat"
  else
    log("E", "", "Cannot add Quest Variable "..dumps(name).." for activity "..dumps(quest.id)..": unable to find a usable type, given its value: "..dumps(value))
    return true
  end
  local mergeStrat = nil
  local fixedType = nil
  local undeletable = nil
  if mgr.variables:variableExists(name) then
    if not mgr.variables:changeBase(name, value) then -- modify value only
      log("E", "", "Cannot set Quest Variable "..dumps(name).." for Quest "..dumps(quest.id))
      return true
    end
  else
    log("W", "", "Cannot set Quest Variable "..dumps(name).." for activity "..dumps(quest.id) .." - The variable does not exit in the FG.")
  end
end


local function setupFlowgraphManager(quest)
  if quest.mgr then
    log("E","","Tried to Setup FG mgr for quest, but the manager already exists! questid: " .. dumps(quest.id))
    return
  end
  --[[
   -- path logic for relative paths
  local relativePath = self.missionFolder.."/"..fgFile
  local absolutePath = fgFile
  local path = FS:fileExists(relativePath) and relativePath or (FS:fileExists(absolutePath) and absolutePath or nil)
  if not path then
    log("E", "", "Unable to locate fgPath file for activity "..dumps(self.id)..", neither as relative nor absolute dir: "..dumps(fgFile))
    return true
  end]]
  -- load the flowgraph and set its variables
  local path = quest.questTypeData.fgPath
  local mgr = core_flowgraphManager.loadManager(path)
  mgr.transient = true -- prevent flowgraph from re-strating flowgraphs after ctrl+L
  mgr.quest = quest
  mgr.name = quest.name or mgr.name
  quest.mgr = mgr
  mgr.savedData = {}

  for name, value in pairs(quest.questTypeData.fgVariables or {}) do
    if addOrSetVariable(quest, mgr, name, value) then
      return true
    end
  end
  --print(mgr.name .. " has been started next frame")
  core_flowgraphManager.startNextFrame(mgr)
end

local function onClientStartMission()
end


local function questActivated(quest)
  --print("questActivated!")
  for _, q in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    if q.id == quest.id then
      --print("Actiovatng quest:")
      setupFlowgraphManager(q)
    end
  end
end

local function onQuestsUnloaded()
  --print("onQuestsUnloaded")
  if not active then
    for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
      if quest.mgr and quest.mgr.runningState == "running" then
        --print("stopping FG! " .. quest.mgr.name)
        quest.mgr:setRunning(false, true) -- stop all running flowgraphs of quests instantly
      end
    end
  end
end
M.onQuestsUnloaded = onQuestsUnloaded

M.onAnyMissionChanged = onAnyMissionChanged
M.questActivated = questActivated
M.onClientStartMission = onClientStartMission

return M