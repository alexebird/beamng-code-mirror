local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function onUpdateProgress()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot then return end

  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    local missionId = quest.questTypeData.missionId
    local missionData = jsonReadFile(savePath.."/career/missions/"..missionId..".json")
    if missionData then
      if quest.questTypeData.condition == "complete" then
        if missionData.progress.default.aggregate.completed then 
          quest.userData.progressTimestamp = os.time()
          career_modules_questManager.addCompleteQuest(quest)
        end
      elseif quest.questTypeData.condition == "pass" then
        if missionData.progress.default.aggregate.passed then 
          quest.userData.progressTimestamp = os.time()
          career_modules_questManager.addCompleteQuest(quest)
        end
      end

      quest.tempData.title = {txt = "quest.type."..quest.questTypeData.condition.."Mission.goal", context={mission = missionId}}
      quest.tempData.goalReached = {txt = "quest.type."..quest.questTypeData.condition.."Mission.succeed", context={mission = missionId}}
      quest.description = "quest.type."..questType..".description"
      quest.tempData.progress = { {
          type = "checkbox",
          done = quest.userData.status == "completed",
          label = "Dont know what to put in here",
          percentage = quest.userData.status == "completed" and 100 or 0,
        }
      }
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