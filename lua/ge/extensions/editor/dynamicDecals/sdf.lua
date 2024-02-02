-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.dependencies = {
  "editor_api_dynamicDecals",
}
local logTag = "editor_dynamicDecals_sdf"
local im = ui_imgui

-- reference to the editor tool, set in setup()
local tool = nil
local api = nil

local sdfPropertiesWindowName = logTag .. "_sdfPropertiesWindow"

local function sdfPropertiesWindow()
  if editor.beginWindow(sdfPropertiesWindowName, "Dynamic Decals - SDF") then

  end
  editor.endWindow()
end

local function sectionGui(guiId)
  im.TextUnformatted("SDF")
  sdfPropertiesWindow()
end

local function registerEditorPreferences(prefsRegistry)
  prefsRegistry:registerSubCategory("dynamicDecalsTool", "sdf", nil, {
    -- {doNotShowAgainSdfIntro = {"bool", false, "Do not pop up SDF intro modal again"}},
  })
end

local function editorPreferenceValueChanged(path, value)

end

local function setup(tool_in)
  tool = tool_in
  api = extensions.editor_api_dynamicDecals

  -- tool.registerSection("SDF", sectionGui, 35, false, {})

  -- editor.registerWindow(sdfPropertiesWindowName, im.ImVec2(550, 550))
end

M.registerEditorPreferences = registerEditorPreferences
M.editorPreferenceValueChanged = editorPreferenceValueChanged
M.setup = setup

return M