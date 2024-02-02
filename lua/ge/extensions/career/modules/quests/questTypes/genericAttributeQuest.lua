local M = {}
--M.dependencies = {'career_modules_playerAttributes'}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function onUpdateProgress()
  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local targetValue = quest.questTypeData.targetValue
    local currValue = career_modules_playerAttributes.getAttribute(quest.questTypeData.attributeKey).value
    if quest.tempData.progress and quest.tempData.currValue ~= currValue then  quest.userData.progressTimestamp = os.time() end
    quest.tempData.progress = { {
        type = "progressBar",
        minValue = 0,
        currValue = math.min(currValue, targetValue),
        maxValue = targetValue,
        label = {txt = quest.progressLabel, context={count = currValue, goal = targetValue}},
        percentage = currValue / targetValue * 100,
        done = currValue >= goal,
      }
    }
    quest.tempData.title = {txt = quest.title, context={goal = targetValue}}
    quest.tempData.goalReached = {txt = quest.goalReached, context={goal = targetValue}}
    quest.description = "quest.type."..questType..".description"
    if currValue >= targetValue then
      career_modules_questManager.addCompleteQuest(quest)
    end
  end
end

local function onPlayerAttributesChanged()
  onUpdateProgress()
end


M.onUpdateProgress = onUpdateProgress
M.onBeamXPAdded = onBeamXPAdded
M.onPlayerAttributesChanged = onPlayerAttributesChanged
return M