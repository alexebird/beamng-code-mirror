-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- Module constants.
local dowelLength = 1.0                                                                                     -- The length of the dowel sections used in link roads, in meters.
local eps = 0.2                                                                                             -- An epsilon by which to expand the mesh (to allow decal fitting on top).

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

local M = {}


-- External modules used.
local profileMgr = require('editor/tech/roadArchitect/profiles')                                            -- Manages the profiles structure/handling profile calculations.

-- Private constants.
local floor, ceil, min, max = math.floor, math.ceil, math.min, math.max

-- Module state.
local meshes = {}                                                                                           -- The collection of road meshes.
local lampPosts = {}
local roadMeshIdx = 1                                                                                       -- An incrementable index which gives each road mesh a unique id number.

-- Module constants.
local uvs = { { u = 0.0, v = 0.0 }, { u = 0.0, v = 1.0 }, { u = 1.0, v = 0.0 }, { u = 1.0, v = 1.0 } }      -- Fixed uv-map corner points (used in all road meshes).
local origin = vec3(0, 0, 0)                                                                                -- A vec3 used for representing the scene origin.
local scaleVec = vec3(1, 1, 1)                                                                              -- A vec3 used for representing uniform scale.
local orig = vec3(0, 1, 0)                                                                                  -- The rotation origin vector (vehicle forward in world space).
local materials = {                                                                                         -- The materials to be used for each lane type.
  road_lane = 'm_asphalt_new_01',
  sidewalk = 'm_asphalt_new_01',
  cycle_lane = 'm_asphalt_new_01',
  concrete = 'm_asphalt_new_01',
  island = nil }
local lampPostPath = 'levels/east_coast_usa/art/shapes/buildings/eca_lamppost.dae'                          -- The lamp post static mesh location.


-- Computes the length of the given polyline.
local function computePolylineLengths(poly)
  local lens = { 0.0 }
  for i = 2, #poly do
    local iMinus1 = i - 1
    lens[i] = lens[iMinus1] + poly[iMinus1]:distance(poly[i])
  end
  return lens
end

