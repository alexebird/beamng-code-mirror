-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.dependencies = {
  "editor_api_dynamicDecals",
  "editor_dynamicDecals_helper",
}
local logTag = "editor_dynamicDecals_settings"
local im = ui_imgui

-- reference to the editor tool, set in setup()
local tool = nil
-- reference to the dynamics decal api
local api = nil
local helper = nil

local uvLayerNamesCharPtr = nil

local materialsMapMaterialNameToMaterialIdx -- key: material name, value: material id
local materialsMapMaterialIxToArrayIdx -- key: material name, value: material id
local materialNames -- lua string table
local materialNamesCharPtr -- ffi string table

local shapeMeshes = nil
local meshesFilter = im.ImGuiTextFilter()

local textureResolutionNamesCharPtr
local textureResolutionXId = 1
local textureResolutionYId = 1

local function updateMaterials()
  if not api then return end
  local vehicleObj = be:getPlayerVehicle(0)
  local vehicleName = (vehicleObj and vehicleObj.jbeam or "")
  local mNames = api.getShapeMaterialNames()
  materialsMapMaterialNameToMaterialIdx = {}
  materialsMapMaterialIxToArrayIdx = {}
  materialNames = {}
  local i = 0
  for materialId, materialName in pairs(mNames) do
    table.insert(materialNames, materialName)
    materialsMapMaterialNameToMaterialIdx[materialName] = materialId
    materialsMapMaterialIxToArrayIdx[materialId] = i
    i = i + 1
  end
  materialNamesCharPtr = im.ArrayCharPtrByTbl(materialNames)
end

local function sectionGui(guiId)
  if im.Checkbox("Enable", editor.getTempBool_BoolBool(api.getEnabled())) then
    api.toggleEnabled()
  end
  im.Separator()

  local enabled = (bit.band(api.getSettings(), api.settingsFlags.UseMousePos.value) == api.settingsFlags.UseMousePos.value)
  if im.Checkbox(api.settingsFlags.UseMousePos.name, editor.getTempBool_BoolBool(enabled)) then
    api.toggleSetting(api.settingsFlags.UseMousePos.value)
  end
  helper.iconTooltip(api.settingsFlags.UseMousePos.description, true)

  if enabled then im.BeginDisabled() end
  local widgetId = "dynamicDecals_settings_cursorPosition"
  local width = (im.GetContentRegionAvailWidth() - im.GetStyle().ItemSpacing.x) / 2
  im.PushItemWidth(width)
  local cursorPosition = api.getCursorPosition()
  local changed = false
  if im.SliderFloat(string.format("##%s_x", widgetId), editor.getTempFloat_NumberNumber(cursorPosition.x), 0, 1, "%.3f") then
    local newVal = editor.getTempFloat_NumberNumber()
    newVal = math.min(newVal, 1)
    newVal = math.max(newVal, 0)
    cursorPosition.x = newVal
    changed = true
  end
  im.PopItemWidth()

  im.SameLine()
  im.PushItemWidth(width)
  if im.SliderFloat(string.format("##%s_y", widgetId), editor.getTempFloat_NumberNumber(cursorPosition.y), 0, 1, "%.3f") then
    local newVal = editor.getTempFloat_NumberNumber()
    newVal = math.min(newVal, 1)
    newVal = math.max(newVal, 0)
    cursorPosition.y = newVal
    changed = true
  end
  im.PopItemWidth()
  if changed then
    api.setCursorPosition(cursorPosition)
  end
  if enabled then im.EndDisabled() end

  im.TextUnformatted("UV Layer")
  im.SameLine()
  im.PushItemWidth(im.GetContentRegionAvailWidth())
  if im.Combo1("##uvLayer", editor.getTempInt_NumberNumber(api:getUvLayer()), uvLayerNamesCharPtr) then
    api.setUvLayer(editor.getTempInt_NumberNumber())
  end
  im.tooltip("Changing UV layer will reproject all layers.\nDepending on the amount of layers this might take some time.")
  im.PopItemWidth()

  im.TextUnformatted("Material")
  im.SameLine()
  im.PushItemWidth(im.GetContentRegionAvailWidth())
  if im.Combo1("Material Names", editor.getTempInt_NumberNumber(materialsMapMaterialIxToArrayIdx[api.getMaterialIdx()]), materialNamesCharPtr) then
    if materialsMapMaterialNameToMaterialIdx[materialNames[editor.getTempInt_NumberNumber() + 1]] then
     api.setMaterialIdx(materialsMapMaterialNameToMaterialIdx[materialNames[editor.getTempInt_NumberNumber() + 1]])
    end
  end
  im.PopItemWidth()

  if im.Button("Update materials") then
    updateMaterials()
  end

  im.Separator()

  if im.TreeNodeEx1("Meshes", im.TreeNodeFlags_DefaultOpen) then
    if im.Button("Enable all") then
      for id, data in pairs(shapeMeshes) do
        data.enabled = true
        api.setMeshEnabledState(id, true)
      end
    end
    im.SameLine()
    if im.Button("Disable all") then
      for id, data in pairs(shapeMeshes) do
        data.enabled = false
        api.setMeshEnabledState(id, false)
      end
    end
    im.SameLine()
    editor.uiInputSearchTextFilter("Meshes Filter", meshesFilter, im.GetContentRegionAvailWidth())
    im.BeginChild1("##MeshesChild", im.ImVec2(0, 280), true)
    for id, data in pairs(shapeMeshes) do
      if im.ImGuiTextFilter_PassFilter(meshesFilter, data.name) then
        if im.Checkbox(string.format("##shapeMesh_%d", id), editor.getTempBool_BoolBool(data.enabled)) then
          local newValue = editor.getTempBool_BoolBool()
          data.enabled = newValue
          api.setMeshEnabledState(id, newValue)
        end
        im.SameLine()
        im.TextUnformatted(data.name)
      end
    end
    im.EndChild()
    im.TreePop()
  end

  im.Separator()
  if im.TreeNodeEx1("Texture Resolution", im.TreeNodeFlags_DefaultOpen) then
    local textureResolution = api.getTextureResolution()
    im.TextUnformatted(string.format("Current x: %d y: %d", textureResolution.x, textureResolution.y))

    im.Dummy(im.ImVec2(0,4))
    im.TextUnformatted("x")
    im.SameLine()
    im.PushItemWidth(im.GetContentRegionAvailWidth())
    if im.Combo1("##textureResolution_x", editor.getTempInt_NumberNumber(textureResolutionXId), textureResolutionNamesCharPtr) then
      textureResolutionXId = editor.getTempInt_NumberNumber()
    end
    im.PopItemWidth()
    im.TextUnformatted("y")
    im.SameLine()
    im.PushItemWidth(im.GetContentRegionAvailWidth())
    if im.Combo1("##textureResolution_y", editor.getTempInt_NumberNumber(textureResolutionYId), textureResolutionNamesCharPtr) then
      textureResolutionYId = editor.getTempInt_NumberNumber()
    end
    im.PopItemWidth()
    if im.Button("Apply Changes##applyTextureResolution") then
      api.setTextureResolution(Point2I(api.textureResolutions[textureResolutionXId + 1].value, api.textureResolutions[textureResolutionYId + 1].value))
    end
    im.tooltip("Changing the texture resolution will reproject all layers.\nDepending on the amount of layers this might take some time.")
    local textureResolution = api.getTextureResolution()
    if textureResolution.x ~= api.textureResolutions[textureResolutionXId + 1].value or textureResolution.y ~= api.textureResolutions[textureResolutionYId + 1].value then
      im.SameLine()
      im.TextColored(editor.color.warning.Value , "Resolution has changed.")
    end
    im.TreePop()
  end

  if im.Button("Show dynamic decals preferences") then
    editor.showPreferences("dynamicDecalsTool")
  end
