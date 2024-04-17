-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local C = {}

local xVector = vec3(1,0,0)
local yVector = vec3(0,1,0)
local zVector = vec3(0,0,1)

local zeroVector = vec3(0,0,0)
local zeroQuat = quat(0,0,0,1)

function C:init(sites, name, forceId)
  self.sites = sites
  self.id = forceId or sites:getNextUniqueIdentifier()
  self.name = name or "Parking " .. self.id
  self.color = vec3(1, 1, 1)
  self.vertices = {}
  self.pos = vec3()
  self.rot = quat(0, 0, 0, 1)
  self.scl = vec3()
  self.isMultiSpot = false
  self.multiSpotData = { spotAmount = 1, spotOffset = 0, spotDirection = "Left", spotRotation = 0 }
  self.wasGenerated = false

  self._drawMode = 'faded'
  self.sortOrder = 999999
  self.customFields = require('/lua/ge/extensions/gameplay/sites/customFields')()
end

function C:onSerialize()
  local ret = {
    name = self.name,
    pos = { self.pos.x, self.pos.y, self.pos.z },
    rot = { self.rot.x, self.rot.y, self.rot.z, self.rot.w },
    scl = { self.scl.x, self.scl.y, self.scl.z },
    isMultiSpot = self.isMultiSpot,
    spotAmount = self.multiSpotData.spotAmount,
    spotOffset = self.multiSpotData.spotOffset,
    spotDirection = self.multiSpotData.spotDirection,
    spotRotation = self.multiSpotData.spotRotation,
    color = self.color:toTable(),
    oldId = self.id,
    customFields = self.customFields:onSerialize()
  }
  return ret
end

function C:onDeserialized(data)
  self.name = data.name
  self.color = vec3(data.color)
  self.pos = vec3(data.pos)
  self.rot = quat(data.rot)
  self.scl = vec3(data.scl)
  self.isMultiSpot = data.isMultiSpot
  self.multiSpotData.spotAmount = data.spotAmount or 1
  self.multiSpotData.spotOffset = data.spotOffset or 0
  self.multiSpotData.spotDirection = data.spotDirection or "Left"
  self.multiSpotData.spotRotation = data.spotRotation or 0
  self.customFields:onDeserialized(data.customFields)
  self:calcVerts()
end

function C:set(pos, rot, scl)
  if pos then
    self.pos = vec3(pos)
  end
  if rot then
    self.rot = quat(rot)
  end
  if scl then
    self.scl = vec3(scl)
  end
  self:calcVerts()
end

function C:getPath()
  return self.sites.dir .. self.sites.filename .. '#'..self.name
end

