-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

local vid
local sensorId
local WIDTH = 100
local HEIGHT = 100
local resolution = {WIDTH, HEIGHT}
local targetSpeed
local data
local debug

local function onUpdate(dtReal, dtSim, dtRaw)
  
  if not loaded then 
    return
  end
  -- Get camera data
  for k, v in pairs(map.objects) do
    local veh = scenetree.findObject(k)
    local meshes = veh:getMeshNames()
    local id = veh:getID()
    for i = 1, #meshes do
      -- the setMeshAnnotationColor() function is used to have a custom annotations for the vehicles,
      -- with instance information constant over time (depending by their ids)
      veh:setMeshAnnotationColor(meshes[i], ColorI(125, 125, id % 255, 255))
    end
  end

  data = extensions.tech_sensors.processCameraData(sensorId)
  local distanceToCars = {}

  -- Find pixels with Car annotations and get the distance (camera depth) of the closest point
  for pixel=1, resolution[1]*resolution[2]*4, 4 do
    local r = data.annotation[pixel]
    local g = data.annotation[pixel + 1]
    local b = data.annotation[pixel + 2]

    local depth = data.depth[(pixel + 3)/4]
    
    local instance = tostring(b)

    if r == 125 and g == 125 then
      if distanceToCars[instance] == nil or depth < distanceToCars[instance] then
        distanceToCars[instance] = depth
      end
    end
  end
  be:queueObjectLua(vid, string.format("extensions.tech_AdaptiveCruiseControl.MPC(%q, %d, %.4f, %s)", lpack.encode(distanceToCars), targetSpeed, dtReal, debug))
end

local function load(speed, debugFlag)
  loaded = true
  -- Attempt to get the vehicle ID.
  vid = be:getPlayerVehicleID(0)
  if not vid or vid == -1 then
    return
  end
  assert(vid >= 0, "adaptiveCruiseControl.lua - Failed to get a valid vehicle ID")

  -- Create the camera
  local cameraArgs = {pos = vec3(0, -2.3, 1), size = resolution, isSnappingDesired = false, nearFarPlanes = {0.01, 200}}
  sensorId = extensions.tech_sensors.createCamera(vid, cameraArgs)

  -- Enable annotations
  Engine.Annotation.enable(true)
  AnnotationManager.setInstanceAnnotations(true)

  targetSpeed = speed
  be:queueObjectLua(vid, "extensions.tech_AdaptiveCruiseControl.getMass()")

  debug = debugFlag
  if debug then
    be:queueObjectLua(vid, "extensions.tech_AdaptiveCruiseControl.createCSV()")
  end

  ui_message("ACC extension loaded", 5, "Tech", "forward")
end

local function changeSpeed(speed)
  targetSpeed = speed
end

local function unload()
  loaded = false
  extensions.tech_sensors.removeSensor(sensorId)
  be:queueObjectLua(vid, "electrics.values.throttleOverride = nil")
  be:queueObjectLua(vid, "electrics.values.brakeOverride = nil")
  log('I', 'ACC', 'adaptiveCruiseControl extension unloaded')
  if debug then
    be:queueObjectLua(vid, "extensions.tech_AdaptiveCruiseControl.saveCSV()")
  end
  ui_message("ACC extension unloaded", 5, "Tech", "forward")
end

-- Public interface.
M.onUpdate            = onUpdate
M.onExtensionLoaded   = function() log('I', 'ACC', 'adaptiveCruiseControl extension loaded') end
M.onExtensionUnloaded = unload
M.load                = load
M.changeSpeed         = changeSpeed

return M