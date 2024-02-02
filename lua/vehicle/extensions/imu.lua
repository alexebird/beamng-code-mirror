-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

local units = {}
local names = {}

local function findClosestColTri(pos)
  local closest, closestU, closestV, closestLength = -1, 0, 0, 1e9

  for i, t in ipairs(v.data.triangles) do
    if v.data.nodes[t.id1].fixed or v.data.nodes[t.id2].fixed or v.data.nodes[t.id3].fixed then
      goto continue
    end

    local p1 = obj:getOriginalNodePositionRelative(t.id1)
    local p2 = obj:getOriginalNodePositionRelative(t.id2)
    local p3 = obj:getOriginalNodePositionRelative(t.id3)

    local u, v, n = pos:triangleBarycentricNorm(p1, p2, p3)
    if u >= 0 and v >= 0 and (u + v) <= 1 then
      local w = 1 - u - v

      local e = pos - p1
      local cosa = e:cosAngle(n)
      local l = math.abs(e:length() * cosa)

      if l < closestLength then
        closest, closestU, closestV, closestLength = i, u, v, l
      end
    end

    ::continue::
  end

  return closest, closestU, closestV, closestLength
end

local function getIMURotation(imu)
  local a, b, c = obj:getNodePosition(imu.a), obj:getNodePosition(imu.b), obj:getNodePosition(imu.c)
  local n = (b - a):cross(c - a)
  n:normalize()
  local r = quatFromDir(n):toEulerYXZ()
  return r.x, r.y, r.z
end

local function addIMU(name, pos, debug)
  if debug == nil then
    debug = false
  end

  local imu = {
    name = name,
    pos = pos,
    a = -1,
    b = -1,
    c = -1,
    u = 0,
    v = 0,
    w = 0,
    d = 0,
    lX = 0,
    lY = 0,
    lZ = 0,
    aX = 0,
    aY = 0,
    aZ = 0,
    gX = 0,
    gY = 0,
    gZ = 0,
    debug = debug
  }

  table.insert(units, imu)
  local idx = #units

  local tri, tu, tv, td = findClosestColTri(pos)
  local triObj = v.data.triangles[tri]

  imu.a = triObj.id1
  imu.b = triObj.id2
  imu.c = triObj.id3

  imu.u = tu
  imu.v = tv
  imu.w = 1 - tu - tv
  imu.d = td

  imu.lX, imu.lY, imu.lZ = getIMURotation(imu)

  names[name] = idx
  return idx
end

local function addIMUAtNode(name, node, debug)
  local pos = obj:getOriginalNodePositionRelative(node)
  return addIMU(name, pos, debug)
end

local function removeIMU(name)
  local idx = names[name]
  local ret = table.remove(units, idx)

  for i = 1, #units do
    names[units[i].name] = i
  end

  return ret
end

local function updateRotationalAcceleration(imu, dtSim)
  local x, y, z = getIMURotation(imu)

  imu.aX, imu.aY, imu.aZ = (x - imu.lX) / dtSim, (y - imu.lY) / dtSim, (z - imu.lZ) / dtSim
  imu.lX, imu.lY, imu.lZ = x, y, z
end

local function updateGForces(imu, dtSim)
  local rotation = quatFromDir(obj:getDirectionVector(), obj:getDirectionVectorUp())

  local fa = obj:getNodeForceVector(imu.a):rotated(rotation) * imu.u
  local fb = obj:getNodeForceVector(imu.b):rotated(rotation) * imu.v
  local fc = obj:getNodeForceVector(imu.c):rotated(rotation) * imu.w

  imu.gX = fa.x + fb.x + fc.x
  imu.gY = fa.y + fb.y + fc.y
  imu.gZ = fa.z + fb.z + fc.z
end

local function onDebugDraw()
  for i = 1, #units do
    local imu = units[i]
    if imu.debug then
      local txt = string.format("%d: A(%7.02f %7.02f %7.02f) | G(%7.02f %7.02f %7.02f)", i, imu.aX, imu.aY, imu.aZ, imu.gX, imu.gY, imu.gZ)
      local pos = (quat(obj:getRotation()) * imu.pos + obj:getPosition())
      obj.debugDrawProxy:drawText(pos, color(0, 0, 0, 255), txt)
      obj.debugDrawProxy:drawSphere(0.1, pos, color(0, 0, 255, 255))
    end
  end
end

local function updateGFX(dtSim)
  if #units == 0 then
    return
  end

  for i = 1, #units do
    local imu = units[i]
    updateRotationalAcceleration(imu, dtSim)
    updateGForces(imu, dtSim)
  end
end

local function getIMU(name)
  return units[names[name]]
end

M.addIMU = addIMU
M.addIMUAtNode = addIMUAtNode
M.removeIMU = removeIMU
M.updateGFX = updateGFX
M.onDebugDraw = onDebugDraw
M.getIMU = getIMU

return M