function C:drawDebug(drawMode, clr)
  if self.isProcedural then
    return
  end

  drawMode = drawMode or self._drawMode
  if drawMode == 'none' then return end

  local camSqDist = self.pos:squaredDistance(core_camera.getPosition())
  local drawDist = editor.isEditorActive() and editor.getPreference("gizmos.visualization.visualizationDrawDistance") or 300
  if camSqDist > square(drawDist) then return end

  clr = clr or self.color:toTable()
  if drawMode == 'highlight' then
    clr = { 1, 1, 1, 1 }
  end
  local shapeAlpha = (drawMode == 'highlight') and 0.5 or 0.25

  local tmpSpotAmount = 1
  if self.isMultiSpot then
    tmpSpotAmount = self.multiSpotData.spotAmount
  end
  for i = 0, tmpSpotAmount - 1 do
    local rot = self.rot
    local dirVec
    if self.multiSpotData.spotDirection == "Left" then
      dirVec = rot * vec3(-i * (self.scl.x + self.multiSpotData.spotOffset), 0, 0)
    elseif self.multiSpotData.spotDirection == "Right" then
      dirVec = rot * vec3(i * (self.scl.x + self.multiSpotData.spotOffset), 0, 0)
    elseif self.multiSpotData.spotDirection == "Front" then
      dirVec = rot * vec3(0, i * (self.scl.y + self.multiSpotData.spotOffset), 0)
    elseif self.multiSpotData.spotDirection == "Back" then
      dirVec = rot * vec3(0, -i * (self.scl.y + self.multiSpotData.spotOffset), 0)
    end
    rot = quatFromEuler(0,0,self.multiSpotData.spotRotation) * rot
    local pos = self.pos + dirVec
    local x, y, z = rot * vec3(self.scl.x / 2, 0, 0), rot * vec3(0, self.scl.y / 2, 0), rot * vec3(0, 0, self.scl.z / 2)
    local clrI

    if self.isMultiSpot and i == 0 then
      clrI = color(0.91 * 255, 0.49 * 255, 0.24 * 255, shapeAlpha * 255)
    else
      clrI = color(clr[1] * 255, clr[2] * 255, clr[3] * 255, shapeAlpha * 255)
    end
    -- one side
    self:drawSide(pos + x + y, pos + x - y, z, clrI)
    self:drawSide(pos + x - y, pos - x - y, z, clrI)
    self:drawSide(pos - x - y, pos - x + y, z, clrI)
    self:drawSide(pos - x + y, pos + x + y, z, clrI)
    if self.isMultiSpot and i == 0 then
      clrI = color(0.91 * 255, 0.49 * 255, 0.24 * 255, shapeAlpha * 128)
    else
      clrI = color(clr[1] * 255, clr[2] * 255, clr[3] * 255, shapeAlpha * 128)
    end

    if camSqDist <= square(drawDist * 0.333) then -- for performance reasons
      debugDrawer:drawTriSolid(
              vec3(pos + x + y),
              vec3(pos + x - y),
              vec3(pos - x - y),
              clrI)
      debugDrawer:drawTriSolid(
              vec3(pos - x - y),
              vec3(pos - x + y),
              vec3(pos + x + y),
              clrI)

      debugDrawer:drawTriSolid(
              vec3(pos - x - y + z / 2),
              vec3(pos + y + z / 2),
              vec3(pos + x - y + z / 2),
              clrI)
    end

    if drawMode == 'highlight' then

    end

    local alpha = (drawMode == 'normal') and 0.4 or 1
    if i == 0 and drawMode ~= 'faded' and camSqDist <= square(math.max(50, drawDist * 0.5)) then
      debugDrawer:drawTextAdvanced(pos, String(self.name), ColorF(1, 1, 1, alpha), true, false, ColorI(0, 0, 0, alpha * 255))
    end
  end
end

function C:drawSide(a, b, z, clrI)
  debugDrawer:drawTriSolid(
          vec3(a),
          vec3(a + z),
          vec3(b + z),
          clrI)
  debugDrawer:drawTriSolid(
          vec3(b + z),
          vec3(b),
          vec3(a),
          clrI)
  debugDrawer:drawTriSolid(
          vec3(a),
          vec3(b + z),
          vec3(a + z),
          clrI)
  debugDrawer:drawTriSolid(
          vec3(b + z),
          vec3(a),
          vec3(b),
          clrI)
end

function C:generateMultiSpots(parkingSpotList)
  if self.wasGenerated then
    return
  end

  self.wasGenerated = true
  for i = 1, self.multiSpotData.spotAmount - 1 do -- skips original spot
    local rot = self.rot
    local dirVec
    if self.multiSpotData.spotDirection == "Left" then
      dirVec = rot * vec3(-i * (self.scl.x + self.multiSpotData.spotOffset), 0, 0)
    elseif self.multiSpotData.spotDirection == "Right" then
      dirVec = rot * vec3(i * (self.scl.x + self.multiSpotData.spotOffset), 0, 0)
    elseif self.multiSpotData.spotDirection == "Front" then
      dirVec = rot * vec3(0, i * (self.scl.y + self.multiSpotData.spotOffset), 0)
    elseif self.multiSpotData.spotDirection == "Back" then
      dirVec = rot * vec3(0, -i * (self.scl.y + self.multiSpotData.spotOffset), 0)
    end
    local pos = self.pos + dirVec
    rot = quatFromEuler(0,0,self.multiSpotData.spotRotation) * rot

    local genPos = parkingSpotList:create(self.name .. "." .. (i + 1))
    genPos:set(pos, rot, self.scl)

    for _,tag in ipairs(self.customFields.sortedTags) do
      genPos.customFields:addTag(tag)
    end

    for _,fieldName in ipairs(self.customFields.names) do
      local fieldValue, fieldType = self.customFields:get(fieldName)
      genPos.customFields:add(fieldName, fieldType, fieldValue)
    end

    genPos.isProcedural = true
  end

