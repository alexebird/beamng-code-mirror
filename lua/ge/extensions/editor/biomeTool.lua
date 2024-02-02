-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}
local u_32_max_int = 4294967295
local logTag = 'biome_tool'
local toolWindowName = "biomeTool"
local editModeName = "Edit Biome"
local imgui = ui_imgui
local ffi = require('ffi')
local windows = {}
local currentWindow = {}
local testingWindow
local allFiles = {}
local searchText = imgui.ArrayChar(256, "")
local searchText_Items_Modify = imgui.ArrayChar(256, "")
local searchText_Meshes_Generate = imgui.ArrayChar(256, "")
local sinkRadiusText = imgui.ArrayChar(256, "1")

local roadRiverGui = extensions.editor_roadRiverGui
local mouseInfo = {}
local nameText = imgui.ArrayChar(1024, "")
local groupItemsBoolPtr = imgui.BoolPtr(1)
local selectAllBoolPtr = imgui.BoolPtr(0)
local areaGlobalIndex = 1
local layerGlobalIndices = {}
local selectAreaPopupIndex = imgui.IntPtr(0)
local isDrawingLassoArea = false
local valueInspector = require("editor/api/valueInspector")()

local forest

local layerCreateMtlComboIndex = imgui.IntPtr(0)
local layerCreateMtlComboItemsTbl = {}
local layerCreateMtlComboItems = imgui.ArrayCharPtrByTbl(layerCreateMtlComboItemsTbl)

local createLayerTypeIndex = imgui.IntPtr(1)

local layerDeleteComboIndex = imgui.IntPtr(0)
local layerDeleteMtlComboItemsTbl = {}
local layerDeleteMtlComboItems = imgui.ArrayCharPtrByTbl(layerDeleteMtlComboItemsTbl)

local areaType_enum = {
  lasso = 0,
  terrain_material = 1
}

local layerType_enum = {
  lasso = 0,
  terrain_material = 1,
  random = 2,
  any = 3
}

local lassoBlending_enum = {
  add = 0,
  replace = 1,
}

local enum_forestObjType = {
  forestBrush = 1,
  forestBrushElement = 2,
  forestItemData = 3
}

local fieldInfoTemplate = {
  { name = "RenderPriority", label = "Render priority", val = 0, type = "int", layerType = layerType_enum.any},
  { name = "TerrainMaterial", label = "Terrain material", val = 1, type = "int", layerType = layerType_enum.any},
  { name = "ForestDensity", label = "Forest density (0 to 1)", val = 0, type = "float", layerType = layerType_enum.any},
  { name = "SlopeInfluence", label = "Slope influence (-1 to 1)", val = 0, type = "float", layerType = layerType_enum.any},
  { name = "BordersFalloff", label = "Borders falloff (-1 to 1)", val = 0, type = "float", layerType = layerType_enum.any},
  { name = "VegetationFalloff", label = "Vegetation falloff (-1 to 1)", val = 0, type = "float", layerType = layerType_enum.any},

  --lasso only
  { name = "BlendingMethod", label = "Blending method", val = lassoBlending_enum.add, type = "int", layerType = layerType_enum.lasso},
  { name = "DeleteForest", label = "Delete forest", val = lassoBlending_enum.add, type = "bool", layerType = layerType_enum.lasso},

  --Random only
  { name = "RA_Size", label = "Random area size (0 to 1)", val = 0, type = "float", layerType = layerType_enum.random},
  { name = "RA_SizeVar", label = "Random area size variation (0 to 1)", val = 0, type = "float", layerType = layerType_enum.random},
  { name = "RA_Density", label = "Random area density (0 to 1)", val = 0, type = "float", layerType = layerType_enum.random},
  { name = "RA_Seed", label = "Random area seed", val = 0, type = "int", layerType = layerType_enum.random}
}

local fieldInfoTbl = {}

local areaListFilter = imgui.ImGuiTextFilter()
local var = {}
var.areas = {}
var.lassoAreas = {}
var.lassoPLNodes = {}
var.lassoPLLineSegments = {}
var.lassoHoveredNode = {}
var.lassoActionHoveredNodeIndex = nil
var.lassoActionSelectedNodeIndex = nil
var.lassoSelectionEnded = false
var.lassoSelectionItemsCalculated = false
var.mouseButtonHeldOnLassoNode = false
var.shouldRenderCompletionSphere = false
var.lassoDrawActionCompleted = false
var.lassoAreaSelectedNode = {}
var.selectedAreaID = nil
var.lassoAreasGroupedMeshTable = {}
var.isGroupMeshesEnabled = true
var.groupSelectedIndices_Modify = {}
var.itemsSelectedIndices_Modify = {}
var.groupSelectedIndices_Generate = {}
var.itemsSelectedIndices_Generate = {}
var.selectAllEnabled = false
var.selectedLayerID = nil
var.forestBrushGroup = {}
var.forestBrushSelectedItems = {}
var.buttonColor_active = imgui.GetStyleColorVec4(imgui.Col_ButtonActive)
var.buttonColor_inactive = imgui.GetStyleColorVec4(imgui.Col_Button)
var.forestBrushTool = nil


local function resetSelectedItemIndices(areaID)
  if var.groupSelectedIndices_Modify[areaID] then
    var.groupSelectedIndices_Modify[areaID] = {}
  end
end

local function resetSelectedGroupIndices(areaID)
  if var.itemsSelectedIndices_Modify[areaID] then
    var.itemsSelectedIndices_Modify[areaID] = {}
  end
end

local function getAreaByID(areaID)
  local area = nil
  if areaID == nil then return nil end
  for _, areaItem in ipairs(var.areas) do
    if areaItem.areaID == areaID then
      area = areaItem
      break
    end
  end
  return area
end

local function resetAreaGroupedItemCount(areaID)
  for _, entriesInfo in ipairs(var.lassoAreasGroupedMeshTable) do
    if entriesInfo.areaID == areaID then
      entriesInfo.meshEntries = {}
      break
    end
  end
end

local function findItemInGroupedMeshTbl(areaID, itemName)
  local entry = {areaID = nil, meshEntry = nil}
  for _, entriesInfo in ipairs(var.lassoAreasGroupedMeshTable) do
    if entriesInfo.areaID == areaID then
      entry.areaID = entriesInfo.areaID
      for _, meshEntry in ipairs(entriesInfo.meshEntries) do
        if meshEntry.shapeFilePath == itemName then
          entry.meshEntry = meshEntry
          break
        end
      end
      break
    end
  end
  return entry
end

local function getGroupMeshEntriesForArea(areaID)
  local meshEntries = {}
  for _, entriesInfo in ipairs(var.lassoAreasGroupedMeshTable) do
    if entriesInfo.areaID == areaID then
      meshEntries = entriesInfo.meshEntries
      break
    end
  end
  return meshEntries
end

local function findAreaInGroupedMeshTbl(areaID)
  local area = nil
  for _, areaItem in ipairs(var.lassoAreasGroupedMeshTable) do
    if areaItem.areaID == areaID then
      area = areaItem
    end
  end
  return area
end

local function incrementGroupedMeshCount(areaID, forestItem)
  local tblMeshEntry = findItemInGroupedMeshTbl(areaID, forestItem:getData():getShapeFile())
  if tblMeshEntry.areaID == nil then
    local meshEntry = {
      shapeFilePath = tostring(forestItem:getData():getShapeFile()),
      name = tostring(forestItem:getData():getName()),
      count = 1
    }
    local entryInfo = {
      areaID = areaID,
      meshEntries = {meshEntry}
    }
    table.insert(var.lassoAreasGroupedMeshTable, entryInfo)
  elseif tblMeshEntry.meshEntry == nil then
    local areaEntry = findAreaInGroupedMeshTbl(areaID)
    local meshEntry = {
      shapeFilePath = tostring(forestItem:getData():getShapeFile()),
      name = tostring(forestItem:getData():getName()),
      count = 1
    }
    table.insert(areaEntry.meshEntries, meshEntry)
  else
    tblMeshEntry.meshEntry.count = tblMeshEntry.meshEntry.count + 1
  end
