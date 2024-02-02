-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
--[[
M.dependencies = {'career_career'}

local allQuestsData = {}

local function init() end

local function setCurrentSaveSlot()
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not savePath then return end
  --gameplay_quests_progress.setSavePath(savePath .. "/career/quests/")
  --gameplay_quests_quests.reloadCompleteQuestSystem()
end

local function onExtensionLoaded()
  if not career_career.isActive() then return false end
  setCurrentSaveSlot()
end

local function onExtensionUnloaded()
  --gameplay_quests_progress.setSavePath(nil)
  --gameplay_quests_quests.reloadCompleteQuestSystem()
end

-- this should only be loaded when the career is active
local function onSaveCurrentSaveSlot(oldSaveDate)
  local saveSlot, savePath = career_saveSystem.getCurrentSaveSlot()
  if not saveSlot or not savePath then return end
  --gameplay_quests_progress.setSavePath(savePath .. "/career/quests/")
  for id, dirtyDate in pairs(allQuestsData) do
    if dirtyDate > oldSaveDate then
      --gameplay_quests_progress.saveQuestSaveData(id, dirtyDate)
    end
  end
end

local function setQuestInfo(id, dirtyDate)
  allQuestsData[id] = dirtyDate
end

local function cacheQuestData(id, dirtyDate)
  setQuestInfo(id, dirtyDate and dirtyDate or os.date("!%Y-%m-%dT%XZ"))
end

local function onMissionLoaded(id, dirtyDate)
  cacheQuestData(id, dirtyDate)
end

local function saveQuest(id)
  cacheQuestData(id)
  career_saveSystem.saveCurrent()
end

local function onAnyQuestChanged(state, quest)
  if quest and state == "stopped" then
    saveQuest(quest.id)
  end
end

M.cacheQuestData = cacheQuestData
M.onMissionLoaded = onMissionLoaded
M.saveQuest = saveQuest

M.onSaveCurrentSaveSlot = onSaveCurrentSaveSlot
M.onExtensionLoaded = onExtensionLoaded
M.onExtensionUnloaded = onExtensionUnloaded
M.onAnyQuestChanged = onAnyQuestChanged
]]
return M