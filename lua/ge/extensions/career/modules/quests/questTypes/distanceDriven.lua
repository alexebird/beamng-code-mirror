local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function onUpdateProgress()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end

  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local goal = quest.questTypeData.targetValue
    local curr = gameplay_statistic.metricGet("vehicle/total_odometer.length", true) 

    if curr then
      curr = math.min(curr.value, goal)
    else
      curr = 0 
    end

    quest.tempData.progress = { {
        type = "progressBar",
        minValue = 0,
        currValue = curr,
        maxValue = goal,
        label = {txt = "quest.type."..questType..".progressBarLabel", context={count = curr, goal = goal}},
        done = curr >= goal,
      }
    }
    quest.tempData.title = {txt = "quest.type."..questType..".title", context={goal = goal}}
    quest.tempData.goalReached = {txt = "quest.type."..questType..".succeed", context={goal = goal}}
    quest.logbookFile = "/gameplay/quests/milestones/"..questType.."/cover.jpg"
    quest.description = "quest.type."..questType..".description"
    if curr >= goal then
      career_modules_questManager.addCompleteQuest(quest)
    end
  end
end


M.onUpdateProgress = onUpdateProgress

return M