end

local function registerEditorPreferences(prefsRegistry)
  -- prefsRegistry:registerSubCategory("dynamicDecalsTool", "moduleName", nil, {

  -- })
end

local function editorPreferenceValueChanged(path, value)

end

local tblx = {}
local function setup(tool_in)
  tool = tool_in
  api = extensions.editor_api_dynamicDecals
  helper = extensions.editor_dynamicDecals_helper

  tblx = {"0", "1"}
  uvLayerNamesCharPtr = im.ArrayCharPtrByTbl(tblx)

  tblx = {}
  for _, textureRes in ipairs(api.textureResolutions) do
    table.insert(tblx, textureRes.name)
  end
  textureResolutionNamesCharPtr = im.ArrayCharPtrByTbl(tblx)

  if api.ready then
    local textureResolution = api.getTextureResolution()
    for k,v in pairs(api.textureResolutions) do
      if textureResolution.x == v.value then
        textureResolutionXId = k - 1
      end
      if textureResolution.y == v.value then
        textureResolutionYId = k - 1
      end
    end

    updateMaterials()
    shapeMeshes = api.getShapeMeshes()
  end

  tool.registerSection("Settings", sectionGui, 1040, false, {})
end

local function getUsedMaterialNames()
  local res = {}

  for _, id in ipairs(api.getMaterialIndices()) do
    table.insert(res, materialNames[id+1])
  end

  return res
end

M.updateMaterials = updateMaterials
M.getUsedMaterialNames = getUsedMaterialNames

M.registerEditorPreferences = registerEditorPreferences
M.editorPreferenceValueChanged = editorPreferenceValueChanged
M.setup = setup

return M