local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function updateProgressOfQuest(quest, done)
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end

  local goal = quest.questTypeData.locationName or "no location name"

  quest.tempData.progress = { {
      type = "checkBox",
      done = done,
      label = "nothing yet",
      percentage = done and 100 or 0,
    }
  }
  quest.tempData.title = {txt = "quest.type."..questType..".title", context={goal = goal}}
  quest.tempData.goalReached = {txt = "quest.type."..questType..".succeed", context={goal = goal}}
  quest.description = "quest.type."..questType..".description"
  if done then
    career_modules_questManager.addCompleteQuest(quest)
  end
end

local function onUpdateProgress()
  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    updateProgressOfQuest(quest, false)
  end
end

local defaultDist = 20
local function check()
  local pos
  local player = be:getPlayerVehicle(0)
  if not player then return end
  local playerPos = player:getPosition()
  if not playerPos then return end
  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    pos = quest.questTypeData.coordinates.pos
    defaultDist = quest.questTypeData.coordinates.radius or defaultDist
    if vec3(pos[1], pos[2], pos[3]):distance(playerPos) < defaultDist then
      updateProgressOfQuest(quest, true)
      quest.userData.progressTimestamp = os.time()
    end
  end
end

local function onUpdate()
  check()
end

M.onUpdateProgress = onUpdateProgress
M.onBeamXPAdded = onBeamXPAdded

M.onUpdate = onUpdate
return M