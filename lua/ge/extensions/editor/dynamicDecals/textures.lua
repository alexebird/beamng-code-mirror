-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
M.dependencies = {
  "editor_api_dynamicDecals",
  "editor_dynamicDecals_browser",
  "editor_dynamicDecals_layerTypes_decal",
  "editor_dynamicDecals_docs",
}
local logTag = "editor_dynamicDecals_textures"
local im = ui_imgui

-- reference to the editor tool, set in init()
local tool = nil
-- reference to the dynamics decal api
local api = nil
local browser = nil
local decal = nil
local docs = nil

local decalTextureTextFilter = im.ImGuiTextFilter()
local textFilterWidth = 200

local texturesDirectoryPath = "/art/dynamicDecals/textures"
local textureFiles = nil

local contextMenuTexturePath = ""

local function checkFilter_decalTexture(dirName, fileName, extension)
  -- Filter out all files that start with an underscore.
  if fileName:startswith("_") then
    return false
  end
  local basename = fileName:match("(.+)%..+")
  if im.ImGuiTextFilter_PassFilter(decalTextureTextFilter, basename) then
    return true
  end
  return false
end

local openPopup = false

local function browserTabGui()
  if im.BeginPopup("TextureContextMenuPopup") then
    if im.Button("Set as decal color texture") then
      api.setDecalTexturePath("color", contextMenuTexturePath)
      decal.checkColorDecalTexturesSdfCompatible()
      im.CloseCurrentPopup()
    end
    if im.Button("Set as decal alpha texture") then
      api.setDecalTexturePath("alpha", contextMenuTexturePath)
      im.CloseCurrentPopup()
    end
    im.EndPopup()
  end

  if openPopup then
    im.OpenPopup("TextureContextMenuPopup")
    openPopup = false
  end

  local spaceAvailable = im.GetContentRegionAvail()

  im.BeginChild1("DecalTexturesBrowserChild", im.ImVec2(spaceAvailable.x, spaceAvailable.y - (2 * im.GetStyle().ItemSpacing.y +  1 * math.ceil(im.GetFontSize()))), true)
  local thumbnailSize = editor.getPreference("dynamicDecalsTool.textureBrowser.texturePreviewSize")

  local loadImagesCount = editor.getPreference("dynamicDecalsTool.textureBrowser.loadImagesPerFrameCount")
  -- virtual scrolling testing
  local cPos = im.GetCursorPos()
  local scrollY = im.GetScrollY()
  for _, filePath in ipairs(textureFiles) do

    local dirName, fileName, extension = path.split(filePath)
    if checkFilter_decalTexture(dirName, fileName, extension) then

      -- virtual scrolling
      if editor.getPreference("dynamicDecalsTool.textureBrowser.enableVirtualScrolling") then
        local imagePosY = im.GetCursorPosY()
        if (cPos.x + scrollY - thumbnailSize) > imagePosY or imagePosY > (cPos.x + scrollY + spaceAvailable.y) then
          im.Button("##" .. filePath, im.ImVec2(thumbnailSize, thumbnailSize))
        else

          if im.ImTextureHandlerIsCached(filePath) then
            im.ImageButton(string.format("##textures_imageButton_%s", filePath), editor.getTempTextureObj(filePath).texId, im.ImVec2(thumbnailSize, thumbnailSize), im.ImVec2Zero, im.ImVec2One)
          else
            if loadImagesCount > 0 then
              im.PushID1("Texture_" .. tostring(k))
              im.ImageButton(string.format("##textures_imageButton_%s", filePath), editor.getTempTextureObj(filePath).texId, im.ImVec2(thumbnailSize, thumbnailSize), im.ImVec2Zero, im.ImVec2One)
              im.PopID()
              loadImagesCount = loadImagesCount - 1
            else
              im.Button("##" .. filePath, im.ImVec2(thumbnailSize, thumbnailSize))
            end
          end
        end
      else
        if im.ImTextureHandlerIsCached(filePath) then
          im.ImageButton(string.format("##textures_imageButton_%s", filePath), editor.getTempTextureObj(filePath).texId, im.ImVec2(thumbnailSize, thumbnailSize), im.ImVec2Zero, im.ImVec2One)
        else
          if loadImagesCount > 0 then
            im.PushID1("Texture_" .. tostring(k))
            im.ImageButton(string.format("##textures_imageButton_%s", filePath), editor.getTempTextureObj(filePath).texId, im.ImVec2(thumbnailSize, thumbnailSize), im.ImVec2Zero, im.ImVec2One)
            im.PopID()
            loadImagesCount = loadImagesCount - 1
          else
            im.Button("##" .. filePath, im.ImVec2(thumbnailSize, thumbnailSize))
          end
        end
      end

      if im.IsItemClicked(1) then
        contextMenuTexturePath = filePath
        openPopup = true
      end

      if im.BeginDragDropSource(im.DragDropFlags_SourceAllowNullID) then
        local payload = ffi.new("char[256]")
        ffi.copy(payload, filePath, ffi.sizeof"char[256]")
        im.SetDragDropPayload("DynDecalTextureDrapDrop", payload, ffi.sizeof"char[256]")
        im.TextUnformatted(filePath)
        im.Image(editor.getTempTextureObj(filePath).texId, im.ImVec2(64, 64), im.ImVec2Zero, im.ImVec2One)
        im.EndDragDropSource()
      end
      im.tooltip(string.format("%s\nRMB to open context menu", fileName))
      im.SameLine()
      if im.GetContentRegionAvailWidth() < thumbnailSize then
        im.NewLine()
      end
    end

  end
  im.EndChild()

  if editor.uiIconImageButton(editor.icons.help_outline, tool.getIconSizeVec2(), nil, nil, nil, "DynamicDecals_Browser_Textures_Docs_Button") then
    docs.selectSection({"Browser", "Textures"})
  end
  im.tooltip("Docs")
  im.SameLine()

  if editor.uiIconImageButton(editor.icons.settings, tool.getIconSizeVec2(), nil, nil, nil, "DynamicDecals_Browser_Textures_Prefs_Button") then
    editor.showPreferences("dynamicDecalsTool")
  end
  im.tooltip("Preferences")
  im.SameLine()

  if editor.uiIconImageButton(editor.icons.folder, tool.getIconSizeVec2(), nil, nil, nil, "DynamicDecals_Browser_Textures_OpenDirectory_Button") then
    Engine.Platform.exploreFolder(texturesDirectoryPath)
  end
  im.tooltip("Open Textures Directory")
  im.SameLine()

  cPos = im.GetCursorPos()
  local textSpace = im.GetContentRegionAvailWidth() - (im.GetStyle().ItemSpacing.x + textFilterWidth)
  im.PushTextWrapPos(textSpace)
  im.TextUnformatted("Hover over a texture and hit the right mouse button in order to open a context menu.")
  im.SetCursorPos(im.ImVec2(cPos.x + textSpace, cPos.y))
  editor.uiInputSearchTextFilter("Texture Filter", decalTextureTextFilter, textFilterWidth)
  im.PopTextWrapPos()
