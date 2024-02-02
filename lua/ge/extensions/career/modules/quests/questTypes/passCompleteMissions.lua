local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

-- Pass or Complete n number of missions
local function onUpdateProgress()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end

  --Count stars
  local passedCount = 0
  local completedCount = 0
  for _, mission in ipairs(gameplay_missions_missions.get()) do
    local saveData = mission.saveData
    if saveData.progress.default then
      if saveData.progress.default.aggregate.completed then
        completedCount = completedCount + 1
      end
      if saveData.progress.default.aggregate.passed then
        passedCount = passedCount + 1
      end
    end
  end

  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local currValue
    local goal = quest.questTypeData.missionsCount
    
    if quest.questTypeData.condition == "complete" then
      if currValue ~= completedCount then quest.userData.progressTimestamp = os.time() end
      currValue = completedCount
      if completedCount >= goal then
        career_modules_questManager.addCompleteQuest(quest)
      end
    elseif quest.questTypeData.condition == "pass" then
      if currValue ~= passedCount then quest.userData.progressTimestamp = os.time() end
      currValue = passedCount
      if passedCount >= goal then
        career_modules_questManager.addCompleteQuest(quest)
      end
    end
    quest.tempData.title = {txt = "quest.type."..quest.questTypeData.condition.."Missions.goal", context={goal = goal}}
    quest.tempData.goalReached = {txt = "quest.type."..quest.questTypeData.condition.."Missions.succeed", context={count = currValue, goal = goal}}
    quest.description = "quest.type."..questType..".description"
    quest.tempData.progress = { {
        type = "progressBar",
        minValue = 0,
        currValue = currValue,
        maxValue = goal,
        label = {txt = "quest.type."..quest.questTypeData.condition.."Missions.progress", context={count = currValue, goal = goal}},
        percentage = currValue / goal * 100,
        done = currValue >= goal,
      }
    }
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