end

local function groupItemsByMesh(areaID)
  local area = getAreaByID(areaID)
  if area then
    resetAreaGroupedItemCount(areaID)
    for _, item in ipairs(area.items) do
      incrementGroupedMeshCount(areaID, item)
    end
  end
end

local function calculateLassoSelectionOnArea(areaID)
  local area = getAreaByID(areaID)
  if area == nil then return end

  local lassoNodes2D = {}
  for _, node in ipairs(area.nodes) do
    table.insert(lassoNodes2D, Point2F(node.pos.x, node.pos.y))
  end

  local forestItems = var.forestData:getItemsPolygon(lassoNodes2D)
  if not forestItems then return end
  area.items = {}

  for _, item in ipairs(forestItems) do
    table.insert(area.items, item)
  end
  groupItemsByMesh(areaID)
end

local function getLassoNodeUnderCursor()
  local camPos = core_camera.getPosition()
  local ray = getCameraMouseRay()
  local rayDir = ray.dir
  local minNodeDist = u_32_max_int
  local hoveredNodeIndex = nil
  local hoveredNodeAreaID = nil

  for index, node in ipairs(var.lassoPLNodes) do
    local distNodeToCam = (node.pos - camPos):length()
    if distNodeToCam < minNodeDist then
      local nodeRayDistance = (node.pos - camPos):cross(rayDir):length() / rayDir:length()
      local sphereRadius = (camPos - node.pos):length() * roadRiverGui.nodeSizeFactor
      if nodeRayDistance <= sphereRadius then
        hoveredNodeAreaID = -1
        hoveredNodeIndex = index
        minNodeDist = distNodeToCam
      end
    end
  end

  -- If no hovered node found in lassoAction polygon then look for in lasso areas.
  if hoveredNodeIndex == nil then
    for _, areaInfo in ipairs(var.lassoAreas) do
      for index, node in ipairs(areaInfo.nodes) do
        local distNodeToCam = (node.pos - camPos):length()
        if distNodeToCam < minNodeDist then
          local nodeRayDistance = (node.pos - camPos):cross(rayDir):length() / rayDir:length()
          local sphereRadius = (camPos - node.pos):length() * roadRiverGui.nodeSizeFactor
          if nodeRayDistance <= sphereRadius then
            hoveredNodeAreaID = areaInfo.areaID
            hoveredNodeIndex = index
            minNodeDist = distNodeToCam
          end
        end
      end
    end
  end

  return hoveredNodeIndex == nil and nil or {index  = hoveredNodeIndex, areaID = hoveredNodeAreaID}
end

local function castRayDown(startPoint, endPoint)
  if not endPoint then
    endPoint = startPoint - vec3(0,0,100)
  end
  local res = Engine.castRay((startPoint + vec3(0,0,1)), endPoint, true, false)
  if not res then
    res = Engine.castRay((startPoint + vec3(0,0,100)), (startPoint - vec3(0,0,1000)), true, false)
  end
  return res
end

local function drawLassoLineSegmented(areaID, originNode, targetNode)
  local length = (originNode.pos - targetNode.pos):length()
  local segmentsCount = length / 4.0
  local directionVector = (targetNode.pos - originNode.pos):normalized()

  local lastPos = originNode.pos
  local lineSegments = {}
  for index = 1, segmentsCount + 1, 1 do
    local tempTarget = (index < segmentsCount) and (lastPos + (directionVector * 4.0)) or targetNode.pos
    local tempLineBegin = lastPos
    local tempLineEnd = tempTarget

    if originNode.isUpdated or targetNode.isUpdated then
      local rayCastBegin = castRayDown(lastPos + vec3(0,0,100))
      local rayCastEnd = castRayDown(tempTarget + vec3(0,0,100))
      if rayCastBegin then
        tempLineBegin = vec3(lastPos.x,lastPos.y,rayCastBegin.pt.z)
      end
      if rayCastEnd then
        tempLineEnd = vec3(tempTarget.x,tempTarget.y,rayCastEnd.pt.z)
      end
    else
      local areaLineSegments =  var.lassoPLLineSegments[areaID]
      if areaLineSegments and areaLineSegments[originNode.nodeID] then
        local currentLassoSegments = areaLineSegments[originNode.nodeID]
        if currentLassoSegments[index] then
          tempLineBegin = currentLassoSegments[index].startPos
          tempLineEnd = currentLassoSegments[index].endPos
        end
      end
    end

    if originNode.isUpdated or targetNode.isUpdated then
      local segment = {startPos = tempLineBegin, endPos = tempLineEnd}
      table.insert(lineSegments, segment)
    end
    local lineWidth = editor.getPreference("gizmos.general.lineThicknessScale") * 4

    local lineColor = ColorF(0,0,1,0.5)
    if var.selectedAreaID == areaID then lineColor = ColorF(0,1,0,0.5) end

    debugDrawer:drawLineInstance(tempLineBegin, tempLineEnd, lineWidth, lineColor, false)
    lastPos = lastPos + (directionVector * 4.0)
  end
  -- cache segments bw updated nodes so that we don't raycast on every frame
  -- when there is no update in node positions
  if originNode.isUpdated or targetNode.isUpdated then
    local areaLineSegments =  var.lassoPLLineSegments[areaID]
    if areaLineSegments == nil then areaLineSegments = {} end
    areaLineSegments[originNode.nodeID] = lineSegments
  end
end

local function getAreaLayerGlobalIdx(areaID)
  local layerIndex = 0
  local indexFound = false
  for _, layerGlobalIndexInfo  in ipairs(layerGlobalIndices) do
    if layerGlobalIndexInfo.areaID == areaID then
      layerIndex = layerGlobalIndexInfo.layerGlobalIndex
      indexFound = true
      break
    end
  end
  if not indexFound then
    table.insert(layerGlobalIndices, {areaID = areaID, layerGlobalIndex = 0})
  end
  return layerIndex
end

local function incAreaLayerGlobalIdx(areaID)
  local indexFound = false
  for _, layerGlobalIndexInfo  in ipairs(layerGlobalIndices) do
    if layerGlobalIndexInfo.areaID == areaID then
      layerGlobalIndexInfo.layerGlobalIndex = layerGlobalIndexInfo.layerGlobalIndex + 1
      indexFound = true
      break
    end
  end
  if not indexFound then
    table.insert(layerGlobalIndices, {areaID = areaID, layerGlobalIndex = 0})
  end
end

local function deleteLayer(areaID, layerID)
  for _, area in ipairs(var.areas) do
    if area.areaID == areaID then
      for index, layer in ipairs(area.layers) do
        if layer.layerID == layerID then
          table.remove(area.layers, index)
          break
        end
      end
      break
    end
  end
end

local function insertFieldInfo(areaID, layerID, fieldData)
  for _, fieldInfo in ipairs(fieldInfoTbl) do
    if fieldInfo.layerID == layerID and fieldInfo.areaID == areaID then
      table.insert(fieldInfo.fieldsData, fieldData)
    end
  end
end

local function getLayers(areaID)
  local layers = {}
  for _, area in ipairs(var.areas) do
    if area.areaID == areaID then
      layers = area.layers
      break
    end
  end
  return layers
end

local function getLayer(areaID, layerID)
  local layerInfo = nil
  for _, area in ipairs(var.areas) do
    if area.areaID == areaID then
      for _, layer in ipairs(area.layers) do
        if layer.layerID == layerID then
          layerInfo = layer
          break
        end
      end
      break
    end
  end
  return layerInfo
end

