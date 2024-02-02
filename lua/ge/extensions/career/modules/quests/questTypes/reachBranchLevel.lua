local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)


local function onUpdateProgress(attributeName)
  local quests = career_modules_questManager.getActiveQuestsByType(questType)
  for _, quest in ipairs(quests) do
    local currBranchId = quest.questTypeData.branchId
    local branchInfo = career_branches.getBranchById(currBranchId)
    if not attributeName or attributeName == branchInfo.attributeKey then
      local currentXp = career_modules_playerAttributes.getAttribute(currBranchId).value or -1
      local currLevel  = career_branches.getBranchLevel(currBranchId)

      local targetLevel = quest.questTypeData.level
      local minXp = branchInfo.levels[targetLevel-1].requiredValue
      local maxXp = branchInfo.levels[targetLevel  ].requiredValue

      if currentXp >= maxXp then
        quest.userData.progressTimestamp = os.time()
        career_modules_questManager.addCompleteQuest(quest)
        currentXp = maxXp
      end
      if currentXp < minXp then
        -- quest shouldnt be active?
        log("E","","This quest shouldnt be active...")
      end

      quest.tempData.title = {txt = "quest.type."..questType..".title", context={goal = targetLevel, branch = branchInfo.name}}
      quest.tempData.goalReached = {txt = "quest.type."..questType..".succeed", context={level = currLevel, branch = branchInfo.name}}
      quest.description = {txt = "quest.type."..questType..".description", context = {branch = branchInfo.name, branchDescription = branchInfo.description}}
      quest.logbookFile = branchInfo.questCover
      quest.tempData.progress = { {
        type = "progressBar",
        minValue = minXp,
        currValue = currentXp,
        maxValue = maxXp,
        label = {txt = "quest.type."..questType..".progressBarLabel", context={maxXp = maxXp, currentXp = currentXp, branch = branchInfo.name}},
        done = currentXp >= maxXp,
        }
      }
    end
  end
end
M.onUpdateProgress = onUpdateProgress
M.onPlayerAttributesChanged = function(attributeName)
  M.onUpdateProgress(attributeName)
end
return M