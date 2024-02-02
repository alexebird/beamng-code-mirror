local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function onUpdateProgress()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end
  --Count stars

  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local goal = quest.questTypeData.unlockCount
    local curr = quest.questTypeData.level and levelCount[quest.questTypeData.level] or total
    if quest.tempData.progress and quest.tempData.progress.currValue ~= curr then
      quest.userData.progressTimestamp = os.time()
    end
    quest.tempData.progress = { {
        type = "progressBar",
        minValue = 0,
        currValue = curr,
        maxValue = goal,
        label = {txt = "quest.type."..questType..".progressBarLabel", context={count = curr, goal = goal}},
        percentage = curr / goal * 100
      }
    }
    quest.tempData.title = {txt = "quest.type."..questType..".title", context={goal = goal}}
    quest.tempData.goalReached = {txt = "quest.type."..questType..".succeed", context={count = curr}}

    if curr >= goal then
      career_modules_questManager.addCompleteQuest(quest)
    end
  end
end

local function onPaidRefuelling()
  onUpdateProgress()
end

M.onPaidRefuelling = onPaidRefuelling

return M