local function populateForestBrushes()
  var.forestBrushGroup = scenetree.findObject("ForestBrushGroup")

  --var.forestBrushElementNames = {}
  var.forestBrushes = {}
  --var.forestBrushesMap = {}
  for i = 0, var.forestBrushGroup:size() - 1 do
    local obj = var.forestBrushGroup:at(i)
    local internalName = obj:getInternalName()
    if internalName then
      local item = {
        id = obj:getId(),
        internalName = internalName,
        type = (obj:getClassName() == "ForestBrush") and enum_forestObjType.forestBrush or enum_forestObjType.forestBrushElement,
        elements = {},
        open = false,
        selected = false
      }
      table.insert(var.forestBrushes, item)
      --var.forestBrushesMap[item.internalName] = (i+1)
      --if item.type == var.enum_forestObjType.forestBrushElement then
      --  var.forestBrushElementNames[internalName] = true
      --end
    end
  end
end

local function addLayer(areaID, layerType, materialName)
  local layerID = nil
  for _, area in ipairs(var.areas) do
    if area.areaID == areaID then
      local layerIndex =  getAreaLayerGlobalIdx(area.areaID)
      incAreaLayerGlobalIdx(area.areaID)
      local layer = {
        layerType = layerType,
        layerID = layerIndex + 1,
        layerName = "Layer "..tostring(layerIndex + 1),
        materialName = materialName
      }
      layerID = layerIndex + 1
      table.insert(area.layers, layer)
      break
    end
  end
  table.insert(fieldInfoTbl, {areaID = areaID, layerID = layerID, fieldsData = {}})

  for _, fieldInfo in ipairs(fieldInfoTemplate) do
    if fieldInfo.layerType == layerType_enum.any or layerType == fieldInfo.layerType then
      local fieldData = {
        name = fieldInfo.name,
        label = fieldInfo.label,
        val = fieldInfo.val,
        type = fieldInfo.type,
        layerType = fieldInfo.layerType
      }
      if fieldInfo.name == "TerrainMaterial" then
        local layer = getLayer(areaID, layerID)
        fieldData.val = layer.materialName or ""
      elseif fieldInfo.name == "BlendingMethod" then
        fieldData.val = (fieldData.val == lassoBlending_enum.add) and "Add" or "Replace"
      end

      insertFieldInfo(areaID, layerID, fieldData)
    end
  end
  populateForestBrushes()
end

local function getLayerType(areaID, layerID)
  local layerName = ""
  for _, area in ipairs(var.areas) do
    if area.areaID == areaID then
      for _, layer in ipairs(area.layers) do
        if layer.layerID == layerID then
          if layer.layerType == layerType_enum.lasso then
            layerName = "Lasso"
          elseif layer.layerType == layerType_enum.random then
            layerName = "Random"
          elseif layer.layerType == layerType_enum.terrain_material then
            layerName = "Terrain Material"
          end
          break
        end
      end
      break
    end
  end
  return layerName
end

local function resetDrawActionVariables()
  var.shouldRenderCompletionSphere = false
  var.lassoSelectionEnded = false
  var.lassoSelectionItemsCalculated = false
  var.lassoPLNodes = {}
end

local function drawLassoPolylineAction()
  local numNodes = #var.lassoPLNodes
  var.shouldRenderCompletionSphere = false
  if var.lassoActionHoveredNodeIndex == 1 and numNodes > 2 then
    if var.lassoSelectionEnded then
      var.shouldRenderCompletionSphere = false;
    else
      if editor.keyModifiers.alt then
        var.shouldRenderCompletionSphere = true;
      else
        var.shouldRenderCompletionSphere = false;
      end
    end
  end

  -- draw cursor sphere
  if editor.keyModifiers.alt and not var.shouldRenderCompletionSphere then
    local hit
    if imgui.GetIO().WantCaptureMouse == false then
      hit = cameraMouseRayCast(false, imgui.flags(SOTTerrain))
    end
    if hit then
      local sphereRadius = (core_camera.getPosition() - hit.pos):length() * roadRiverGui.nodeSizeFactor
      debugDrawer:drawSphere(hit.pos, sphereRadius, roadRiverGui.highlightColors.node, false)
      if not tableIsEmpty(var.lassoPLNodes) then
        local tempNode = {pos = hit.pos, isUpdated = true}
        drawLassoLineSegmented(var.drawActionAreaID, var.lassoPLNodes[numNodes], tempNode, true)
      end
    end
  end

  if tableIsEmpty(var.lassoPLNodes) then return end

  for index, node in ipairs(var.lassoPLNodes) do
    local nodeColor = roadRiverGui.highlightColors.node
    if var.lassoActionHoveredNodeIndex == index then
      nodeColor = roadRiverGui.highlightColors.hoveredNode
    elseif var.lassoActionSelectedNodeIndex == index then
      nodeColor = roadRiverGui.highlightColors.selectedNode
    end
    -- Skip first node if we should render completion sphere
    if index == 1 and var.shouldRenderCompletionSphere then
      goto continue
    else
      local sphereRadius = (core_camera.getPosition() - node.pos):length() * roadRiverGui.nodeSizeFactor
      debugDrawer:drawSphere(node.pos, sphereRadius, nodeColor, false)
    end
    if index > 1 then
      drawLassoLineSegmented(var.drawActionAreaID, var.lassoPLNodes[index - 1], node)
    end
    ::continue::
  end

  -- finally draw the closing line if selection ended
  if var.lassoSelectionEnded then
    drawLassoLineSegmented(var.drawActionAreaID, var.lassoPLNodes[numNodes], var.lassoPLNodes[1])
  end

  -- draw completion line and sphere
  if var.lassoSelectionEnded == false and editor.keyModifiers.alt then
    if var.shouldRenderCompletionSphere then
      local sphereRadius = (core_camera.getPosition() - var.lassoPLNodes[1].pos):length() * roadRiverGui.nodeSizeFactor * 2
      debugDrawer:drawSphere(var.lassoPLNodes[1].pos, sphereRadius,  ColorF(0,1,0,0.5), false)
      var.lassoPLNodes[1].isUpdated = true
      drawLassoLineSegmented(var.drawActionAreaID, var.lassoPLNodes[numNodes], var.lassoPLNodes[1])
    end
  end

  for _, node in ipairs(var.lassoPLNodes) do
    node.isUpdated = false
  end
end

local function drawLassoAreas()
  for _, areaInfo in ipairs(var.lassoAreas) do
    local numNodes = #areaInfo.nodes

    if numNodes == 0 then return end

    for index, node in ipairs(areaInfo.nodes) do
      local nodeColor = roadRiverGui.highlightColors.node
      if var.lassoHoveredNode.index == index and  var.lassoHoveredNode.areaID == areaInfo.areaID then
        nodeColor = roadRiverGui.highlightColors.hoveredNode
      elseif var.lassoAreaSelectedNode.index == index and var.lassoAreaSelectedNode.areaID == areaInfo.areaID then
        nodeColor = roadRiverGui.highlightColors.selectedNode
      end

      local sphereRadius = (core_camera.getPosition() - node.pos):length() * roadRiverGui.nodeSizeFactor
      debugDrawer:drawSphere(node.pos, sphereRadius, nodeColor, false)

      if index > 1 then
        drawLassoLineSegmented(areaInfo.areaID, areaInfo.nodes[index - 1], node)
      end
    end

    -- finally draw the closing line
    drawLassoLineSegmented(areaInfo.areaID, areaInfo.nodes[numNodes], areaInfo.nodes[1])

    for _, node in ipairs(areaInfo.nodes) do
      node.isUpdated = false
    end
  end
end

