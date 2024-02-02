-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.dependencies = {
  "editor_api_dynamicDecals"
}
local logTag = "editor_dynamicDecals_notification"
local im = ui_imgui

-- reference to the editor tool, set in setup()
local tool = nil
-- reference to the dynamics decal api
local api = nil

local levels = {
  log = 1,
  warning = 2,
  error = 3
}
local colors = {
  [1] = im.ImColorByRGB(255,255,255,255), -- log
  [2] = im.ImColorByRGB(255,204,0,255), -- warning
  [3] = im.ImColorByRGB(255,0,0,255), -- error
}

local popupTitle = "Dynamic Decals Notifications"
local notifications = {}
local dirty = false

local function onGui()
  if im.BeginPopupModal(popupTitle, nil, im.WindowFlags_AlwaysAutoResize) then
    if tableSize(notifications) > 0 then
      for sectionName, sectionData in pairs(notifications) do

        if im.CollapsingHeader1(string.format("%s##NotificationSection", sectionName), im.TreeNodeFlags_DefaultOpen) then
          for k, notification in ipairs(sectionData) do
            if editor.uiIconImageButton(editor.icons.delete, im.ImVec2(tool.getIconSize(), tool.getIconSize()), nil, nil, nil, string.format("%s_%d", sectionName, k)) then
              table.remove(notifications[sectionName], k)
              if #notifications[sectionName] == 0 then notifications[sectionName] = nil end
            end
            im.tooltip("Remove notification")
            im.SameLine()
            im.TextColored(colors[notification.level].Value, string.format("%s - %s", notification.title, notification.msg))
          end
        end
      end

      im.Separator()
      if im.Button("Remove all") then
        notifications = {}
      end
      im.SameLine()
      if im.Button("Close") then
        im.CloseCurrentPopup()
      end
    else
      im.CloseCurrentPopup()
    end
    im.EndPopup()
  end

  if dirty then
    dirty = false
    im.OpenPopup(popupTitle)
  end
end

local function registerEditorPreferences(prefsRegistry)
  -- prefsRegistry:registerSubCategory("dynamicDecalsTool", "moduleName", nil, {

  -- })
end

local function editorPreferenceValueChanged(path, value)

end

local function setup(tool_in)
  tool = tool_in
  api = extensions.editor_api_dynamicDecals

  tool.registerOnEditorGuiFn("notification", onGui)
end

local function add(section, title, msg, level)
  if not notifications[section] then notifications[section] = {} end
  table.insert(notifications[section], {section=section, title=title, msg=msg, level=level or levels.log})
  dirty = true
end

M.add = add
M.levels = levels

M.onGui = onGui
M.registerEditorPreferences = registerEditorPreferences
M.editorPreferenceValueChanged = editorPreferenceValueChanged
M.setup = setup

return M