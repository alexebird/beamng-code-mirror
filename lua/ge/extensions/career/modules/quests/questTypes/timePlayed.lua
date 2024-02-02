local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

-- in sec
local function formatInMinHours(currTime, goalTime)
  local currHours = math.floor(currTime / 3600)
  local currMins = math.floor(((currTime % 3600) or 0) / 60)

  local goalTimeHours = goalTime / 3600

  if currHours > 0 and currMins > 0 then
    return {txt = "quest.type."..questType..".progressBarLabel1", context={countMinutes = currMins, countHours = currHours, hoursGoal = goalTimeHours}}
  elseif currHours == 0 then
    return {txt = "quest.type."..questType..".progressBarLabel2", context={countMinutes = currMins, hoursGoal = goalTimeHours}}
  elseif currHours > 0 and currMins == 0 then
    return {txt = "quest.type."..questType..".progressBarLabel3", context={countHours = currHours, hoursGoal = goalTimeHours}}
  end
end

local function onUpdateProgress()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end
  --Count stars

  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local goal = quest.questTypeData.targetValue
    local curr = gameplay_statistic.metricGet("general/mode/career.time", true) --getting it in seconds

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
        label = formatInMinHours(curr, goal),
        done = curr >= goal,
      }
    }

    quest.tempData.title = {txt = "quest.type."..questType..".title", context={goal = goal / 3600}}
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