local function drawAreasList()
  imgui.Text("Areas")
  local flags = imgui.flags(imgui.WindowFlags_NoScrollWithMouse, imgui.WindowFlags_NoScrollbar, imgui.WindowFlags_ChildWindow)
  imgui.BeginChild1("AreasPanel", imgui.ImVec2(imgui.GetContentRegionAvail().x, 150), flags)
  if imgui.BeginPopupModal("Delete Area") then
    imgui.TextUnformatted("Are you sure you want to delete the area?")
    if imgui.Button("Cancel") then
      imgui.CloseCurrentPopup()
    end
    imgui.SameLine()
    if imgui.Button("OK") then
    for index, area in ipairs(var.areas) do
        if var.selectedAreaID == area.areaID then
          table.remove(var.areas, index)
          var.selectedAreaID = nil
          break
        end
    end
      imgui.CloseCurrentPopup()
    end
    imgui.EndPopup()
  end

  if imgui.BeginPopupModal("Create Area") then
    imgui.TextUnformatted("Please Select the Area type:")
    if imgui.RadioButton2("Terrain Material Area", selectAreaPopupIndex, 0) then
      selectAreaPopupIndex = imgui.IntPtr(0)
    end
    if imgui.RadioButton2("Lasso Area", selectAreaPopupIndex, 1) then
      selectAreaPopupIndex = imgui.IntPtr(1)
      isDrawingLassoArea = true
    end

    if imgui.Button("Cancel") then
      imgui.CloseCurrentPopup()
    end
    imgui.SameLine()

    editor_terrainEditor.updateMaterialLibrary()
    layerCreateMtlComboItemsTbl = {}
    for id, mtl in pairs(editor_terrainEditor.getMaterialsInJson()) do
      table.insert(layerCreateMtlComboItemsTbl, mtl.internalName)
    end
    if imgui.Button("OK") then
      local area = {
        areaID    = areaGlobalIndex,
        areaName = "Area "..tostring(areaGlobalIndex),
        areaType = selectAreaPopupIndex[0] == 0 and areaType_enum.terrain_material or areaType_enum.lasso,
        layers = {},
        items = {},
        materialName = selectAreaPopupIndex[0] == 0 and layerCreateMtlComboItemsTbl[layerCreateMtlComboIndex[0] + 1] or nil
      }
      table.insert(var.areas, area)
      areaGlobalIndex = areaGlobalIndex + 1
      if selectAreaPopupIndex[0] == 0 then
        createLayerTypeIndex[0] = layerType_enum.terrain_material
      else
        createLayerTypeIndex[0] = layerType_enum.lasso
      end
      imgui.CloseCurrentPopup()
    end
    imgui.EndPopup()
  end

  if imgui.Button("Create Area") then
    imgui.OpenPopup("Create Area")
  end
  imgui.SameLine()
  if var.selectedAreaID == nil then
    imgui.BeginDisabled()
  end

  if imgui.Button("Delete Area") then
    imgui.OpenPopup("Delete Area")
  end

  if var.selectedAreaID == nil then
    imgui.EndDisabled()
  end

  --  editor.uiInputSearchTextFilter("##windowsFilter", areaListFilter, imgui.GetContentRegionAvailWidth())
  editor.uiInputText('', searchText)
  imgui.SameLine()
  if imgui.SmallButton("x") then
    searchText = imgui.ArrayChar(256, '')
  end
  imgui.Separator()
  local filter = string.lower(ffi.string(searchText))
  if filter == '' then
    --filter = nil
  end

  imgui.BeginChild1("AreasList", imgui.ImVec2(imgui.GetContentRegionAvail().x, 80), imgui.WindowFlags_ChildWindow)
  for _, area in ipairs(var.areas) do
    if string.find(string.lower(area.areaName), filter) then
      if var.selectedAreaID == area.areaID then imgui.PushStyleColor2(imgui.Col_Text, imgui.ImVec4(0, 1, 0, 0.5)) end
      local areaTypeStr = (area.areaType == areaType_enum.terrain_material) and "Terrain Material" or "Lasso"
      if imgui.Selectable1(area.areaName.. " (".. areaTypeStr ..")##", var.selectedAreaID == area.areaID) then
        var.selectedAreaID = area.areaID
      end
      if var.selectedAreaID == area.areaID then imgui.PopStyleColor() end
    end
  end
  imgui.Separator()
  imgui.EndChild()
  imgui.EndChild()
end

local function getAreaType(areaID)
  local areaType =  areaType_enum.lasso
  for _, area in ipairs(var.areas) do
    if areaID == area.areaID then
      areaType = area.areaType
      break
    end
  end
  return areaType
end

local function getAreaName(areaID)
  local areaName = ""
  for _, area in ipairs(var.areas) do
    if areaID == area.areaID then
      areaName = area.areaName
      break
    end
  end
  return areaName
end

local function getLayerName(areaID, layerID)
  local layerName = ""
  for _, area in ipairs(var.areas) do
    if areaID == area.areaID then
      for _, layer in ipairs(area.layers) do
        if layerID == layer.layerID then
          layerName = layer.name
        end
      end
    end
  end
  return layerName
end

local function getSelectionInfo(areaID, layerID)
  local selectionInfo = nil
  for _, selectedItemsInfo in ipairs(var.forestBrushSelectedItems) do
    if selectedItemsInfo.areaID == areaID and selectedItemsInfo.layerID == layerID then
      selectionInfo = selectedItemsInfo.selectedItems
      break
    end
  end
  return selectionInfo
end

local function isForestBrushSelected(areaID, layerID, index)
  local selected = false
  for _, selectedItemsInfo in ipairs(var.forestBrushSelectedItems) do
    if selectedItemsInfo.areaID == areaID and selectedItemsInfo.layerID == layerID then
      selected = selectedItemsInfo.selectedItems[index]
      break
    end
  end
  return selected
end

local function selectForestBrush(areaID, layerID, index)
  for _, selectedItemsInfo in ipairs(var.forestBrushSelectedItems) do
    if selectedItemsInfo.areaID == areaID and selectedItemsInfo.layerID == layerID then
      selectedItemsInfo.selectedItems[index] = true
    end
  end
end

local function deselectForestBrush(areaID, layerID, index)
  for _, selectedItemsInfo in ipairs(var.forestBrushSelectedItems) do
    if selectedItemsInfo.areaID == areaID and selectedItemsInfo.layerID == layerID then
      selectedItemsInfo.selectedItems[index] = false
      break
    end
  end
end

local function clearForestBrushSelection(areaID, layerID)
  for _, selectedItemsInfo in ipairs(var.forestBrushSelectedItems) do
    if selectedItemsInfo.areaID == areaID and selectedItemsInfo.layerID == layerID then
      selectedItemsInfo.selectedItems = {}
      break
    end
  end
end