-- Linearly interpolates into a given polyline.
local function polyLerp(pos, rot, lens, q)
  local l, u = 1, #pos
  for i = 2, #lens do
    if lens[i - 1] <= q and lens[i] >= q then
      l, u = i - 1, i
      break
    end
  end
  if q < lens[1] then
    return nil, nil
  end
  if q > lens[#lens] then
    return nil, nil
  end
  local rat = (q - lens[l]) / (lens[u] - lens[l])
  local p = pos[l] + rat * (pos[u] - pos[l])
  local r = rot[l]:nlerp(rot[u], rat)
  return p, r
end

-- Expand the road geometry to make the procedural mesh slightly larger in appearance.
local function expandRoadGeometry(rD, laneKeys)

  -- Determine the min and max lane indices.
  local lMin, lMax, numLaneKeys = 9999, -9999, #laneKeys
  for k = 1, numLaneKeys do
    local lK = laneKeys[k]
    lMin, lMax = min(lMin, lK), max(lMax, lK)
  end

  -- Deep copy the geometry data.
  local rData = {}
  for i = 1, #rD do
    local ppp, rDat = {}, rD[i]
    for jj = 1, numLaneKeys do
      local j = laneKeys[jj]
      local inner, iDat = {}, rDat[j]
      for k = 1, #iDat do
        inner[k] = iDat[k]
      end
      ppp[j] = inner
    end
    rData[i] = ppp
  end

  -- Expand the start and end (longitudinally).
  for kk = 1, numLaneKeys do
    local k = laneKeys[kk]
    local vS = rData[2][k][1] - rData[1][k][1]
    vS:normalize()
    local vE = rData[#rData - 1][k][1] - rData[#rData][k][1]
    vE:normalize()
    local vSEps = vS * eps
    rData[1][k][1] = rData[1][k][1] - vSEps
    rData[1][k][2] = rData[1][k][2] - vSEps
    rData[1][k][3] = rData[1][k][3] - vSEps
    rData[1][k][4] = rData[1][k][4] - vSEps
    local vEEps = vE * eps
    rData[#rData][k][1] = rData[#rData][k][1] - vEEps
    rData[#rData][k][2] = rData[#rData][k][2] - vEEps
    rData[#rData][k][3] = rData[#rData][k][3] - vEEps
    rData[#rData][k][4] = rData[#rData][k][4] - vEEps
  end

  -- Expand the lateral width across the road.
  for i = 1, #rData do
    local k = lMin
    local lat = rData[i][k][6]
    lat:normalize()
    local latEps = lat * eps
    rData[i][k][1] = rData[i][k][1] - latEps
    rData[i][k][4] = rData[i][k][4] - latEps

    local k = lMax
    local lat = rData[i][k][6]
    lat:normalize()
    local latEps = lat * eps
    rData[i][k][2] = rData[i][k][2] + latEps
    rData[i][k][3] = rData[i][k][3] + latEps
  end

  return rData
end

-- Creates a road mesh from the given rendering data.
-- [The index of the road is used outside this module to reference the mesh later].
local function createRoad(r)

  -- Expand the road data to make the mesh slightly larger.
  -- [This is done so that any decals being laid on top of them will let their raycasts hit the mesh rather than fall through].
  local rData = expandRoadGeometry(r.renderData, r.laneKeys)

  -- Create the mesh.
  local laneMeshes, lmCtr, laneKeys = {}, 1, r.laneKeys
  local numDivs, numLaneKeys = #rData, #laneKeys
  for k = 1, numLaneKeys do
    local laneKey = laneKeys[k]
    local laneType = rData[1][laneKey][8]
    if laneType ~= 'island' then                                                                            -- Only render lanes which are solid (do not render island lanes).
      local vertsLane, facesLane, normalsLane, vCtr, fCtr, nCtr = {}, {}, {}, 1, 1, 1
      for j = 2, numDivs do
        local div1, div2 = rData[j - 1], rData[j]
        local b, f = div1[laneKey], div2[laneKey]

        -- Append the vertices.
        local b1, b2, b3, b4, f1, f2, f3, f4 = b[1], b[2], b[3], b[4], f[1], f[2], f[3], f[4]
        local i1, i2, i3, i4, i5, i6, i7, i8 = vCtr, vCtr + 1, vCtr + 2, vCtr + 3, vCtr + 4, vCtr + 5, vCtr + 6, vCtr + 7
        vertsLane[i1] = { x = b1.x, y = b1.y, z = b1.z }
        vertsLane[i2] = { x = b2.x, y = b2.y, z = b2.z }
        vertsLane[i3] = { x = b3.x, y = b3.y, z = b3.z }
        vertsLane[i4] = { x = b4.x, y = b4.y, z = b4.z }
        vertsLane[i5] = { x = f1.x, y = f1.y, z = f1.z }
        vertsLane[i6] = { x = f2.x, y = f2.y, z = f2.z }
        vertsLane[i7] = { x = f3.x, y = f3.y, z = f3.z }
        vertsLane[i8] = { x = f4.x, y = f4.y, z = f4.z }

        -- Append the normals.
        local n, l = b[5], b[6]
        local nInv, lInv = -n, -l
        local n1, n2, n3, n4 = nCtr, nCtr + 1, nCtr + 2, nCtr + 3
        normalsLane[n1] = { x = n.x, y = n.y, z = n.z }
        normalsLane[n2] = { x = l.x, y = l.y, z = l.z }
        normalsLane[n3] = { x = nInv.x, y = nInv.y, z = nInv.z }
        normalsLane[n4] = { x = lInv.x, y = lInv.y, z = lInv.z }

        -- Reduce the vertex and normal indices by one, since face indexing starts at zero.
        i1, i2, i3, i4, i5, i6, i7, i8 = i1 - 1, i2 - 1, i3 - 1, i4 - 1, i5 - 1, i6 - 1, i7 - 1, i8 - 1
        n1, n2, n3, n4 = n1 - 1, n2 - 1, n3 - 1, n4 - 1

        -- Append the topside faces [b1 - f1 - f2, f2 - b2 - b1].
        facesLane[fCtr] = { v = i1, n = n1, u = 0 }
        facesLane[fCtr + 1] = { v = i6 , n = n1, u = 3 }
        facesLane[fCtr + 2] = { v = i5, n = n1, u = 1 }
        facesLane[fCtr + 3] = { v = i6, n = n1, u = 3 }
        facesLane[fCtr + 4] = { v = i1, n = n1, u = 0 }
        facesLane[fCtr + 5] = { v = i2, n = n1, u = 2 }

        -- Append the rightside faces [b2 - f2 - f3, f3 - b3 - b2].
        facesLane[fCtr + 6] = { v = i2, n = n2, u = 0 }
        facesLane[fCtr + 7] = { v = i7 , n = n2, u = 3 }
        facesLane[fCtr + 8] = { v = i6, n = n2, u = 1 }
        facesLane[fCtr + 9] = { v = i7, n = n2, u = 3 }
        facesLane[fCtr + 10] = { v = i2, n = n2, u = 0 }
        facesLane[fCtr + 11] = { v = i3, n = n2, u = 2 }

        -- Append the underside faces [b3 - f3 - f4, f4 - b4 - b3].
        facesLane[fCtr + 12] = { v = i3, n = n3, u = 0 }
        facesLane[fCtr + 13] = { v = i8 , n = n3, u = 3 }
        facesLane[fCtr + 14] = { v = i7, n = n3, u = 1 }
        facesLane[fCtr + 15] = { v = i8, n = n3, u = 3 }
        facesLane[fCtr + 16] = { v = i3, n = n3, u = 0 }
        facesLane[fCtr + 17] = { v = i4, n = n3, u = 2 }

        -- Append the leftside faces [b4 - f4 - f1, f1 - b1 - b4].
        facesLane[fCtr + 18] = { v = i4, n = n4, u = 0 }
        facesLane[fCtr + 19] = { v = i5 , n = n4, u = 3 }
        facesLane[fCtr + 20] = { v = i8, n = n4, u = 1 }
        facesLane[fCtr + 21] = { v = i5, n = n4, u = 3 }
        facesLane[fCtr + 22] = { v = i4, n = n4, u = 0 }
        facesLane[fCtr + 23] = { v = i1, n = n4, u = 2 }

        -- Increment the index counters as required.
        vCtr, fCtr, nCtr = vCtr + 8, fCtr + 24, nCtr + 4
      end

      -- Add the start dowel, if required.
      local b = rData[1][laneKey]
      if r.isDowelS then

        -- Append the vertices.
        local prot = b[5]:cross(b[6]) * dowelLength
        local b1, b2, b3, b4, f1, f2, f3, f4 = b[1] + prot, b[2] + prot, b[3] + prot, b[4] + prot, b[1], b[2], b[3], b[4]
        local i1, i2, i3, i4, i5, i6, i7, i8 = vCtr, vCtr + 1, vCtr + 2, vCtr + 3, vCtr + 4, vCtr + 5, vCtr + 6, vCtr + 7
        vertsLane[i1] = { x = b1.x, y = b1.y, z = b1.z }
        vertsLane[i2] = { x = b2.x, y = b2.y, z = b2.z }
        vertsLane[i3] = { x = b3.x, y = b3.y, z = b3.z }
        vertsLane[i4] = { x = b4.x, y = b4.y, z = b4.z }
        vertsLane[i5] = { x = f1.x, y = f1.y, z = f1.z }
        vertsLane[i6] = { x = f2.x, y = f2.y, z = f2.z }
        vertsLane[i7] = { x = f3.x, y = f3.y, z = f3.z }
        vertsLane[i8] = { x = f4.x, y = f4.y, z = f4.z }

        -- Append the normals.
        local n, l = b[5], b[6]
        local nInv, lInv = -n, -l
        local n1, n2, n3, n4 = nCtr, nCtr + 1, nCtr + 2, nCtr + 3
        normalsLane[n1] = { x = n.x, y = n.y, z = n.z }
        normalsLane[n2] = { x = l.x, y = l.y, z = l.z }
        normalsLane[n3] = { x = nInv.x, y = nInv.y, z = nInv.z }
        normalsLane[n4] = { x = lInv.x, y = lInv.y, z = lInv.z }

        -- Reduce the vertex and normal indices by one, since face indexing starts at zero.
        i1, i2, i3, i4, i5, i6, i7, i8 = i1 - 1, i2 - 1, i3 - 1, i4 - 1, i5 - 1, i6 - 1, i7 - 1, i8 - 1
        n1, n2, n3, n4 = n1 - 1, n2 - 1, n3 - 1, n4 - 1

        -- Append the topside faces [b1 - f1 - f2, f2 - b2 - b1].
        facesLane[fCtr] = { v = i1, n = n1, u = 0 }
        facesLane[fCtr + 1] = { v = i6 , n = n1, u = 3 }
        facesLane[fCtr + 2] = { v = i5, n = n1, u = 1 }
        facesLane[fCtr + 3] = { v = i6, n = n1, u = 3 }
        facesLane[fCtr + 4] = { v = i1, n = n1, u = 0 }
        facesLane[fCtr + 5] = { v = i2, n = n1, u = 2 }

        -- Append the rightside faces [b2 - f2 - f3, f3 - b3 - b2].
        facesLane[fCtr + 6] = { v = i2, n = n2, u = 0 }
        facesLane[fCtr + 7] = { v = i7 , n = n2, u = 3 }
        facesLane[fCtr + 8] = { v = i6, n = n2, u = 1 }
        facesLane[fCtr + 9] = { v = i7, n = n2, u = 3 }
        facesLane[fCtr + 10] = { v = i2, n = n2, u = 0 }
        facesLane[fCtr + 11] = { v = i3, n = n2, u = 2 }

        -- Append the underside faces [b3 - f3 - f4, f4 - b4 - b3].
        facesLane[fCtr + 12] = { v = i3, n = n3, u = 0 }
        facesLane[fCtr + 13] = { v = i8 , n = n3, u = 3 }
        facesLane[fCtr + 14] = { v = i7, n = n3, u = 1 }
        facesLane[fCtr + 15] = { v = i8, n = n3, u = 3 }
        facesLane[fCtr + 16] = { v = i3, n = n3, u = 0 }
        facesLane[fCtr + 17] = { v = i4, n = n3, u = 2 }

        -- Append the leftside faces [b4 - f4 - f1, f1 - b1 - b4].
        facesLane[fCtr + 18] = { v = i4, n = n4, u = 0 }
        facesLane[fCtr + 19] = { v = i5 , n = n4, u = 3 }
        facesLane[fCtr + 20] = { v = i8, n = n4, u = 1 }
        facesLane[fCtr + 21] = { v = i5, n = n4, u = 3 }
        facesLane[fCtr + 22] = { v = i4, n = n4, u = 0 }
        facesLane[fCtr + 23] = { v = i1, n = n4, u = 2 }

        -- Increment the index counters as required.
        vCtr, fCtr, nCtr = vCtr + 8, fCtr + 24, nCtr + 4
      end

      -- Add the end dowel, if required.
      if r.isDowelE then

        -- Append the vertices.
        local f = rData[numDivs][laneKey]
        local prot = f[5]:cross(f[6]) * dowelLength
        local b1, b2, b3, b4, f1, f2, f3, f4 = f[1], f[2], f[3], f[4], f[1] - prot, f[2] - prot, f[3] - prot, f[4] - prot
        local i1, i2, i3, i4, i5, i6, i7, i8 = vCtr, vCtr + 1, vCtr + 2, vCtr + 3, vCtr + 4, vCtr + 5, vCtr + 6, vCtr + 7
        vertsLane[i1] = { x = b1.x, y = b1.y, z = b1.z }
        vertsLane[i2] = { x = b2.x, y = b2.y, z = b2.z }
        vertsLane[i3] = { x = b3.x, y = b3.y, z = b3.z }
        vertsLane[i4] = { x = b4.x, y = b4.y, z = b4.z }
        vertsLane[i5] = { x = f1.x, y = f1.y, z = f1.z }
        vertsLane[i6] = { x = f2.x, y = f2.y, z = f2.z }
        vertsLane[i7] = { x = f3.x, y = f3.y, z = f3.z }
        vertsLane[i8] = { x = f4.x, y = f4.y, z = f4.z }

        -- Append the normals.
        local n, l = b[5], b[6]
        local nInv, lInv = -n, -l
        local n1, n2, n3, n4 = nCtr, nCtr + 1, nCtr + 2, nCtr + 3
        normalsLane[n1] = { x = n.x, y = n.y, z = n.z }
        normalsLane[n2] = { x = l.x, y = l.y, z = l.z }
        normalsLane[n3] = { x = nInv.x, y = nInv.y, z = nInv.z }
        normalsLane[n4] = { x = lInv.x, y = lInv.y, z = lInv.z }

        -- Reduce the vertex and normal indices by one, since face indexing starts at zero.
        i1, i2, i3, i4, i5, i6, i7, i8 = i1 - 1, i2 - 1, i3 - 1, i4 - 1, i5 - 1, i6 - 1, i7 - 1, i8 - 1
        n1, n2, n3, n4 = n1 - 1, n2 - 1, n3 - 1, n4 - 1

        -- Append the topside faces [b1 - f1 - f2, f2 - b2 - b1].
        facesLane[fCtr] = { v = i1, n = n1, u = 0 }
        facesLane[fCtr + 1] = { v = i6 , n = n1, u = 3 }
        facesLane[fCtr + 2] = { v = i5, n = n1, u = 1 }
        facesLane[fCtr + 3] = { v = i6, n = n1, u = 3 }
        facesLane[fCtr + 4] = { v = i1, n = n1, u = 0 }
        facesLane[fCtr + 5] = { v = i2, n = n1, u = 2 }

        -- Append the rightside faces [b2 - f2 - f3, f3 - b3 - b2].
        facesLane[fCtr + 6] = { v = i2, n = n2, u = 0 }
        facesLane[fCtr + 7] = { v = i7 , n = n2, u = 3 }
        facesLane[fCtr + 8] = { v = i6, n = n2, u = 1 }
        facesLane[fCtr + 9] = { v = i7, n = n2, u = 3 }
        facesLane[fCtr + 10] = { v = i2, n = n2, u = 0 }
        facesLane[fCtr + 11] = { v = i3, n = n2, u = 2 }

        -- Append the underside faces [b3 - f3 - f4, f4 - b4 - b3].
        facesLane[fCtr + 12] = { v = i3, n = n3, u = 0 }
        facesLane[fCtr + 13] = { v = i8 , n = n3, u = 3 }
        facesLane[fCtr + 14] = { v = i7, n = n3, u = 1 }
        facesLane[fCtr + 15] = { v = i8, n = n3, u = 3 }
        facesLane[fCtr + 16] = { v = i3, n = n3, u = 0 }
        facesLane[fCtr + 17] = { v = i4, n = n3, u = 2 }

        -- Append the leftside faces [b4 - f4 - f1, f1 - b1 - b4].
        facesLane[fCtr + 18] = { v = i4, n = n4, u = 0 }
        facesLane[fCtr + 19] = { v = i5 , n = n4, u = 3 }
        facesLane[fCtr + 20] = { v = i8, n = n4, u = 1 }
        facesLane[fCtr + 21] = { v = i5, n = n4, u = 3 }
        facesLane[fCtr + 22] = { v = i4, n = n4, u = 0 }
        facesLane[fCtr + 23] = { v = i1, n = n4, u = 2 }

        -- Increment the index counters as required.
        vCtr, fCtr, nCtr = vCtr + 8, fCtr + 24, nCtr + 4
      end

      -- Add end caps.
      local b, f = rData[1][laneKey], rData[numDivs][laneKey]

      -- Append the vertices.
      local b1, b2, b3, b4, f1, f2, f3, f4 = b[1], b[2], b[3], b[4], f[1], f[2], f[3], f[4]
      local i1, i2, i3, i4, i5, i6, i7, i8 = vCtr, vCtr + 1, vCtr + 2, vCtr + 3, vCtr + 4, vCtr + 5, vCtr + 6, vCtr + 7
      vertsLane[i1] = { x = b1.x, y = b1.y, z = b1.z }
      vertsLane[i2] = { x = b2.x, y = b2.y, z = b2.z }
      vertsLane[i3] = { x = b3.x, y = b3.y, z = b3.z }
      vertsLane[i4] = { x = b4.x, y = b4.y, z = b4.z }
      vertsLane[i5] = { x = f1.x, y = f1.y, z = f1.z }
      vertsLane[i6] = { x = f2.x, y = f2.y, z = f2.z }
      vertsLane[i7] = { x = f3.x, y = f3.y, z = f3.z }
      vertsLane[i8] = { x = f4.x, y = f4.y, z = f4.z }

      -- Append the normals.
      local n, l = b[5], b[6]
      local t = n:cross(l)
      local n1, n2 = nCtr, nCtr + 1
      normalsLane[n1] = { x = t.x, y = t.y, z = t.z }
      normalsLane[n2] = { x = -t.x, y = -t.y, z = -t.z }

      -- Reduce the vertex and normal indices by one, since face indexing starts at zero.
      i1, i2, i3, i4, i5, i6, i7, i8 = i1 - 1, i2 - 1, i3 - 1, i4 - 1, i5 - 1, i6 - 1, i7 - 1, i8 - 1
      n1, n2 = n1 - 1, n2 - 1

      -- Append the front cap faces [f1 - f3 - f2, f3 - f1 - f4].
      facesLane[fCtr] = { v = i1, n = n1, u = 0 }
      facesLane[fCtr + 1] = { v = i3 , n = n1, u = 3 }
      facesLane[fCtr + 2] = { v = i2, n = n1, u = 1 }
      facesLane[fCtr + 3] = { v = i3, n = n1, u = 3 }
      facesLane[fCtr + 4] = { v = i1, n = n1, u = 0 }
      facesLane[fCtr + 5] = { v = i4, n = n1, u = 2 }

      -- Append the back cap faces [b1 - b3 - b2, b3 - b1 - b4].
      facesLane[fCtr + 6] = { v = i5, n = n2, u = 0 }
      facesLane[fCtr + 7] = { v = i6 , n = n2, u = 1 }
      facesLane[fCtr + 8] = { v = i7, n = n2, u = 3 }
      facesLane[fCtr + 9] = { v = i7, n = n2, u = 3 }
      facesLane[fCtr + 10] = { v = i8, n = n2, u = 2 }
      facesLane[fCtr + 11] = { v = i5, n = n2, u = 0 }

      -- Increment the index counters as required.
      vCtr, fCtr, nCtr = vCtr + 8, fCtr + 12, nCtr + 2

      -- Store the mesh for this lane in the lane meshes container.
      laneMeshes[lmCtr] = { verts = vertsLane, faces = facesLane, normals = normalsLane, uvs = uvs, material = materials[laneType] }
      lmCtr = lmCtr + 1
    end
  end

  -- Generate the procedural meshes for the road.
  local mesh = createObject('ProceduralMesh')
  mesh:registerObject('Road_Mesh_' .. tonumber(roadMeshIdx))
  roadMeshIdx = roadMeshIdx + 1
  mesh.canSave = true
  scenetree.MissionGroup:add(mesh.obj)
  mesh:createMesh({ laneMeshes })
  mesh:setPosition(origin)
  mesh.scale = scaleVec

  meshes[r.name] = mesh

  -- Compute the position and rotation of lamp posts, at each div point.
  if r.isUseLampPosts then
    local lMin, lMax = profileMgr.getMinMaxLaneKeys(laneKeys)
    lMin, lMax = laneKeys[lMin], laneKeys[lMax]
    local posL, rotL, posR, rotR = {}, {}, {}, {}
    local vOffset = vec3(0, 0, r.lampPostVertOffset[0])
    for j = 1, numDivs do
      local lData = rData[j][lMin]                                                                      -- Left side lamp posts.
      local lat = lData[6]
      posL[j] = lData[4] - lat * r.lampPostLatOffsetLeft[0] + vOffset
      rotL[j] = orig:getRotationTo(-lat:cross(lData[5]))

      local lData = rData[j][lMax]                                                                      -- Right side lamp posts.
      local lat = lData[6]
      posR[j] = lData[3] + lat * r.lampPostLatOffsetRight[0] + vOffset
      rotR[j] = orig:getRotationTo(lat:cross(lData[5]))
    end

    local lensL = computePolylineLengths(posL)
    local lensR = computePolylineLengths(posR)
    local numLampsL, numLampsR = ceil(lensL[#lensL] / r.lampPostLonSpacing[0]), ceil(lensR[#lensR] / r.lampPostLonSpacing[0])

    -- Create the static meshes for the lamp posts.
    lampPosts[r.name] = {}
    local lamps = lampPosts[r.name]
    local ctr = 1
    if r.lampPostLeftSide[0] then
      local q = r.lampPostLonOffset[0]
      for j = 1, numLampsL do
        local static = createObject('TSStatic')                                                         -- Left side lamp post meshes.
        static:setField('shapeName', 0, lampPostPath)
        static:registerObject('Lamp post ' .. tostring(ctr))
        local pos, rot = polyLerp(posL, rotL, lensL, q)
        if pos then
          static:setPosRot(pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, rot.w)
          static.scale = scaleVec
          static.canSave = true
          scenetree.MissionGroup:addObject(static.obj)
          lamps[ctr] = static
          q = q + r.lampPostLonSpacing[0]
          ctr = ctr + 1
        end
      end
    end
    if r.lampPostRightSide[0] then
      local q = r.lampPostLonOffset[0]
      for j = 1, numLampsR do
        local static = createObject('TSStatic')                                                         -- Right side lamp post meshes.
        static:setField('shapeName', 0, lampPostPath)
        static:registerObject('Lamp post ' .. tostring(ctr + 1))
        local pos, rot = polyLerp(posR, rotR, lensR, q)
        if pos then
          static:setPosRot(pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, rot.w)
          static.scale = scaleVec
          static.canSave = true
          scenetree.MissionGroup:addObject(static.obj)
          lamps[ctr] = static
          q = q + r.lampPostLonSpacing[0]
          ctr = ctr + 1
        end
      end
    end
  end

end

-- Attempts to removes the meshes of the road with the given name, from the scene (if it exists).
-- [This is done through road indices; the actual handling of the meshes structure should be private to this module].
local function tryRemove(roadName)
  local mesh = meshes[roadName]
  if mesh then
    mesh:delete()
    if lampPosts and lampPosts[roadName] then
      local numLampPosts = #lampPosts[roadName] or 0
      for i = 1, numLampPosts do
        lampPosts[roadName][i]:delete()
      end
    end
  end
  meshes[roadName] = nil
  lampPosts[roadName] = nil
end


-- Public interface.
M.createRoad =                                            createRoad
M.tryRemove =                                             tryRemove

return M