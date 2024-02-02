-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

local im = ui_imgui
local ffi = require("ffi")

local formattedQuests = {}
local startDebugWindow = false

local stateToColor = {
  locked = im.ImVec4(1,0.5,0.5,0.8),
  active = im.ImVec4(0.5,1,0.5,0.8),
  completed = im.ImVec4(0.5,0.5,1,0.8),
  claimed = im.ImVec4(1,1,0.5,0.8),
  none = im.ImVec4(1,1,1,0.8)
}
local imVec16x16 = im.ImVec2(16,16)

local function onUpdate()
  if startDebugWindow then
    im.SetNextWindowSize(im.ImVec2(300, 500), im.Cond_FirstUseEver)
    im.Begin("Quest Debug")
    if im.Button("Refresh") then
      formattedQuests = gameplay_quests_questManager.getUIFormattedQuests()
    end
    im.SameLine()
    if im.Button("Unlock All") then
      gameplay_quests_questManager.d_unlockAllQuest()
      formattedQuests = gameplay_quests_questManager.getUIFormattedQuests()
    end
    im.SameLine()
    if im.Button("Complete All") then
      gameplay_quests_questManager.d_completeAllQuest()
      formattedQuests = gameplay_quests_questManager.getUIFormattedQuests()
    end
    im.SameLine()
    if im.Button("Claim All") then
      gameplay_quests_questManager.d_claimAllQuest()
      formattedQuests = gameplay_quests_questManager.getUIFormattedQuests()
    end
    if im.CollapsingHeader1("Quest List") then
      im.Separator()
      im.NextColumn()

      im.Columns(2, "quest options")
      for _, quest in ipairs(formattedQuests) do
        if editor and editor.uiIconImage then
          editor.uiIconImage(editor.icons.star, imVec16x16 ,stateToColor[quest.status or 'none'])
          im.SameLine()
        end
        im.Text(quest.id)
        im.TextColored(stateToColor[quest.status or 'none'], "Status: " .. quest.status)
        if im.Button("Dump quest##"..quest.id) then
          dump(quest)
          dumpz(gameplay_quests_questManager.getQuestById(quest.id), 3)
        end
        im.SameLine()
        im.NextColumn()
        if quest.status ~= "locked" then im.BeginDisabled() end
        if im.Button("Unlock" .. " (" .. quest.id .. ")") then
          gameplay_quests_questManager.d_unlockQuest(quest.id)
          formattedQuests = gameplay_quests_questManager.getUIFormattedQuests()
        end
        if quest.status ~= "locked" then im.EndDisabled() end
        if quest.status ~= "active" then im.BeginDisabled() end
        if im.Button("Complete".. " (" .. quest.id .. ")") then
          gameplay_quests_questManager.d_completeQuest(quest.id)
          formattedQuests = gameplay_quests_questManager.getUIFormattedQuests()
        end
        if quest.status ~= "active" then im.EndDisabled() end
        if quest.status ~= "completed" then im.BeginDisabled() end
        if im.Button("Claim".. " (" .. quest.id .. ")") then
          gameplay_quests_questManager.d_claimQuest(quest.id)
          formattedQuests = gameplay_quests_questManager.getUIFormattedQuests()
        end
        if quest.status ~= "completed" then im.EndDisabled() end
        im.Separator()
        im.NextColumn()
      end
    end
  end
end

local function onExtensionLoaded()
end

local function openQuestDebug()
  startDebugWindow = not startDebugWindow
  formattedQuests = gameplay_quests_questManager.getUIFormattedQuests()
end

M.onExtensionLoaded = onExtensionLoaded
M.onUpdate = onUpdate
M.openQuestDebug = openQuestDebug

M.onEditorInitialized = onEditorInitialized
M.onEditorRegisterPreferences = onEditorRegisterPreferences
M.onEditorGui = onEditorGui

return M