local function drawLayerPanel(areaID, layerID)
  local layer = getLayer(areaID, layerID)
  imgui.Columns(2, layerID .. "LayersColumn")
  imgui.Text("Layer Properties:")
  imgui.BeginChild1("LayerPanel"..layerID, imgui.ImVec2(imgui.GetContentRegionAvail().x, 220 * imgui.uiscale[0]), imgui.WindowFlags_ChildWindow)
  for index, item in ipairs(fieldInfoTbl) do
    if item.areaID == areaID and item.layerID == layerID then
      for _, fieldData in ipairs(item.fieldsData) do
        valueInspector:valueEditorGui(fieldData.name, tostring(fieldData.val) or "", index, fieldData.label, nil, fieldData.type or "", fieldData.type or "", {areaID = item.areaID, layerID = item.layerID}, nil, nil)
        imgui.Separator()
        imgui.NextColumn()
      end
      break
    end
  end
  imgui.EndChild()

  imgui.NextColumn()
  imgui.Text("Forest Brushes:")

  imgui.BeginChild1("LayerForestBrushes"..layerID..areaID, imgui.ImVec2(imgui.GetContentRegionAvail().x, 180), imgui.WindowFlags_ChildWindow)
  for index, item in ipairs(var.forestBrushes) do
    imgui.PushStyleColor2(imgui.Col_Button, (isForestBrushSelected(areaID, layerID, index)) and var.buttonColor_active or var.buttonColor_inactive)
    editor.uiIconImage(editor.icons.forest_brushelement, imgui.ImVec2(math.ceil(imgui.GetFontSize()), math.ceil(imgui.GetFontSize())))
    imgui.SameLine()
    local textPos = imgui.GetCursorPos()
    if imgui.Button("##"..item.internalName, imgui.ImVec2(imgui.GetContentRegionAvailWidth(), math.ceil(imgui.GetFontSize()))) then
       local selectionInfo = getSelectionInfo(areaID, layerID)
       if selectionInfo == nil then
        local selectionData = {areaID = areaID, layerID = layerID, selectedItems = {}}
        table.insert(var.forestBrushSelectedItems, selectionData)
       else
        if editor.keyModifiers.ctrl then
          if isForestBrushSelected(areaID, layerID, index) then
            deselectForestBrush(areaID, layerID, index)
          else
            selectForestBrush(areaID, layerID, index)
          end
        else
          clearForestBrushSelection(areaID, layerID)
          selectForestBrush(areaID, layerID, index)
        end
       end
    end
    imgui.SetCursorPos(textPos)
    imgui.Text(item.internalName)
    imgui.PopStyleColor()
  end
  imgui.EndChild()
  imgui.Button("Delete")
  imgui.SameLine()
  imgui.Button("Conform to Terrain")
  imgui.Columns(1)
end

local function getLayerIDByIndex(areaID, layerIndex)
  local layerID = nil
  for _, area in ipairs(var.areas) do
    if area.areaID == areaID and area.layers[layerIndex] then
      layerID = area.layers[layerIndex].layerID
      break
    end
  end
  return layerID
end


local function drawLayersList(areaID)
  if imgui.CollapsingHeader1("Edit Layers") then
        imgui.BeginChild1("CreateLayer", imgui.ImVec2(imgui.GetContentRegionAvail().x, 160), imgui.WindowFlags_ChildWindow)
        imgui.Text("Create Layer:")
        imgui.SameLine()
        local xPos = imgui.GetCursorPos().x

        local layersAvailable = not tableIsEmpty(getLayers(var.selectedAreaID))
        if not layersAvailable and getAreaType(var.selectedAreaID) == areaType_enum.terrain_material then
          imgui.BeginDisabled()
        end
        if imgui.RadioButton2("Lasso", createLayerTypeIndex, layerType_enum.lasso) then
          createLayerTypeIndex[0] = layerType_enum.lasso
          isDrawingLassoArea = true
        end
        if not layersAvailable and getAreaType(var.selectedAreaID) == areaType_enum.terrain_material then
          imgui.EndDisabled()
        end

        if getAreaType(var.selectedAreaID) == areaType_enum.terrain_material then
          imgui.SetCursorPosX(xPos)
          if layersAvailable then
            imgui.BeginDisabled()
          end
          if imgui.RadioButton2("Terrain Material", createLayerTypeIndex, layerType_enum.terrain_material) then
            createLayerTypeIndex[0] = layerType_enum.terrain_material
            editor_terrainEditor.updateMaterialLibrary()
            layerCreateMtlComboItemsTbl = {}
            for id, mtl in pairs(editor_terrainEditor.getMaterialsInJson()) do
              table.insert(layerCreateMtlComboItemsTbl, mtl.internalName)
            end
          end

          if createLayerTypeIndex[0] ~= layerType_enum.terrain_material then
            imgui.BeginDisabled()
          end

          layerCreateMtlComboItems = imgui.ArrayCharPtrByTbl(layerCreateMtlComboItemsTbl)
          imgui.SameLine()
          if imgui.Combo1("##terrainmaterials", layerCreateMtlComboIndex, layerCreateMtlComboItems) then
          end

          if createLayerTypeIndex[0] ~= layerType_enum.terrain_material then
            imgui.EndDisabled()
          end

          if layersAvailable then
            imgui.EndDisabled()
          end

          imgui.SetCursorPosX(xPos)
          if not layersAvailable then
            imgui.BeginDisabled()
          end
          if imgui.RadioButton2("Random", createLayerTypeIndex, layerType_enum.random) then
            createLayerTypeIndex[0] = layerType_enum.random
            isDrawingLassoArea = true
          end
          if not layersAvailable then
            imgui.EndDisabled()
          end
        end

        imgui.SetCursorPosX(xPos)
        if imgui.Button("Create Layer") then
          local materialName = nil
          if getAreaType(var.selectedAreaID) == areaType_enum.terrain_material then
            materialName = layerCreateMtlComboItemsTbl[layerCreateMtlComboIndex[0] + 1]
          else
            materialName = "-"
          end
          addLayer(var.selectedAreaID, createLayerTypeIndex[0], materialName)
          if #getLayers(var.selectedAreaID) == 1 then
            createLayerTypeIndex[0] = layerType_enum.lasso
          end
        end
        imgui.EndChild()

        imgui.BeginChild1("DeleteLayer", imgui.ImVec2(imgui.GetContentRegionAvail().x, 80), imgui.WindowFlags_ChildWindow)
        imgui.Text("Delete Layer:")
        local noLayers = tableIsEmpty(getLayers(var.selectedAreaID))
        if noLayers then
          imgui.BeginDisabled()
        end
        imgui.SameLine()

        layerDeleteMtlComboItemsTbl = {}
        for _, layer in ipairs(getLayers(var.selectedAreaID)) do
          table.insert(layerDeleteMtlComboItemsTbl, layer.layerName)
        end

        layerDeleteMtlComboItems = imgui.ArrayCharPtrByTbl(layerDeleteMtlComboItemsTbl)
        imgui.Combo1("##layersDelete", layerDeleteComboIndex, layerDeleteMtlComboItems)

        imgui.SameLine()
        if imgui.Button("Delete Layer") then
          imgui.OpenPopup("Delete Layer")
        end

      if imgui.BeginPopupModal("Delete Layer") then
        local layerName = layerDeleteMtlComboItemsTbl[layerDeleteComboIndex[0] + 1]
        imgui.TextUnformatted("Are you sure you want to delete \""..layerName.."\"?")
        if imgui.Button("Cancel") then
          imgui.CloseCurrentPopup()
        end
        imgui.SameLine()
        if imgui.Button("OK") then
          deleteLayer(var.selectedAreaID, getLayerIDByIndex(var.selectedAreaID, layerDeleteComboIndex[0] + 1))
          imgui.CloseCurrentPopup()
        end
        imgui.EndPopup()
      end


        if noLayers then
          imgui.EndDisabled()
        end
        imgui.EndChild()
  end

  imgui.Spacing()
  imgui.Separator()
  imgui.Spacing()
  local filter = ""

  if imgui.CollapsingHeader1("Layers in "..getAreaName(var.selectedAreaID), imgui.TreeNodeFlags_DefaultOpen) then
    imgui.BeginChild1("LayersList", imgui.ImVec2(imgui.GetContentRegionAvail().x, imgui.GetContentRegionAvail().y - 4), imgui.WindowFlags_ChildWindow)
    if tableIsEmpty(getLayers(var.selectedAreaID)) then
      local noAreaText = "N O   L A Y E R S   I N   T H E   A R E A !"
      imgui.SetCursorPos(imgui.ImVec2(imgui.GetContentRegionAvail().x/2 - imgui.CalcTextSize(noAreaText).x/2, imgui.GetContentRegionAvail().y/2))
      imgui.PushStyleColor2(imgui.Col_Text, imgui.ImVec4(1, 0, 0, 1));
      editor.uiTextColoredWithFont(imgui.ImVec4(1, 0, 0, 1), noAreaText, "cairo_bold")
      imgui.PopStyleColor()
    else
      for _, layer in ipairs(getLayers(var.selectedAreaID)) do
        --if var.selectedAreaID == area.areaID then imgui.PushStyleColor2(imgui.Col_Text, imgui.ImVec4(0, 1, 0, 0.5)) end

        if imgui.CollapsingHeader1(layer.layerName.." ("..getLayerType(var.selectedAreaID, layer.layerID)..")" .. '##', true) then
          drawLayerPanel(var.selectedAreaID, layer.layerID)
        end
      -- if var.selectedAreaID == area.areaID then imgui.PopStyleColor() end
      end
    end
    imgui.EndChild()
  end
