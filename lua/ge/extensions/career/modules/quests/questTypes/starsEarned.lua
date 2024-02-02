local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function onUpdateProgress()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end
  --Count stars
  local currValue = 0
  for _, mission in ipairs(gameplay_missions_missions.get()) do
    local saveData = mission.saveData
    local starCount = tableSize(saveData.unlockedStars)
    if starCount then
      currValue = currValue + starCount
    end
  end

  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local goal = quest.questTypeData.targetValue
    if quest.tempData.progress and quest.tempData.progress.currValue ~= currValue then  quest.userData.progressTimestamp = os.time() end
    quest.tempData.progress = { {
        type = "progressBar",
        minValue = 0,
        currValue = math.min(currValue, goal),
        maxValue = goal,
        label = {txt = "quest.type."..questType..".progressBarLabel", context={count = currValue, goal = goal}},
        done = currValue >= goal,
      }
    }
    quest.tempData.title = {txt = "quest.type."..questType..".title", context={goal = goal}}
    quest.tempData.goalReached = {txt = "quest.type."..questType..".succeed", context={goal = goal}}
    quest.logbookFile = "/gameplay/quests/milestones/"..questType.."/cover.jpg"
    quest.description = "quest.type."..questType..".description"
    if currValue >= goal then
      career_modules_questManager.addCompleteQuest(quest)
    end
  end
end

local function onAnyMissionChanged(state, activity)
  if state == "stopped" then
    onUpdateProgress()
  end
end


M.onUpdateProgress = onUpdateProgress
M.onAnyMissionChanged = onAnyMissionChanged

return M