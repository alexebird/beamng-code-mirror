local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)


local function onUpdateProgress()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end

  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local andFlag = true
    local succeededSubQuestCount = 0
    local goal = #quest.questTypeData.subTasks

    for _, id in ipairs(quest.questTypeData.subTasks) do
      local questStatus = career_modules_questManager.getQuestById(id).userData.status
      if questStatus ~= "completed" then
        andFlag = false
        break
      else
        succeededSubQuestCount = succeededSubQuestCount + 1
        quest.userData.progressTimestamp = os.time()
      end
    end
    if andFlag then
      career_modules_questManager.addCompleteQuest(quest)
    end
    quest.tempData.title = {txt = "quest.type."..questType..".title"}
    quest.tempData.goalReached = {txt = "quest.type."..questType..".succeed"}
    quest.description = "quest.type."..questType..".description"
    quest.tempData.progress = { {
        type = "progressBar",
        minValue = 0,
        currValue = succeededSubQuestCount,
        maxValue = goal,
        label = {txt = "quest.type."..questType..".progressBarLabel", context={count = succeededSubQuestCount, goal = goal}},
        percentage = succeededSubQuestCount / goal * 100,
        done = succeededSubQuestCount >= goal
      }
    }
  end
end

local function onQuestCompleted(q)
  onUpdateProgress()
end

M.onUpdateProgress = onUpdateProgress
M.onQuestCompleted = onQuestCompleted

return M