end

local function indexOf(table, value)
  if not table then return -1 end
  for i,v in ipairs(table) do
    if v == value then return i end
  end
  return -1
end

local function removeItemsActionUndo(actionData)
  for _, item in ipairs(actionData.items) do
    editor.addForestItem(var.forestData, item)
  end
  calculateLassoSelectionOnArea(actionData.areaID)
end

local function removeItemsActionRedo(actionData)
  for _, item in ipairs(actionData.items) do
    editor.removeForestItem(forest:getData(), item)
  end
  calculateLassoSelectionOnArea(actionData.areaID)
end

local function removeItems(items)
  if tableIsEmpty(items) then return end
  editor.history:commitAction("RemoveForestItems", {items = items, areaID = var.selectedAreaID}, removeItemsActionUndo, removeItemsActionRedo)
end

local function setItemTransformUndo(actionData)
  for index, item in ipairs(actionData.items) do
    actionData.items[index] = editor.updateForestItem(var.forestData, item:getKey(), item:getPosition(), item:getData(), editor.tableToMatrix(actionData.oldTransforms[index]), item:getScale())
  end
end

local function setItemTransformRedo(actionData)
  for index, item in ipairs(actionData.items) do
    actionData.items[index] = editor.updateForestItem(var.forestData, item:getKey(), item:getPosition(), item:getData(), editor.tableToMatrix(actionData.newTransforms[index]), item:getScale())
  end
end

local function drawAreaPanel2(areaID)
  local areaType = getAreaType(areaID)
  local areaTypeStr = areaType == areaType_enum.terrain_material and "Terrain Material" or "Lasso"
  imgui.Text("Area "..tostring(areaID).." ("..areaTypeStr..")")
  imgui.BeginChild1("ModifyPanel", imgui.ImVec2((imgui.GetContentRegionAvail().x - 6), imgui.GetContentRegionAvail().y -2), true)
  drawLayersList()
  imgui.EndChild()
end