end

function C:calcVerts()
  table.clear(self.vertices)

  for i = 1, 4 do -- 2D vertices
    local a = (i == 2 or i == 3) and 1 or -1
    local b = i <= 2 and 1 or -1
    local x = self.rot * vec3(self.scl.x / 2, 0, 0)
    local y = self.rot * vec3(0, self.scl.y / 2, 0)
    table.insert(self.vertices, self.pos + x * a + y * b)
  end
end

function C:containsPoint(pos)
  if not self.vertices[1] then
    self:calcVerts()
  end

  if pos:squaredDistance(self.pos) <= self.pos:squaredDistance(self.vertices[1]) then -- quick radius check, as an optimization
    local offset = pos - self.pos
    local dx = vec3(1, 0, 0):rotated(self.rot)
    local dy = vec3(0, 1, 0):rotated(self.rot)
    local dz = vec3(0, 0, 1):rotated(self.rot)

    return math.abs(offset:dot(dx)) <= self.scl.x / 2 and math.abs(offset:dot(dx)) <= self.scl.y / 2 and math.abs(offset:dot(dx)) <= self.scl.z / 2
  end

  return false
end

local bbPoints = { 0, 3, 7, 4 }
local bbPointsAlt = { 7, 4, 0, 3 }
function C:checkParking(vehId, precision, drivingSpeed, parkingSpeed)
  local valid = false
  local res = { false, false, false, false } -- for each vertice of the parking spot

  local veh = be:getObjectByID(vehId)
  if not veh then
    return valid, res
  end

  local speed = veh:getVelocity():squaredLength()
  drivingSpeed = drivingSpeed or 5
  parkingSpeed = parkingSpeed or 1
  precision = precision or 0.8

  if speed <= square(drivingSpeed) then
    local vehBB = veh:getSpawnWorldOOBB()
    local vehPos = vehBB:getCenter()
    local parkingDir = veh:getDirectionVector():dot(vec3(0, 1, 0):rotated(self.rot))

    if precision <= 0 then
      if self:containsPoint(vehPos) then -- vehicle center only
        res = { true, true, true, true }
        valid = true
      end
    else
      local points = parkingDir >= 0 and bbPoints or bbPointsAlt
      valid = true

      for i, v in ipairs(points) do
        local checkPos = linePointFromXnorm(vehPos, vehBB:getPoint(v), precision)
        if self:containsPoint(checkPos) then
          res[i] = true
        else
          valid = false
        end
      end
    end
  end

  if speed > square(parkingSpeed) then valid = false end

  return valid, res
end

function C:vehicleFits(vehId)
  local veh = be:getObjectByID(vehId)
  if not veh then return false end

  local vehicleExtents = veh.initialNodePosBB:getExtents()
  return vehicleExtents.x <= self.scl.x and vehicleExtents.y <= self.scl.y and vehicleExtents.z <= self.scl.z
end

function C:hasAnyVehicles(playerId)
  -- if playerId is given, ignores this vehicle for this spot
  local state = false
  local spotVehIds = {}

  if not self.vertices[1] then
    self:calcVerts()
  end

  local selfRadius = self.pos:distance(self.vertices[1])
  for _, veh in ipairs(getAllVehiclesByType({"Car", "Truck", "Automation", "Traffic", "Trailer"})) do
    local vehId = veh:getID()
    if veh:getActive() and (not playerId or playerId ~= vehId) then
      local oobb = veh:getSpawnWorldOOBB()
      local radius = oobb:getCenter():distance(oobb:getPoint(0))
      if oobb:getCenter():squaredDistance(self.pos) <= square(radius + selfRadius) then -- check corner radii first, as an optimization
        for i, p1 in ipairs(bbPoints) do -- this method may lack precision
          local p2 = bbPoints[i + 1] or bbPoints[1]
          local pos1, pos2 = oobb:getPoint(p1), oobb:getPoint(p2)
          local checkPos = linePointFromXnorm(pos1, pos2, clamp(self.pos:xnormOnLine(pos1, pos2), 0, 1))
          if self:containsPoint(checkPos) then
            state = true
            table.insert(spotVehIds, vehId)
            break
          end
        end
      end
    end
  end

  return state, vehIds
