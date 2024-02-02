local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function onUpdateProgress()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end
  --Count stars

  local unlockData = career_modules_spawnPoints.getUnlockedSpawnpointsData()
  local levelCount = {}
  local total = 0
  for lvl, sList in pairs(unlockData) do
    levelCount[lvl] = 0
    for _, unlocked in pairs(sList) do
      levelCount[lvl] = levelCount[lvl] + (unlocked and 1 or 0)
      local temp_total = total + (unlocked and 1 or 0)
      total = temp_total
    end
  end

  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local goal = quest.questTypeData.unlockCount
    local curr = quest.questTypeData.level and levelCount[quest.questTypeData.level] or total
    if quest.tempData.progress and quest.tempData.progress.currValue ~= curr then  quest.userData.progressTimestamp = os.time() end
    quest.tempData.progress = { {
        type = "progressBar",
        minValue = 0,
        currValue = curr,
        maxValue = goal,
        label = {txt = "quest.type."..questType..".progressBarLabel", context={count = curr, goal = goal}},
        percentage = curr / goal * 100,
        done = curr >= goal
      }
    }
    quest.tempData.title = {txt = "quest.type."..questType..".title", context={goal = goal}}
    quest.tempData.goalReached = {txt = "quest.type."..questType..".succeed", context={count = curr}}
    quest.description = "quest.type."..questType..".description"
    if curr >= goal then
      career_modules_questManager.addCompleteQuest(quest)
      career_modules_logbook.genericInfoUnlocked(
        "levels.west_coast_usa.info.title",
        "level.west_coast_usa.info.logbookEntry",
        quest.logbookFile,
        nil,
        nil,
        'unlock'
        )
    end
  end
end

local function onSpawnPointUnlocked(spawnPoint)
  onUpdateProgress()
end

M.onUpdateProgress = onUpdateProgress
M.onSpawnPointUnlocked = onSpawnPointUnlocked

return M