local function drawAreaPanel(areaID)
  imgui.Text("Area "..tostring(var.selectedAreaID))
  imgui.BeginChild1("ModifyPanel", imgui.ImVec2((imgui.GetContentRegionAvail().x - 6), imgui.GetContentRegionAvail().y -2), true)

  local textSuffix = numOfItemsInArea and " ("..tostring(numOfItemsInArea)..")" or ""
  imgui.Text("Forest Items In Area"..textSuffix)
  imgui.SetCursorPos(cursorPos)

  local childFlags = bit.bor(imgui.WindowFlags_HorizontalScrollbar, imgui.WindowFlags_AlwaysVerticalScrollbar)
  imgui.BeginChild1("ItemsList", imgui.ImVec2(200, 400), true, childFlags)
  if editor.uiInputText('', searchText_Items_Modify) then
    resetSelectedItemIndices(selectedArea.areaID)
    resetSelectedGroupIndices(selectedArea.areaID)
  end
  imgui.SameLine()
  if imgui.SmallButton("x") then
    searchText_Items_Modify = imgui.ArrayChar(256, '')
  end

  selectAllBoolPtr[0] = var.selectAllEnabled
  groupItemsBoolPtr[0] = var.isGroupMeshesEnabled
  if imgui.Checkbox("##groupMeshesEnabled", groupItemsBoolPtr) then
    var.isGroupMeshesEnabled = groupItemsBoolPtr[0]
    if var.isGroupMeshesEnabled then
      groupItemsByMesh()
    end
  end
  imgui.SameLine()
  imgui.Text("Group Items")
  imgui.Separator()
  local modify_filter = string.lower(ffi.string(searchText_Items_Modify))
  if modify_filter == '' then
  end

  if selectedArea then
    if not var.groupSelectedIndices_Modify[selectedArea.areaID] then
      var.groupSelectedIndices_Modify[selectedArea.areaID] = {}
    end
    if not var.itemsSelectedIndices_Modify[selectedArea.areaID] then
      var.itemsSelectedIndices_Modify[selectedArea.areaID] = {}
    end
    if var.isGroupMeshesEnabled then
      for _, entryInfo in ipairs(var.lassoAreasGroupedMeshTable) do
        if entryInfo.areaID == selectedArea.areaID then
          for index, meshEntry in ipairs(entryInfo.meshEntries) do
            if string.find(string.lower(meshEntry.name), modify_filter) then
              if imgui.Selectable1(tostring(meshEntry.name).."("..tostring(meshEntry.count)..")"..'##'..tostring(index), indexOf(var.groupSelectedIndices_Modify[selectedArea.areaID], index) ~= -1) then
                if var.selectAllEnabled then
                  table.insert(var.groupSelectedIndices_Modify[selectedArea.areaID], index)
                else
                  if editor.keyModifiers.ctrl then
                    if indexOf(var.groupSelectedIndices_Modify[selectedArea.areaID], index) == -1 then
                      table.insert(var.groupSelectedIndices_Modify[selectedArea.areaID], index)
                    else
                      table.remove(var.groupSelectedIndices_Modify[selectedArea.areaID], index)
                    end
                  else
                    var.groupSelectedIndices_Modify[selectedArea.areaID] = {index}
                  end
                end
              end
            end
          end
          break
        end
      end
    else
      for index, item in ipairs(selectedArea.items) do
        if string.find(string.lower(item:getData():getName()), modify_filter) then
          if imgui.Selectable1(tostring(item:getData():getName()) .. '##'..tostring(index),indexOf(var.itemsSelectedIndices_Modify[selectedArea.areaID], index) ~= -1) then
            if editor.keyModifiers.ctrl then
              if indexOf(var.itemsSelectedIndices_Modify[selectedArea.areaID], index) == -1 then
                table.insert(var.itemsSelectedIndices_Modify[selectedArea.areaID], index)
              else
                table.remove(var.itemsSelectedIndices_Modify[selectedArea.areaID], index)
              end
            else
              var.itemsSelectedIndices_Modify[selectedArea.areaID] = {index}
            end

            if var.selectAllEnabled then
              table.insert(var.itemsSelectedIndices_Modify[selectedArea.areaID], index)
            end
          end
        end
      end
    end
  end
  imgui.Separator()
  imgui.EndChild()

  imgui.SetCursorPos(imgui.ImVec2(cursorPos.x + 206, cursorPos.y - fontSize))
  imgui.Text("Placement Constraints")
  imgui.SetCursorPos(imgui.ImVec2(cursorPos.x + 206, cursorPos.y))
  imgui.BeginChild1("PlacementConstraintsPanel ", imgui.ImVec2(200, 400), true)
  imgui.Text("Sink radius:")
  imgui.SameLine()
  editor.uiInputText('', sinkRadiusText)
  imgui.EndChild()

  imgui.SetCursorPos(imgui.ImVec2(cursorPos.x + 412 , cursorPos.y - fontSize))
  imgui.Text("Actions")
  imgui.SetCursorPos(imgui.ImVec2(cursorPos.x + 412 , cursorPos.y))

  local shouldDisableActionButtons = false

  if var.isGroupMeshesEnabled then
    if tableIsEmpty(var.groupSelectedIndices_Modify[var.selectedAreaID]) then
      shouldDisableActionButtons = true
    end
  else
    if tableIsEmpty(var.itemsSelectedIndices_Modify[var.selectedAreaID])then
      shouldDisableActionButtons = true
    end
  end

  if var.selectAllEnabled then
    shouldDisableActionButtons = false
  end

  imgui.BeginChild1("ActionsPanel ", imgui.ImVec2(200, 400), true)
  if shouldDisableActionButtons then
    imgui.BeginDisabled()
  end

  local shouldConform = false
  local conformSelected = false

  if imgui.Button("Conform To Terrain") then
    shouldConform = true
  end

  if shouldConform then
    local oldTransforms = {}
    local newTransforms = {}
    local itemsToModify = {}
    if selectedArea then
      if var.isGroupMeshesEnabled then
        for _, entryInfo in ipairs(var.lassoAreasGroupedMeshTable) do
          if entryInfo.areaID == selectedArea.areaID then
            for index, meshEntry in ipairs(entryInfo.meshEntries) do
              if arrayFindValueIndex(var.groupSelectedIndices_Modify[selectedArea.areaID], index) then
                for _, item in ipairs(selectedArea.items) do
                  if item:getData():getShapeFile() == meshEntry.shapeFilePath then
                    local itemPos = item:getPosition()
                    local objectTerrainHeight = core_terrain.getTerrainHeight(vec3(itemPos.x, itemPos.y, itemPos.z + 1000)) or 0
                    table.insert(oldTransforms, editor.matrixToTable(item:getTransform()))

                    local transform = MatrixF(true)
                    transform:setColumn4F(0, item:getTransform():getColumn4F(0))
                    transform:setColumn4F(1, item:getTransform():getColumn4F(1))
                    transform:setColumn4F(2, item:getTransform():getColumn4F(2))
                    transform:setPosition(vec3(itemPos.x, itemPos.y, objectTerrainHeight - tonumber(ffi.string(sinkRadiusText))))

                    table.insert(newTransforms, editor.matrixToTable(transform))
                    table.insert(itemsToModify, item)
                  end
                end
              end
            end
          end
        end
      else
        for index, item in ipairs(selectedArea.items) do
          if arrayFindValueIndex(var.itemsSelectedIndices_Modify[selectedArea.areaID], index) then
            local itemPos = item:getPosition()
            local objectTerrainHeight = core_terrain.getTerrainHeight(vec3(itemPos.x, itemPos.y, itemPos.z + 1000)) or 0
            table.insert(oldTransforms, editor.matrixToTable(item:getTransform()))

            local transform = MatrixF(true)
            transform:setColumn4F(0, item:getTransform():getColumn4F(0))
            transform:setColumn4F(1, item:getTransform():getColumn4F(1))
            transform:setColumn4F(2, item:getTransform():getColumn4F(2))
            transform:setPosition(vec3(itemPos.x, itemPos.y, objectTerrainHeight - tonumber(ffi.string(sinkRadiusText))))

            table.insert(newTransforms, editor.matrixToTable(transform))
            table.insert(itemsToModify, item)
          end
        end
      end
      editor.history:commitAction("ConformToTerrain", {items = itemsToModify, newTransforms = newTransforms, oldTransforms = oldTransforms}, setItemTransformUndo, setItemTransformRedo)
    end
  end

  imgui.tooltip("Conform Selected Items to Terrain")
  if imgui.Button("Delete Selected") then
    local delItems = {}
    if var.isGroupMeshesEnabled then
      for _, selectedGroupIndex in ipairs(var.groupSelectedIndices_Modify[selectedArea.areaID]) do
        local meshEntries = getGroupMeshEntriesForArea(selectedArea.areaID)
        for index, meshEntry in ipairs(meshEntries) do
          if selectedGroupIndex == index then
            for _, item in ipairs(selectedArea.items) do
              if item:getData():getShapeFile() == meshEntry.shapeFilePath then
                table.insert(delItems, item)
              end
            end
          end
        end
      end
    else
      for _, index in ipairs(var.itemsSelectedIndices_Modify[selectedArea.areaID]) do
        table.insert(delItems, selectedArea.items[index])
      end
    end

    removeItems(delItems)
    calculateLassoSelectionOnArea(selectedArea.areaID)
    var.itemsSelectedIndices_Modify[selectedArea.areaID] = {}
    var.groupSelectedIndices_Modify[selectedArea.areaID] = {}
  end
  if shouldDisableActionButtons then
    imgui.EndDisabled()
  end

  if var.selectedAreaID == nil then
    imgui.BeginDisabled()
  end

  if imgui.Button("Clear Area") then
    removeItems(selectedArea.items)
    calculateLassoSelectionOnArea(selectedArea.areaID)
  end
  if var.selectedAreaID == nil then
    imgui.EndDisabled()
  end
  imgui.EndChild()

  imgui.EndChild()
  imgui.SetCursorPos(imgui.ImVec2(cursorPos.x , imgui.GetCursorPos().y + fontSize))
  imgui.Text("Generate Area")
  imgui.BeginChild1("GeneratePanel", imgui.ImVec2((imgui.GetContentRegionAvail().x - 6), panelHeight), true)

  imgui.Text("Select Forest Meshes")
  imgui.SetCursorPos(imgui.ImVec2(cursorPos.x, cursorPos.y))
  imgui.BeginChild1("ItemsList", imgui.ImVec2(200 * imgui.uiscale[0], 400), true)

  editor.uiInputText('', searchText_Meshes_Generate)
  imgui.SameLine()
  if imgui.SmallButton("x") then
    searchText_Meshes_Generate = imgui.ArrayChar(256, '')
  end
  imgui.Separator()
  local generate_items_filter = string.lower(ffi.string(searchText_Meshes_Generate))
  for index, item in ipairs(var.forestItemData) do
    local obj = scenetree.findObjectById(item.id)
    if obj and string.find(string.lower(obj.name), generate_items_filter) then
      if imgui.Selectable1(obj.name .. '##'..tostring(index), false) then
      end
    end
  end
  imgui.EndChild()
end

local function drawWindow()
  if editor.beginWindow(toolWindowName, "Biome Tool") then
    local selectedArea = getAreaByID(var.selectedAreaID)
    drawAreasList()
    imgui.BeginChild1("MainPanel", imgui.GetContentRegionAvail(), true)

    if var.selectedAreaID == nil then
      local txtSfx = "S E L E C T E D !"
      if tableIsEmpty(var.areas) then txtSfx = "A V A I L A B L E !" end
      local noAreaText = "N O   A R E A   " .. txtSfx
      imgui.SetCursorPos(imgui.ImVec2(imgui.GetContentRegionAvail().x/2 - imgui.CalcTextSize(noAreaText).x/2, imgui.GetContentRegionAvail().y/2))
      imgui.PushStyleColor2(imgui.Col_Text, imgui.ImVec4(1, 0, 0, 1));
      editor.uiTextColoredWithFont(imgui.ImVec4(1, 0, 0, 1), noAreaText, "cairo_bold")
      imgui.PopStyleColor()
    else
      drawAreaPanel2(var.selectedAreaID)
    end

    imgui.EndChild()
  end
  editor.endWindow()
end

local function updateNodePosInArea(areaID, nodeIndex, pos)
  for _, areaInfo in ipairs(var.lassoAreas) do
    if areaInfo.areaID == areaID then
      areaInfo.nodes[nodeIndex].pos = pos
      areaInfo.nodes[nodeIndex].isUpdated = true
    end
  end
end

