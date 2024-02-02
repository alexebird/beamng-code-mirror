local M = {}
local _, questType = path.splitWithoutExt(debug.getinfo(1).source)

local function onUpdateProgress()
  local veh = be:getPlayerVehicle(0)
  local model = veh and veh:getJBeamFilename() or nil
  for _, quest in ipairs(career_modules_questManager.getActiveQuestsByType(questType)) do
    if quest.userData.status == "active" then
      local goal = quest.questTypeData.targetModel
      quest.tempData.progress = { {
          type = "checkBox",
          done = model == goal,
          label = "nothing yet",
        }
      }
      quest.tempData.title = {txt = "Switch to any vehicle of the model " .. goal}
      quest.tempData.goalReached = {txt = "You switched to the correct vehicle."}

      if model == goal then
        quest.userData.progressTimestamp = os.time()
        career_modules_questManager.addCompleteQuest(quest)
      end
    end
  end
end


local function onVehicleSwitched(oldid, newid, player)
  if player==0 then
    onUpdateProgress()
  end
end

M.onUpdateProgress = onUpdateProgress
M.onAnyMissionChanged = onAnyMissionChanged

return M