end

local backwardsQuat = quat(0, 0, 1, 0)
function C:moveResetVehicleTo(vehId, lowPrecision, backwards, addedOffsetPos, addedOffsetRot, useSafeTeleport)
  local veh = be:getObjectByID(vehId)
  if not veh then return end

  addedOffsetPos = addedOffsetPos or zeroVector
  addedOffsetRot = addedOffsetRot or zeroQuat

  local oobb = veh:getSpawnWorldOOBB()
  local fl  = oobb:getPoint(0)
  local fr  = oobb:getPoint(3)
  local bl  = oobb:getPoint(4)
  local flU = oobb:getPoint(1)

  local xVeh = (fr -fl) xVeh:normalize()
  local yVeh = (fl -bl) yVeh:normalize()
  local zVeh = (flU-fl) zVeh:normalize()

  local pos = veh:getPosition()
  local posOffset = (pos - fl)
  local localOffset = vec3(xVeh:dot(posOffset), yVeh:dot(posOffset), zVeh:dot(posOffset))

  local selfRot = quat(self.rot)
  if backwards then
    selfRot = selfRot * backwardsQuat
  end

  local xLine, yLine, zLine = selfRot * xVector, selfRot * yVector, selfRot * zVector
  local newFLPos = self.pos - xLine * fl:distance(fr) * 0.5 + yLine * fl:distance(bl) * 0.5
  local newAddedOffset = xLine * addedOffsetPos.x + yLine * addedOffsetPos.y

  local newOffset = xLine * localOffset.x + yLine * localOffset.y + zLine * localOffset.z
  local newPos = newFLPos + newOffset + newAddedOffset
  local vehRot = quatFromEuler(0, 0, math.pi) * addedOffsetRot * selfRot

  if lowPrecision then -- this must be used if the vehicle is loaded in the first frame, because the OOBB does not work correctly then.
    newPos = self.pos + yLine * 2 + zLine * 0.5 -- spawn the vehicle 2m behin and 0.5m above self.
  end

  if useSafeTeleport then
    spawn.safeTeleport(veh, self.pos, vehRot, nil, nil, nil, true)
  else
    veh:setPositionRotation(newPos.x, newPos.y, newPos.z, vehRot.x, vehRot.y, vehRot.z, vehRot.w)
    veh:autoplace(false)
  end

  return newPos, vehRot
end

--[[
function C:setToVehicle(vehId)
  local veh = scenetree.findObjectById(vehId)
  if not veh then return end
  local fl  = vec3(veh:getSpawnWorldOOBB():getPoint(0))
  local fr  = vec3(veh:getSpawnWorldOOBB():getPoint(3))
  local bl  = vec3(veh:getSpawnWorldOOBB():getPoint(4))
  local flU = vec3(veh:getSpawnWorldOOBB():getPoint(1))

  local center = fl/2 + fr/2
  if scenetree.findClassObjects("TerrainBlock") then
    center.z = core_terrain.getTerrainHeight(center)
    local normalTip = center + (bl-fl)
    normalTip = vec3(normalTip.x, normalTip.y, core_terrain.getTerrainHeight(normalTip))
    self.rot = quatFromDir((center - normalTip):normalized(), (flU-bl):normalized())
  else
    self.rot = quatFromDir((fl - bl):normalized(), (flU-bl):normalized())
  end
  self.pos = center

end
]]

return function(...)
  local o = {}
  setmetatable(o, C)
  C.__index = C
  o:init(...)
  return o
end