local function onEditorGui()
  if not editor.editMode or (editor.editMode.displayName ~= editModeName) then
    return
  end
  drawWindow()
  if isDrawingLassoArea then
    drawLassoPolylineAction()
  end

  local hit
  if imgui.GetIO().WantCaptureMouse == false then
    hit = cameraMouseRayCast(false, imgui.flags(SOTTerrain))
  end

  if not imgui.IsMouseDown(0) then
    local hoveredNodeInfo = getLassoNodeUnderCursor()
    var.lassoHoveredNode = {}
    var.lassoActionHoveredNodeIndex = nil
    if hoveredNodeInfo.areaID == -1 then
      var.lassoActionHoveredNodeIndex = hoveredNodeInfo.index
    else
      var.lassoHoveredNode.index = hoveredNodeInfo.index
      var.lassoHoveredNode.areaID = hoveredNodeInfo.areaID
    end
  end

  if editor.keyModifiers.alt then
    if imgui.IsMouseClicked(0) and isDrawingLassoArea
        and editor.isViewportHovered()
        and not editor.isAxisGizmoHovered() then
      if var.lassoActionHoveredNodeIndex == 1 and #var.lassoPLNodes > 2 then
        var.lassoSelectionEnded = true

        local area = {
          areaID    = areaGlobalIndex,
          areaName = "Area "..tostring(areaGlobalIndex),
          nodes = deepcopy(var.lassoPLNodes),
          items = {}
        }
        table.insert(var.lassoAreas, area)
        var.selectedAreaID = area.areaID
        calculateLassoSelectionOnArea(area.areaID)
        resetDrawActionVariables()
        areaGlobalIndex = areaGlobalIndex + 1
      elseif hit then
        local node = {
          nodeID    = #var.lassoPLNodes + 1,
          pos       = hit.pos,
          isUpdated = false
        }
        table.insert(var.lassoPLNodes, node)
      end
    end
  else
    if hit then
      if imgui.IsMouseClicked(0)
          and editor.isViewportHovered()
          and not editor.isAxisGizmoHovered() then
        if var.lassoHoveredNode.index ~= nil then
          var.mouseButtonHeldOnLassoNode = true
          if var.lassoHoveredNode.areaID == -1 then
            var.lassoActionSelectedNodeIndex = var.lassoHoveredNode.index
          else
            var.lassoAreaSelectedNode = {}
            var.lassoAreaSelectedNode.index = var.lassoHoveredNode.index
            var.lassoAreaSelectedNode.areaID = var.lassoHoveredNode.areaID
          end
        end
      end

      if imgui.IsMouseReleased(0) then
        var.mouseButtonHeldOnLassoNode = false
        var.lassoAreaSelectedNode = {}
      end

      if var.mouseButtonHeldOnLassoNode and imgui.IsMouseDragging(0) then
        updateNodePosInArea(var.lassoHoveredNode.areaID, var.lassoHoveredNode.index, hit.pos)
        calculateLassoSelectionOnArea(var.lassoHoveredNode.areaID)
      end
    end
  end
end

local function show()
  editor.clearObjectSelection()
  editor.selectEditMode(editor.editModes.biomeEditMode)
  editor.showWindow(toolWindowName)
end

local function onActivate()
  editor.clearObjectSelection()
  for _, win in ipairs(windows) do
    if win.onEditModeActivate then
      win:onEditModeActivate()
    end
  end
end

local function onDeactivate()
  for _, win in ipairs(windows) do
    if win.onEditModeDeactivate then
      win:onEditModeDeactivate()
    end
  end
  editor.clearObjectSelection()
end

local function initialize()
  -- ForestItemData
  local forestItemDataNames = scenetree.findClassObjects("TSForestItemData")
  var.forestItemData = {}
  for k, forestItemDataId in ipairs(forestItemDataNames) do
    local cobj = scenetree.findObject(forestItemDataId)
    if cobj then
      local item = {
        pos = k,
        id = cobj:getId(),
        dirty = false,
        selected = false
      }
      table.insert(var.forestItemData, item)
    end
  end
  var.forestBrushTool = ForestBrushTool()
end

local function setFieldValue(fieldName, fieldValue, customData)
  for _, item in ipairs(fieldInfoTbl) do
    if item.areaID == customData.areaID and item.layerID == customData.layerID then
      for _, fieldData in ipairs(item.fieldsData) do
        if fieldData.name == fieldName then
          fieldData.val = fieldValue
        end
      end
    end
  end
end

local function getFieldsData(areaID, layerID)
  local data = nil
  for _, info in ipairs(fieldInfoTbl) do
    if info.areaID == areaID and info.layerID == layerID then
      data = info.fieldsData
    end
  end
  return data
end

local function getMaterialName(index)
  local materialName = ""
  editor_terrainEditor.updateMaterialLibrary()
  for id, mtl in pairs(editor_terrainEditor.getMaterialsInJson()) do
    print("Mat Name: "..mtl.internalName)
    print("Mat Index: "..tostring(id))
    if id == index then
      materialName = mtl.internalName
      print("Mat Name: "..mtl.internalName)
      print("Mat Index: "..tostring(id))
      break
    end
  end
  return materialName
end

local function getLayerTerrainMaterial(areaID, layerID)
  local materialName = nil
  local fieldsData = getFieldsData(areaID, layerID)
  for _, fieldData in ipairs(fieldsData) do
    if fieldData.name == "TerrainMaterial" then
      materialName = fieldData.val
    end
  end
  return materialName
end

local function getLayerBlendingMethod(areaID, layerID)
  local blendingMethod = ""
  local fieldsData = getFieldsData(areaID, layerID)
  for _, fieldData in ipairs(fieldsData) do
    if fieldData.name == "BlendingMethod" then
      blendingMethod = fieldData.val
    end
  end
  return blendingMethod
end

local function biomeToolCustomFieldEditor(objectIds, fieldValue, fieldName, fieldLabel, fieldDesc, fieldType, fieldTypeName, customData, pasteCallback, contextMenuUI)
  local fieldVal = fieldValue

  if fieldName == "TerrainMaterial" then
    fieldVal = getLayerTerrainMaterial(customData.areaID, customData.layerID)
  elseif fieldName == "BlendingMethod" then
    fieldVal = getLayerBlendingMethod(customData.areaID, customData.layerID)
  end

  imgui.BeginDisabled()
  editor.uiInputText('', editor.getTempCharPtr(fieldVal))
  imgui.EndDisabled()
end

local function onEditorInitialized()
  editor.registerWindow(toolWindowName, imgui.ImVec2(400, 400))
  editor.editModes.biomeEditMode =
  {
    displayName = editModeName,
    onUpdate = nop,
    onActivate = onActivate,
    onDeactivate = onDeactivate,
    auxShortcuts = {},
  }
  editor.addWindowMenuItem("Biome Tool", function() show() end, {groupMenuName="Experimental"})
  editor.registerCustomFieldInspectorEditor("BiomeTool", "TerrainMaterial", biomeToolCustomFieldEditor)
  editor.registerCustomFieldInspectorEditor("BiomeTool", "BlendingMethod", biomeToolCustomFieldEditor)

  valueInspector.selectionClassName = "BiomeTool"
  valueInspector.setValueCallback = function(fieldName, fieldValue, arrayIndex, customData, editEnded)
    if customData then
      setFieldValue(fieldName, fieldValue, customData)
    end
  end

  forest = core_forest and core_forest.getForestObject()
  if forest then
    var.forestData = forest:getData()
  end

  initialize()
end

local function onEditorToolWindowHide(windowName)
  if windowName == toolWindowName then
    editor.selectEditMode(editor.editModes.objectSelect)
  end
end

local function onWindowGotFocus(windowName)
  if windowName == toolWindowName then
    editor.selectEditMode(editor.editModes.biomeEditMode)
  end
end

M.onEditorGui = onEditorGui
M.onEditorToolWindowHide = onEditorToolWindowHide
M.onEditorToolWindowGotFocus = onWindowGotFocus

M.onEditorInitialized = onEditorInitialized
M.onExtensionLoaded = onExtensionLoaded

return M