end

local function registerEditorPreferences(prefsRegistry)
  prefsRegistry:registerSubCategory("dynamicDecalsTool", "textureBrowser", nil, {
    {loadImagesPerFrameCount = {"int", 3, "Number of images that are loaded per frame by the decal textures browser."}},
    {enableVirtualScrolling = {"bool", true, "If enabled only visible textures will be loaded in the decal texture browser."}},
    {texturePreviewSize = {"float", 128, "Max width of the decal texture thumbnails in the decal textures browser", nil, 32, 512}},
  })
end

local function editorPreferenceValueChanged(path, value)

end

local function textureFilesSortFn(a, b)
  local _, fileNameA, _ = path.split(a)
  local _, fileNameB, _ = path.split(b)
  return string.lower(fileNameA) < string.lower(fileNameB)
end

local function reloadTextureFiles()
  textureFiles = FS:findFiles(texturesDirectoryPath, "*.png", -1, false, false)
  table.sort(textureFiles, textureFilesSortFn)
end

local function texturesDocsGui(docsSection)
  im.PushTextWrapPos(im.GetContentRegionAvailWidth())
  im.TextUnformatted([[
The Textures tab serves as a comprehensive directory of all accessible textures.

In this tab, you'll find an inventory of textures for your design needs.
These textures can be utilized as color or alpha maps, adding depth and complexity to your decals.

The Textures tab not only offers a pre-existing selection but also accommodates your creativity.
You can easily incorporate your own textures, allowing you to personalize your designs.

A right-click on a texture opens up a context menu, simplifying the process of setting a texture to a designated property.
  ]])
  im.PopTextWrapPos()
end

local function setup(tool_in)
  tool = tool_in
  api = extensions.editor_api_dynamicDecals
  browser = extensions.editor_dynamicDecals_browser
  decal = extensions.editor_dynamicDecals_layerTypes_decal
  docs = extensions.editor_dynamicDecals_docs

  reloadTextureFiles()

  browser.registerBrowserTab("Textures", browserTabGui, 10)
  docs.register({section = {"Browser", "Textures"}, guiFn = texturesDocsGui})

  FS:directoryCreate(texturesDirectoryPath)
end

local function onFileChanged(filepath, filetype)
  local dir, filename, ext = path.split(filepath)
  if dir == texturesDirectoryPath then
    reloadTextureFiles()
  end
end

M.getTexturesDirectoryPath = function()
  return texturesDirectoryPath .. '/'
end

M.onGui = onGui
M.registerEditorPreferences = registerEditorPreferences
M.editorPreferenceValueChanged = editorPreferenceValueChanged
M.reloadTextureFiles = reloadTextureFiles
M.setup = setup
M.onFileChanged = onFileChanged

return M